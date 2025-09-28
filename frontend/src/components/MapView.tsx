import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useMemo, useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";

type PinStyle = { color: string; glyph?: string };
type StyledPin = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  style: PinStyle;
  address?: string;
  placeId?: string;
};

const containerStyle = { width: "100%", height: "100%" };
const MIAMI = { lat: 25.7617, lng: -80.1918 };
const libraries: ("places")[] = ["places"];

// Safe SVG icon builder
const makePinIconUrl = (style: PinStyle) => {
  const color = style.color || "#19513b";
  const glyph = (style.glyph || "").slice(0, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
      <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"/>
      <circle cx="12" cy="9.5" r="3.2" fill="white" />
      <text x="12" y="10.2" text-anchor="middle" font-size="3.2" font-family="Arial, sans-serif" fill="${color}" font-weight="700">
        ${glyph.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
      </text>
    </svg>`;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`;
};

async function aiSuggestPins(apiKey: string): Promise<{ title: string; query: string; style: PinStyle }[]> {
  const ai = new GoogleGenAI({ apiKey });
  const sys = `Return ONLY a JSON array with exactly 3 objects.
Each object: {"title": string, "query": string, "style": {"color":"#RRGGBB","glyph": string (<=2 chars)}}
Constraints:
- Miami, FL; places on LAND (libraries, community centers, schools, shelters, clinics, parks on land, pantries).
- Avoid water/ocean/lake/marina/pier/boat-only.
- "query" must be a concrete place name (and optional neighborhood), not a category.`;
  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { responseModalities: ["TEXT"] as const, temperature: 0.8 },
    contents: [
      { role: "user", parts: [{ text: sys }] },
      { role: "user", parts: [{ text: "Return the JSON array now." }] },
    ],
  });

  const text = (resp as { text?: string }).text ?? "";
  try {
    const s = text.indexOf("["), e = text.lastIndexOf("]");
    if (s >= 0 && e > s) {
      const arr = JSON.parse(text.slice(s, e + 1));
      if (Array.isArray(arr) && arr.length === 3) {
        return arr.map((x: { title?: unknown; query?: unknown; style?: { color?: unknown; glyph?: unknown } }, i: number) => ({
          title: String(x?.title ?? `Miami Pin ${i + 1}`),
          query: String(x?.query ?? "Miami City Hall"),
          style: {
            color: typeof x?.style?.color === "string" ? x.style.color : "#19513b",
            glyph: typeof x?.style?.glyph === "string" ? x.style.glyph : "",
          },
        }));
      }
    }
  } catch {
    // Ignore JSON
  }
  // Fallback
  return [
    { title: "Little Havana Community Center", query: "Maximo Gomez Park Miami", style: { color: "#3b82f6", glyph: "🏠" } },
    { title: "Wynwood Tutoring Hub", query: "Wynwood Walls Entrance Miami", style: { color: "#8b5cf6", glyph: "✎" } },
    { title: "Overtown Pantry", query: "Overtown Youth Center Miami", style: { color: "#f97316", glyph: "🍎" } },
  ];
}

// Promisified Places find
function findPlace(service: google.maps.places.PlacesService, query: string, bias: google.maps.places.LocationBias) {
  return new Promise<google.maps.places.PlaceResult[] | null>((resolve) => {
    service.findPlaceFromQuery(
      {
        query,
        fields: ["name", "geometry", "types", "formatted_address", "place_id"], // <-- include place_id & address
        locationBias: bias,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) resolve(results);
        else resolve(null);
      }
    );
  });
}

// Land filter
function isOnLandPlace(r: google.maps.places.PlaceResult) {
  const name = (r.name || "").toLowerCase();
  const types = r.types || [];
  const waterHints = ["bay", "marina", "pier", "beach", "ocean", "lake", "boat", "harbor", "harbour", "dock"];
  if (waterHints.some((w) => name.includes(w))) return false;
  if (types.includes("natural_feature")) return false;
  return !!r.geometry?.location;
}

// Build a Google Maps place link
const mapsUrl = (p: StyledPin) =>
  p.placeId ? `https://www.google.com/maps/place/?q=place_id:${p.placeId}` :
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.title)}&query_place_id=${encodeURIComponent(p.placeId || "")}`;

export default function MapView() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const ranOnceRef = useRef(false);
  const [pins, setPins] = useState<StyledPin[]>([]);
  const [icons, setIcons] = useState<Record<string, google.maps.Icon>>({});
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const onLoad = async (map: google.maps.Map) => {
    mapRef.current = map;
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      const suggestions = apiKey ? await aiSuggestPins(apiKey) : await aiSuggestPins("NO_KEY");

      const service = new google.maps.places.PlacesService(map);
      const bias: google.maps.places.LocationBias = {
        center: MIAMI as google.maps.LatLngLiteral,
        radius: 25000,
      };

      const resolved: StyledPin[] = [];
      for (let i = 0; i < suggestions.length; i++) {
        const s = suggestions[i];
        const results = await findPlace(service, s.query, bias);
        const chosen = results?.find(isOnLandPlace) || results?.[0];
        if (chosen?.geometry?.location) {
          resolved.push({
            id: `pin-${Date.now()}-${i}`,
            title: s.title || chosen.name || `Miami Pin ${i + 1}`,
            lat: chosen.geometry.location.lat(),
            lng: chosen.geometry.location.lng(),
            style: s.style,
            address: chosen.formatted_address,
            placeId: chosen.place_id,
          });
        }
      }
      if (!resolved.length) throw new Error("No land-based places found.");

      const nextIcons: Record<string, google.maps.Icon> = {};
      resolved.forEach((p) => {
        nextIcons[p.id] = {
          url: makePinIconUrl(p.style),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 34),
        };
      });

      setPins(resolved);
      setIcons(nextIcons);

      const bounds = new google.maps.LatLngBounds();
      resolved.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 64);
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
      ) {
        setErr((e as { message: string }).message);
      } else {
        setErr("Failed to generate Miami pins");
      }
    }
  };

  const mapOptions = useMemo(
    () => ({
      clickableIcons: false,
      gestureHandling: "greedy" as const,
      mapTypeControl: false,
      streetViewControl: false,
    }),
    []
  );

  if (!isLoaded) {
    return (
      <div className="m-5 flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Neighborly Map — Miami</h3>
            <p className="text-sm text-gray-600">Generating AI-curated pins…</p>
          </div>
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-lg font-medium">Loading…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activePin = activePinId ? pins.find(p => p.id === activePinId) : null;

  return (
    <div className="m-5 flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-2 border-b border-gray-200 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-900">Neighborly Map</h3>
          <p className="text-sm text-gray-600">Events that make an impact on your community</p>
          {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
        </div>

        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={MIAMI}
            zoom={12}
            onLoad={onLoad}
            options={mapOptions}
          >
            {pins.map((p) => (
              <Marker
                key={p.id}
                position={{ lat: p.lat, lng: p.lng }}
                title={p.title}
                icon={icons[p.id]}
                onClick={() => setActivePinId(p.id)}   // <-- open InfoWindow
              />
            ))}

            {activePin && (
              <InfoWindow
                position={{ lat: activePin.lat, lng: activePin.lng }}
                onCloseClick={() => setActivePinId(null)}
              >
                <div className="min-w-48">
                  <h4 className="font-semibold">{activePin.title}</h4>
                  {activePin.address && (
                    <p className="text-xs text-gray-600 mb-2">{activePin.address}</p>
                  )}
                  <a
                    href={mapsUrl(activePin)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
