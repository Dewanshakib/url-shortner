-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_urls" (
    "id" SERIAL NOT NULL,
    "short_id" VARCHAR(8) NOT NULL,
    "redirect_url" TEXT NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "short_urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "short_urls_short_id_idx" ON "short_urls"("short_id");

-- AddForeignKey
ALTER TABLE "short_urls" ADD CONSTRAINT "short_urls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
