/*
  Warnings:

  - A unique constraint covering the columns `[tenSkill]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - Made the column `tenSkill` on table `Skill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Skill` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `tenSkill` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Skill_tenSkill_key` ON `Skill`(`tenSkill`);
