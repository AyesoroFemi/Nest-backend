import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ValidateBankDto {
  @IsIn(['EUR', 'GBP', 'USD'])
  currency: 'EUR' | 'GBP' | 'USD';

  // For IBAN-based validations (EUR, GBP if provided)
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]+$/, { message: 'IBAN must be alphanumeric and uppercase' })
  iban?: string;

  // Swift/BIC (8 or 11 chars)
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
    message: 'Invalid SWIFT/BIC format',
  })
  swift?: string;

  // UK local alternative
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Sort code must be 6 digits' })
  sortCode?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8,10}$/, { message: 'Account number must be 8-10 digits' })
  accountNumber?: string;
}
