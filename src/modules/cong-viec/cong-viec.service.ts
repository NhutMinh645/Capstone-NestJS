import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CongViecService {
  constructor(private prisma: PrismaService) {}

  async getMenuLoaiCongViec() {
    return this.prisma.loaiCongViec.findMany({
      include: { chiTietLoaiCongViecs: true },
      orderBy: { id: 'asc' },
    });
  }

  async getCongViecTheoChiTiet(chiTietId: number) {
    return this.prisma.congViec.findMany({
      where: { chiTietLoaiCongViecId: chiTietId },
      include: { chiTietLoaiCongViec: true },
      orderBy: { id: 'asc' },
    });
  }

  async getCongViecChiTiet(id: number) {
    const row = await this.prisma.congViec.findUnique({
      where: { id },
      include: { chiTietLoaiCongViec: true },
    });
    if (!row) throw new NotFoundException('Công việc không tồn tại');
    return row;
  }

  async getCongViecTheoTen(ten: string) {
    return this.prisma.congViec.findMany({
      where: { tenCongViec: { contains: ten } },
      include: { chiTietLoaiCongViec: true },
      orderBy: { id: 'asc' },
    });
  }

  list() {
    return this.prisma.congViec.findMany({ orderBy: { id: 'asc' } });
  }

  // ✅ type dto gồm cả saoCongViec (để không lỗi TS)
  async create(dto: {
    tenCongViec: string;
    moTa?: string;
    moTaNgan?: string;
    giaTien: number;
    hinhAnh?: string;
    chiTietLoaiCongViecId: number;
    danhGia?: number;
    saoCongViec?: number;   // <-- thêm field đúng tên schema
    saoDanhGia?: number;    // <-- nếu client còn gửi tên cũ, sẽ map sang saoCongViec
  }) {
    try {
      const chiTietId = Number(dto.chiTietLoaiCongViecId);
      if (!chiTietId || Number.isNaN(chiTietId)) {
        throw new BadRequestException('chiTietLoaiCongViecId không hợp lệ');
      }

      const exists = await this.prisma.chiTietLoaiCongViec.findUnique({ where: { id: chiTietId } });
      if (!exists) throw new BadRequestException('ChiTietLoaiCongViec không tồn tại');

      // ✅ KHÔNG tự set id (đã autoincrement)
      return await this.prisma.congViec.create({
        data: {
          tenCongViec: dto.tenCongViec.trim(),
          moTa: dto.moTa?.toString().slice(0, 20000) || null,
          moTaNgan: dto.moTaNgan ?? null,
          giaTien: Number(dto.giaTien),
          hinhAnh: dto.hinhAnh ?? null,
          danhGia: dto.danhGia ?? 0,
          // map tên cũ -> tên đúng trong schema
          saoCongViec: dto.saoCongViec ?? dto.saoDanhGia ?? 0,
          chiTietLoaiCongViecId: chiTietId,
          // hoặc dùng connect:
          // chiTietLoaiCongViec: { connect: { id: chiTietId } },
        },
      });
    } catch (e: any) {
      if (e.code === 'P2003') throw new BadRequestException('FK chiTietLoaiCongViecId không hợp lệ');
      if (e.code === 'P2000') throw new BadRequestException('Trường moTa quá dài so với schema');
      throw e;
    }
  }

  async searchPagination(pageIndex = 1, pageSize = 10, keyword?: string) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where = keyword ? { tenCongViec: { contains: String(keyword) } } : undefined;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.congViec.count({ where }),
      this.prisma.congViec.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (pi - 1) * ps,
        take: ps,
      }),
    ]);

    return { pageIndex: pi, pageSize: ps, total, totalPages: Math.max(1, Math.ceil(total / ps)), items };
  }

  async detail(id: number) {
    const row = await this.prisma.congViec.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Công việc không tồn tại');
    return row;
  }

  // ✅ Whitelist field hợp lệ cho Prisma
  async update(id: number, dto: any) {
    const data: any = {};
    if (dto.tenCongViec !== undefined) data.tenCongViec = String(dto.tenCongViec);
    if (dto.moTa !== undefined)       data.moTa = dto.moTa?.toString().slice(0, 20000) || null;
    if (dto.moTaNgan !== undefined)   data.moTaNgan = dto.moTaNgan ?? null;
    if (dto.giaTien !== undefined)    data.giaTien = Number(dto.giaTien);
    if (dto.hinhAnh !== undefined)    data.hinhAnh = dto.hinhAnh ?? null;
    if (dto.danhGia !== undefined)    data.danhGia = Number(dto.danhGia ?? 0);
    if (dto.saoCongViec !== undefined || dto.saoDanhGia !== undefined) {
      data.saoCongViec = Number(dto.saoCongViec ?? dto.saoDanhGia ?? 0);
    }
    if (dto.chiTietLoaiCongViecId !== undefined) {
      const chiTietId = Number(dto.chiTietLoaiCongViecId);
      if (!chiTietId || Number.isNaN(chiTietId)) throw new BadRequestException('chiTietLoaiCongViecId không hợp lệ');
      data.chiTietLoaiCongViecId = chiTietId;
      // hoặc:
      // data.chiTietLoaiCongViec = { connect: { id: chiTietId } };
    }

    return this.prisma.congViec.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.congViec.delete({ where: { id } });
  }
}
