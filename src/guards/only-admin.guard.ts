import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Roles, User } from 'src/users/entities/user';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    if (!req.user) {
      throw new UnauthorizedException('User not found!');
    }

    const user = req.user as User;
    if (user.role === Roles.ADMIN) {
      return true;
    }

    throw new UnauthorizedException('User must be an admin!');
  }
}
