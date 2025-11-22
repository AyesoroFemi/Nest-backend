import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Validate user credentials (used by LocalStrategy)
  async validateUser({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email, true);
    if (!user || !user.password) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return null;
    }

    // Return user without password
    const { password: _, ...result } = user;
    return result;
  }

  // login
  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email, true);
    if (!user || !user.password)
      throw new BadRequestException('Invalid credentials');

    this.logger.log('who is this user', user);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('Invalid credentials');
    // console.log('what is the result of the user login', { user });

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }
}
