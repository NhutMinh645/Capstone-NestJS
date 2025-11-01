/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HAS_HINH_ANH_IN_CTL = true;

/** Helpers */
const toInt = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const isBad = (v: any) =>
  v === undefined ||
  v === null ||
  v === "" ||
  v === "string" ||
  (typeof v === "number" && !Number.isFinite(v));

function toDate(v?: string | Date | null): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v).trim();
  if (!s) return null;

  // ISO
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;

  // dd/MM/yyyy
  const m1 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m1) {
    const [_, dd, mm, yyyy] = m1;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // MM-dd-yyyy
  const m2 = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (m2) {
    const [_, MM, dd, yyyy] = m2;
    const d = new Date(Number(yyyy), Number(MM) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

async function readSeedJson(): Promise<any> {
  const filePath = path.join(process.cwd(), "prisma", "seed-data.json");
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

function flattenChiTietLoai(
  raw: any[]
): Array<{
  id?: number;
  tenChiTiet: string;
  loaiCongViecId: number;
  hinhAnh?: string | null;
}> {
  if (!Array.isArray(raw)) return [];
  const looksFlat = raw.every((x) => x && (x.tenChiTiet || x.loaiCongViecId));
  if (looksFlat) {
    return raw
      .map((x) => ({
        id: toInt(x.id),
        tenChiTiet: String(x.tenChiTiet ?? "").trim(),
        loaiCongViecId: toInt(x.loaiCongViecId)!,
        ...(HAS_HINH_ANH_IN_CTL && x.hinhAnh !== undefined
          ? { hinhAnh: x.hinhAnh ?? null }
          : {}),
      }))
      .filter((r) => r.tenChiTiet && Number.isFinite(r.loaiCongViecId));
  }

  const out: Array<{
    id?: number;
    tenChiTiet: string;
    loaiCongViecId: number;
    hinhAnh?: string | null;
  }> = [];
  for (const grp of raw) {
    const loaiId = toInt(grp?.maLoaiCongviec);
    if (!loaiId) continue;
    const childs = Array.isArray(grp?.dsChiTietLoai) ? grp.dsChiTietLoai : [];
    for (const d of childs) {
      const item: any = {
        id: toInt(d?.id),
        tenChiTiet: String(d?.tenChiTiet ?? "").trim(),
        loaiCongViecId: loaiId,
      };
      if (HAS_HINH_ANH_IN_CTL && grp?.hinhAnh !== undefined)
        item.hinhAnh = grp.hinhAnh ?? null;
      if (item.tenChiTiet && Number.isFinite(item.loaiCongViecId))
        out.push(item);
    }
  }
  return out;
}

async function main() {
  console.log("🚀 Seeding start...");

  const data = await readSeedJson();

  /** 1) NguoiDung */
  if (Array.isArray(data.nguoiDung) && data.nguoiDung.length) {
    const users = await Promise.all(
      data.nguoiDung.map(async (u: any) => ({
        id: toInt(u.id),
        name: u.name ?? null,
        email: String(u.email).toLowerCase(),
        password: await bcrypt.hash(String(u.password ?? "123456"), 10),
        role: (u.role === "ADMIN" ? "ADMIN" : "USER") as "ADMIN" | "USER",
        phone: u.phone ?? null,
        avatar: u.avatar ?? null,
      }))
    );
    await prisma.nguoiDung.createMany({ data: users, skipDuplicates: true });
    console.log(`✅ Seed nguoiDung: ${users.length}`);
  } else {
    const admin = {
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("secret123", 10),
      role: "ADMIN" as const,
      phone: null,
      avatar: null,
    };
    await prisma.nguoiDung.createMany({ data: [admin], skipDuplicates: true });
    console.log("✅ Seed nguoiDung: 1 (auto admin)");
  }

  /** 2) LoaiCongViec */
  if (Array.isArray(data.loaiCongViec) && data.loaiCongViec.length) {
    const loais = data.loaiCongViec
      .map((x: any) => ({
        id: toInt(x.id),
        tenLoaiCongViec: String(x.tenLoaiCongViec ?? "").trim(),
      }))
      .filter((x: any) => x.tenLoaiCongViec);
    if (loais.length) {
      await prisma.loaiCongViec.createMany({
        data: loais,
        skipDuplicates: true,
      });
      console.log(`✅ Seed loaiCongViec: ${loais.length}`);
    }
  }

  if (
    Array.isArray(data.chiTietLoaiCongViec) &&
    data.chiTietLoaiCongViec.length
  ) {
    const flat = flattenChiTietLoai(data.chiTietLoaiCongViec);
    if (flat.length) {
      // Loại bỏ field hinhAnh nếu model không có
      const payload = flat.map((x) =>
        HAS_HINH_ANH_IN_CTL
          ? x
          : {
              id: x.id,
              tenChiTiet: x.tenChiTiet,
              loaiCongViecId: x.loaiCongViecId,
            }
      );
      await prisma.chiTietLoaiCongViec.createMany({
        data: payload as any[],
        skipDuplicates: true,
      });
      console.log(`✅ Seed chiTietLoaiCongViec: ${payload.length}`);
    }
  }

  /** 4) Skill */
  if (Array.isArray(data.skill) && data.skill.length) {
    const skills = data.skill
      .map((x: any) => ({
        id: toInt(x.id),
        tenSkill: String(x.tenSkill ?? "").trim(),
      }))
      .filter((x: any) => x.tenSkill);
    if (skills.length) {
      await prisma.skill.createMany({ data: skills, skipDuplicates: true });
      console.log(`✅ Seed skill: ${skills.length}`);
    }
  }

  // 5) CongViec
  if (Array.isArray(data.congViec) && data.congViec.length) {
    const jobs = data.congViec
      .map((x: any) => ({
        id: Number(x.id),
        tenCongViec: String(x.tenCongViec ?? "").trim(),
        giaTien: Number.isFinite(Number(x.giaTien)) ? Number(x.giaTien) : null,
        moTa: x.moTa ?? null,
        moTaNgan: x.moTaNgan ?? null,
        hinhAnh: x.hinhAnh ?? null,
        danhGia: Number.isFinite(Number(x.danhGia)) ? Number(x.danhGia) : 0,
        saoCongViec: Number.isFinite(Number(x.saoCongViec))
          ? Number(x.saoCongViec)
          : 0,
        chiTietLoaiCongViecId:
          Number(x.maChiTietLoaiCongViec) || Number(x.chiTietLoaiCongViecId),
        nguoiTao: Number(x.nguoiTao) || 1,
      }))
      .filter(
        (j: any) =>
          j.tenCongViec &&
          Number.isFinite(j.chiTietLoaiCongViecId) &&
          Number.isFinite(j.nguoiTao)
      );

    if (jobs.length) {
      await prisma.congViec.createMany({
        data: jobs as any[],
        skipDuplicates: true,
      });
      console.log(`✅ Seed congViec: ${jobs.length}`);
    }
  }

  /** 6) BinhLuan */
  if (Array.isArray(data.binhLuan) && data.binhLuan.length) {
    const comments = data.binhLuan
      .map((x: any) => ({
        id: toInt(x.id),
        noiDung: String(x.noiDung ?? "").trim(),
        saoBinhLuan: toInt(x.saoBinhLuan) ?? 5,
        ngayBinhLuan: toDate(x.ngayBinhLuan),
        congViecId: toInt(x.congViecId) ?? toInt(x.maCongViec),
        nguoiDungId:
          toInt(x.nguoiDungId) ??
          toInt(x.maNguoiBinhLuan) ??
          toInt(x.maNguoiDung),
      }))
      .filter(
        (c: any) =>
          c.noiDung &&
          Number.isFinite(c.congViecId) &&
          Number.isFinite(c.nguoiDungId)
      );

    if (comments.length) {
      await prisma.binhLuan.createMany({
        data: comments as any[],
        skipDuplicates: true,
      });
      console.log(`✅ Seed binhLuan: ${comments.length}`);
    }
  }

  /** 7) ThueCongViec */
  if (Array.isArray(data.thueCongViec) && data.thueCongViec.length) {
    const rentals = data.thueCongViec
      .map((x: any) => ({
        id: toInt(x.id),

        congViecId: toInt(x.congViecId) ?? toInt(x.maCongViec),
        nguoiDungId: toInt(x.nguoiDungId) ?? toInt(x.maNguoiThue),
        ngayThue: isBad(x.ngayThue) ? null : toDate(x.ngayThue),
        hoanThanh: Boolean(x.hoanThanh ?? false),
      }))
      .filter(
        (r: any) =>
          Number.isFinite(r.congViecId) && Number.isFinite(r.nguoiDungId)
      );

    if (rentals.length) {
      await prisma.thueCongViec.createMany({
        data: rentals as any[],
        skipDuplicates: true,
      });
      console.log(`✅ Seed thueCongViec: ${rentals.length}`);
    }
  }

  console.log("🎉 Seeding done!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
