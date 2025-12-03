CREATE TYPE "LeadStatus" AS ENUM ('New', 'Contacted', 'QuoteSent', 'Interested', 'ClosedWon', 'ClosedLost');

CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "eventId" TEXT NOT NULL,
    "travellersCount" INTEGER NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadStatusHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "oldStatus" "LeadStatus",
    "newStatus" "LeadStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "seasonalAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "earlyBirdAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastMinuteAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "groupDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "weekendSurcharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

CREATE INDEX "Package_eventId_idx" ON "Package"("eventId");

CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_eventId_idx" ON "Lead"("eventId");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

CREATE INDEX "LeadStatusHistory_leadId_idx" ON "LeadStatusHistory"("leadId");
CREATE INDEX "LeadStatusHistory_changedAt_idx" ON "LeadStatusHistory"("changedAt");

CREATE INDEX "Quote_leadId_idx" ON "Quote"("leadId");
CREATE INDEX "Quote_packageId_idx" ON "Quote"("packageId");
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

ALTER TABLE "Package" ADD CONSTRAINT "Package_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadStatusHistory" ADD CONSTRAINT "LeadStatusHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

