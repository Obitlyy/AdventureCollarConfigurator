import { BASE_COLLAR_OPTIONS, STICKER_CATALOG } from "../domain/catalog";
import { calculatePricing } from "../domain/pricing";
import type {
  CollarConfigurationPayload,
  ConfiguratorState,
  PricingBreakdown,
  StickerMetadata
} from "../domain/types";

export function selectBaseCollarOption(state: ConfiguratorState) {
  return (
    BASE_COLLAR_OPTIONS.find((option) => option.modelId === state.baseCollar.modelId) ??
    BASE_COLLAR_OPTIONS[0]
  );
}

export function selectPricingBreakdown(state: ConfiguratorState): PricingBreakdown {
  return calculatePricing(state.baseCollar, state.placedStickers);
}

export function selectTotalPrice(state: ConfiguratorState): number {
  return selectPricingBreakdown(state).total;
}

export function selectFilteredStickers(state: ConfiguratorState): StickerMetadata[] {
  const normalizedQuery = state.filters.query.trim().toLowerCase();

  return STICKER_CATALOG.filter((sticker) => {
    const matchesCategory =
      state.filters.category === "all" || sticker.category === state.filters.category;
    const searchableText = [sticker.name, sticker.category, ...sticker.tags].join(" ").toLowerCase();
    const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}

export function selectConfigurationPayload(
  state: ConfiguratorState
): CollarConfigurationPayload {
  return {
    configuration_id: state.configurationId,
    base_collar: {
      model_id: state.baseCollar.modelId,
      size: state.baseCollar.size,
      thickness: state.baseCollar.thickness,
      color_code: state.baseCollar.colorCode
    },
    stickers_placed: state.placedStickers.map((sticker) => ({
      sticker_id: sticker.stickerId,
      style_type: sticker.styleType,
      position_relative_x: sticker.positionRelativeX,
      position_relative_y: sticker.positionRelativeY,
      layer_index: sticker.layerIndex
    })),
    total_price: selectTotalPrice(state)
  };
}
