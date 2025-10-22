-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'ATTENTION', 'IN_PROGRESS', 'FOR_REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PRINT', 'DIGITAL', 'ECOMMERCE', 'SPECIAL');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "type" "TaskType" NOT NULL DEFAULT 'DIGITAL',
    "authorId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintTask" (
    "id" TEXT NOT NULL,

    CONSTRAINT "PrintTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalTask" (
    "id" TEXT NOT NULL,

    CONSTRAINT "DigitalTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcommerceTask" (
    "id" TEXT NOT NULL,

    CONSTRAINT "EcommerceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialTask" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "legals" TEXT NOT NULL,

    CONSTRAINT "SpecialTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintTask" ADD CONSTRAINT "PrintTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalTask" ADD CONSTRAINT "DigitalTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceTask" ADD CONSTRAINT "EcommerceTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialTask" ADD CONSTRAINT "SpecialTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
