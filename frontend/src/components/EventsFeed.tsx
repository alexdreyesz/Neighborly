import { useEffect, useMemo, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import Filters from "./Filters"; 
import supabase from "../config/supabaseClient";
import { useProfile } from "../hooks/useProfile";



// --- API Function for Fetching Events by Category ---
async function fetchEventsByCategory(category?: string, limit = 3): Promise<EventItem[]> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: false })
      .limit(limit);

   
    if (category && category.trim() !== '') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }


    interface DBEvent {
      id: string;
      title?: string;
      details?: string;
      starts_at?: string;
      org_id?: string;
      category?: string;
    }

    const events: EventItem[] = (data || []).map((event: DBEvent) => {
    
      let type: EventType = "OFFER"; // Default type
      
     
      if (event.category?.includes("REQUEST") || event.title?.toLowerCase().includes("need")) {
        type = "REQUEST";
      } else if (event.category?.includes("VOLUNTEER") || event.title?.toLowerCase().includes("volunteer")) {
        type = "VOLUNTEER";
      }


      const distanceMiles = Math.round((0.5 + Math.random() * 8) * 10) / 10;

      // Format date
      const eventDate = event.starts_at ? new Date(event.starts_at) : new Date();
      const dateLabel = formatDateLabel(eventDate);

      // Get organizer name (you might want to join with profiles table)
      const organizer = event.org_id ? "Community Member" : "Local Group";

      return {
        dateLabel,
        type,
        title: event.title || "Community Event",
        organizer,
        distanceMiles,
        description: event.details || "Community event to support local needs.",
        interestedCount: type === "VOLUNTEER" ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 10),
      };
    });

    console.log(`Fetched ${events.length} events from database`);
    return events;

  } catch (err) {
    console.error('Error fetching events by category:', err);
    throw err;
  }
}



// --- types ---
type EventType = "REQUEST" | "OFFER" | "VOLUNTEER";

interface EventItem {
  dateLabel: string;
  type: EventType;
  title: string;
  organizer: string;
  distanceMiles: number;
  description: string;
  interestedCount: number;
}

interface EventsContext {
  topic?: string;
  area?: string;
  when?: string;
  limit?: number;
}

interface EventsFeedProps {
  prompt?: string;
  context: EventsContext;
}

// --- tiny helpers ---
function formatDateLabel(date: Date): string {
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

function parseJsonLoose(text: string): unknown[] | null {
  try {
    const j = JSON.parse(text);
    return Array.isArray(j) ? j : null;
  } catch {
    // ignore
  }
  const noFences = String(text || "").replace(/```json|```/g, "").trim();
  const start = noFences.indexOf("[");
  const end = noFences.lastIndexOf("]");
  if (start >= 0 && end > start) {
    try {
      const j = JSON.parse(noFences.slice(start, end + 1));
      return Array.isArray(j) ? j : null;
    } catch {
      // ignore
    }
  }
  return null;
}

async function getGenAIText(resp: unknown): Promise<string> {
  // Type guards for expected structure
  if (typeof resp === "object" && resp !== null) {
    const r1 = (resp as { response?: { text?: unknown } })?.response?.text;
    if (typeof r1 === "function") {
      const v = r1.call((resp as { response?: { text?: unknown } }).response);
      return typeof v?.then === "function" ? await v : String(v ?? "");
    }
    const r2 = (resp as { text?: unknown })?.text;
    if (typeof r2 === "function") {
      const v = r2.call(resp);
      return typeof v?.then === "function" ? await v : String(v ?? "");
    }
    const parts = (resp as { response?: { candidates?: { content?: { parts?: Array<{ text?: string }> } }[] } })?.response?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: { text?: string }) => (typeof p?.text === "string" ? p.text : "")).join("");
    }
  }
  try { return JSON.stringify(resp); } catch { return ""; }
}

// --- local fallback list (simple/random) ---
function localEvents(limit = 5, ctx: EventsContext = {}): EventItem[] {
  const area = ctx.area || "nearby";
  const when = ctx.when || "this week";
  const kinds: EventType[] = ["REQUEST", "OFFER", "VOLUNTEER"];
  const titles: Record<EventType, string[]> = {
    REQUEST: [
      "Need groceries for family of 4",
      "Looking for school supplies",
      "Urgent: baby essentials",
      `Warm meals needed ${when}`,
    ],
    OFFER: [
      "Free rides to medical appointments",
      "Donating gently used clothes",
      "After-school tutoring",
      `Hot meals available ${when}`,
    ],
    VOLUNTEER: [
      `Community cleanup in ${area}`,
      `Pantry restock shift ${when}`,
      "Park beautification day",
    ],
  };
  const descs: Record<EventType, string[]> = {
    REQUEST: [
      "Short on funds; focused on essentials.",
      `Prefer pickup near ${area.split(",")[0] || "you"}.`,
    ],
    OFFER: [
      `Flexible within 5 miles.`,
      `Happy to help neighbors in ${area.split(",")[0] || "the area"}.`,
    ],
    VOLUNTEER: [
      "Supplies provided; all ages welcome.",
      `Helps address urgent needs in ${area.split(",")[0] || "the area"}.`,
    ],
  };
  const out: EventItem[] = [];
  for (let i = 0; i < Math.min(Math.max(limit,1),8); i++) {
    const type: EventType = kinds[Math.floor(Math.random() * kinds.length)];
    const titleList = titles[type];
    const descList = descs[type];
    const hours = Math.floor(Math.random() * 24) - 4; // -4..19
    const date = new Date(Date.now() + hours * 3600 * 1000);
    out.push({
      dateLabel: formatDateLabel(date),
      type,
      title: titleList[Math.floor(Math.random() * titleList.length)],
      organizer: Math.random() < 0.5 ? "Neighborhood Assoc." : "Local Group",
      distanceMiles: Math.round((0.5 + Math.random() * 8) * 10) / 10,
      description: descList[Math.floor(Math.random() * descList.length)],
      interestedCount: type === "VOLUNTEER" ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 10),
    });
  }
  return out;
}


async function aiEvents(apiKey: string, limit = 5, ctx: EventsContext = {}): Promise<EventItem[]> {
  const ai = new GoogleGenAI({ apiKey });
  const count = Math.min(Math.max(limit, 1), 8);

  const prompt = `Respond ONLY with a JSON array of ${count} objects (no prose, no code fences).

Each object:
{
  "title": string,
  "organizer": string,
  "type": "REQUEST" | "OFFER" | "VOLUNTEER",
  "description": string,
  "distanceMiles": number,
  "hoursFromNow": number
}

City: Miami, FL (land locations only; avoid marinas/piers/boats).
Topic: ${ctx.topic || "community support"}
Area: ${ctx.area || "nearby"}
When: ${ctx.when || "this week"}`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = await getGenAIText(resp);
  const arr = parseJsonLoose(text);
  if (!arr) throw new Error("Gemini JSON was not parseable.");

  const now = new Date();
  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

  type AIEvent = {
    title?: string;
    organizer?: string;
    type?: EventType;
    description?: string;
    distanceMiles?: number;
    hoursFromNow?: number;
  };

  return arr.slice(0, count).map((value) => {
    const o = value as AIEvent;
    const t = o?.type;
    const type: EventType = t === "REQUEST" || t === "OFFER" || t === "VOLUNTEER" ? t : "OFFER";
    const hoursRaw = o?.hoursFromNow;
    const hours = typeof hoursRaw === "number" && Number.isFinite(hoursRaw)
      ? Math.round(hoursRaw)
      : 4;
    const date = new Date(now.getTime() + clamp(hours, -4, 120) * 3600 * 1000);
    const distRaw = o?.distanceMiles;
    const dist = typeof distRaw === "number" && Number.isFinite(distRaw)
      ? clamp(distRaw, 0.2, 12)
      : 1.2;

    return {
      dateLabel: formatDateLabel(date),
      type,
      title: String(o?.title || "Community activity"),
      organizer: String(o?.organizer || "Local Group"),
      distanceMiles: dist,
      description: String(o?.description || "Neighborhood effort to support local needs."),
      interestedCount: type === "VOLUNTEER" ? 10 : 4,
    };
  });
}

// --- Component ---
declare global {
  interface Window {
    __NEIGHBORLY_PROMPT__?: string;
  }
}

export default function EventsFeed({ prompt: propPrompt, context }: EventsFeedProps) {
  const prompt = useMemo(() => {
    const winPrompt =
      typeof window !== "undefined" ? (window as Window).__NEIGHBORLY_PROMPT__ : undefined;
    const envPrompt = import.meta?.env?.VITE_EVENTS_PROMPT;
    return propPrompt || winPrompt || envPrompt || "Generate realistic mutual-aid events near Miami.";
  }, [propPrompt]);

  const [items, setItems] = useState<EventItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const limit = Math.min(Math.max((context?.limit ?? 3), 1), 8);

  // Function to refresh events from database
  const refreshEvents = async () => {
    try {
      const dbEvents = await fetchEventsByCategory(context?.topic, 20); // Fetch more from DB
      const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;
      
      let aiEvents: EventItem[] = [];
      try {
        if (apiKey) {
          aiEvents = await aiEvents(apiKey, 3, {
            topic: context?.topic,
            area: context?.area,
            when: context?.when,
          });
        } else {
          aiEvents = localEvents(3, context);
        }
      } catch (aiError) {
        console.log('AI generation failed, using local events:', aiError);
        aiEvents = localEvents(3, context);
      }

      // Combine AI events first, then database events
      const combinedEvents = [...aiEvents, ...dbEvents];
      setItems(combinedEvents);
      setErrorMsg(null);
    } catch (error) {
      console.error('Error refreshing events:', error);
      // Fallback to local events if everything fails
      setItems(localEvents(limit, context));
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setErrorMsg(null);
      
      try {
        // Fetch both AI-generated events and database events
        const [dbEventsResult, aiEventsResult] = await Promise.allSettled([
          fetchEventsByCategory(context?.topic, 20), // Fetch more from database
          (async () => {
            const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;
            if (apiKey) {
              return await aiEvents(apiKey, 3, { // Generate 3 AI events
                topic: context?.topic,
                area: context?.area,
                when: context?.when,
              });
            } else {
              return localEvents(3, context); // Generate 3 local events
            }
          })()
        ]);

        if (!cancelled) {
          const dbEvents = dbEventsResult.status === 'fulfilled' ? dbEventsResult.value : [];
          const generatedEvents = aiEventsResult.status === 'fulfilled' ? aiEventsResult.value : localEvents(3, context);

          // Combine generated events first (top 3), then database events
          const combinedEvents = [...generatedEvents, ...dbEvents];
          setItems(combinedEvents);

          // Set appropriate error message if needed
          if (dbEventsResult.status === 'rejected' && aiEventsResult.status === 'rejected') {
            setErrorMsg("Showing local suggestions (both database and AI failed).");
          } else if (aiEventsResult.status === 'rejected') {
            setErrorMsg("AI generation failed, showing local suggestions + database events.");
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        if (!cancelled) {
          setErrorMsg("Error loading events, showing local suggestions.");
          setItems(localEvents(limit, context));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [prompt, context, limit]);

  const badge = (type: EventType) => {
    if (type === "REQUEST") return { bg: "bg-red-100", text: "text-red-800" };
    if (type === "VOLUNTEER") return { bg: "bg-purple-100", text: "text-purple-800" };
    return { bg: "bg-green-100", text: "text-green-800" };
  };

  return (
    <div className="w-96 flex-shrink-0 overflow-y-auto custom-scrollbar-hidden mt-5 mb-5">
      <Filters />

      {errorMsg && <div className="text-xs text-red-600 mb-2">{errorMsg}</div>}

      <div className="space-y-3">
        {items.map((p, idx) => {
          const b = badge(p.type);
          const isAIGenerated = idx < 3; // First 3 are AI-generated
          
          return (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{p.dateLabel}</span>
                    {isAIGenerated && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                  <span className={`${b.bg} ${b.text} px-2 py-0.5 rounded-full text-xs font-medium`}>
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
        {items.length === 0 && <p className="text-xs text-gray-500">No events generated.</p>}
      </div>
    </div>
  );
}
