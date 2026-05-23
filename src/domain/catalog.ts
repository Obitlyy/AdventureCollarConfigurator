import type { BaseCollarOption, CollarThickness, StickerMetadata } from "./types";

export const BASE_COLLAR_OPTIONS: BaseCollarOption[] = [
  {
    modelId: "trail-s-green-2",
    name: "Trail Scout",
    size: "S",
    thickness: "2cm",
    colorName: "Tactical Green",
    colorCode: "#46614A",
    basePrice: 24
  },
  {
    modelId: "summit-m-orange-3",
    name: "Summit Loop",
    size: "M",
    thickness: "3cm",
    colorName: "Bright Orange",
    colorCode: "#F26A2E",
    basePrice: 30
  },
  {
    modelId: "harbor-l-navy-3",
    name: "Harbor Trek",
    size: "L",
    thickness: "3cm",
    colorName: "Navy Blue",
    colorCode: "#1E3557",
    basePrice: 36
  },
  {
    modelId: "expedition-xl-graphite-5",
    name: "Expedition Ring",
    size: "XL",
    thickness: "5cm",
    colorName: "Graphite Black",
    colorCode: "#2E3432",
    basePrice: 42
  }
];

// No longer needed — aspect ratio is computed from real dimensions in collarGeometry.ts

export const STICKER_CATALOG: StickerMetadata[] = [
  {
    id: "landmark-great-wall",
    name: "Great Wall",
    category: "landmarks",
    tags: ["china", "beijing", "wall", "heritage"],
    price: 6,
    widthRatio: 1.25,
    heightRatio: 0.82,
    assets: {
      pixel: "/assets/stickers/pixel/great-wall.svg",
      realistic: "/assets/stickers/realistic/great-wall.svg"
    }
  },
  {
    id: "landmark-temple-of-heaven",
    name: "Temple of Heaven",
    category: "landmarks",
    tags: ["china", "beijing", "temple", "tiananmen"],
    price: 6,
    widthRatio: 1,
    heightRatio: 1,
    assets: {
      pixel: "/assets/stickers/pixel/temple-of-heaven.svg",
      realistic: "/assets/stickers/realistic/temple-of-heaven.svg"
    }
  },
  {
    id: "landmark-oriental-pearl",
    name: "Oriental Pearl Tower",
    category: "landmarks",
    tags: ["shanghai", "tower", "china"],
    price: 6,
    widthRatio: 0.72,
    heightRatio: 1.15,
    assets: {
      pixel: "/assets/stickers/pixel/oriental-pearl.svg",
      realistic: "/assets/stickers/realistic/oriental-pearl.svg"
    }
  },
  {
    id: "landmark-golden-gate",
    name: "Golden Gate Bridge",
    category: "landmarks",
    tags: ["san francisco", "bridge", "usa"],
    price: 7,
    widthRatio: 1.4,
    heightRatio: 0.72,
    assets: {
      pixel: "/assets/stickers/pixel/golden-gate.svg",
      realistic: "/assets/stickers/realistic/golden-gate.svg"
    }
  },
  {
    id: "landmark-statue-of-liberty",
    name: "Statue of Liberty",
    category: "landmarks",
    tags: ["new york", "usa", "statue"],
    price: 7,
    widthRatio: 0.72,
    heightRatio: 1.15,
    assets: {
      pixel: "/assets/stickers/pixel/statue-of-liberty.svg",
      realistic: "/assets/stickers/realistic/statue-of-liberty.svg"
    }
  },
  {
    id: "activity-mountaineering",
    name: "Mountaineering",
    category: "outdoor-activities",
    tags: ["mountain", "climb", "trail", "summit"],
    price: 5,
    widthRatio: 1,
    heightRatio: 1,
    assets: {
      pixel: "/assets/stickers/pixel/mountaineering.svg",
      realistic: "/assets/stickers/realistic/mountaineering.svg"
    }
  },
  {
    id: "activity-surfing",
    name: "Surfing",
    category: "outdoor-activities",
    tags: ["surf", "wave", "ocean"],
    price: 5,
    widthRatio: 1.22,
    heightRatio: 0.85,
    assets: {
      pixel: "/assets/stickers/pixel/surfing.svg",
      realistic: "/assets/stickers/realistic/surfing.svg"
    }
  },
  {
    id: "activity-swimming",
    name: "Swimming",
    category: "outdoor-activities",
    tags: ["water", "pool", "lake"],
    price: 4,
    widthRatio: 1.2,
    heightRatio: 0.8,
    assets: {
      pixel: "/assets/stickers/pixel/swimming.svg",
      realistic: "/assets/stickers/realistic/swimming.svg"
    }
  },
  {
    id: "activity-frisbee",
    name: "Frisbee",
    category: "outdoor-activities",
    tags: ["park", "play", "disc"],
    price: 4,
    widthRatio: 1.05,
    heightRatio: 0.92,
    assets: {
      pixel: "/assets/stickers/pixel/frisbee.svg",
      realistic: "/assets/stickers/realistic/frisbee.svg"
    }
  },
  {
    id: "activity-camping",
    name: "Camping",
    category: "outdoor-activities",
    tags: ["tent", "camp", "outdoor", "fire"],
    price: 5,
    widthRatio: 1.12,
    heightRatio: 0.9,
    assets: {
      pixel: "/assets/stickers/pixel/camping.svg",
      realistic: "/assets/stickers/realistic/camping.svg"
    }
  },
  {
    id: "delight-salmon",
    name: "Salmon",
    category: "daily-delights",
    tags: ["fish", "food", "treat"],
    price: 3,
    widthRatio: 1.2,
    heightRatio: 0.72,
    assets: {
      pixel: "/assets/stickers/pixel/salmon.svg",
      realistic: "/assets/stickers/realistic/salmon.svg"
    }
  },
  {
    id: "delight-beef",
    name: "Beef",
    category: "daily-delights",
    tags: ["food", "treat", "meat"],
    price: 3,
    widthRatio: 1,
    heightRatio: 0.85,
    assets: {
      pixel: "/assets/stickers/pixel/beef.svg",
      realistic: "/assets/stickers/realistic/beef.svg"
    }
  },
  {
    id: "delight-shrimp",
    name: "Shrimp",
    category: "daily-delights",
    tags: ["seafood", "food", "treat"],
    price: 3,
    widthRatio: 1.05,
    heightRatio: 0.82,
    assets: {
      pixel: "/assets/stickers/pixel/shrimp.svg",
      realistic: "/assets/stickers/realistic/shrimp.svg"
    }
  },
  {
    id: "delight-milk",
    name: "Milk",
    category: "daily-delights",
    tags: ["drink", "daily", "treat"],
    price: 3,
    widthRatio: 0.8,
    heightRatio: 1,
    assets: {
      pixel: "/assets/stickers/pixel/milk.svg",
      realistic: "/assets/stickers/realistic/milk.svg"
    }
  },
  {
    id: "delight-small-ball",
    name: "Small Ball",
    category: "daily-delights",
    tags: ["toy", "ball", "play"],
    price: 3,
    widthRatio: 1,
    heightRatio: 1,
    assets: {
      pixel: "/assets/stickers/pixel/small-ball.svg",
      realistic: "/assets/stickers/realistic/small-ball.svg"
    }
  }
];
