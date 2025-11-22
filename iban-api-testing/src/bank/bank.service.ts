import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ValidateBankDto } from './validate-bank.dto';

@Injectable()
export class BankService {
  private readonly logger = new Logger(BankService.name);
  private readonly base = 'https://api.ibanapi.com/v1';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get apiKey(): string {
    const key = this.config.get<string>('IBANAPI_KEY');
    if (!key) {
      throw new Error('IBANAPI_KEY not set in environment/config');
    }
    return key;
  }

  private async call(path: string, params = {}) {
    const url = `${this.base}${path}`;
    try {
      const obs = this.http.get(url, {
        params: { api_key: this.apiKey, ...params },
      });
      const res = await firstValueFrom(obs);
      return res.data;
    } catch (err: any) {
      this.logger.error(`External call failed: ${url} ${err?.message ?? err}`);
      // Normalize errors
      throw new BadRequestException(
        'Failed to validate bank details with external provider',
      );
    }
  }

  async validate(dto: ValidateBankDto) {
    // Basic routing by currency
    if (dto.currency === 'EUR') {
      if (!dto.iban)
        throw new BadRequestException('IBAN is required for EUR transfers');
      const ibanResult = await this.call(
        `/validate/${encodeURIComponent(dto.iban)}`,
      );
      // optional SWIFT check if provided
      let swiftResult = null;
      if (dto.swift)
        swiftResult = await this.call(
          `/swift/validate/${encodeURIComponent(dto.swift)}`,
        );
      return { currency: 'EUR', iban: ibanResult, swift: swiftResult };
    }

    if (dto.currency === 'GBP') {
      // Prefer IBAN if provided
      if (dto.iban) {
        const ibanResult = await this.call(
          `/validate/${encodeURIComponent(dto.iban)}`,
        );
        return { currency: 'GBP', iban: ibanResult };
      }

      // or sortCode + accountNumber (local)
      if (dto.sortCode && dto.accountNumber) {
        // Example IBANAPI bank lookup endpoint for UK (adjust if provider differs)
        const bankLookup = await this.call('/bank/uk', {
          sortcode: dto.sortCode,
          accountnumber: dto.accountNumber,
        });
        return { currency: 'GBP', bankLookup };
      }

      throw new BadRequestException(
        'For GBP provide either IBAN or both sortCode and accountNumber',
      );
    }

    if (dto.currency === 'USD') {
      // SWIFT only
      if (!dto.swift)
        throw new BadRequestException(
          'SWIFT/BIC is required for USD transfers',
        );
      const swiftResult = await this.call(
        `/swift/validate/${encodeURIComponent(dto.swift)}`,
      );
      return { currency: 'USD', swift: swiftResult };
    }

    throw new BadRequestException('Unsupported currency');
  }
}
