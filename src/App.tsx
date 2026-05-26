import { ArrowLeftRight, FileJson, Moon, PawPrint, PanelTop, Sun } from "lucide-react";
import { useEffect, useMemo, useReducer, useState } from "react";
import { fetchDesign, fetchStickers, saveDesign, validatePrice } from "./api/client";
import { BaseControls } from "./components/BaseControls";
import { FlatCollarCanvas } from "./components/FlatCollarCanvas";
import { Preview3D } from "./components/Preview3D";
import { StickerLibrary } from "./components/StickerLibrary";
import { STICKER_CATALOG } from "./domain/catalog";
import type { StickerMetadata } from "./domain/types";
import { configuratorReducer, createInitialConfiguratorState } from "./state/configuratorReducer";
import { selectConfigurationPayload, selectPricingBreakdown } from "./state/selectors";

export function App() {
  const [state, dispatch] = useReducer(configuratorReducer, createInitialConfiguratorState());
  const [stickers, setStickers] = useState<StickerMetadata[]>(STICKER_CATALOG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Ready");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [panelsReversed, setPanelsReversed] = useState(false); // Canvas/Stickers 左右互换
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("collar-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("collar-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const pricing = selectPricingBreakdown(state);
  const payload = selectConfigurationPayload(state);

  // 竖的模式 = 两栏布局
  const isVerticalMode = state.flatLayout === "vertical";

  const visibleStickers = useMemo(() => {
    const normalizedQuery = state.filters.query.trim().toLowerCase();

    return stickers.filter((sticker) => {
      const matchesCategory =
        state.filters.category === "all" || sticker.category === state.filters.category;
      const searchableText = [sticker.name, sticker.category, ...sticker.tags].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [state.filters, stickers]);

  useEffect(() => {
    fetchStickers()
      .then(setStickers)
      .catch(() => setStickers(STICKER_CATALOG));
  }, []);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/design\/([^/]+)$/);
    if (!match) {
      return;
    }

    fetchDesign(decodeURIComponent(match[1]))
      .then((savedDesign) => {
        dispatch({ type: "restore-configuration", payload: savedDesign });
        setSaveMessage("Design restored");
        setShareUrl(window.location.href);
      })
      .catch(() => setSaveMessage("Design not found"));
  }, []);

  const handleQuickAdd = (stickerId: string) => {
    const offset = state.placedStickers.length % 6;
    const positionRelativeX = state.flatLayout === "horizontal" ? 16 + offset * 12 : 50;
    const positionRelativeY = state.flatLayout === "horizontal" ? 50 : 16 + offset * 12;

    dispatch({
      type: "place-sticker",
      stickerId,
      positionRelativeX,
      positionRelativeY
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("Validating price");

    try {
      const validation = await validatePrice(payload);
      if (!validation.valid) {
        setSaveMessage("Price corrected by API");
      }

      const saved = await saveDesign({
        ...payload,
        total_price: validation.total_price
      });
      const absoluteShareUrl = `${window.location.origin}${saved.share_url}`;
      setShareUrl(absoluteShareUrl);
      window.history.replaceState({}, "", saved.share_url);
      setSaveMessage(`Saved as ${saved.design_id}`);
    } catch {
      setSaveMessage("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark">
          <PawPrint size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">Trailborn Custom Collars</p>
          <h1>Adventure Collar Configurator</h1>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="header-price">
          <span>Total</span>
          <strong>${pricing.total.toFixed(2)}</strong>
        </div>
      </header>

      {/* 移动端快捷工具栏 */}
      <div className="mobile-toolbar">
        <button
          type="button"
          className="toolbar-button"
          onClick={() => setControlsOpen(true)}
        >
          <PanelTop size={18} />
          Controls
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          className="toolbar-button"
          data-active={state.viewMode === "flat-2d"}
          onClick={() => dispatch({ type: "set-view-mode", viewMode: "flat-2d" })}
        >
          2D
        </button>
        <button
          type="button"
          className="toolbar-button"
          data-active={state.viewMode === "preview-3d"}
          onClick={() => dispatch({ type: "set-view-mode", viewMode: "preview-3d" })}
        >
          3D
        </button>
        {isVerticalMode && (
          <>
            <div className="toolbar-divider" />
            <button
              type="button"
              className="toolbar-button"
              onClick={() => setPanelsReversed(v => !v)}
              title="Swap canvas and stickers"
            >
              <ArrowLeftRight size={18} />
            </button>
          </>
        )}
      </div>

      <section className={`configurator-grid ${isVerticalMode ? 'vertical-split' : ''} ${panelsReversed ? 'reversed' : ''}`}>
        {/* 竖着模式：Controls 在顶部横排 */}
        {isVerticalMode ? (
          <div className="top-controls">
            <BaseControls
              state={state}
              pricing={pricing}
              onDispatch={dispatch}
              onSave={handleSave}
              isSaving={isSaving}
              shareUrl={shareUrl}
            />
          </div>
        ) : (
          /* 横着模式：Controls 在左侧 */
          <div className="desktop-controls">
            <BaseControls
              state={state}
              pricing={pricing}
              onDispatch={dispatch}
              onSave={handleSave}
              isSaving={isSaving}
              shareUrl={shareUrl}
            />
          </div>
        )}

        <section className="canvas-panel">
          <div className="canvas-topbar">
            <div>
              <p className="eyebrow">{state.viewMode === "flat-2d" ? "2D Editor" : "3D Preview"}</p>
              <h2>{state.viewMode === "flat-2d" ? "Flat Collar Layout" : "Closed Ring Preview"}</h2>
            </div>
            <span className="status-pill">{saveMessage}</span>
          </div>

          {state.viewMode === "flat-2d" ? (
            <FlatCollarCanvas state={state} stickers={stickers} onDispatch={dispatch} />
          ) : (
            <Preview3D state={state} stickers={stickers} />
          )}
        </section>

        <StickerLibrary
          state={state}
          stickers={visibleStickers}
          onDispatch={dispatch}
          onQuickAdd={handleQuickAdd}
        />
      </section>

      {/* 移动端抽屉 */}
      {controlsOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setControlsOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-handle-bar">
              <div className="drawer-handle" />
            </div>
            <div className="drawer-header">
              <h2>Collar Settings</h2>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setControlsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="drawer-content">
              <BaseControls
                state={state}
                pricing={pricing}
                onDispatch={dispatch}
                onSave={handleSave}
                isSaving={isSaving}
                shareUrl={shareUrl}
              />
            </div>
          </div>
        </div>
      )}

      {/* <details className="payload-drawer">
        <summary>
          <FileJson size={17} aria-hidden="true" />
          Manufacturing JSON
        </summary>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </details> */}
    </main>
  );
}
