-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "name" TEXT,
    "lastname" TEXT,
    "cellphone" TEXT NOT NULL,
    "messageCounter" INTEGER NOT NULL DEFAULT 1,
    "city" TEXT,
    "country" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_chatId_key" ON "User"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cellphone_key" ON "User"("cellphone");
