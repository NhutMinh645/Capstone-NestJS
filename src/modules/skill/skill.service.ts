import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.skill.findMany({ orderBy: { id: 'asc' } });
  }

  async detail(id: number) {
    const it = await this.prisma.skill.findUnique({ where: { id } });
    if (!it) throw new NotFoundException('Skill không tồn tại');
    return it;
  }

  async searchPagination(pageIndex = 1, pageSize = 10, keyword?: string) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where = keyword
      ? { tenSkill: { contains: String(keyword)} }
      : undefined;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.skill.count({ where }),
      this.prisma.skill.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (pi - 1) * ps,
        take: ps,
      }),
    ]);

    return { total, pageIndex: pi, pageSize: ps, items };
  }

  
  async create(dto: { tenSkill: string; moTa?: string }) {
    const name = dto.tenSkill?.trim();
    if (!name) throw new BadRequestException('tenSkill là bắt buộc');

    // dùng upsert để tránh duplicate error
    return this.prisma.skill.upsert({
      where: { tenSkill: name }, // cần UNIQUE trên cột tenSkill
      create: {
        tenSkill: name,
        moTa: dto.moTa?.trim() || null,
      },
      update: {
        // nếu client gửi moTa thì cập nhật; nếu không, giữ nguyên
        ...(dto.moTa !== undefined ? { moTa: dto.moTa?.trim() || null } : {}),
      },
    });
  }

  async update(id: number, dto: { tenSkill?: string; moTa?: string }) {
    const exists = await this.prisma.skill.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Skill không tồn tại');

    // nếu đổi tên, phải đảm bảo không đụng tên của skill khác
    if (dto.tenSkill !== undefined) {
      const name = dto.tenSkill?.trim();
      if (!name) throw new BadRequestException('tenSkill không được rỗng');
      const dup = await this.prisma.skill.findUnique({ where: { tenSkill: name } });
      if (dup && dup.id !== id) {
        throw new ConflictException('tenSkill đã tồn tại');
      }
    }

    return this.prisma.skill.update({
      where: { id },
      data: {
        ...(dto.tenSkill !== undefined ? { tenSkill: dto.tenSkill.trim() } : {}),
        ...(dto.moTa !== undefined ? { moTa: dto.moTa?.trim() || null } : {}),
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.skill.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Skill không tồn tại');
      throw e;
    }
  }
}
