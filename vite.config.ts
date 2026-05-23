import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { STICKER_CATALOG } from "./src/domain/catalog";
import { calculatePricing } from "./src/domain/pricing";
import type { CollarConfigurationPayload } from "./src/domain/types";

export default defineConfig({
  base: "/AdventureCollarConfigurator/",
  plugins: [react(), configuratorApiPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});

function configuratorApiPlugin(): Plugin {
  const savedDesigns = new Map<string, CollarConfigurationPayload>();

  return {
    name: "configurator-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");

        if (!url.pathname.startsWith("/api/")) {
          next();
          return;
        }

        try {
          if (request.method === "GET" && url.pathname === "/api/stickers") {
            sendJson(response, 200, STICKER_CATALOG);
            return;
          }

          if (request.method === "POST" && url.pathname === "/api/pricing/calculate") {
            const payload = (await readJson(request)) as CollarConfigurationPayload;
            const pricing = calculatePricing(payloadToBaseState(payload), payloadToPlacedStickers(payload));

            sendJson(response, 200, {
              total_price: pricing.total,
              valid: pricing.total === payload.total_price && hasValidRelativePositions(payload),
              breakdown: {
                base_price: pricing.basePrice,
                sticker_total: pricing.stickerTotal
              }
            });
            return;
          }

          if (request.method === "POST" && url.pathname === "/api/design/save") {
            const payload = (await readJson(request)) as CollarConfigurationPayload;
            const pricing = calculatePricing(payloadToBaseState(payload), payloadToPlacedStickers(payload));
            const designId = payload.configuration_id.replace(/^cfg_/, "design_");
            const savedPayload = {
              ...payload,
              total_price: pricing.total
            };
            savedDesigns.set(designId, savedPayload);

            sendJson(response, 200, {
              design_id: designId,
              share_url: `/design/${designId}`
            });
            return;
          }

          if (request.method === "GET" && url.pathname.startsWith("/api/design/")) {
            const designId = decodeURIComponent(url.pathname.replace("/api/design/", ""));
            const savedDesign = savedDesigns.get(designId);

            if (!savedDesign) {
              sendJson(response, 404, { error: "Design not found" });
              return;
            }

            sendJson(response, 200, savedDesign);
            return;
          }

          sendJson(response, 404, { error: "Route not found" });
        } catch {
          sendJson(response, 500, { error: "Mock API failure" });
        }
      });
    }
  };
}

function readJson(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = "";
    request.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf-8");
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function payloadToBaseState(payload: CollarConfigurationPayload) {
  return {
    modelId: payload.base_collar.model_id,
    size: payload.base_collar.size,
    thickness: payload.base_collar.thickness,
    colorCode: payload.base_collar.color_code
  };
}

function payloadToPlacedStickers(payload: CollarConfigurationPayload) {
  return payload.stickers_placed.map((sticker, index) => ({
    instanceId: `${sticker.sticker_id}_${index}`,
    stickerId: sticker.sticker_id,
    styleType: sticker.style_type,
    positionRelativeX: sticker.position_relative_x,
    positionRelativeY: sticker.position_relative_y,
    layerIndex: sticker.layer_index
  }));
}

function hasValidRelativePositions(payload: CollarConfigurationPayload): boolean {
  return payload.stickers_placed.every(
    (sticker) =>
      sticker.position_relative_x >= 0 &&
      sticker.position_relative_x <= 100 &&
      sticker.position_relative_y >= 0 &&
      sticker.position_relative_y <= 100
  );
}
