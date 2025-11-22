import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';

import { Wallet } from './entity/wallet.entity';
import { Transaction } from './entity/transaction.entity';
import { IWalletResponse } from './interfaces/interface';
import { CreateWalletDto, DepositDto, WithdrawDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createWallet(dto: CreateWalletDto): Promise<IWalletResponse> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const wallet = this.walletRepo.create({ user, balance: '0' });
    await this.walletRepo.save(wallet);

    return this.mapWallet(wallet);
  }

  async deposit(dto: DepositDto): Promise<IWalletResponse> {
    const wallet = await this.walletRepo.findOne({
      where: { id: dto.walletId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const currentBalance = Number(wallet.balance);
    const newBalance = currentBalance + dto.amount;
    wallet.balance = newBalance.toString();
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      wallet,
      amount: dto.amount.toString(),
      type: 'deposit',
    });
    await this.txRepo.save(tx);

    return this.findWithTransactions(wallet.id);
  }

  async withdraw(dto: WithdrawDto): Promise<IWalletResponse> {
    const wallet = await this.walletRepo.findOne({
      where: { id: dto.walletId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const currentBalance = Number(wallet.balance);
    if (currentBalance < dto.amount) {
      throw new BadRequestException('Insufficient funds');
    }

    const newBalance = currentBalance - dto.amount;
    wallet.balance = newBalance.toString();
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      wallet,
      amount: dto.amount.toString(),
      type: 'withdrawal',
    });
    await this.txRepo.save(tx);

    return this.findWithTransactions(wallet.id);
  }

  async findWithTransactions(walletId: string): Promise<IWalletResponse> {
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
      relations: ['user', 'transactions'],
      order: { transactions: { createdAt: 'DESC' } },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    return this.mapWallet(wallet);
  }

  private mapWallet(wallet: Wallet): IWalletResponse {
    return {
      id: wallet.id,
      balance: Number(wallet.balance),
      userId: wallet.user.id,
      transactions:
        wallet.transactions?.map((tx) => ({
          id: tx.id,
          amount: Number(tx.amount),
          type: tx.type,
          createdAt: tx.createdAt,
        })) || [],
    };
  }
}
