/*
  Warnings:

  - You are about to drop the column `budget` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `revenue` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `tagline` on the `movies` table. All the data in the column will be lost.
  - Made the column `poster_path` on table `movies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `release_date` on table `movies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `popularity` on table `movies` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "idx_movies_release_date";

-- AlterTable
ALTER TABLE "movies" DROP COLUMN "budget",
DROP COLUMN "revenue",
DROP COLUMN "runtime",
DROP COLUMN "status",
DROP COLUMN "tagline",
ADD COLUMN     "genre_ids" INTEGER[],
ALTER COLUMN "poster_path" SET NOT NULL,
ALTER COLUMN "release_date" SET NOT NULL,
ALTER COLUMN "release_date" SET DATA TYPE TEXT,
ALTER COLUMN "popularity" SET NOT NULL,
ALTER COLUMN "adult" DROP NOT NULL,
ALTER COLUMN "original_language" DROP NOT NULL,
ALTER COLUMN "original_title" DROP NOT NULL,
ALTER COLUMN "video" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_movies_title" ON "movies"("title");
