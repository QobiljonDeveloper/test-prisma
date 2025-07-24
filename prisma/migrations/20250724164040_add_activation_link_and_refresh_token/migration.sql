-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activationLink" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
