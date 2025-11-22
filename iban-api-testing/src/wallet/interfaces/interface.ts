// export interface WalletResponse {
//   id: string;
//   balance: number;
//   currency: string;
//   userId: string;
//   createdAt: Date;
// }

import { TransactionType } from '../entity/transaction.entity';

// export interface TransactionResponse {
//   id: string;
//   type: 'CREDIT' | 'DEBIT';
//   amount: number;
//   createdAt: Date;
// }

// export interface WalletWithTransactions extends WalletResponse {
//   transactions: TransactionResponse[];
// }

export interface ITransactionResponse {
  id: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
}

export interface IWalletResponse {
  id: string;
  balance: number;
  userId: string;
  transactions: ITransactionResponse[];
}
