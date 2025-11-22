import * as bcrypt from 'bcrypt';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { VerificationService } from '../verification/verification.service';
import { MessageService } from '../message/message.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private verificationService: VerificationService,
    private messageService: MessageService,
  ) {}

  public async create(createUserDto: CreateUserDto) {
    const { email, password, name, knowUs } = createUserDto;

    this.logger.log(`Attempting to create user with email: ${email}`);

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    this.logger.log({ 'result of existing user': existingUser });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      knowUs,
    });
    newUser = await this.userRepository.save(newUser);

    this.logger.log(`User created successfully: ${email}`);

    return newUser;
  }
  public async getAllUsers() {
    const users = await this.userRepository.find();
    this.logger.log('Getting all users!!!', { users });
    return users;
  }

  public async findOneByEmail(
    email: string,
    selectSecrets: boolean = false,
  ): Promise<Partial<User> | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: selectSecrets,
        knowUs: true,
      },
    });
  }

  async generateEmailVerification(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const otp = await this.verificationService.generateOtp(Number(user.id));

    await this.messageService.sendEmail({
      subject: 'MyApp - Account Verification',
      recipients: [{ name: user.name ?? '', address: user.email }],
      html: `<p>Hi${user.name ? ' ' + user.name : ''},</p><p>You may verify your MyApp account using the following OTP: <br /><span style="font-size:24px; font-weight: 700;">${otp}</span></p><p>Regards,<br />MyApp</p>`,
    });
  }

  async verifyEmail(userId: string, token: string) {
    const invalidMessage = 'Invalid or expired OTP';

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const isValid = await this.verificationService.validateOtp(
      Number(user.id),
      token,
    );

    if (!isValid) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    user.emailVerifiedAt = new Date();
    user.accountStatus = 'active';

    await this.userRepository.save(user);

    return true;
  }
  async sendTestEmail() {
    await this.messageService.sendEmail({
      subject: 'MyApp - Test Email',
      recipients: [{ name: 'Kemi', address: 'XXXXXXXXXXXXX' }],
      html: `<p>Hi Kemi,</p><p>This is a test email</p><p>Regards,<br />MyApp</p>`,
    });
  }
}
