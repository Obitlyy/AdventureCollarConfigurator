import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { DoubleSide, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import type { ConfiguratorState, PlacedSticker, StickerMetadata } from "../domain/types";
import { COLLAR_LENGTH_CM, COLLAR_WIDTH_CM } from "../utils/collarGeometry";

interface Preview3DProps {
  state: ConfiguratorState;
  stickers: StickerMetadata[];
}

// Scale: 1 unit = 1 cm in 3D space, then we scale down for comfortable viewing
const SCENE_SCALE = 0.06;
const COLLAR_THICKNESS_CM = 0.5;

export function Preview3D({ state, stickers }: Preview3DProps) {
  const lengthCm = COLLAR_LENGTH_CM[state.baseCollar.size];
  const widthCm = COLLAR_WIDTH_CM[state.baseCollar.thickness];
  const radius = lengthCm / (2 * Math.PI);

  return (
    <section className="preview-3d" aria-label="3D collar preview">
      <Canvas camera={{ position: [0, radius * SCENE_SCALE * 2.5, radius * SCENE_SCALE * 4], fov: 42 }} shadows>
        <color attach="background" args={["#eef4f0"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
        <directionalLight position={[-4, 3, -4]} intensity={0.3} />
        <directionalLight position={[0, -3, 2]} intensity={0.2} />
        {/* Rim light for edge definition */}
        <pointLight position={[0, 0, radius * SCENE_SCALE * 3]} intensity={0.4} />
        <Suspense fallback={null}>
          <group scale={[SCENE_SCALE, SCENE_SCALE, SCENE_SCALE]}>
            <CollarBand
              radius={radius}
              widthCm={widthCm}
              thicknessCm={COLLAR_THICKNESS_CM}
              color={state.baseCollar.colorCode}
            />
            <StitchLines radius={radius} widthCm={widthCm} />
            {state.placedStickers.map((placedSticker) => {
              const sticker = stickers.find((item) => item.id === placedSticker.stickerId);
              if (!sticker) return null;

              return (
                <StickerBlock
                  key={placedSticker.instanceId}
                  placedSticker={placedSticker}
                  sticker={sticker}
                  collarRadius={radius}
                  collarWidth={widthCm}
                />
              );
            })}
          </group>
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          minDistance={radius * SCENE_SCALE * 2}
          maxDistance={radius * SCENE_SCALE * 8}
        />
      </Canvas>
    </section>
  );
}

/**
 * Generate a procedural leather normal map texture with fine grain
 */
function useLeatherNormalMap(): THREE.Texture {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base: neutral normal (128, 128, 255)
    ctx.fillStyle = "rgb(128, 128, 255)";
    ctx.fillRect(0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Layer 1: Fine grain (leather pores)
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 16;
      data[i] = Math.max(0, Math.min(255, 128 + grain));
      data[i + 1] = Math.max(0, Math.min(255, 128 + grain));
    }

    // Layer 2: Larger leather cell pattern (irregular polygons)
    for (let pass = 0; pass < 120; pass++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const cellRadius = 6 + Math.random() * 14;
      const bumpDir = Math.random() > 0.5 ? 1 : -1;
      const strength = 8 + Math.random() * 12;

      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > cellRadius) continue;
          const px = Math.round(cx + dx) % size;
          const py = Math.round(cy + dy) % size;
          if (px < 0 || py < 0) continue;
          const idx = (py * size + px) * 4;
          // Edge bump: stronger at the edge of the cell
          const edgeFactor = dist / cellRadius;
          const bump = bumpDir * strength * edgeFactor * (1 - edgeFactor) * 4;
          data[idx] = Math.max(0, Math.min(255, data[idx] + bump * (dx / (dist || 1))));
          data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + bump * (dy / (dist || 1))));
        }
      }
    }

    // Layer 3: Long creases (leather fold lines)
    for (let pass = 0; pass < 30; pass++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const len = 20 + Math.random() * 50;
      const angle = Math.random() * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const strength = 12 + Math.random() * 10;

      for (let t = 0; t < len; t++) {
        for (let w = -1; w <= 1; w++) {
          const px = Math.round(cx + dx * t + dy * w) % size;
          const py = Math.round(cy + dy * t - dx * w) % size;
          if (px < 0 || py < 0 || px >= size || py >= size) continue;
          const idx = (py * size + px) * 4;
          const sign = w === 0 ? 0 : w;
          data[idx] = Math.max(0, Math.min(255, data[idx] + sign * strength * (-dy)));
          data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + sign * strength * dx));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 3);
    return texture;
  }, []);
}

/**
 * Generate a subtle roughness variation map for leather
 */
function useLeatherRoughnessMap(): THREE.Texture {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base roughness (gray = 0.5)
    ctx.fillStyle = "rgb(180, 180, 180)";
    ctx.fillRect(0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Random variation
    for (let i = 0; i < data.length; i += 4) {
      const v = 160 + (Math.random() - 0.5) * 50;
      data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, v));
    }

    // Smoother patches (worn areas)
    for (let p = 0; p < 20; p++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const r = 10 + Math.random() * 25;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const px = Math.round(cx + dx) % size;
          const py = Math.round(cy + dy) % size;
          if (px < 0 || py < 0) continue;
          const idx = (py * size + px) * 4;
          // Make these areas slightly smoother (lower roughness = darker)
          data[idx] = Math.max(0, data[idx] - 20);
          data[idx + 1] = Math.max(0, data[idx + 1] - 20);
          data[idx + 2] = Math.max(0, data[idx + 2] - 20);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }, []);
}

/**
 * Collar band with leather material: rounded edges, normal map, roughness variation
 */
function CollarBand({
  radius,
  widthCm,
  thicknessCm,
  color
}: {
  radius: number;
  widthCm: number;
  thicknessCm: number;
  color: string;
}) {
  const normalMap = useLeatherNormalMap();
  const roughnessMap = useLeatherRoughnessMap();

  const geometry = useMemo(() => {
    const hw = widthCm / 2;
    const ht = thicknessCm / 2;

    // Generous rounded corners for natural leather feel
    const r = Math.min(thicknessCm, widthCm) * 0.3;
    const cornerSegments = 6;

    // Build cross-section with rounded corners using arcs
    const shape = new THREE.Shape();

    // Start bottom-left, go clockwise
    shape.moveTo(-hw + r, -ht);
    // Bottom edge
    shape.lineTo(hw - r, -ht);
    // Bottom-right corner
    shape.absarc(hw - r, -ht + r, r, -Math.PI / 2, 0, false);
    // Right edge
    shape.lineTo(hw, ht - r);
    // Top-right corner
    shape.absarc(hw - r, ht - r, r, 0, Math.PI / 2, false);
    // Top edge
    shape.lineTo(-hw + r, ht);
    // Top-left corner
    shape.absarc(-hw + r, ht - r, r, Math.PI / 2, Math.PI, false);
    // Left edge
    shape.lineTo(-hw, -ht + r);
    // Bottom-left corner
    shape.absarc(-hw + r, -ht + r, r, Math.PI, Math.PI * 1.5, false);

    // Sweep path: circle in XZ plane with slight random wobble for organic feel
    const segments = 160;
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Tiny random radial wobble (±0.03cm) for organic imperfection
      const wobble = (Math.sin(angle * 13) * 0.015 + Math.sin(angle * 7) * 0.01);
      const r2 = radius + wobble;
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * r2, 0, Math.sin(angle) * r2));
    }
    const path = new THREE.CatmullRomCurve3(curvePoints, true);

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 160,
      extrudePath: path,
      bevelEnabled: false
    });

    geo.computeVertexNormals();
    return geo;
  }, [radius, widthCm, thicknessCm]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.78}
        metalness={0.0}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        roughnessMap={roughnessMap}
        side={DoubleSide}
        envMapIntensity={0.3}
      />
    </mesh>
  );
}

/**
 * Stitch lines: small dashes along the top and bottom edges of the collar,
 * sitting slightly above the outer surface.
 */
function StitchLines({ radius, widthCm }: { radius: number; widthCm: number }) {
  const stitchGeometry = useMemo(() => {
    const outerR = radius + COLLAR_THICKNESS_CM / 2 + 0.02; // slightly above surface
    const stitchCount = 64;
    const stitchLength = (2 * Math.PI * outerR) / (stitchCount * 2.5); // each stitch covers ~40% of spacing
    const hw = widthCm / 2;
    const edgeOffset = hw - hw * 0.15; // 15% inset from edge

    const positions: number[] = [];

    for (let edge = 0; edge < 2; edge++) {
      const y = edge === 0 ? edgeOffset : -edgeOffset;

      for (let i = 0; i < stitchCount; i++) {
        const startAngle = (i / stitchCount) * Math.PI * 2;
        const endAngle = startAngle + (stitchLength / outerR);

        // Each stitch is a small cylinder-like segment
        const steps = 3;
        for (let s = 0; s < steps; s++) {
          const a1 = startAngle + (s / steps) * (endAngle - startAngle);
          const a2 = startAngle + ((s + 1) / steps) * (endAngle - startAngle);

          positions.push(
            Math.cos(a1) * outerR, y, Math.sin(a1) * outerR,
            Math.cos(a2) * outerR, y, Math.sin(a2) * outerR
          );
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [radius, widthCm]);

  return (
    <lineSegments geometry={stitchGeometry}>
      <lineBasicMaterial
        color="#e8dcc8"
        linewidth={1}
        opacity={0.85}
        transparent
      />
    </lineSegments>
  );
}

/**
 * Sticker: a small box placed on the outer surface of the collar.
 */
function StickerBlock({
  placedSticker,
  sticker,
  collarRadius,
  collarWidth
}: {
  placedSticker: PlacedSticker;
  sticker: StickerMetadata;
  collarRadius: number;
  collarWidth: number;
}) {
  const texture = useLoader(TextureLoader, sticker.assets[placedSticker.styleType]);

  const stickerHeight = collarWidth * 0.55 * sticker.heightRatio;
  const stickerWidth = collarWidth * 0.55 * sticker.widthRatio;
  const stickerDepth = 0.12;

  // Angular position (0-100% maps to full 360°)
  const angle = (placedSticker.positionRelativeX / 100) * Math.PI * 2;

  // Y position
  const yOffset = ((placedSticker.positionRelativeY - 50) / 50) * (collarWidth / 2 - stickerHeight / 2);

  // Place on outer surface
  const outerRadius = collarRadius + COLLAR_THICKNESS_CM / 2 + stickerDepth / 2;
  const x = Math.cos(angle) * outerRadius;
  const z = Math.sin(angle) * outerRadius;

  return (
    <mesh
      position={[x, yOffset, z]}
      rotation={[0, -angle + Math.PI / 2, 0]}
      castShadow
    >
      <boxGeometry args={[stickerWidth, stickerHeight, stickerDepth]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.35}
        metalness={0.0}
        transparent
        side={DoubleSide}
      />
    </mesh>
  );
}
