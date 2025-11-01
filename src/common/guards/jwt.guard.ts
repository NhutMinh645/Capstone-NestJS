import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const token = String(auth).startsWith('Bearer ') ? String(auth).slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
      (req as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
