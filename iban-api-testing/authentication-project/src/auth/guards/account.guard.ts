import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NO_ACCOUNT_GUARD_KEY } from '../decorators/no-account-guard.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const noAccountGuard = this.reflector.getAllAndOverride<boolean>(
      NO_ACCOUNT_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || noAccountGuard) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // if (!user) {
    //   throw new UnauthorizedException('User not found');
    // }

    // return true;
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(`Account not verified`);
    }

    if (user.accountStatus !== 'active') {
      throw new UnauthorizedException(`Account ${user.accountStatus}`);
    }

    return user.accountStatus === 'active' && !!user.emailVerifiedAt;
  }
}
