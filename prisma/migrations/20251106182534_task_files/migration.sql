-- CreateEnum
CREATE TYPE "TaskFileType" AS ENUM ('REQUIRED', 'REFERENCE');

-- CreateTable
CREATE TABLE "TaskFiles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TaskFileType" NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TaskFiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskFiles_key_key" ON "TaskFiles"("key");

-- AddForeignKey
ALTER TABLE "TaskFiles" ADD CONSTRAINT "TaskFiles_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
