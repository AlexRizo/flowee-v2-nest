/*
  Warnings:

  - A unique constraint covering the columns `[userId,boardId]` on the table `UserBoard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserBoard_userId_boardId_key" ON "UserBoard"("userId", "boardId");
