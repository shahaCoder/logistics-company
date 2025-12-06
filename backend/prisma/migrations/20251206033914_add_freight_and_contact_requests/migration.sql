-- CreateTable
CREATE TABLE "FreightRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isBroker" BOOLEAN NOT NULL DEFAULT false,
    "equipment" TEXT,
    "cargo" TEXT,
    "weight" TEXT,
    "pallets" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupDate" TEXT,
    "pickupTime" TEXT,
    "deliveryAddress" TEXT,
    "deliveryDate" TEXT,
    "deliveryTime" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "applicantIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "FreightRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "applicantIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FreightRequest_createdAt_idx" ON "FreightRequest"("createdAt");

-- CreateIndex
CREATE INDEX "FreightRequest_email_idx" ON "FreightRequest"("email");

-- CreateIndex
CREATE INDEX "ContactRequest_createdAt_idx" ON "ContactRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ContactRequest_email_idx" ON "ContactRequest"("email");
