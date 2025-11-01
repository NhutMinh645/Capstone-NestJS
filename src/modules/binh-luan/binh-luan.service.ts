import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateBinhLuanDto } from "./dto/create-binh-luan.dto";

@Injectable()
export class BinhLuanService {
  constructor(private prisma: PrismaService) {}

  async list(pageIndex = 1, pageSize = 10, keyword?: string) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where: Prisma.BinhLuanWhereInput | undefined = keyword
      ? { noiDung: { contains: String(keyword) } }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.binhLuan.findMany({
        where,
        skip: (pi - 1) * ps,
        take: ps,
        orderBy: { id: "desc" },
        select: {
          id: true,
          noiDung: true,
          saoBinhLuan: true,
          ngayBinhLuan: true,
          congViecId: true,
          nguoiDungId: true,
        },
      }),
      this.prisma.binhLuan.count({ where }),
    ]);

    return { pageIndex: pi, pageSize: ps, total, items };
  }

  async getById(id: number) {
    const found = await this.prisma.binhLuan.findUnique({
      where: { id },
      select: {
        id: true,
        noiDung: true,
        saoBinhLuan: true,
        ngayBinhLuan: true,
        congViecId: true,
        nguoiDungId: true,
      },
    });
    if (!found) throw new NotFoundException("Bình luận không tồn tại");
    return found;
  }

  async findByCongViec(
  congViecId: number,
  pageIndex = 1,
  pageSize = 10,
) {
  const pi = Math.max(1, Number(pageIndex) || 1);
  const ps = Math.max(1, Number(pageSize) || 10);
  const skip = (pi - 1) * ps;

  const where: Prisma.BinhLuanWhereInput = { congViecId };

  const [total, items] = await this.prisma.$transaction([
    this.prisma.binhLuan.count({ where }),
    this.prisma.binhLuan.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: ps,
      select: {
        id: true,
        noiDung: true,
        saoBinhLuan: true,
        ngayBinhLuan: true,
        congViecId: true,
        nguoiDungId: true,
        // tuỳ chọn: trả kèm tên user/job nếu cần
        // nguoiDung: { select: { id: true, name: true } },
        // congViec: { select: { id: true, tenCongViec: true } },
      },
    }),
  ]);

  return { pageIndex: pi, pageSize: ps, total, items };
}

 async create(dto: CreateBinhLuanDto) {
    // 1) Kiểm tra khóa ngoại để tránh 500
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: dto.nguoiDungId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const job = await this.prisma.congViec.findUnique({
      where: { id: dto.congViecId },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Công việc không tồn tại');

    try {
      // 2) Tạo bình luận với đúng tên field
      const created = await this.prisma.binhLuan.create({
        data: {
          noiDung: dto.noiDung,
          saoBinhLuan: dto.saoBinhLuan,
          nguoiDungId: dto.nguoiDungId,
          congViecId: dto.congViecId,
          ngayBinhLuan: new Date(),
        },
      });
      return { message: 'Tạo bình luận thành công', data: created };
    } catch (e) {
      // 3) Bắt lỗi Prisma → trả 4xx dễ hiểu
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          // Foreign key constraint failed
          throw new BadRequestException('Khóa ngoại không hợp lệ (nguoiDungId/congViecId)');
        }
        if (e.code === 'P2002') {
          // Unique constraint (nếu có ràng buộc trùng)
          throw new BadRequestException('Dữ liệu trùng lặp');
        }
      }
      throw e;
    }
  }

  async update(
    id: number,
    data: Partial<{
      noiDung: string;
      nguoiDungId: number;
      congViecId: number;
      saoBinhLuan?: number | null;
    }>
  ) {
    try {
      return await this.prisma.binhLuan.update({
        where: { id },
        data,
        select: {
          id: true,
          noiDung: true,
          saoBinhLuan: true,
          ngayBinhLuan: true,
          congViecId: true,
          nguoiDungId: true,
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025")
          throw new NotFoundException("Bình luận không tồn tại");
        if (e.code === "P2003")
          throw new BadRequestException("Tham chiếu không hợp lệ");
        if (e.code === "P2002")
          throw new ConflictException("Dữ liệu trùng unique");
      }
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.binhLuan.delete({
        where: { id },
        select: {
          id: true,
          noiDung: true,
          saoBinhLuan: true,
          ngayBinhLuan: true,
          congViecId: true,
          nguoiDungId: true,
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new NotFoundException("Bình luận không tồn tại");
      }
      throw e;
    }
  }
}
