ALTER TABLE "Donation" ADD COLUMN "qpayInvoiceId" TEXT;
ALTER TABLE "Donation" ADD COLUMN "qpayPaymentId" TEXT;
ALTER TABLE "Donation" ADD COLUMN "qpayQrText" TEXT;
ALTER TABLE "Donation" ADD COLUMN "qpayQrImage" TEXT;
ALTER TABLE "Donation" ADD COLUMN "qpayShortUrl" TEXT;
ALTER TABLE "Donation" ADD COLUMN "qpayUrls" JSONB;
ALTER TABLE "Donation" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "Donation" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Donation" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE UNIQUE INDEX "Donation_qpayInvoiceId_key" ON "Donation"("qpayInvoiceId");
CREATE INDEX "Donation_status_idx" ON "Donation"("status");
