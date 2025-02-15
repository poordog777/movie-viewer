-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "belongs_to_collection" JSONB,
ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "homepage" TEXT,
ADD COLUMN     "imdb_id" TEXT,
ADD COLUMN     "origin_country" TEXT[],
ADD COLUMN     "production_companies" JSONB,
ADD COLUMN     "production_countries" JSONB,
ADD COLUMN     "revenue" INTEGER,
ADD COLUMN     "runtime" INTEGER,
ADD COLUMN     "spoken_languages" JSONB,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "tagline" TEXT;
