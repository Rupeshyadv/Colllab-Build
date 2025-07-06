/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- DropIndex
DROP INDEX "idx_user_username";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username";
