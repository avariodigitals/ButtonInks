"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

// ── Nominatim result shape (OpenStreetMap — free, no API key) ──────────────────
interface NominatimResult {
  place_id:     number;
  display_name: string;
  address: {
    house_number?: string;
    road?:         string;
    suburb?:       string;
    city?:         string;
    town?:         string;
    village?:      string;
    state?:        string;
    postcode?:     string;
    country_code?: string;
  };
}

export interface ParsedAddress {
  address:  string;   // street + house number
  city:     string;
  state:    string;
  zipCode:  string;
  country:  string;
}

interface AddressAutocompleteProps {
  value:       string;
  onChange:    (raw: string) => void;
  onSelect:    (parsed: ParsedAddress) => void;
  placeholder?: string;
  className?:  string;
  required?:   boolean;
  id?:         string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address…",
  className   = "",
  required,
  id,
}: AddressAutocompleteProps) {
  const [suggestions,  setSuggestions]  = useState<NominatimResult[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [open,         setOpen]         = useState(false);
  const debounceTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef   = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 4) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      // Nominatim usage policy: max 1 req/sec, set a custom User-Agent via headers isn't possible
      // from the browser, but the free tier is fine for low-volume usage.
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    const a = result.address;
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const city   = a.city ?? a.town ?? a.village ?? a.suburb ?? "";
    const parsed: ParsedAddress = {
      address: street,
      city,
      state:   a.state    ?? "",
      zipCode: a.postcode ?? "",
      country: a.country_code?.toUpperCase() ?? "",
    };
    // Set the raw text to the full display name so the field looks filled
    onChange(street || result.display_name.split(",")[0]);
    onSelect(parsed);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          autoComplete="off"
          required={required}
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`w-full h-12 pl-10 pr-10 bg-white rounded-[10px] border border-gray-200 focus:outline-none focus:border-green-700 text-sm transition-colors ${className}`}
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 animate-spin pointer-events-none" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-[200] top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-snug">{s.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
