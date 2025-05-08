-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_url_key" ON "Profile"("url");
