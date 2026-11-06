import type { BodyPart, SkinObject } from "skinview3d";
import type * as Three from "three";

const TEXTURES =
  "https://assets.mcasset.cloud/26.1.2/assets/minecraft/textures";
const DEFAULT_LEATHER_COLOR = 0xa06540;
const DARKER_TRIM_MATERIALS = new Set([
  "copper",
  "diamond",
  "gold",
  "iron",
  "netherite"
]);
const GLINT_SPEED = 0.15;

export interface ArmorItem {
  type: string;
  color?: number;
  enchanted?: boolean;
  trim?: { pattern: string; material: string };
}

export interface ArmorPieces {
  head?: ArmorItem;
  chest?: ArmorItem;
  legs?: ArmorItem;
  feet?: ArmorItem;
}

type Layer = "humanoid" | "humanoid_leggings";

interface PieceSpec {
  part: (skin: SkinObject) => BodyPart;
  size: [number, number, number];
  uv: [number, number];
  inflate: number;
  layer: Layer;
  mirror?: boolean;
}

const PIECES: Record<keyof ArmorPieces, PieceSpec[]> = {
  head: [
    {
      part: (s) => s.head,
      size: [8, 8, 8],
      uv: [0, 0],
      inflate: 1,
      layer: "humanoid"
    }
  ],
  chest: [
    {
      part: (s) => s.body,
      size: [8, 12, 4],
      uv: [16, 16],
      inflate: 1,
      layer: "humanoid"
    },
    {
      part: (s) => s.rightArm,
      size: [4, 12, 4],
      uv: [40, 16],
      inflate: 1,
      layer: "humanoid"
    },
    {
      part: (s) => s.leftArm,
      size: [4, 12, 4],
      uv: [40, 16],
      inflate: 1,
      layer: "humanoid",
      mirror: true
    }
  ],
  legs: [
    {
      part: (s) => s.body,
      size: [8, 12, 4],
      uv: [16, 16],
      inflate: 0.5,
      layer: "humanoid_leggings"
    },
    {
      part: (s) => s.rightLeg,
      size: [4, 12, 4],
      uv: [0, 16],
      inflate: 0.5,
      layer: "humanoid_leggings"
    },
    {
      part: (s) => s.leftLeg,
      size: [4, 12, 4],
      uv: [0, 16],
      inflate: 0.5,
      layer: "humanoid_leggings",
      mirror: true
    }
  ],
  feet: [
    {
      part: (s) => s.rightLeg,
      size: [4, 12, 4],
      uv: [0, 16],
      inflate: 1,
      layer: "humanoid"
    },
    {
      part: (s) => s.leftLeg,
      size: [4, 12, 4],
      uv: [0, 16],
      inflate: 1,
      layer: "humanoid",
      mirror: true
    }
  ]
};

export const armorMaterial = (type: string) => {
  const id = type.replace(/^minecraft:/, "");
  if (id === "turtle_helmet") return "turtle_scute";
  const match = id.match(/^(.+)_(helmet|chestplate|leggings|boots)$/);
  if (!match) return null;
  return match[1] === "golden" ? "gold" : match[1];
};

const images = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (url: string) => {
  let image = images.get(url);
  if (!image) {
    image = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
        images.delete(url);
        reject(new Error(`Failed to load ${url}`));
      };
      img.src = url;
    });
    images.set(url, image);
  }
  return image;
};

const pixelsOf = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

const toCanvas = (data: ImageData) => {
  const canvas = document.createElement("canvas");
  canvas.width = data.width;
  canvas.height = data.height;
  canvas.getContext("2d")!.putImageData(data, 0, 0);
  return canvas;
};

const tint = (image: HTMLImageElement, color: number) => {
  const data = pixelsOf(image);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  for (let i = 0; i < data.data.length; i += 4) {
    data.data[i] = (data.data[i] * r) / 255;
    data.data[i + 1] = (data.data[i + 1] * g) / 255;
    data.data[i + 2] = (data.data[i + 2] * b) / 255;
  }
  return data;
};

const recolorTrim = (
  pattern: HTMLImageElement,
  keyPalette: HTMLImageElement,
  materialPalette: HTMLImageElement
) => {
  const data = pixelsOf(pattern);
  const keys = pixelsOf(keyPalette).data;
  const colors = pixelsOf(materialPalette).data;

  const indexByGray = new Map<number, number>();
  for (let i = 0; i < keyPalette.width; i++) indexByGray.set(keys[i * 4], i);

  for (let p = 0; p < data.data.length; p += 4) {
    if (data.data[p + 3] === 0) continue;
    const index = indexByGray.get(data.data[p]);
    if (index === undefined) continue;
    data.data[p] = colors[index * 4];
    data.data[p + 1] = colors[index * 4 + 1];
    data.data[p + 2] = colors[index * 4 + 2];
  }
  return toCanvas(data);
};

const composeTexture = async (
  layer: Layer,
  material: string,
  item: ArmorItem
) => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d")!;
  const equipment = `${TEXTURES}/entity/equipment/${layer}`;

  const base = await loadImage(`${equipment}/${material}.png`);
  if (material === "leather") {
    context.drawImage(
      toCanvas(tint(base, item.color ?? DEFAULT_LEATHER_COLOR)),
      0,
      0
    );
    context.drawImage(
      await loadImage(`${equipment}/leather_overlay.png`),
      0,
      0
    );
  } else {
    context.drawImage(base, 0, 0);
  }

  if (item.trim) {
    const palette =
      item.trim.material === material && DARKER_TRIM_MATERIALS.has(material)
        ? `${item.trim.material}_darker`
        : item.trim.material;
    try {
      const [pattern, keyPalette, materialPalette] = await Promise.all([
        loadImage(`${TEXTURES}/trims/entity/${layer}/${item.trim.pattern}.png`),
        loadImage(`${TEXTURES}/trims/color_palettes/trim_palette.png`),
        loadImage(`${TEXTURES}/trims/color_palettes/${palette}.png`)
      ]);
      context.drawImage(
        recolorTrim(pattern, keyPalette, materialPalette),
        0,
        0
      );
    } catch (error) {
      console.warn("Armor trim failed", error);
    }
  }

  return canvas;
};

const setArmorUVs = (
  box: Three.BoxGeometry,
  u: number,
  v: number,
  width: number,
  height: number,
  depth: number,
  mirror = false
) => {
  const face = (x1: number, y1: number, x2: number, y2: number) => {
    const [left, right] = mirror ? [x2, x1] : [x1, x2];
    return [
      [left / 64, 1 - y2 / 32],
      [right / 64, 1 - y2 / 32],
      [right / 64, 1 - y1 / 32],
      [left / 64, 1 - y1 / 32]
    ];
  };

  const top = face(u + depth, v, u + width + depth, v + depth);
  const bottom = face(u + width + depth, v, u + width * 2 + depth, v + depth);
  let left = face(u, v + depth, u + depth, v + depth + height);
  const front = face(
    u + depth,
    v + depth,
    u + width + depth,
    v + depth + height
  );
  let right = face(
    u + width + depth,
    v + depth,
    u + width + depth * 2,
    v + height + depth
  );
  const back = face(
    u + width + depth * 2,
    v + depth,
    u + width * 2 + depth * 2,
    v + height + depth
  );
  if (mirror) [left, right] = [right, left];

  const reorder = (f: number[][], order: number[]) => order.map((i) => f[i]);
  const faces = [
    reorder(right, [3, 2, 0, 1]),
    reorder(left, [3, 2, 0, 1]),
    reorder(top, [3, 2, 0, 1]),
    reorder(bottom, [0, 1, 3, 2]),
    reorder(front, [3, 2, 0, 1]),
    reorder(back, [3, 2, 0, 1])
  ];

  const uv = box.attributes.uv as Three.BufferAttribute;
  uv.set(new Float32Array(faces.flat(2)));
  uv.needsUpdate = true;
};

const createGlintMaterial = (
  three: typeof Three,
  armorTexture: Three.Texture,
  glintTexture: Three.Texture
) =>
  new three.ShaderMaterial({
    uniforms: {
      armorMap: { value: armorTexture },
      glintMap: { value: glintTexture },
      offset: { value: new three.Vector2() }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D armorMap;
      uniform sampler2D glintMap;
      uniform vec2 offset;
      varying vec2 vUv;
      void main() {
        if (texture2D(armorMap, vUv).a < 0.1) discard;
        vec3 glint = texture2D(glintMap, vUv * 4.0 + offset).rgb;
        gl_FragColor = vec4(glint * 0.5, 1.0);
      }
    `,
    transparent: true,
    blending: three.AdditiveBlending,
    depthWrite: false,
    side: three.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

export const attachArmor = (
  three: typeof Three,
  skin: SkinObject,
  armor: ArmorPieces
) => {
  let disposed = false;
  let frame = 0;
  let glintTexture: Three.Texture | null = null;
  const meshes: Three.Mesh[] = [];
  const disposables: { dispose: () => void }[] = [];
  const glints: Three.ShaderMaterial[] = [];

  const cleanup = () => {
    cancelAnimationFrame(frame);
    for (const mesh of meshes) mesh.removeFromParent();
    for (const item of disposables) item.dispose();
    meshes.length = 0;
    disposables.length = 0;
    glints.length = 0;
  };

  const toTexture = (canvas: HTMLCanvasElement) => {
    const texture = new three.CanvasTexture(canvas);
    texture.magFilter = three.NearestFilter;
    texture.minFilter = three.NearestFilter;
    texture.colorSpace = three.SRGBColorSpace;
    disposables.push(texture);
    return texture;
  };

  const getGlintTexture = () => {
    if (!glintTexture) {
      glintTexture = new three.TextureLoader()
        .setCrossOrigin("anonymous")
        .load(`${TEXTURES}/misc/enchanted_glint_armor.png`);
      glintTexture.wrapS = three.RepeatWrapping;
      glintTexture.wrapT = three.RepeatWrapping;
      disposables.push(glintTexture);
    }
    return glintTexture;
  };

  const addPiece = (
    spec: PieceSpec,
    texture: Three.Texture,
    enchanted: boolean
  ) => {
    const [width, height, depth] = spec.size;
    const grow = spec.inflate * 2;
    const box = new three.BoxGeometry(
      width + grow,
      height + grow,
      depth + grow
    );
    setArmorUVs(box, spec.uv[0], spec.uv[1], width, height, depth, spec.mirror);
    disposables.push(box);

    const material = new three.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 1e-5,
      side: three.DoubleSide
    });
    disposables.push(material);

    const target = spec.part(skin).innerLayer;
    const place = (mesh: Three.Mesh) => {
      mesh.position.copy(target.position);
      target.parent?.add(mesh);
      meshes.push(mesh);
    };

    place(new three.Mesh(box, material));

    if (enchanted) {
      const glint = createGlintMaterial(three, texture, getGlintTexture());
      disposables.push(glint);
      glints.push(glint);
      place(new three.Mesh(box, glint));
    }
  };

  const animate = () => {
    const start = performance.now();
    const tick = (now: number) => {
      const time = ((now - start) / 1000) * GLINT_SPEED;
      for (const glint of glints)
        glint.uniforms.offset.value.set(time, time * 0.5);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };

  const build = async () => {
    for (const slot of ["head", "chest", "legs", "feet"] as const) {
      const item = armor[slot];
      const material = item ? armorMaterial(item.type) : null;
      if (!item || !material) continue;

      const textureByLayer = new Map<Layer, Three.Texture>();
      for (const spec of PIECES[slot]) {
        let texture = textureByLayer.get(spec.layer);
        if (!texture) {
          let canvas: HTMLCanvasElement;
          try {
            canvas = await composeTexture(spec.layer, material, item);
          } catch (error) {
            console.warn("Armor texture failed", error);
            continue;
          }
          if (disposed) return;
          texture = toTexture(canvas);
          textureByLayer.set(spec.layer, texture);
        }
        addPiece(spec, texture, Boolean(item.enchanted));
      }
    }
    if (glints.length > 0) animate();
  };

  void build().catch((error) => console.warn("Armor failed", error));

  return () => {
    disposed = true;
    cleanup();
  };
};
