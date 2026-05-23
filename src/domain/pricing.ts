import { STICKER_CATALOG } from "./catalog";
import type { BaseCollarState, CollarSize, CollarThickness, PlacedSticker, PricingBreakdown } from "./types";

const SIZE_BASE_PRICE: Record<CollarSize, number> = {
  S: 24,
  M: 30,
  L: 36,
  XL: 42
};

const THICKNESS_PRICE_DELTA: Record<CollarThickness, number> = {
  "2cm": 0,
  "3cm": 4,
  "5cm": 8
};

export function calculatePricing(
  baseCollar: BaseCollarState,
  placedStickers: PlacedSticker[]
): PricingBreakdown {
  const basePrice = calculateBasePrice(baseCollar);
  const stickerTotal = placedStickers.reduce((total, placedSticker) => {
    const sticker = STICKER_CATALOG.find((item) => item.id === placedSticker.stickerId);
    return total + (sticker?.price ?? 0);
  }, 0);

  return {
    basePrice,
    stickerTotal,
    total: roundCurrency(basePrice + stickerTotal)
  };
}

export function calculateBasePrice(baseCollar: BaseCollarState): number {
  return roundCurrency(SIZE_BASE_PRICE[baseCollar.size] + THICKNESS_PRICE_DELTA[baseCollar.thickness]);
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
