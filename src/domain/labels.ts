import type { CollarSize, CollarThickness, StickerCategory } from "./types";

export const SIZE_OPTIONS: CollarSize[] = ["S", "M", "L", "XL"];

export const THICKNESS_OPTIONS: CollarThickness[] = ["2cm", "3cm", "5cm"];

export const STICKER_CATEGORY_LABELS: Record<StickerCategory | "all", string> = {
  all: "All",
  landmarks: "Landmarks",
  "outdoor-activities": "Outdoor",
  "daily-delights": "Daily"
};
