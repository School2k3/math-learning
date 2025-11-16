/*
  Warnings:

  - Added the required column `lesson_number` to the `Lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Lessons" ADD COLUMN     "lesson_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Questions" ADD COLUMN     "topic" TEXT NOT NULL;
