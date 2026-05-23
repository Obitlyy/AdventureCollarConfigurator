import {
  BadgeDollarSign,
  Box,
  CircleDot,
  Layers3,
  PanelTop,
  RectangleHorizontal,
  RectangleVertical,
  Save,
  Search
} from "lucide-react";
import { BASE_COLLAR_OPTIONS } from "../domain/catalog";
import { SIZE_OPTIONS, THICKNESS_OPTIONS } from "../domain/labels";
import type { ConfiguratorAction } from "../state/configuratorReducer";
import type { ConfiguratorState, PricingBreakdown } from "../domain/types";

interface BaseControlsProps {
  state: ConfiguratorState;
  pricing: PricingBreakdown;
  onDispatch: React.Dispatch<ConfiguratorAction>;
  onSave: () => void;
  isSaving: boolean;
  shareUrl: string | null;
}

const COLOR_OPTIONS = Array.from(
  new Map(BASE_COLLAR_OPTIONS.map((option) => [option.colorCode, option])).values()
);

export function BaseControls({
  state,
  pricing,
  onDispatch,
  onSave,
  isSaving,
  shareUrl
}: BaseControlsProps) {
  return (
    <aside className="control-panel" aria-label="Base collar controls">
      <section className="panel-section">
        <div className="panel-title">
          <PanelTop size={18} aria-hidden="true" />
          <h2>Base Collar</h2>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Size</span>
            <select
              value={state.baseCollar.size}
              onChange={(event) =>
                onDispatch({ type: "set-base-size", size: event.target.value as ConfiguratorState["baseCollar"]["size"] })
              }
            >
              {SIZE_OPTIONS.map((size) => (
                <option value={size} key={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Width</span>
            <select
              value={state.baseCollar.thickness}
              onChange={(event) =>
                onDispatch({
                  type: "set-base-thickness",
                  thickness: event.target.value as ConfiguratorState["baseCollar"]["thickness"]
                })
              }
            >
              {THICKNESS_OPTIONS.map((thickness) => (
                <option value={thickness} key={thickness}>
                  {thickness}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="swatch-row" aria-label="Collar colors">
          {COLOR_OPTIONS.map((option) => (
            <button
              className="swatch-button"
              type="button"
              key={option.colorCode}
              style={{ backgroundColor: option.colorCode }}
              aria-label={option.colorName}
              title={option.colorName}
              data-selected={state.baseCollar.colorCode === option.colorCode}
              onClick={() => onDispatch({ type: "set-base-color", colorCode: option.colorCode })}
            />
          ))}
        </div>
      </section>

      <section className="panel-section">
        <div className="panel-title">
          <Box size={18} aria-hidden="true" />
          <h2>View</h2>
        </div>

        <div className="segmented-control">
          <button
            type="button"
            data-selected={state.viewMode === "flat-2d"}
            onClick={() => onDispatch({ type: "set-view-mode", viewMode: "flat-2d" })}
          >
            <Search size={16} aria-hidden="true" />
            2D
          </button>
          <button
            type="button"
            data-selected={state.viewMode === "preview-3d"}
            onClick={() => onDispatch({ type: "set-view-mode", viewMode: "preview-3d" })}
          >
            <Layers3 size={16} aria-hidden="true" />
            3D
          </button>
        </div>

        <div className="icon-button-row" aria-label="2D canvas layout">
          <button
            type="button"
            className="icon-button"
            data-selected={state.flatLayout === "horizontal"}
            title="Horizontal layout"
            aria-label="Horizontal layout"
            onClick={() => onDispatch({ type: "set-flat-layout", flatLayout: "horizontal" })}
            disabled={state.viewMode === "preview-3d"}
          >
            <RectangleHorizontal size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-button"
            data-selected={state.flatLayout === "vertical"}
            title="Vertical layout"
            aria-label="Vertical layout"
            onClick={() => onDispatch({ type: "set-flat-layout", flatLayout: "vertical" })}
            disabled={state.viewMode === "preview-3d"}
          >
            <RectangleVertical size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="panel-section">
        <div className="panel-title">
          <BadgeDollarSign size={18} aria-hidden="true" />
          <h2>Price</h2>
        </div>
        <div className="price-breakdown">
          <span>Base</span>
          <strong>${pricing.basePrice.toFixed(2)}</strong>
          <span>Stickers</span>
          <strong>${pricing.stickerTotal.toFixed(2)}</strong>
          <span>Total</span>
          <strong>${pricing.total.toFixed(2)}</strong>
        </div>

        <button className="save-button" type="button" onClick={onSave} disabled={isSaving}>
          <Save size={17} aria-hidden="true" />
          {isSaving ? "Saving" : "Save Design"}
        </button>

        {shareUrl && (
          <a className="share-link" href={shareUrl}>
            <CircleDot size={14} aria-hidden="true" />
            Share URL
          </a>
        )}
      </section>
    </aside>
  );
}
