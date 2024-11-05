/*
  Warnings:

  - Added the required column `mimeType` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable first
ALTER TABLE "File" ADD COLUMN "mimeType" TEXT;

-- Step 2: Update existing records with a default MIME type
UPDATE "File" SET "mimeType" = 'application/octet-stream';

-- Step 3: Make the column required
ALTER TABLE "File" ALTER COLUMN "mimeType" SET NOT NULL;
