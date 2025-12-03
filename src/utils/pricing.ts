export interface PricingAdjustments {
  basePrice: number;
  seasonalAdjustment: number;
  earlyBirdAdjustment: number;
  lastMinuteAdjustment: number;
  groupDiscount: number;
  weekendSurcharge: number;
  finalPrice: number;
}

export interface PricingInput {
  basePrice: number;
  eventStartDate: Date;
  travellersCount: number;
}

export function calculatePricing(input: PricingInput): PricingAdjustments {
  const { basePrice, eventStartDate, travellersCount } = input;
  
  let price = basePrice;
  const adjustments: Partial<PricingAdjustments> = {
    basePrice,
    seasonalAdjustment: 0,
    earlyBirdAdjustment: 0,
    lastMinuteAdjustment: 0,
    groupDiscount: 0,
    weekendSurcharge: 0,
  };

  const month = eventStartDate.getMonth() + 1;
  if ([6, 7, 12].includes(month)) {
    adjustments.seasonalAdjustment = price * 0.2;
    price += adjustments.seasonalAdjustment;
  } else if ([4, 5, 9].includes(month)) {
    adjustments.seasonalAdjustment = price * 0.1;
    price += adjustments.seasonalAdjustment;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(eventStartDate);
  eventDate.setHours(0, 0, 0, 0);
  
  const daysUntilEvent = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEvent >= 120) {
    adjustments.earlyBirdAdjustment = -price * 0.1;
    price += adjustments.earlyBirdAdjustment;
  }

  if (daysUntilEvent < 15 && daysUntilEvent >= 0) {
    adjustments.lastMinuteAdjustment = price * 0.25;
    price += adjustments.lastMinuteAdjustment;
  }

  if (travellersCount >= 4) {
    adjustments.groupDiscount = -price * 0.08;
    price += adjustments.groupDiscount;
  }

  const eventEndDate = new Date(eventStartDate);
  eventEndDate.setDate(eventEndDate.getDate() + 1);
  
  let hasWeekend = false;
  const checkDate = new Date(eventStartDate);
  for (let i = 0; i < 7; i++) {
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      hasWeekend = true;
      break;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  if (hasWeekend) {
    adjustments.weekendSurcharge = price * 0.08;
    price += adjustments.weekendSurcharge;
  }

  price = Math.max(0, price);

  return {
    basePrice: Number(adjustments.basePrice!.toFixed(2)),
    seasonalAdjustment: Number(adjustments.seasonalAdjustment!.toFixed(2)),
    earlyBirdAdjustment: Number(adjustments.earlyBirdAdjustment!.toFixed(2)),
    lastMinuteAdjustment: Number(adjustments.lastMinuteAdjustment!.toFixed(2)),
    groupDiscount: Number(adjustments.groupDiscount!.toFixed(2)),
    weekendSurcharge: Number(adjustments.weekendSurcharge!.toFixed(2)),
    finalPrice: Number(price.toFixed(2)),
  };
}

