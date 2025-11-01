import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class LoaiCongViecService {
  constructor(private prisma: PrismaService) {}

  async list(pageIndex = 1, pageSize = 10, keyword?: string) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where = keyword
      ? { tenLoaiCongViec: { contains: String(keyword) } }
      : undefined;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.loaiCongViec.count({ where }),
      this.prisma.loaiCongViec.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (pi - 1) * ps,
        take: ps,
      
      }),
    ]);

    return { total, pageIndex: pi, pageSize: ps, items };
  }

  async detail(id: number) {
    const it = await this.prisma.loaiCongViec.findUnique({
      where: { id },
      // include: { chiTietLoaiCongViec: true } // bật nếu cần
    });
    if (!it) throw new NotFoundException("Loại công việc không tồn tại");
    return it;
  }

  async create(dto: { tenLoaiCongViec: string }) {
    if (!dto.tenLoaiCongViec?.trim())
      throw new BadRequestException("tenLoaiCongViec là bắt buộc");

    try {
      return await this.prisma.loaiCongViec.create({
        data: {
          tenLoaiCongViec: dto.tenLoaiCongViec,
        } as Prisma.LoaiCongViecUncheckedCreateInput,
      });
    } catch (e: any) {
      // P2002: unique constraint
      if (e?.code === "P2002")
        throw new BadRequestException("Tên loại công việc đã tồn tại");
      throw e;
    }
  }

  async update(id: number, dto: { tenLoaiCongViec?: string }) {
    // kiểm tra tồn tại để trả 404 chuẩn
    const exists = await this.prisma.loaiCongViec.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Loại công việc không tồn tại");

    try {
      return await this.prisma.loaiCongViec.update({
        where: { id },
        data: {
          ...(dto.tenLoaiCongViec !== undefined
            ? { tenLoaiCongViec: dto.tenLoaiCongViec }
            : {}),
        },
      });
    } catch (e: any) {
      if (e?.code === "P2002")
        throw new BadRequestException("Tên loại công việc đã tồn tại");
      throw e;
    }
  }

 async remove(id: number) {
  const existed = await this.prisma.loaiCongViec.findUnique({ where: { id } });
  if (!existed) throw new NotFoundException('Loại công việc không tồn tại');

  const [cntDetail, cntJob] = await this.prisma.$transaction([
    this.prisma.chiTietLoaiCongViec.count({ where: { loaiCongViecId: id } }),
    this.prisma.congViec.count({ where: { chiTietLoaiCongViec: { loaiCongViecId: id } } }),
  ]);

  if (cntDetail + cntJob > 0) {
    throw new BadRequestException(
      `Không thể xoá vì đang được tham chiếu (ChiTietLoai: ${cntDetail}, CongViec: ${cntJob})`
    );
  }
  return this.prisma.loaiCongViec.delete({ where: { id } });
}

async removeForce(id: number) {
  await this.prisma.loaiCongViec.findUniqueOrThrow({ where: { id } });

  return this.prisma.$transaction(async (tx) => {
    // Xoá công việc thuộc các chi tiết của loại này
    await tx.congViec.deleteMany({
      where: { chiTietLoaiCongViec: { loaiCongViecId: id } },
    });
    // Xoá chi tiết loại
    await tx.chiTietLoaiCongViec.deleteMany({
      where: { loaiCongViecId: id },
    });
    // Xoá loại
    return tx.loaiCongViec.delete({ where: { id } });
  });
}

  // Alias search (tái dùng list)
  async search(pageIndex = 1, pageSize = 10, keyword?: string) {
    return this.list(pageIndex, pageSize, keyword);
  }
}
