import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ChiTietLoaiService {
  constructor(private prisma: PrismaService) {}

  async list(pageIndex = 1, pageSize = 10, keyword?: string) {
    const pi = Math.max(1, Number(pageIndex) || 1);
    const ps = Math.max(1, Number(pageSize) || 10);

    const where = keyword
      ? { tenChiTiet: { contains: String(keyword) } }
      : undefined;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.chiTietLoaiCongViec.count({ where }),
      this.prisma.chiTietLoaiCongViec.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (pi - 1) * ps,
        take: ps,
      }),
    ]);

    return { total, pageIndex: pi, pageSize: ps, items };
  }

  async detail(id: number) {
    const it = await this.prisma.chiTietLoaiCongViec.findUnique({
      where: { id },
    });
    if (!it) throw new NotFoundException("Chi tiết loại không tồn tại");
    return it;
  }

  async getChiTietTheoLoai(loaiId: number) {
    const loai = await this.prisma.loaiCongViec.findUnique({
      where: { id: loaiId },
    });
    if (!loai) throw new NotFoundException("Loại công việc không tồn tại");

    return this.prisma.chiTietLoaiCongViec.findMany({
      where: { loaiCongViecId: loaiId },
      orderBy: { id: "asc" },
    });
  }

  async create(dto: {
    tenChiTiet: string;
    hinhAnh?: string;
    loaiCongViecId: number;
  }) {
    if (!dto.tenChiTiet?.trim())
      throw new BadRequestException("tenChiTiet là bắt buộc");
    if (!dto.loaiCongViecId)
      throw new BadRequestException("loaiCongViecId là bắt buộc");

    try {
      return this.prisma.chiTietLoaiCongViec.create({
        data: {
          tenChiTiet: dto.tenChiTiet,
          hinhAnh: dto.hinhAnh ?? null,
          loaiCongViecId: dto.loaiCongViecId,
        } as Prisma.ChiTietLoaiCongViecUncheckedCreateInput,
      });
    } catch (e: any) {
      if (e?.code === "P2003")
        throw new BadRequestException(
          "Khóa ngoại không hợp lệ (loaiCongViecId)"
        );

      if (e?.code === "P2002")
        throw new BadRequestException("Chi tiết loại đã tồn tại");
      throw e;
    }
  }

  async update(
    id: number,
    dto: { tenChiTiet?: string; hinhAnh?: string; loaiCongViecId?: number }
  ) {
    const exists = await this.prisma.chiTietLoaiCongViec.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException("Chi tiết loại không tồn tại");

    try {
      return await this.prisma.chiTietLoaiCongViec.update({
        where: { id },
        data: {
          ...(dto.tenChiTiet !== undefined
            ? { tenChiTiet: dto.tenChiTiet }
            : {}),
          ...(dto.hinhAnh !== undefined ? { hinhAnh: dto.hinhAnh } : {}),
          ...(dto.loaiCongViecId !== undefined
            ? { loaiCongViecId: dto.loaiCongViecId }
            : {}),
        },
      });
    } catch (e: any) {
      if (e?.code === "P2003")
        throw new BadRequestException(
          "Khóa ngoại không hợp lệ (loaiCongViecId)"
        );
      if (e?.code === "P2002")
        throw new BadRequestException("Chi tiết loại đã tồn tại");
      throw e;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.chiTietLoaiCongViec.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === "P2025")
        throw new NotFoundException("Chi tiết loại không tồn tại");
      throw e;
    }
  }

  // Alias search (tái sử dụng list)
  async search(pageIndex = 1, pageSize = 10, keyword?: string) {
    return this.list(pageIndex, pageSize, keyword);
  }

  createGroup(body: any) {
    return { createdGroup: true, body };
  }
  uploadForGroup(maNhom: number, file?: Express.Multer.File) {
    return {
      nhomId: maNhom,
      uploaded: !!file,
      path: file ? `/uploads/${file.filename || file.originalname}` : null,
    };
  }
  updateGroup(id: number, body: any) {
    return { updatedGroup: id, body };
  }
}
