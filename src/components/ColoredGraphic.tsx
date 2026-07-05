"use client";

import React from "react";

/**
 * Renders an SVG icon with a specific fill/stroke color.
 * Fetches the SVG once, replaces fill/stroke with the target color,
 * encodes it as a data: URI, and caches the result so each (url, color)
 * pair is only fetched once per session.
 */
const svgColorCache = new Map<string, string>();

export default function ColoredGraphic({
  src,
  color,
  className,
  alt = "graphic",
}: {
  src: string;
  color?: string;
  className?: string;
  alt?: string;
}) {
  const targetColor = color || "#171717";

  const [dataUri, setDataUri] = React.useState<string>(() => {
    const key = `${src}::${targetColor}`;
    return svgColorCache.get(key) ?? src;
  });

  React.useEffect(() => {
    const key = `${src}::${targetColor}`;
    if (svgColorCache.has(key)) {
      const cached = svgColorCache.get(key)!;
      Promise.resolve().then(() => setDataUri(cached));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res  = await fetch(src);
        let   text = await res.text();
        // Replace fill/stroke attributes and inline CSS — preserve "none" values
        text = text
          .replace(/fill="(?!none)[^"]*"/g,             `fill="${targetColor}"`)
          .replace(/stroke="(?!none)[^"]*"/g,           `stroke="${targetColor}"`)
          .replace(/fill\s*:\s*(?!none)[^;}"]+/g,       `fill:${targetColor}`)
          .replace(/stroke\s*:\s*(?!none)[^;}"]+/g,     `stroke:${targetColor}`);
        const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
        svgColorCache.set(key, uri);
        if (!cancelled) setDataUri(uri);
      } catch {
        if (!cancelled) setDataUri(src);
      }
    })();
    return () => { cancelled = true; };
  }, [src, targetColor]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUri} className={className} alt={alt} />;
}
