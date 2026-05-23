# Adventure Collar Configurator

An interactive custom pet collar configurator for an outdoor adventure brand.

## Features

- 2D flat editing canvas with horizontal and vertical layouts.
- Native drag-and-drop from the sticker library to the collar band.
- Boundary-aware sticker placement with relative 0-100% coordinates.
- Smart snapping along the collar length to reduce sticker overlap.
- In-canvas sticker selection, slider movement, removal, and drag-out delete.
- Base collar controls for size, width, and color.
- Searchable sticker library with category filters and Pixel Art / Realistic style toggle.
- Live pricing from base collar size/width plus sticker totals.
- 3D closed-ring preview with rotate, pan, and zoom controls.
- Mock API routes for sticker metadata, price validation, design save, and design restore.
- Manufacturing JSON drawer using the requested saved configuration schema.

## Starter Assets

The current art set is intentionally replaceable:

- 5 landmark stickers.
- 5 outdoor activity stickers.
- 5 daily delight stickers.
- Each sticker has one Pixel Art SVG and one Realistic SVG.

Files live in:

```text
public/assets/stickers/pixel
public/assets/stickers/realistic
```

To regenerate the placeholder SVGs:

```bash
npm run assets
```

## API Routes

- `GET /api/stickers`
- `POST /api/pricing/calculate`
- `POST /api/design/save`
- `GET /api/design/{id}`

The mock design store is in memory while the Vite dev server is running.

## Development

```bash
npm install
npm run dev
```

Default local URL:

```text
http://127.0.0.1:5173/
```

## Verification

```bash
npm run typecheck
npm run build
```
