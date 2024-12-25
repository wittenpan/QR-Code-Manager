export interface QRCodeResponse {
  qrCode: string; // Base64 encoded QR code image
  uniqueCode: string;
  url: string; // The URL that the QR code points to
}
