import { Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConfiguratorAction } from "../state/configuratorReducer";
import type { ConfiguratorState, PlacedSticker, StickerMetadata } from "../domain/types";
import {
  clientPointToRelativePoint,
  constrainAndSnapStickerPosition,
  getCollarAspectRatio,
  getStickerPixelSize,
  type BandSize,
  type RelativePoint
} from "../utils/collarGeometry";

interface FlatCollarCanvasProps {
  state: ConfiguratorState;
  stickers: StickerMetadata[];
  onDispatch: React.Dispatch<ConfiguratorAction>;
}

interface ActiveDrag {
  instanceId: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

export function FlatCollarCanvas({ state, stickers, onDispatch }: FlatCollarCanvasProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [bandSize, setBandSize] = useState<BandSize>({ width: 0, height: 0 });
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  const selectedSticker = state.placedStickers.find(
    (sticker) => sticker.instanceId === state.selectedInstanceId
  );

  const aspectRatio = getCollarAspectRatio(state.baseCollar.size, state.baseCollar.thickness);

  // In horizontal mode: width is the long side. In vertical mode: height is the long side.
  const isVertical = state.flatLayout === "vertical";
  const SHORT_SIDE = 120;
  const longSide = SHORT_SIDE * aspectRatio * zoom;
  const shortSide = SHORT_SIDE * zoom;
  const collarWidth = isVertical ? shortSide : longSide;
  const collarHeightScaled = isVertical ? longSide : shortSide;

  useEffect(() => {
    if (!bandRef.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setBandSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(bandRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset pan when layout changes
  useEffect(() => {
    setPanX(0);
    setPanY(0);
  }, [state.flatLayout]);

  // Wheel zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, []);

  // Panning (middle click or drag on empty area)
  useEffect(() => {
    if (!isPanning) return;

    const handleMove = (e: PointerEvent) => {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPanX(panStart.current.startPanX + dx);
      setPanY(panStart.current.startPanY + dy);
    };

    const handleUp = () => {
      setIsPanning(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isPanning]);

  const findSticker = useCallback(
    (stickerId: string) => stickers.find((sticker) => sticker.id === stickerId),
    [stickers]
  );

  const resolvePosition = useCallback(
    (
      stickerId: string,
      rawPoint: RelativePoint,
      movingInstanceId?: string
    ): RelativePoint | null => {
      const sticker = findSticker(stickerId);
      if (!sticker || !bandRef.current) {
        return null;
      }

      return constrainAndSnapStickerPosition({
        rawPoint,
        sticker,
        bandSize,
        layout: state.flatLayout,
        placedStickers: state.placedStickers,
        stickerCatalog: stickers,
        movingInstanceId
      });
    },
    [bandSize, findSticker, state.flatLayout, state.placedStickers, stickers]
  );

  const movePlacedSticker = useCallback(
    (placedSticker: PlacedSticker, clientX: number, clientY: number) => {
      if (!bandRef.current) {
        return;
      }

      const rect = bandRef.current.getBoundingClientRect();
      const rawPoint = clientPointToRelativePoint(clientX, clientY, rect);
      const nextPoint = resolvePosition(placedSticker.stickerId, rawPoint, placedSticker.instanceId);

      if (nextPoint) {
        onDispatch({
          type: "move-sticker",
          instanceId: placedSticker.instanceId,
          positionRelativeX: nextPoint.x,
          positionRelativeY: nextPoint.y
        });
      }
    },
    [onDispatch, resolvePosition]
  );

  useEffect(() => {
    if (!activeDrag) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const placedSticker = state.placedStickers.find(
        (sticker) => sticker.instanceId === activeDrag.instanceId
      );
      const rect = bandRef.current?.getBoundingClientRect();

      if (!placedSticker || !rect) {
        return;
      }

      const isOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      setDeleteTargetId(isOutside ? placedSticker.instanceId : null);

      if (!isOutside) {
        movePlacedSticker(placedSticker, event.clientX, event.clientY);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const rect = bandRef.current?.getBoundingClientRect();
      const isOutside =
        rect &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom);

      if (isOutside) {
        onDispatch({ type: "remove-sticker", instanceId: activeDrag.instanceId });
      }

      setActiveDrag(null);
      setDeleteTargetId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeDrag, movePlacedSticker, onDispatch, state.placedStickers]);

  const placeStickerFromClientPoint = (stickerId: string, clientX: number, clientY: number) => {
    if (!bandRef.current) {
      return;
    }

    const rawPoint = clientPointToRelativePoint(clientX, clientY, bandRef.current.getBoundingClientRect());
    const nextPoint = resolvePosition(stickerId, rawPoint);

    if (nextPoint) {
      onDispatch({
        type: "place-sticker",
        stickerId,
        positionRelativeX: nextPoint.x,
        positionRelativeY: nextPoint.y
      });
    }
  };

  const handleStagePointerDown = (event: React.PointerEvent) => {
    // Only pan if clicking empty area (not on a sticker)
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest(".collar-band") === bandRef.current && !(event.target as HTMLElement).closest(".placed-sticker")) {
      onDispatch({ type: "select-sticker", instanceId: null });
      setIsPanning(true);
      panStart.current = { x: event.clientX, y: event.clientY, startPanX: panX, startPanY: panY };
    }
  };

  return (
    <section
      ref={stageRef}
      className={`canvas-stage ${state.flatLayout} ${deleteTargetId ? "delete-target" : ""}`}
      aria-label="2D collar canvas"
      onPointerDown={handleStagePointerDown}
    >
      <div
        className="collar-band"
        ref={bandRef}
        style={{
          backgroundColor: state.baseCollar.colorCode,
          width: `${collarWidth}px`,
          height: `${collarHeightScaled}px`,
          transform: `translate(${panX}px, ${panY}px)`,
          flexShrink: 0
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const stickerId = event.dataTransfer.getData("application/x-sticker-id");
          if (stickerId) {
            placeStickerFromClientPoint(stickerId, event.clientX, event.clientY);
          }
        }}
      >
        <div className="band-stitch top" />
        <div className="band-stitch bottom" />
        {state.placedStickers.map((placedSticker) => {
          const sticker = findSticker(placedSticker.stickerId);
          if (!sticker) {
            return null;
          }

          const pixelSize = getStickerPixelSize(sticker, bandSize, state.flatLayout);

          return (
            <button
              type="button"
              className="placed-sticker"
              key={placedSticker.instanceId}
              data-selected={state.selectedInstanceId === placedSticker.instanceId}
              data-delete-target={deleteTargetId === placedSticker.instanceId}
              style={{
                left: `${placedSticker.positionRelativeX}%`,
                top: `${placedSticker.positionRelativeY}%`,
                width: `${pixelSize.width}px`,
                height: `${pixelSize.height}px`,
                zIndex: 10 + placedSticker.layerIndex
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDispatch({ type: "select-sticker", instanceId: placedSticker.instanceId });
                setActiveDrag({
                  instanceId: placedSticker.instanceId
                });
              }}
            >
              <img src={sticker.assets[placedSticker.styleType]} alt={sticker.name} draggable={false} />
            </button>
          );
        })}

        {selectedSticker && (
          <button
            type="button"
            className="sticker-delete-btn"
            style={{
              left: `${selectedSticker.positionRelativeX}%`,
              top: `${selectedSticker.positionRelativeY}%`,
              transform: "translate(-50%, -150%)"
            }}
            title="Remove sticker"
            aria-label="Remove sticker"
            onClick={() =>
              onDispatch({ type: "remove-sticker", instanceId: selectedSticker.instanceId })
            }
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          title="Zoom out"
        >
          <Minus size={16} />
        </button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
      </div>
    </section>
  );
}
