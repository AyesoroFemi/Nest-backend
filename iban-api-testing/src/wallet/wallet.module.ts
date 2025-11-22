import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { Transaction } from './entity/transaction.entity';
import { User } from '../user/user.entity';

@Module({
  providers: [WalletService],
  controllers: [WalletController],
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, User])],
})
export class WalletModule {}
