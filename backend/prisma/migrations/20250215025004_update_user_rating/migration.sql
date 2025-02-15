/*
  Warnings:

  - You are about to drop the `ratings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_user_id_fkey";

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "user_votes" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "ratings";
