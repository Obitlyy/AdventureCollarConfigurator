export type ViewMode = "flat-2d" | "preview-3d";

export type FlatLayout = "horizontal" | "vertical";

export type CollarSize = "S" | "M" | "L" | "XL";

export type CollarThickness = "2cm" | "3cm" | "5cm";

export type StickerCategory = "landmarks" | "outdoor-activities" | "daily-delights";

export type StickerStyleType = "pixel" | "realistic";

export interface BaseCollarOption {
  modelId: string;
  name: string;
  size: CollarSize;
  thickness: CollarThickness;
  colorName: string;
  colorCode: string;
  basePrice: number;
}

export interface BaseCollarState {
  modelId: string;
  size: CollarSize;
  thickness: CollarThickness;
  colorCode: string;
}

export interface StickerAssetSet {
  pixel: string;
  realistic: string;
}

export interface StickerMetadata {
  id: string;
  name: string;
  category: StickerCategory;
  tags: string[];
  price: number;
  widthRatio: number;
  heightRatio: number;
  assets: StickerAssetSet;
}

export interface PlacedSticker {
  instanceId: string;
  stickerId: string;
  styleType: StickerStyleType;
  positionRelativeX: number;
  positionRelativeY: number;
  layerIndex: number;
}

export interface SavedPlacedSticker {
  sticker_id: string;
  style_type: StickerStyleType;
  position_relative_x: number;
  position_relative_y: number;
  layer_index: number;
}

export interface CollarConfigurationPayload {
  configuration_id: string;
  base_collar: {
    model_id: string;
    size: CollarSize;
    thickness: CollarThickness;
    color_code: string;
  };
  stickers_placed: SavedPlacedSticker[];
  total_price: number;
}

export interface StickerLibraryFilters {
  query: string;
  category: StickerCategory | "all";
  styleType: StickerStyleType;
}

export interface ConfiguratorState {
  configurationId: string;
  viewMode: ViewMode;
  flatLayout: FlatLayout;
  baseCollar: BaseCollarState;
  placedStickers: PlacedSticker[];
  selectedInstanceId: string | null;
  filters: StickerLibraryFilters;
}

export interface PricingBreakdown {
  basePrice: number;
  stickerTotal: number;
  total: number;
}
