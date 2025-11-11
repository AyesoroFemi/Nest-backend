import * as bcrypt from 'bcrypt';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
}
