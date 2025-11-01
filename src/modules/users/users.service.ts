import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Danh sách + phân trang + keyword (name/email)
  async list(pageIndex = 1, pageSize = 10, keyword?: string) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where = keyword
      ? { OR: [
          { name:  { contains: String(keyword) } },
          { email: { contains: String(keyword) } },
        ] }
      : undefined;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.nguoiDung.count({ where }),
      this.prisma.nguoiDung.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
        orderBy: { id: 'asc' },
        skip: (pi - 1) * ps,
        take: ps,
      }),
    ]);

    return { total, pageIndex: pi, pageSize: ps, items };
  }

  async detail(id: number) {
    const it = await this.prisma.nguoiDung.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
    });
    if (!it) throw new NotFoundException('Người dùng không tồn tại');
    return it;
  }

  // ADMIN: tạo user — hash password, chống trùng email (P2002)
  async create(dto: { name: string; email: string; password: string; role?: string; phone?: string }) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.nguoiDung.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashed,
          role: (dto.role as any) ?? 'USER',
          phone: dto.phone ?? null,
        },
        select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') throw new BadRequestException('Email đã tồn tại');
      throw e;
    }
  }

  // ADMIN: cập nhật user (có thể đổi password)
  async update(id: number, dto: any) {
    const data: any = {};
    if (dto.name !== undefined)  data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined)  data.role = dto.role;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      return await this.prisma.nguoiDung.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Người dùng không tồn tại');
      if (e?.code === 'P2002') throw new BadRequestException('Email đã tồn tại');
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.nguoiDung.delete({
        where: { id },
        select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Người dùng không tồn tại');
      throw e;
    }
  }

  // Tìm theo tên/email (đơn giản) — có phân trang
  async search(pageIndex = 1, pageSize = 10, keyword?: string) {
    return this.list(pageIndex, pageSize, keyword);
  }

  // Hồ sơ của chính mình
  async me(userId: number) {
    return this.detail(userId);
  }

  // Cập nhật hồ sơ cá nhân 
  async updateMe(userId: number, dto: { name?: string; phone?: string; email?: string; password?: string; avatar?: string }) {
    const data: any = {};
    if (dto.name !== undefined)  data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.password !== undefined) data.password = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.nguoiDung.update({
        where: { id: userId },
        data,
        select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') throw new BadRequestException('Email đã tồn tại');
      throw e;
    }
  }

  
  async updateAvatar(userId: number, avatarUrl: string) {
    if (!avatarUrl) throw new BadRequestException('Không có file upload');
    return this.prisma.nguoiDung.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
    });
  }
}
