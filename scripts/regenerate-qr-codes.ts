const { prisma } = require("../app/lib/db");
const { generateQRCode } = require("../app/lib/qr");

async function regenerateQRCodes() {
  const qrCodes = await prisma.qRCode.findMany({
    include: {
      table: true,
    },
  });

  console.log(`Found ${qrCodes.length} QR codes to regenerate`);

  for (const qrCode of qrCodes) {
    try {
      const qrCodeData = await generateQRCode(qrCode.restaurantId, qrCode.tableId);
      
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: {
          imageData: qrCodeData.qrCode,
          targetUrl: qrCodeData.url,
        },
      });

      console.log(`Updated QR code for table ${qrCode.table.tableNumber}`);
    } catch (error) {
      console.error(`Failed to update QR code ${qrCode.id}:`, error);
    }
  }

  console.log('Finished regenerating QR codes');
}

regenerateQRCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
