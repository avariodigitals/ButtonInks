"use client";

/**
 * ColorSwatch
 *
 * Renders a single color swatch circle for a WooCommerce color attribute option.
 *
 * - Solid circle for single colors ("Black", "Navy", "Sport Grey", etc.)
 * - Diagonal split circle for two-tone names ("Black/White", "Army Olive/Tan", etc.)
 * - Text pill fallback when no hex can be resolved
 *
 * All color resolution goes through colorLookup (single source of truth).
 */

import React from "react";
import { colorNameToHex } from "@/lib/colorLookup";

// ── helpers ───────────────────────────────────────────────────────────────────

export function isLightHex(hex: string): boolean {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

// ── types ─────────────────────────────────────────────────────────────────────

interface ColorSwatchProps {
  /** The color name exactly as returned from WooCommerce (e.g. "Black/White") */
  colorName: string;
  /** Size in pixels — default 16 */
  size?: number;
  /** Whether this swatch is currently selected */
  selected?: boolean;
  /** Click handler — called with the original color name */
  onClick?: (name: string) => void;
  /** Additional className on the outer element */
  className?: string;
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
  // Diagonal split: top-left = leftHex, bottom-right = rightHex
  // Using a simple clipping approach with two overlapping semicircle paths
  const r = size / 2;
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
          {/* Left half: triangle from top-left to bottom-left diagonal */}
          <polygon points={`0,0 ${size},0 0,${size}`} />
        </clipPath>
        <clipPath id={`${id}-right`}>
          <polygon points={`${size},0 ${size},${size} 0,${size}`} />
        </clipPath>
      </defs>
      {/* Background circle right half */}
      <circle cx={r} cy={r} r={r} fill={rightHex} />
      {/* Left half on top */}
      <circle cx={r} cy={r} r={r} fill={leftHex} clipPath={`url(#${id}-left)`} />
      {/* Thin dividing line for contrast */}
      <line
        x1="0"
        y1="0"
        x2={size}
        y2={size}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

// ── ColorSwatch component ────────────────────────────────────────────────────

export default function ColorSwatch({
  colorName,
  size = 16,
  selected = false,
  onClick,
  className = "",
}: ColorSwatchProps) {
  const resolved = colorNameToHex(colorName);

  // Unknown color — text pill
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

  const isTwoTone = Array.isArray(resolved);
  const leftHex   = isTwoTone ? resolved[0] : resolved as string;
  const rightHex  = isTwoTone ? resolved[1] : resolved as string;

  // Border needed when both halves are very light
  const leftLight  = isLightHex(leftHex);
  const rightLight = isLightHex(rightHex);
  const needsBorder = leftLight && rightLight;

  const ringClass = selected
    ? "ring-[3px] ring-green-500 scale-110"
    : "hover:scale-110";

  const borderStyle = needsBorder
    ? { border: "1px solid #D1D5DB" }
    : {};

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
        ...borderStyle,
      }}
    >
      {isTwoTone ? (
        <SplitCircle leftHex={leftHex} rightHex={rightHex} size={size} />
      ) : (
        <span
          className="block w-full h-full rounded-full"
          style={{ backgroundColor: leftHex }}
        >
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
// Convenience wrapper: renders a row of swatches with +N overflow.

interface SwatchRowProps {
  colors: string[];
  /** Max swatches to show before "+N" — default 6 */
  maxVisible?: number;
  size?: number;
  selectedColor?: string;
  onColorClick?: (name: string) => void;
}

export function SwatchRow({
  colors,
  maxVisible = 6,
  size = 16,
  selectedColor,
  onColorClick,
}: SwatchRowProps) {
  if (!colors || colors.length === 0) return null;

  const visible  = colors.slice(0, maxVisible);
  const overflow = colors.length - maxVisible;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((colorName) => (
        <ColorSwatch
          key={colorName}
          colorName={colorName}
          size={size}
          selected={selectedColor === colorName}
          onClick={onColorClick}
        />
      ))}
      {overflow > 0 && (
        <span className="text-gray-400 text-[10px] font-['Inter'] leading-none">
          +{overflow}
        </span>
      )}
    </div>
  );
}
