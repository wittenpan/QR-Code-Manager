/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,tableNumber]` on the table `RestaurantTable` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RestaurantTable" DROP CONSTRAINT "RestaurantTable_restaurantId_fkey";

-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "imageData" TEXT,
ADD COLUMN     "targetUrl" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "contactInfo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTable_restaurantId_tableNumber_key" ON "RestaurantTable"("restaurantId", "tableNumber");

-- AddForeignKey
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
