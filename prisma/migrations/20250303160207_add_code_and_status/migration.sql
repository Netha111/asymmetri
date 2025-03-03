-- AlterTable
ALTER TABLE "Asymmetri" ADD COLUMN     "code" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'idle';
