import { useEffect, useMemo, useState } from "react";
import Filters from "./Filters";

type FeedItem = {
  dateLabel: string;                     // "TODAY • 2:30 PM"
  type: "REQUEST" | "OFFER" | "VOLUNTEER";
  title: string;
  organizer: string;                     // AI-ish name/org
  distanceMiles: number;                 // e.g., 0.8
  description: string;                   // short summary
  interestedCount: number;               // e.g., 7
};

type EventsFeedProps = {
  prompt?: string; 
  context?: { topic?: string; area?: string; when?: string; limit?: number };
};

const badgeStyles: Record<FeedItem["type"], { bg: string; text: string }> = {
  REQUEST: { bg: "bg-red-100", text: "text-red-800" },
  OFFER: { bg: "bg-green-100", text: "text-green-800" },
  VOLUNTEER: { bg: "bg-purple-100", text: "text-purple-800" },
};

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, list: T[]): T { 
  return list[Math.floor(r() * list.length)]; 
}

function randFloat(r: () => number, min: number, max: number, d = 1): number {
  const v = min + r() * (max - min);
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

function randInt(r: () => number, min: number, max: number): number {
  return Math.floor(r() * (max - min + 1)) + min;
}
function formatDateLabel(date: Date) {
  const now = new Date();
  const same =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  if (same) return `TODAY • ${time}`;
  const dayStr = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "2-digit" }).format(date);
  return `${dayStr.toUpperCase()} • ${time}`;
}

function generateItem(r: () => number, prompt: string, ctx?: EventsFeedProps["context"]): FeedItem {
  const type = pick(r, ["REQUEST", "OFFER", "VOLUNTEER"] as const);
  const area = ctx?.area || "nearby";
  const when = ctx?.when || "this week";
  const topic = (ctx?.topic || prompt || "community support").toLowerCase();

  const orgs = ["Community Center", "Neighborhood Assoc.", "Food Bank", "Youth Club", "Mutual Aid Network"];
  const first = ["Sarah","Mike","Ana","Luis","Jasmine","Carlos","Elena","David","Rosa","Marco"];
  const lastI = ["M.","R.","G.","S.","L.","P.","K.","D.","C.","H."];

  const titles: Record<FeedItem["type"], string[]> = {
    REQUEST: [
      "Need groceries for family of 4",
      "Looking for school supplies assistance",
      "Urgent request: baby essentials",
      "Help with short-term rent gap",
      `Requesting warm meals ${when}`,
    ],
    OFFER: [
      "Free rides to medical appointments",
      "Donating gently used clothes",
      "Offering tutoring after school",
      `Hot meals available ${when}`,
      "Can help with basic home repairs",
    ],
    VOLUNTEER: [
      `Community cleanup in ${area}`,
      `Pantry restock shift ${when}`,
      "Park beautification day",
      `Sort donations at ${pick(r, orgs)}`,
      "Neighborhood outreach walk",
    ],
  };

  if ((topic.includes("food") || topic.includes("groc")) && type === "REQUEST") {
    titles.REQUEST.unshift(`Need groceries ${when}`);
  }
  if ((topic.includes("ride") || topic.includes("transport")) && type !== "VOLUNTEER") {
    titles.OFFER.unshift("Free rides for appointments");
    titles.REQUEST.unshift("Need ride to clinic");
  }
  if (topic.includes("tutor") || topic.includes("school")) {
    titles.OFFER.unshift("After-school tutoring available");
    titles.REQUEST.unshift("Looking for math tutoring");
  }

  const title = pick(r, titles[type]);
  const useOrg = r() < 0.35;
  const organizer = useOrg ? `${area.split(",")[0]} ${pick(r, orgs)}` : `${pick(r, first)} ${pick(r, lastI)}`;
  const distanceMiles = randFloat(r, 0.2, 12.0, 1);
  const interestedCount = type === "VOLUNTEER" ? randInt(r, 5, 25) : randInt(r, 0, 20);

  const now = new Date();
  const date = new Date(now.getTime() + randInt(r, -4, 120) * 3600 * 1000);
  const dateLabel = formatDateLabel(date);

  const descs: Record<FeedItem["type"], string[]> = {
    REQUEST: [
      "Lost hours at work; need basics for the week.",
      "Short on funds; focused on essentials.",
      "Temporary setback—any help appreciated.",
      `Prefer pickup near ${area.split(",")[0]}.`,
    ],
    OFFER: [
      `Available on weekdays, flexible within ${Math.max(3, Math.round(distanceMiles))} miles.`,
      "Items are clean and ready for pickup.",
      `Can coordinate times ${when}.`,
      `Happy to help neighbors in ${area.split(",")[0]}.`,
    ],
    VOLUNTEER: [
      "Supplies provided; all ages welcome.",
      "Great for small groups—bring water & hat.",
      "Check-in table on site; simple tasks.",
      `Helps address urgent needs in ${area.split(",")[0]}.`,
    ],
  };

  return { 
    dateLabel, 
    type, 
    title, 
    organizer, 
    distanceMiles, 
    description: pick(r, descs[type]), 
    interestedCount 
  };
}

function generateItems(seedKey: string, ctx?: EventsFeedProps["context"]): FeedItem[] {
  const rand = mulberry32(xmur3(seedKey)());
  const limit = Math.min(Math.max(ctx?.limit ?? 3, 1), 8);
  const items: FeedItem[] = [];
  for (let i = 0; i < limit; i++) items.push(generateItem(rand, seedKey, ctx));
  return items;
}

function resolvePrompt(propPrompt?: string): string {
 
  const winPrompt = typeof window !== "undefined" ? (window as Window & { __NEIGHBORLY_PROMPT__?: string }).__NEIGHBORLY_PROMPT__ : undefined;

  const envPrompt = (import.meta as ImportMeta & { env: { VITE_EVENTS_PROMPT?: string } })?.env?.VITE_EVENTS_PROMPT;
  return propPrompt || winPrompt || envPrompt || "Generate realistic mutual-aid events near Miami focusing on practical, specific needs and offers.";
}

export default function EventsFeed({ prompt: propPrompt, context }: EventsFeedProps) {
  const prompt = useMemo(() => resolvePrompt(propPrompt), [propPrompt]);
  const [items, setItems] = useState<FeedItem[]>([]);

  // Auto-generate on mount AND whenever prompt/context change
  useEffect(() => {
    const seedKey = JSON.stringify({
      prompt,
      topic: context?.topic || "",
      area: context?.area || "",
      when: context?.when || "",
      limit: context?.limit ?? 5,
    });
    setItems(generateItems(seedKey, context));
  }, [prompt, context?.topic, context?.area, context?.when, context?.limit]);

  return (
    <div className="w-96 flex-shrink-0 overflow-y-auto custom-scrollbar-hidden mt-5 mb-5">
      <Filters />

      <div className="space-y-3">
        {items.map((p, idx) => {
          const badge = badgeStyles[p.type] ?? { bg: "bg-gray-100", text: "text-gray-800" };
          return (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{p.dateLabel}</span>
                  <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {p.type}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{p.title}</h3>
                <p className="text-gray-600 text-xs mb-2">
                  {p.organizer} • {Number.isFinite(p.distanceMiles) ? p.distanceMiles.toFixed(1) : "—"} miles away
                </p>

                <p className="text-gray-700 text-xs mb-2 line-clamp-2">{p.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{p.interestedCount} interested</span>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-xs text-gray-500">No events generated.</p>
        )}
      </div>
    </div>
  );
}
