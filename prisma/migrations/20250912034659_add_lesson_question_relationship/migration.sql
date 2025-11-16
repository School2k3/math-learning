/*
  Warnings:

  - You are about to drop the column `lesson_number` on the `Lessons` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `Questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Lessons" DROP COLUMN "lesson_number";

-- AlterTable
ALTER TABLE "public"."Questions" DROP COLUMN "topic",
ADD COLUMN     "lesson_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."Explanations" (
    "explanation_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "content_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Explanations_pkey" PRIMARY KEY ("explanation_id")
);

-- CreateIndex
CREATE INDEX "Explanations_question_id_idx" ON "public"."Explanations"("question_id");

-- AddForeignKey
ALTER TABLE "public"."Questions" ADD CONSTRAINT "Questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."Lessons"("lesson_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Explanations" ADD CONSTRAINT "Explanations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Questions"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;
