/*
  Warnings:

  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chapters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `practice_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `practice_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `progress_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_answers" DROP CONSTRAINT "exam_answers_chosen_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_answers" DROP CONSTRAINT "exam_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_answers" DROP CONSTRAINT "exam_answers_result_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_questions" DROP CONSTRAINT "exam_questions_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_questions" DROP CONSTRAINT "exam_questions_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_results" DROP CONSTRAINT "exam_results_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."exam_results" DROP CONSTRAINT "exam_results_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."lessons" DROP CONSTRAINT "lessons_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."practice_answers" DROP CONSTRAINT "practice_answers_chosen_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."practice_answers" DROP CONSTRAINT "practice_answers_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."practice_answers" DROP CONSTRAINT "practice_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."practice_sessions" DROP CONSTRAINT "practice_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_history" DROP CONSTRAINT "progress_history_exam_result_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_history" DROP CONSTRAINT "progress_history_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_history" DROP CONSTRAINT "progress_history_practice_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_history" DROP CONSTRAINT "progress_history_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_rewards" DROP CONSTRAINT "user_rewards_reward_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_rewards" DROP CONSTRAINT "user_rewards_user_id_fkey";

-- DropTable
DROP TABLE "public"."answers";

-- DropTable
DROP TABLE "public"."chapters";

-- DropTable
DROP TABLE "public"."exam_answers";

-- DropTable
DROP TABLE "public"."exam_questions";

-- DropTable
DROP TABLE "public"."exam_results";

-- DropTable
DROP TABLE "public"."exams";

-- DropTable
DROP TABLE "public"."lessons";

-- DropTable
DROP TABLE "public"."practice_answers";

-- DropTable
DROP TABLE "public"."practice_sessions";

-- DropTable
DROP TABLE "public"."progress_history";

-- DropTable
DROP TABLE "public"."questions";

-- DropTable
DROP TABLE "public"."rewards";

-- DropTable
DROP TABLE "public"."user_rewards";

-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "public"."Users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "grade" INTEGER,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Chapters" (
    "chapter_id" SERIAL NOT NULL,
    "grade" INTEGER NOT NULL,
    "volume" INTEGER NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Chapters_pkey" PRIMARY KEY ("chapter_id")
);

-- CreateTable
CREATE TABLE "public"."Lessons" (
    "lesson_id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "lesson_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content_text" TEXT NOT NULL,
    "video_url" TEXT,
    "image_url" TEXT,

    CONSTRAINT "Lessons_pkey" PRIMARY KEY ("lesson_id")
);

-- CreateTable
CREATE TABLE "public"."Questions" (
    "question_id" SERIAL NOT NULL,
    "question_text" TEXT NOT NULL,
    "image_url" TEXT,
    "audio_url" TEXT,
    "grade" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "public"."Answers" (
    "answer_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "public"."PracticeSessions" (
    "practice_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "PracticeSessions_pkey" PRIMARY KEY ("practice_id")
);

-- CreateTable
CREATE TABLE "public"."PracticeAnswers" (
    "practice_answer_id" SERIAL NOT NULL,
    "practice_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "chosen_answer_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "PracticeAnswers_pkey" PRIMARY KEY ("practice_answer_id")
);

-- CreateTable
CREATE TABLE "public"."Exams" (
    "exam_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exams_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "public"."ExamQuestions" (
    "exam_question_id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "ExamQuestions_pkey" PRIMARY KEY ("exam_question_id")
);

-- CreateTable
CREATE TABLE "public"."ExamResults" (
    "result_id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "ExamResults_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "public"."ExamAnswers" (
    "exam_answer_id" SERIAL NOT NULL,
    "result_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "chosen_answer_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "is_flagged" BOOLEAN NOT NULL,

    CONSTRAINT "ExamAnswers_pkey" PRIMARY KEY ("exam_answer_id")
);

-- CreateTable
CREATE TABLE "public"."Rewards" (
    "reward_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Rewards_pkey" PRIMARY KEY ("reward_id")
);

-- CreateTable
CREATE TABLE "public"."UserRewards" (
    "user_reward_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reward_id" INTEGER NOT NULL,
    "acquired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRewards_pkey" PRIMARY KEY ("user_reward_id")
);

-- CreateTable
CREATE TABLE "public"."ProgressHistory" (
    "history_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lesson_id" INTEGER,
    "practice_id" INTEGER,
    "exam_result_id" INTEGER,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "public"."Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- AddForeignKey
ALTER TABLE "public"."Lessons" ADD CONSTRAINT "Lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."Chapters"("chapter_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answers" ADD CONSTRAINT "Answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PracticeSessions" ADD CONSTRAINT "PracticeSessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PracticeAnswers" ADD CONSTRAINT "PracticeAnswers_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "public"."PracticeSessions"("practice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PracticeAnswers" ADD CONSTRAINT "PracticeAnswers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PracticeAnswers" ADD CONSTRAINT "PracticeAnswers_chosen_answer_id_fkey" FOREIGN KEY ("chosen_answer_id") REFERENCES "public"."Answers"("answer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamQuestions" ADD CONSTRAINT "ExamQuestions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamQuestions" ADD CONSTRAINT "ExamQuestions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamResults" ADD CONSTRAINT "ExamResults_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamResults" ADD CONSTRAINT "ExamResults_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAnswers" ADD CONSTRAINT "ExamAnswers_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "public"."ExamResults"("result_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAnswers" ADD CONSTRAINT "ExamAnswers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."Questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamAnswers" ADD CONSTRAINT "ExamAnswers_chosen_answer_id_fkey" FOREIGN KEY ("chosen_answer_id") REFERENCES "public"."Answers"("answer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRewards" ADD CONSTRAINT "UserRewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRewards" ADD CONSTRAINT "UserRewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."Rewards"("reward_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressHistory" ADD CONSTRAINT "ProgressHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressHistory" ADD CONSTRAINT "ProgressHistory_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."Lessons"("lesson_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressHistory" ADD CONSTRAINT "ProgressHistory_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "public"."PracticeSessions"("practice_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressHistory" ADD CONSTRAINT "ProgressHistory_exam_result_id_fkey" FOREIGN KEY ("exam_result_id") REFERENCES "public"."ExamResults"("result_id") ON DELETE SET NULL ON UPDATE CASCADE;
