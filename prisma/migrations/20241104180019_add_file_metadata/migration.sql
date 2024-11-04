-- AlterTable
ALTER TABLE "File" ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- After the migration, you can remove the default constraint if you want
ALTER TABLE "File" ALTER COLUMN "size" DROP DEFAULT;
