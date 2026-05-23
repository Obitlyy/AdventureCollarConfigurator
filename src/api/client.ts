import type { CollarConfigurationPayload, StickerMetadata } from "../domain/types";

export interface PricingValidationResponse {
  total_price: number;
  valid: boolean;
  breakdown: {
    base_price: number;
    sticker_total: number;
  };
}

export interface SaveDesignResponse {
  design_id: string;
  share_url: string;
}

export async function fetchStickers(): Promise<StickerMetadata[]> {
  return requestJson<StickerMetadata[]>("/api/stickers");
}

export async function validatePrice(
  payload: CollarConfigurationPayload
): Promise<PricingValidationResponse> {
  return requestJson<PricingValidationResponse>("/api/pricing/calculate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function saveDesign(payload: CollarConfigurationPayload): Promise<SaveDesignResponse> {
  return requestJson<SaveDesignResponse>("/api/design/save", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchDesign(designId: string): Promise<CollarConfigurationPayload> {
  return requestJson<CollarConfigurationPayload>(`/api/design/${designId}`);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
