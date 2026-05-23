import { STICKER_CATALOG } from "../domain/catalog";
import { calculatePricing } from "../domain/pricing";
import type { CollarConfigurationPayload, StickerMetadata } from "../domain/types";

const savedDesigns = new Map<string, CollarConfigurationPayload>();

export async function getStickers(): Promise<StickerMetadata[]> {
  return STICKER_CATALOG;
}

export async function calculateBackendPrice(
  payload: CollarConfigurationPayload
): Promise<{ total_price: number; valid: boolean }> {
  const placedStickers = payload.stickers_placed.map((sticker, index) => ({
    instanceId: `${sticker.sticker_id}_${index}`,
    stickerId: sticker.sticker_id,
    styleType: sticker.style_type,
    positionRelativeX: sticker.position_relative_x,
    positionRelativeY: sticker.position_relative_y,
    layerIndex: sticker.layer_index
  }));
  const pricing = calculatePricing(
    {
      modelId: payload.base_collar.model_id,
      size: payload.base_collar.size,
      thickness: payload.base_collar.thickness,
      colorCode: payload.base_collar.color_code
    },
    placedStickers
  );

  return {
    total_price: pricing.total,
    valid: pricing.total === payload.total_price
  };
}

export async function saveDesign(
  payload: CollarConfigurationPayload
): Promise<{ design_id: string; share_url: string }> {
  const designId = payload.configuration_id.replace(/^cfg_/, "design_");
  savedDesigns.set(designId, payload);

  return {
    design_id: designId,
    share_url: `/design/${designId}`
  };
}

export async function getDesign(designId: string): Promise<CollarConfigurationPayload | null> {
  return savedDesigns.get(designId) ?? null;
}
