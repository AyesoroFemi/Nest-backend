import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateWalletDto {
  @IsUUID()
  userId: string;
}

export class DepositDto {
  @IsUUID()
  walletId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class WithdrawDto {
  @IsUUID()
  walletId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
