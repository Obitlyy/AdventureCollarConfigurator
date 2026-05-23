export const collarConfigurationJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://adventure-collar.example/schemas/collar-configuration.schema.json",
  title: "Adventure Collar Configuration",
  type: "object",
  required: ["configuration_id", "base_collar", "stickers_placed", "total_price"],
  additionalProperties: false,
  properties: {
    configuration_id: {
      type: "string",
      minLength: 1
    },
    base_collar: {
      type: "object",
      required: ["model_id", "size", "thickness", "color_code"],
      additionalProperties: false,
      properties: {
        model_id: {
          type: "string",
          minLength: 1
        },
        size: {
          type: "string",
          enum: ["S", "M", "L", "XL"]
        },
        thickness: {
          type: "string",
          enum: ["2cm", "3cm", "5cm"]
        },
        color_code: {
          type: "string",
          pattern: "^#[0-9A-Fa-f]{6}$"
        }
      }
    },
    stickers_placed: {
      type: "array",
      items: {
        type: "object",
        required: [
          "sticker_id",
          "style_type",
          "position_relative_x",
          "position_relative_y",
          "layer_index"
        ],
        additionalProperties: false,
        properties: {
          sticker_id: {
            type: "string",
            minLength: 1
          },
          style_type: {
            type: "string",
            enum: ["pixel", "realistic"]
          },
          position_relative_x: {
            type: "number",
            minimum: 0,
            maximum: 100
          },
          position_relative_y: {
            type: "number",
            minimum: 0,
            maximum: 100
          },
          layer_index: {
            type: "integer",
            minimum: 0
          }
        }
      }
    },
    total_price: {
      type: "number",
      minimum: 0
    }
  }
} as const;
