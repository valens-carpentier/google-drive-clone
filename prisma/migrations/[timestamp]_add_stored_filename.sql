-- First add the column as nullable
ALTER TABLE "File" ADD COLUMN "storedName" TEXT;

-- Update existing records to use the name field as storedName
UPDATE "File" SET "storedName" = "name";

-- Make the column required
ALTER TABLE "File" ALTER COLUMN "storedName" SET NOT NULL; 