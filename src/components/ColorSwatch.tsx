"use client";

/**
 * ColorSwatch / ImageSwatch
 *
 * Two modes depending on what data is available:
 *
 * 1. IMAGE SWATCHES (preferred, 100% accurate)
 *    Pass `images` — renders tiny product image thumbnails from the WC gallery.
 *    Each image represents a color variant. No guessing, no name matching.
 *
 * 2. COLOR NAME SWATCHES (fallback)
 *    Pass `colors` (string[]) — resolves names via colorLookup.
 *    Used when no gallery images are available.
 */

import React from "react";
import Image from "next/image";
import { colorNameToHex } from "@/lib/colorLookup";
import type { WPProductImage } from "@/lib/wordpress";

// ── helpers ───────────────────────────────────────────────────────────────────

export function isLightHex(hex: string): boolean {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

// ── Split-circle SVG ─────────────────────────────────────────────────────────

function SplitCircle({
  leftHex,
  rightHex,
  size,
}: {
  leftHex: string;
  rightHex: string;
  size: number;
}) {
  const r  = size / 2;
  const id = `split-${leftHex.slice(1)}-${rightHex.slice(1)}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", borderRadius: "50%", overflow: "hidden" }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${id}-left`}>
          <polygon points={`0,0 ${size},0 0,${size}`} />
        </clipPath>
        <clipPath id={`${id}-right`}>
          <polygon points={`${size},0 ${size},${size} 0,${size}`} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill={rightHex} />
      <circle cx={r} cy={r} r={r} fill={leftHex} clipPath={`url(#${id}-left)`} />
      <line x1="0" y1="0" x2={size} y2={size} stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" />
    </svg>
  );
}

// ── Image swatch ──────────────────────────────────────────────────────────────

function ImageSwatch({
  image,
  size = 20,
  selected = false,
  onClick,
}: {
  image: WPProductImage;
  size?: number;
  selected?: boolean;
  onClick?: (img: WPProductImage) => void;
}) {
  const ringClass = selected
    ? "ring-[3px] ring-green-500 scale-110"
    : "hover:scale-110 hover:ring-2 hover:ring-green-400";

  return (
    <button
      type="button"
      title={image.alt || image.name}
      aria-label={image.alt || image.name}
      aria-pressed={selected}
      onClick={onClick ? () => onClick(image) : undefined}
      className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 border border-gray-200 bg-gray-50 ${ringClass}`}
      style={{ width: size, height: size, padding: 0 }}
    >
      <Image
        src={image.src}
        alt={image.alt || image.name}
        width={size}
        height={size}
        className="w-full h-full object-cover rounded-full"
        sizes={`${size}px`}
      />
    </button>
  );
}

// ── ColorSwatch (name-based fallback) ────────────────────────────────────────

interface ColorSwatchProps {
  colorName: string;
  size?: number;
  selected?: boolean;
  onClick?: (name: string) => void;
  className?: string;
}

export default function ColorSwatch({
  colorName,
  size = 16,
  selected = false,
  onClick,
  className = "",
}: ColorSwatchProps) {
  const resolved = colorNameToHex(colorName);

  if (!resolved) {
    return (
      <span
        title={colorName}
        className={`px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 text-[10px] font-['Inter'] leading-none ${className}`}
      >
        {colorName}
      </span>
    );
  }

  const isTwoTone   = Array.isArray(resolved);
  const leftHex     = isTwoTone ? resolved[0] : (resolved as string);
  const rightHex    = isTwoTone ? resolved[1] : (resolved as string);
  const leftLight   = isLightHex(leftHex);
  const rightLight  = isLightHex(rightHex);
  const needsBorder = leftLight && rightLight;
  const ringClass   = selected ? "ring-[3px] ring-green-500 scale-110" : "hover:scale-110";

  return (
    <button
      type="button"
      title={colorName}
      aria-label={colorName}
      aria-pressed={selected}
      onClick={onClick ? () => onClick(colorName) : undefined}
      className={`inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${ringClass} ${className}`}
      style={{
        width: size,
        height: size,
        padding: 0,
        backgroundColor: "transparent",
        ...(needsBorder ? { border: "1px solid #D1D5DB" } : {}),
      }}
    >
      {isTwoTone ? (
        <SplitCircle leftHex={leftHex} rightHex={rightHex} size={size} />
      ) : (
        <span className="block w-full h-full rounded-full" style={{ backgroundColor: leftHex }}>
          {selected && (
            <span
              className={`flex items-center justify-center w-full h-full text-[8px] font-black leading-none ${leftLight ? "text-gray-800" : "text-white"}`}
              aria-hidden="true"
            >
              ✓
            </span>
          )}
        </span>
      )}
    </button>
  );
}

// ── SwatchRow ─────────────────────────────────────────────────────────────────
// Auto-selects the best strategy:
//   - images[] with >1 item → image thumbnails (100% accurate, no guessing)
//   - colors[]              → color name lookup (fallback)

interface SwatchRowProps {
  images?: WPProductImage[];
  colors?: string[];
  maxVisible?: number;
  size?: number;
  selectedColor?: string;
  onColorClick?: (name: string) => void;
  selectedImage?: number;
  onImageClick?: (img: WPProductImage) => void;
}

export function SwatchRow({
  images,
  colors,
  maxVisible = 6,
  size = 20,
  selectedColor,
  onColorClick,
  selectedImage,
  onImageClick,
}: SwatchRowProps) {
  // Deduplicate images by src
  const uniqueImages = images
    ? images.filter((img, idx, arr) => arr.findIndex(x => x.src === img.src) === idx)
    : [];

  // Use image swatches when gallery has more than 1 image
  if (uniqueImages.length > 1) {
    const visible  = uniqueImages.slice(0, maxVisible);
    const overflow = uniqueImages.length - maxVisible;
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visible.map(img => (
          <ImageSwatch
            key={img.id}
            image={img}
            size={size}
            selected={selectedImage === img.id}
            onClick={onImageClick}
          />
        ))}
        {overflow > 0 && (
          <span className="text-gray-400 text-[10px] font-['Inter'] leading-none">+{overflow}</span>
        )}
      </div>
    );
  }

  // Fallback: color name swatches
  const colorList = colors ?? [];
  if (!colorList.length) return null;

  const visible  = colorList.slice(0, maxVisible);
  const overflow = colorList.length - maxVisible;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map(colorName => (
        <ColorSwatch
          key={colorName}
          colorName={colorName}
          size={size}
          selected={selectedColor === colorName}
          onClick={onColorClick}
        />
      ))}
      {overflow > 0 && (
        <span className="text-gray-400 text-[10px] font-['Inter'] leading-none">+{overflow}</span>
      )}
    </div>
  );
}
