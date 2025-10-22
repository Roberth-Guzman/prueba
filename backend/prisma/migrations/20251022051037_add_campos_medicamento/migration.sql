-- AlterTable
ALTER TABLE `medicamento` ADD COLUMN `cantidad` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sucursal` VARCHAR(191) NULL;
