import { Beef, Fish, Globe2, Mountain, Search, Sparkles } from "lucide-react";
import { STICKER_CATEGORY_LABELS } from "../domain/labels";
import type { ConfiguratorAction } from "../state/configuratorReducer";
import type { ConfiguratorState, StickerCategory, StickerMetadata, StickerStyleType } from "../domain/types";

interface StickerLibraryProps {
  state: ConfiguratorState;
  stickers: StickerMetadata[];
  onDispatch: React.Dispatch<ConfiguratorAction>;
  onQuickAdd: (stickerId: string) => void;
}

const CATEGORY_OPTIONS: Array<StickerCategory | "all"> = [
  "all",
  "landmarks",
  "outdoor-activities",
  "daily-delights"
];

const STYLE_OPTIONS: StickerStyleType[] = ["pixel", "realistic"];

export function StickerLibrary({ state, stickers, onDispatch, onQuickAdd }: StickerLibraryProps) {
  return (
    <aside className="library-panel" aria-label="Sticker library">
      <header className="library-header">
        <div>
          <p className="eyebrow">Sticker Library</p>
          <h2>Adventure Marks</h2>
        </div>
        <Sparkles size={20} aria-hidden="true" />
      </header>

      <label className="search-field">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search places, activities, treats"
          value={state.filters.query}
          onChange={(event) => onDispatch({ type: "set-library-query", query: event.target.value })}
        />
      </label>

      <nav className="category-tabs" aria-label="Sticker categories">
        {CATEGORY_OPTIONS.map((category) => (
          <button
            type="button"
            key={category}
            data-selected={state.filters.category === category}
            onClick={() => onDispatch({ type: "set-library-category", category })}
          >
            {getCategoryIcon(category)}
            {STICKER_CATEGORY_LABELS[category]}
          </button>
        ))}
      </nav>

      <div className="style-toggle" aria-label="Sticker style">
        {STYLE_OPTIONS.map((styleType) => (
          <button
            type="button"
            key={styleType}
            data-selected={state.filters.styleType === styleType}
            onClick={() => onDispatch({ type: "set-sticker-style", styleType })}
          >
            {styleType === "pixel" ? "Pixel Art" : "Realistic"}
          </button>
        ))}
      </div>

      <div className="sticker-grid" aria-label="Available stickers">
        {stickers.map((sticker) => (
          <button
            className="sticker-card"
            type="button"
            draggable
            key={sticker.id}
            onClick={() => onQuickAdd(sticker.id)}
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-sticker-id", sticker.id);
              event.dataTransfer.effectAllowed = "copy";
            }}
          >
            <span className="sticker-image-shell">
              <img src={sticker.assets[state.filters.styleType]} alt="" draggable={false} />
            </span>
            <span>
              <strong>{sticker.name}</strong>
              <small>${sticker.price.toFixed(2)}</small>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function getCategoryIcon(category: StickerCategory | "all") {
  if (category === "landmarks") {
    return <Globe2 size={15} aria-hidden="true" />;
  }

  if (category === "outdoor-activities") {
    return <Mountain size={15} aria-hidden="true" />;
  }

  if (category === "daily-delights") {
    return (
      <span className="split-icon" aria-hidden="true">
        <Fish size={13} />
        <Beef size={13} />
      </span>
    );
  }

  return <Sparkles size={15} aria-hidden="true" />;
}
