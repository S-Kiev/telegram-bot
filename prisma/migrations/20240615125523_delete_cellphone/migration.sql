/*
  Warnings:

  - You are about to drop the column `cellphone` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_cellphone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cellphone";
