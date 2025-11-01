-- CreateTable
CREATE TABLE `NguoiDung` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `avatar` TEXT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',

    UNIQUE INDEX `NguoiDung_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoaiCongViec` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenLoaiCongViec` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChiTietLoaiCongViec` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenChiTiet` VARCHAR(191) NOT NULL,
    `loaiCongViecId` INTEGER NOT NULL,
    `hinhAnh` VARCHAR(191) NULL,

    INDEX `ChiTietLoaiCongViec_loaiCongViecId_idx`(`loaiCongViecId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CongViec` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenCongViec` VARCHAR(255) NULL,
    `moTa` TEXT NULL,
    `moTaNgan` TEXT NULL,
    `giaTien` INTEGER NULL,
    `hinhAnh` TEXT NULL,
    `danhGia` INTEGER NULL DEFAULT 0,
    `saoCongViec` INTEGER NULL DEFAULT 0,
    `chiTietLoaiCongViecId` INTEGER NULL,
    `nguoiTao` INTEGER NULL,

    INDEX `CongViec_chiTietLoaiCongViecId_fkey`(`chiTietLoaiCongViecId`),
    INDEX `CongViec_nguoiTao_idx`(`nguoiTao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` INTEGER NOT NULL,
    `tenSkill` VARCHAR(191) NULL,
    `moTa` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BinhLuan` (
    `id` INTEGER NOT NULL,
    `noiDung` LONGTEXT NULL,
    `saoBinhLuan` INTEGER NULL,
    `ngayBinhLuan` DATETIME(3) NULL,
    `congViecId` INTEGER NULL,
    `nguoiDungId` INTEGER NULL,

    INDEX `BinhLuan_congViecId_fkey`(`congViecId`),
    INDEX `BinhLuan_nguoiDungId_fkey`(`nguoiDungId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ThueCongViec` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ngayThue` DATETIME(3) NULL,
    `hoanThanh` BOOLEAN NULL DEFAULT false,
    `congViecId` INTEGER NULL,
    `nguoiDungId` INTEGER NULL,

    INDEX `ThueCongViec_congViecId_fkey`(`congViecId`),
    INDEX `ThueCongViec_nguoiDungId_fkey`(`nguoiDungId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChiTietLoaiCongViec` ADD CONSTRAINT `ChiTietLoaiCongViec_loaiCongViecId_fkey` FOREIGN KEY (`loaiCongViecId`) REFERENCES `LoaiCongViec`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CongViec` ADD CONSTRAINT `CongViec_chiTietLoaiCongViecId_fkey` FOREIGN KEY (`chiTietLoaiCongViecId`) REFERENCES `ChiTietLoaiCongViec`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CongViec` ADD CONSTRAINT `CongViec_nguoiTao_fkey` FOREIGN KEY (`nguoiTao`) REFERENCES `NguoiDung`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BinhLuan` ADD CONSTRAINT `BinhLuan_congViecId_fkey` FOREIGN KEY (`congViecId`) REFERENCES `CongViec`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BinhLuan` ADD CONSTRAINT `BinhLuan_nguoiDungId_fkey` FOREIGN KEY (`nguoiDungId`) REFERENCES `NguoiDung`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThueCongViec` ADD CONSTRAINT `ThueCongViec_congViecId_fkey` FOREIGN KEY (`congViecId`) REFERENCES `CongViec`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThueCongViec` ADD CONSTRAINT `ThueCongViec_nguoiDungId_fkey` FOREIGN KEY (`nguoiDungId`) REFERENCES `NguoiDung`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
