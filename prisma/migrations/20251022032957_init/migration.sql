-- CreateTable
CREATE TABLE `Sede` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `presentacion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medicamentoId` INTEGER NOT NULL,
    `sedeId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `motivoNoDisp` VARCHAR(191) NULL,
    `alternativa` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_medicamentoId_fkey` FOREIGN KEY (`medicamentoId`) REFERENCES `Medicamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_sedeId_fkey` FOREIGN KEY (`sedeId`) REFERENCES `Sede`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
