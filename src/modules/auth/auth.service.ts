import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

type PublicUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private signToken(payload: any) {
    const secret = process.env.JWT_SECRET || 'supersecret';
    const expiresIn = process.env.JWT_EXPIRES || '1d';
   return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  }

  private toPublic(u: any): PublicUser {
    return {
      id: u.id,
      name: u.name ?? null,
      email: u.email,
      role: u.role,
      avatar: u.avatar ?? null,
      phone: u.phone ?? null,
    };
  }

  async signup(dto: { name: string; email: string; password: string; role?: string; phone?: string }) {
    const exists = await this.prisma.nguoiDung.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email đã tồn tại');

    const hashed = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.nguoiDung.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: (dto.role as any) ?? 'USER',
        phone: dto.phone ?? null,
      },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
    });

    const token = this.signToken({ id: created.id, email: created.email, role: created.role });
    return { accessToken: token, user: this.toPublic(created) };
  }

  async signin(dto: { email: string; password: string }) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { email: dto.email },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true, password: true },
    });
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const ok = await bcrypt.compare(dto.password, user.password || '');
    if (!ok) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const { password, ...pub } = user as any;
    const token = this.signToken({ id: user.id, email: user.email, role: user.role });
    return { accessToken: token, user: this.toPublic(pub) };
  }

  async me(userId: number) {
    const u = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
    });
    if (!u) throw new UnauthorizedException('User không tồn tại');
    return this.toPublic(u);
  }
}
