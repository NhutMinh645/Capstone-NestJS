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
    include: {
      
      chiTietLoaiCongViec: true, 
    },
    orderBy: { id: 'asc' },
  });
}
async getCongViecChiTiet(id: number) {
    const row = await this.prisma.congViec.findUnique({
      where: { id },
      include: {
        chiTietLoaiCongViec: true, 
      },
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

  async create(dto: { tenCongViec: string; moTa?: string; giaTien: number; chiTietLoaiCongViecId: number; saoDanhGia?: number }) {
    try {
      const chiTietId = Number(dto.chiTietLoaiCongViecId);
      if (!chiTietId || Number.isNaN(chiTietId)) throw new BadRequestException('chiTietLoaiCongViecId không hợp lệ');

      const exists = await this.prisma.chiTietLoaiCongViec.findUnique({ where: { id: chiTietId } });
      if (!exists) throw new BadRequestException('ChiTietLoaiCongViec không tồn tại');

      // Nếu id KHÔNG autoincrement, tự tính id
      const nextId = (await this.prisma.congViec.count()) + 1;

      return await this.prisma.congViec.create({
        data: {
          id: nextId, // nếu model có autoincrement thì bỏ dòng này
          tenCongViec: dto.tenCongViec.trim(),
          moTa: dto.moTa?.toString().slice(0, 20000) || null, // tránh P2000
          giaTien: Number(dto.giaTien),
          saoDanhGia: Number(dto.saoDanhGia ?? 0),
          chiTietLoaiCongViecId: chiTietId,
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

  update(id: number, dto: any) {
    return this.prisma.congViec.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.congViec.delete({ where: { id } });
  }
}
