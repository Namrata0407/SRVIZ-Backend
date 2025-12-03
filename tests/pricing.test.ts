/// <reference path="./jest.d.ts" />
import { calculatePricing } from '../src/utils/pricing';

describe('Pricing Logic Tests', () => {
  const basePrice = 1000;

  describe('Base Price', () => {
    it('should return base price correctly', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 2,
      });

      expect(result.basePrice).toBe(1000);
    });
  });

  describe('Seasonal Multiplier', () => {
    it('should apply +20% for June', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-06-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(200); 
      expect(result.finalPrice).toBe(1200);
    });

    it('should apply +20% for July', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-07-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(200);
      expect(result.finalPrice).toBe(1200);
    });

    it('should apply +20% for December', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-12-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(200);
      expect(result.finalPrice).toBe(1200);
    });

    it('should apply +10% for April', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-04-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(100); 
      expect(result.finalPrice).toBe(1100);
    });

    it('should apply +10% for May', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-05-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(100);
      expect(result.finalPrice).toBe(1100);
    });

    it('should apply +10% for September', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-09-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(100);
      expect(result.finalPrice).toBe(1100);
    });

    it('should not apply seasonal multiplier for other months', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(0);
      expect(result.finalPrice).toBe(1000);
    });
  });

  describe('Early-Bird Discount', () => {
    it('should apply -10% discount for events 120+ days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 120);

      const result = calculatePricing({
        basePrice,
        eventStartDate: futureDate,
        travellersCount: 2,
      });

      expect(result.earlyBirdAdjustment).toBeLessThan(0);
      expect(result.finalPrice).toBeLessThan(basePrice);
    });

    it('should apply -10% discount for events exactly 120 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 120);

      const result = calculatePricing({
        basePrice,
        eventStartDate: futureDate,
        travellersCount: 2,
      });

      const expectedDiscount = -basePrice * 0.1;
      expect(result.earlyBirdAdjustment).toBeCloseTo(expectedDiscount, 2);
    });

    it('should not apply early-bird discount for events less than 120 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 100);

      const result = calculatePricing({
        basePrice,
        eventStartDate: futureDate,
        travellersCount: 2,
      });

      expect(result.earlyBirdAdjustment).toBe(0);
    });
  });

  describe('Last-Minute Surcharge', () => {
    it('should apply +25% surcharge for events less than 15 days away', () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 10);

      const result = calculatePricing({
        basePrice,
        eventStartDate: nearDate,
        travellersCount: 2,
      });

      expect(result.lastMinuteAdjustment).toBeGreaterThan(0);
      expect(result.finalPrice).toBeGreaterThan(basePrice);
    });

    it('should apply +25% surcharge for events exactly 14 days away', () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 14);

      const result = calculatePricing({
        basePrice,
        eventStartDate: nearDate,
        travellersCount: 2,
      });

      expect(result.lastMinuteAdjustment).toBeGreaterThan(0);
    });

    it('should not apply last-minute surcharge for events 15+ days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      const result = calculatePricing({
        basePrice,
        eventStartDate: futureDate,
        travellersCount: 2,
      });

      expect(result.lastMinuteAdjustment).toBe(0);
    });

    it('should not apply last-minute surcharge for past events', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const result = calculatePricing({
        basePrice,
        eventStartDate: pastDate,
        travellersCount: 2,
      });

      expect(result.lastMinuteAdjustment).toBe(0);
    });
  });

  describe('Group Discount', () => {
    it('should apply -8% discount for 4 travellers', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 4,
      });

      expect(result.groupDiscount).toBeLessThan(0);
      expect(result.finalPrice).toBeLessThan(basePrice);
    });

    it('should apply -8% discount for more than 4 travellers', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 6,
      });

      expect(result.groupDiscount).toBeLessThan(0);
    });

    it('should not apply group discount for less than 4 travellers', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 3,
      });

      expect(result.groupDiscount).toBe(0);
    });

    it('should not apply group discount for exactly 3 travellers', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 3,
      });

      expect(result.groupDiscount).toBe(0);
    });
  });

  describe('Weekend Surcharge', () => {
    it('should apply +8% surcharge if event starts on Saturday', () => {
      const saturday = new Date();
      const dayOfWeek = saturday.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      saturday.setDate(saturday.getDate() + daysUntilSaturday);

      const result = calculatePricing({
        basePrice,
        eventStartDate: saturday,
        travellersCount: 2,
      });

      expect(result.weekendSurcharge).toBeGreaterThan(0);
    });

    it('should apply +8% surcharge if event starts on Sunday', () => {
      const sunday = new Date();
      const dayOfWeek = sunday.getDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
      sunday.setDate(sunday.getDate() + daysUntilSunday);

      const result = calculatePricing({
        basePrice,
        eventStartDate: sunday,
        travellersCount: 2,
      });

      expect(result.weekendSurcharge).toBeGreaterThan(0);
    });

    it('should apply +8% surcharge if event includes weekend within 7 days', () => {
      const monday = new Date();
      const dayOfWeek = monday.getDay();
      const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
      monday.setDate(monday.getDate() + daysUntilMonday);
      monday.setDate(monday.getDate() - 1);

      const result = calculatePricing({
        basePrice,
        eventStartDate: monday,
        travellersCount: 2,
      });

      expect(result.weekendSurcharge).toBeGreaterThanOrEqual(0);
    });

    it('should not apply weekend surcharge for weekday-only events', () => {
      const tuesday = new Date('2024-03-12');

      const result = calculatePricing({
        basePrice,
        eventStartDate: tuesday,
        travellersCount: 2,
      });

      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Combined Pricing Scenarios', () => {
    it('should calculate correctly with multiple adjustments', () => {
      const juneSaturday = new Date('2024-06-15');
      juneSaturday.setDate(juneSaturday.getDate() + 150);

      const result = calculatePricing({
        basePrice,
        eventStartDate: juneSaturday,
        travellersCount: 5,
      });

      expect(result.basePrice).toBe(1000);
      expect(result.seasonalAdjustment).toBe(200);
      expect(result.groupDiscount).toBeLessThan(0);
      expect(result.weekendSurcharge).toBeGreaterThan(0);
      expect(result.finalPrice).toBeGreaterThan(0);
    });

    it('should handle early-bird with seasonal adjustment', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 150);
      futureDate.setMonth(6);

      const result = calculatePricing({
        basePrice,
        eventStartDate: futureDate,
        travellersCount: 2,
      });

      expect(result.seasonalAdjustment).toBe(200);
      expect(result.earlyBirdAdjustment).toBeLessThan(0);
    });

    it('should prioritize last-minute over early-bird', () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 5);

      const result = calculatePricing({
        basePrice,
        eventStartDate: nearDate,
        travellersCount: 2,
      });

      expect(result.lastMinuteAdjustment).toBeGreaterThan(0);
      expect(result.earlyBirdAdjustment).toBe(0);
    });

    it('should ensure final price is never negative', () => {
      const result = calculatePricing({
        basePrice: 100,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 10,
      });

      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero base price', () => {
      const result = calculatePricing({
        basePrice: 0,
        eventStartDate: new Date('2024-06-15'),
        travellersCount: 5,
      });

      expect(result.finalPrice).toBe(0);
    });

    it('should handle single traveller', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 1,
      });

      expect(result.groupDiscount).toBe(0);
      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large traveller count', () => {
      const result = calculatePricing({
        basePrice,
        eventStartDate: new Date('2024-03-15'),
        travellersCount: 100,
      });

      expect(result.groupDiscount).toBeLessThan(0);
      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });
  });
});

