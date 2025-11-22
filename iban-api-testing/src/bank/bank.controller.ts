import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { ValidateBankDto } from './validate-bank.dto';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  // local validation pipe ensures DTO checks before hitting the service
  @Post('validate')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async validate(@Body() dto: ValidateBankDto) {
    return this.bankService.validate(dto);
  }
}
