import type { CollarSize, CollarThickness, FlatLayout, PlacedSticker, StickerMetadata } from "../domain/types";
import { clampPercent, roundPercent } from "./percent";

const SNAP_GAP_PERCENT = 1.2;

/** Physical collar lengths in cm */
export const COLLAR_LENGTH_CM: Record<CollarSize, number> = {
  S: 20,
  M: 28,
  L: 36,
  XL: 45
};

/** Physical collar widths in cm */
export const COLLAR_WIDTH_CM: Record<CollarThickness, number> = {
  "2cm": 2,
  "3cm": 3,
  "5cm": 5
};

/** Get the aspect ratio (length / width) for a given collar config */
export function getCollarAspectRatio(size: CollarSize, thickness: CollarThickness): number {
  return COLLAR_LENGTH_CM[size] / COLLAR_WIDTH_CM[thickness];
}

export interface BandSize {
  width: number;
  height: number;
}

export interface RelativePoint {
  x: number;
  y: number;
}

export interface StickerPixelSize {
  width: number;
  height: number;
}

export function clientPointToRelativePoint(clientX: number, clientY: number, rect: DOMRect): RelativePoint {
  return {
    x: roundPercent(((clientX - rect.left) / rect.width) * 100),
    y: roundPercent(((clientY - rect.top) / rect.height) * 100)
  };
}

export function getStickerPixelSize(
  sticker: StickerMetadata,
  bandSize: BandSize,
  layout: FlatLayout
): StickerPixelSize {
  const crossAxis = layout === "horizontal" ? bandSize.height : bandSize.width;
  const base = Math.max(24, crossAxis * 0.68);
  const maxWidth = Math.max(24, bandSize.width * 0.94);
  const maxHeight = Math.max(24, bandSize.height * 0.94);

  return {
    width: Math.min(maxWidth, base * sticker.widthRatio),
    height: Math.min(maxHeight, base * sticker.heightRatio)
  };
}

export function getStickerSizePercent(
  sticker: StickerMetadata,
  bandSize: BandSize,
  layout: FlatLayout
) {
  const pixelSize = getStickerPixelSize(sticker, bandSize, layout);

  return {
    width: (pixelSize.width / Math.max(1, bandSize.width)) * 100,
    height: (pixelSize.height / Math.max(1, bandSize.height)) * 100
  };
}

export function constrainAndSnapStickerPosition(params: {
  rawPoint: RelativePoint;
  sticker: StickerMetadata;
  bandSize: BandSize;
  layout: FlatLayout;
  placedStickers: PlacedSticker[];
  stickerCatalog: StickerMetadata[];
  movingInstanceId?: string;
}): RelativePoint {
  const ownSize = getStickerSizePercent(params.sticker, params.bandSize, params.layout);
  let point = clampPointToBounds(params.rawPoint, ownSize);

  for (let pass = 0; pass < 2; pass += 1) {
    for (const placedSticker of params.placedStickers) {
      if (placedSticker.instanceId === params.movingInstanceId) {
        continue;
      }

      const neighborSticker = params.stickerCatalog.find((sticker) => sticker.id === placedSticker.stickerId);
      if (!neighborSticker) {
        continue;
      }

      const neighborSize = getStickerSizePercent(neighborSticker, params.bandSize, params.layout);
      point = pushAwayFromNeighbor(point, ownSize, placedSticker, neighborSize, params.layout);
      point = clampPointToBounds(point, ownSize);
    }
  }

  return {
    x: roundPercent(point.x),
    y: roundPercent(point.y)
  };
}

function clampPointToBounds(
  point: RelativePoint,
  sizePercent: { width: number; height: number }
): RelativePoint {
  const halfWidth = sizePercent.width / 2;
  const halfHeight = sizePercent.height / 2;

  return {
    x: clampBetween(point.x, halfWidth, 100 - halfWidth),
    y: clampBetween(point.y, halfHeight, 100 - halfHeight)
  };
}

function pushAwayFromNeighbor(
  point: RelativePoint,
  ownSize: { width: number; height: number },
  neighbor: PlacedSticker,
  neighborSize: { width: number; height: number },
  layout: FlatLayout
): RelativePoint {
  const ownMajor = layout === "horizontal" ? ownSize.width : ownSize.height;
  const neighborMajor = layout === "horizontal" ? neighborSize.width : neighborSize.height;
  const ownMinor = layout === "horizontal" ? ownSize.height : ownSize.width;
  const neighborMinor = layout === "horizontal" ? neighborSize.height : neighborSize.width;
  const pointMajor = layout === "horizontal" ? point.x : point.y;
  const pointMinor = layout === "horizontal" ? point.y : point.x;
  const neighborMajorPosition =
    layout === "horizontal" ? neighbor.positionRelativeX : neighbor.positionRelativeY;
  const neighborMinorPosition =
    layout === "horizontal" ? neighbor.positionRelativeY : neighbor.positionRelativeX;
  const majorDistance = pointMajor - neighborMajorPosition;
  const minorDistance = Math.abs(pointMinor - neighborMinorPosition);
  const minimumMajorDistance = ownMajor / 2 + neighborMajor / 2 + SNAP_GAP_PERCENT;
  const overlapsMinorAxis = minorDistance < ownMinor / 2 + neighborMinor / 2;

  if (!overlapsMinorAxis || Math.abs(majorDistance) >= minimumMajorDistance) {
    return point;
  }

  const direction = majorDistance >= 0 ? 1 : -1;
  const adjustedMajor = neighborMajorPosition + direction * minimumMajorDistance;

  return layout === "horizontal"
    ? { x: adjustedMajor, y: point.y }
    : { x: point.x, y: adjustedMajor };
}

function clampBetween(value: number, min: number, max: number): number {
  if (min > max) {
    return 50;
  }

  return Math.min(max, Math.max(min, clampPercent(value)));
}
