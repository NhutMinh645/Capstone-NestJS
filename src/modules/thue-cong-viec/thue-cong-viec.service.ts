import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "@prisma/client";

type ListFilters = {
  congViecId?: number;
  nguoiDungId?: number;
  hoanThanh?: boolean;
};

@Injectable()
export class ThueCongViecService {
  constructor(private prisma: PrismaService) {}

  // thue-cong-viec.service.ts
  async list(
    pageIndex = 1,
    pageSize = 10,
    filters: {
      congViecId?: number;
      nguoiDungId?: number;
      hoanThanh?: boolean;
    } = {}
  ) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where: any = {};
    if (filters.congViecId !== undefined)
      where.congViecId = Number(filters.congViecId);
    if (filters.nguoiDungId !== undefined)
      where.nguoiDungId = Number(filters.nguoiDungId);
    if (typeof filters.hoanThanh === "boolean")
      where.hoanThanh = filters.hoanThanh;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.thueCongViec.count({ where }),
      this.prisma.thueCongViec.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (pi - 1) * ps,
        take: ps,
      }),
    ]);

    return { total, pageIndex: pi, pageSize: ps, items };
  }

  async detail(id: number) {
    const it = await this.prisma.thueCongViec.findUnique({ where: { id } });
    if (!it) throw new NotFoundException("Không tìm thấy đơn thuê");
    return it;
  }

  // Tạo đơn thuê: user hiện tại là người thuê
  async create(
    userId: number,
    dto: { congViecId: number; ngayThue?: Date; hoanThanh?: boolean }
  ) {
    if (!dto.congViecId)
      throw new BadRequestException("congViecId là bắt buộc");

    try {
      return await this.prisma.thueCongViec.create({
        data: {
          congViec: { connect: { id: dto.congViecId } },
          nguoiDung: { connect: { id: userId } },
          ngayThue: dto.ngayThue ?? new Date(),
          hoanThanh: dto.hoanThanh ?? false,
        } as Prisma.ThueCongViecCreateInput,
      });
    } catch (e: any) {
      if (e?.code === "P2003")
        throw new BadRequestException(
          "Khóa ngoại không hợp lệ (congViecId hoặc nguoiDungId)"
        );
      throw e;
    }
  }

  // Admin cập nhật: cho phép chỉnh congViecId/ngayThue/hoanThanh
  async updateAdmin(
    id: number,
    dto: { congViecId?: number; ngayThue?: Date; hoanThanh?: boolean }
  ) {
    const exists = await this.prisma.thueCongViec.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Không tìm thấy đơn thuê");

    const data: any = {};
    if (dto.congViecId !== undefined)
      data.congViec = { connect: { id: dto.congViecId } };
    if (dto.ngayThue !== undefined) data.ngayThue = dto.ngayThue;
    if (dto.hoanThanh !== undefined) data.hoanThanh = dto.hoanThanh;

    try {
      return await this.prisma.thueCongViec.update({ where: { id }, data });
    } catch (e: any) {
      if (e?.code === "P2003")
        throw new BadRequestException("Khóa ngoại không hợp lệ (congViecId)");
      throw e;
    }
  }

  // Admin xóa
  async removeAdmin(id: number) {
    try {
      return await this.prisma.thueCongViec.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === "P2025")
        throw new NotFoundException("Không tìm thấy đơn thuê");
      throw e;
    }
  }

  // Đơn thuê của chính mình (phân trang)
  async myOrders(
    userId: number,
    pageIndex = 1,
    pageSize = 10,
    hoanThanh?: boolean
  ) {
    const filters: ListFilters = { nguoiDungId: userId };
    if (hoanThanh !== undefined) filters.hoanThanh = hoanThanh;
    return this.list(pageIndex, pageSize, filters);
  }

  // Hoàn thành đơn: owner hoặc admin
  async complete(currentUser: { id: number; role?: string }, id: number) {
    const it = await this.prisma.thueCongViec.findUnique({
      where: { id },
      select: { nguoiDungId: true, hoanThanh: true },
    });
    if (!it) throw new NotFoundException("Không tìm thấy đơn thuê");
    if (it.hoanThanh) return { id, hoanThanh: true }; // idempotent

    const isOwner = it.nguoiDungId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";
    if (!isOwner && !isAdmin)
      throw new ForbiddenException(
        "Chỉ chủ đơn hoặc admin được phép hoàn thành"
      );

    return this.prisma.thueCongViec.update({
      where: { id },
      data: { hoanThanh: true },
    });
  }
}
