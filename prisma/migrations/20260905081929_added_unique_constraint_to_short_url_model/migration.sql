/*
  Warnings:

  - A unique constraint covering the columns `[short_id]` on the table `short_urls` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "short_urls_short_id_key" ON "short_urls"("short_id");
