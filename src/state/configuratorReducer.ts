import { BASE_COLLAR_OPTIONS } from "../domain/catalog";
import type {
  BaseCollarState,
  CollarConfigurationPayload,
  CollarSize,
  CollarThickness,
  ConfiguratorState,
  FlatLayout,
  PlacedSticker,
  StickerCategory,
  StickerStyleType,
  ViewMode
} from "../domain/types";
import { clampPercent } from "../utils/percent";
import { selectConfigurationPayload } from "./selectors";

export type ConfiguratorAction =
  | { type: "set-view-mode"; viewMode: ViewMode }
  | { type: "set-flat-layout"; flatLayout: FlatLayout }
  | { type: "set-base-size"; size: CollarSize }
  | { type: "set-base-thickness"; thickness: CollarThickness }
  | { type: "set-base-color"; colorCode: string }
  | { type: "set-sticker-style"; styleType: StickerStyleType }
  | { type: "set-library-category"; category: StickerCategory | "all" }
  | { type: "set-library-query"; query: string }
  | {
      type: "place-sticker";
      stickerId: string;
      positionRelativeX: number;
      positionRelativeY: number;
    }
  | {
      type: "move-sticker";
      instanceId: string;
      positionRelativeX: number;
      positionRelativeY: number;
    }
  | { type: "select-sticker"; instanceId: string | null }
  | { type: "remove-sticker"; instanceId: string }
  | { type: "restore-configuration"; payload: CollarConfigurationPayload };

export function createInitialConfiguratorState(): ConfiguratorState {
  const defaultBase = BASE_COLLAR_OPTIONS[1];

  return {
    configurationId: createConfigurationId(),
    viewMode: "flat-2d",
    flatLayout: "horizontal",
    baseCollar: {
      modelId: defaultBase.modelId,
      size: defaultBase.size,
      thickness: defaultBase.thickness,
      colorCode: defaultBase.colorCode
    },
    placedStickers: [],
    selectedInstanceId: null,
    filters: {
      query: "",
      category: "all",
      styleType: "pixel"
    }
  };
}

export function configuratorReducer(
  state: ConfiguratorState,
  action: ConfiguratorAction
): ConfiguratorState {
  switch (action.type) {
    case "set-view-mode":
      return {
        ...state,
        viewMode: action.viewMode,
        selectedInstanceId: action.viewMode === "preview-3d" ? null : state.selectedInstanceId
      };

    case "set-flat-layout":
      return {
        ...state,
        flatLayout: action.flatLayout
      };

    case "set-base-size":
      return {
        ...state,
        baseCollar: syncBaseOption({ ...state.baseCollar, size: action.size })
      };

    case "set-base-thickness":
      return {
        ...state,
        baseCollar: syncBaseOption({ ...state.baseCollar, thickness: action.thickness })
      };

    case "set-base-color":
      return {
        ...state,
        baseCollar: syncBaseOption({ ...state.baseCollar, colorCode: action.colorCode })
      };

    case "set-sticker-style":
      return {
        ...state,
        filters: {
          ...state.filters,
          styleType: action.styleType
        },
        placedStickers: state.placedStickers.map((sticker) => ({
          ...sticker,
          styleType: action.styleType
        }))
      };

    case "set-library-category":
      return {
        ...state,
        filters: {
          ...state.filters,
          category: action.category
        }
      };

    case "set-library-query":
      return {
        ...state,
        filters: {
          ...state.filters,
          query: action.query
        }
      };

    case "place-sticker": {
      const placedSticker: PlacedSticker = {
        instanceId: createPlacedStickerId(action.stickerId),
        stickerId: action.stickerId,
        styleType: state.filters.styleType,
        positionRelativeX: clampPercent(action.positionRelativeX),
        positionRelativeY: clampPercent(action.positionRelativeY),
        layerIndex: state.placedStickers.length
      };

      return {
        ...state,
        placedStickers: [...state.placedStickers, placedSticker],
        selectedInstanceId: placedSticker.instanceId
      };
    }

    case "move-sticker":
      return {
        ...state,
        placedStickers: state.placedStickers.map((sticker) =>
          sticker.instanceId === action.instanceId
            ? {
                ...sticker,
                positionRelativeX: clampPercent(action.positionRelativeX),
                positionRelativeY: clampPercent(action.positionRelativeY)
              }
            : sticker
        )
      };

    case "select-sticker":
      return {
        ...state,
        selectedInstanceId: action.instanceId
      };

    case "remove-sticker": {
      const remainingStickers = state.placedStickers
        .filter((sticker) => sticker.instanceId !== action.instanceId)
        .map((sticker, index) => ({
          ...sticker,
          layerIndex: index
        }));

      return {
        ...state,
        placedStickers: remainingStickers,
        selectedInstanceId:
          state.selectedInstanceId === action.instanceId ? null : state.selectedInstanceId
      };
    }

    case "restore-configuration":
      return restoreConfiguration(state, action.payload);

    default:
      return state;
  }
}

export function serializeCurrentState(state: ConfiguratorState): CollarConfigurationPayload {
  return selectConfigurationPayload(state);
}

function restoreConfiguration(
  state: ConfiguratorState,
  payload: CollarConfigurationPayload
): ConfiguratorState {
  return {
    ...state,
    configurationId: payload.configuration_id,
    baseCollar: {
      modelId: payload.base_collar.model_id,
      size: payload.base_collar.size,
      thickness: payload.base_collar.thickness,
      colorCode: payload.base_collar.color_code
    },
    placedStickers: payload.stickers_placed.map((sticker, index) => ({
      instanceId: createPlacedStickerId(sticker.sticker_id),
      stickerId: sticker.sticker_id,
      styleType: sticker.style_type,
      positionRelativeX: clampPercent(sticker.position_relative_x),
      positionRelativeY: clampPercent(sticker.position_relative_y),
      layerIndex: sticker.layer_index ?? index
    })),
    selectedInstanceId: null
  };
}

function syncBaseOption(nextBase: BaseCollarState): BaseCollarState {
  const matchingOption =
    BASE_COLLAR_OPTIONS.find(
      (option) =>
        option.size === nextBase.size &&
        option.thickness === nextBase.thickness &&
        option.colorCode === nextBase.colorCode
    ) ??
    BASE_COLLAR_OPTIONS.find(
      (option) => option.size === nextBase.size && option.thickness === nextBase.thickness
    ) ??
    BASE_COLLAR_OPTIONS.find((option) => option.size === nextBase.size) ??
    BASE_COLLAR_OPTIONS[0];

  return {
    modelId: matchingOption.modelId,
    size: nextBase.size,
    thickness: nextBase.thickness,
    colorCode: nextBase.colorCode
  };
}

function createConfigurationId(): string {
  return `cfg_${crypto.randomUUID()}`;
}

function createPlacedStickerId(stickerId: string): string {
  return `${stickerId}_${crypto.randomUUID()}`;
}
