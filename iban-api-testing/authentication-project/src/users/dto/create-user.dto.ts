import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { KnowUs } from '../entity/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(KnowUs)
  knowUs?: KnowUs;
}
