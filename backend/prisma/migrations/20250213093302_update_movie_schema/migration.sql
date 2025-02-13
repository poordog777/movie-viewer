/*
  Warnings:

  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `original_language` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_title` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropIndex
DROP INDEX "movies_vote_average_idx";

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "adult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "backdrop_path" TEXT,
ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "original_language" TEXT NOT NULL,
ADD COLUMN     "original_title" TEXT NOT NULL,
ADD COLUMN     "revenue" INTEGER,
ADD COLUMN     "runtime" INTEGER,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "video" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "favorites";

-- DropTable
DROP TABLE "reviews";

-- RenameIndex
ALTER INDEX "movies_popularity_idx" RENAME TO "idx_movies_popularity";

-- RenameIndex
ALTER INDEX "movies_release_date_idx" RENAME TO "idx_movies_release_date";
