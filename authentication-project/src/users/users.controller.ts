import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { CurrentUser } from './current-user.decorator';
import { User } from './entity/user.entity';
import { NoAccountGuard } from 'src/auth/decorators/no-account-guard.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Get('test-email')
  async testEmail() {
    return this.userService.sendTestEmail();
  }

  @Public()
  @Get()
  public getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post()
  public createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @NoAccountGuard()
  @Post('verification-otp')
  async generateEmailVerification(@CurrentUser() user: User) {
    await this.userService.generateEmailVerification(user.id);

    return { status: 'success', message: 'Sending email in a moment' };
  }

  @NoAccountGuard()
  @Post('verify/:otp')
  async verifyEmail(@Param('otp') otp: string, @CurrentUser() user: User) {
    const result = await this.userService.verifyEmail(user.id, otp);

    return { status: result ? 'sucess' : 'failure', message: null };
  }
}
