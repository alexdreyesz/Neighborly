import { useEffect, useMemo, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import Filters from "./Filters"; // assumes you have this
import supabase from "../config/supabaseClient";
import { useProfile } from "../hooks/useProfile";

// --- API Function for Creating Events ---
async function createEvent(eventData: {
  title: string;
  details?: string;
  starts_at?: string;
  category?: string;
}) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    // Prepare event data for database
    const eventPayload = {
      title: eventData.title,
      details: eventData.details || null,
      starts_at: eventData.starts_at ? new Date(eventData.starts_at).toISOString() : null,
      org_id: user.id, // Link to the user who created the event
      category: eventData.category || null,
      // Note: display_location was removed from the form, so we don't include it
    };

    // Insert event into database
    const { data, error } = await supabase
      .from('events')
      .insert([eventPayload])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    console.log('Event created successfully:', data);
    return data;

  } catch (err) {
    console.error('Error creating event:', err);
    throw err;
  }
}

// --- API Function for Fetching Events by Category ---
async function fetchEventsByCategory(category?: string, limit = 3): Promise<EventItem[]> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: false })
      .limit(limit);

    // Filter by category if provided
    if (category && category.trim() !== '') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    // Transform database events to EventItem format
    const events: EventItem[] = (data || []).map((event: any) => {
      // Determine event type based on category or use a default
      let type: EventType = "OFFER"; // Default type
      
      // You can customize this logic based on your business rules
      if (event.category?.includes("REQUEST") || event.title?.toLowerCase().includes("need")) {
        type = "REQUEST";
      } else if (event.category?.includes("VOLUNTEER") || event.title?.toLowerCase().includes("volunteer")) {
        type = "VOLUNTEER";
      }

      // Calculate distance (you might want to implement real distance calculation)
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

// --- NewEvent Component ---
function NewEvent({ onEventCreated }: { onEventCreated?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { profile, loading: profileLoading } = useProfile();
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    starts_at: '',
    category: ''
  });

  const handleNewEvent = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', details: '', starts_at: '', category: '' });
    setSubmitMessage('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!profile) {
      setSubmitMessage('Please log in to create an event');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await createEvent(formData);
      setSubmitMessage('Event created successfully!');
      
      // Refresh the events feed
      if (onEventCreated) {
        onEventCreated();
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating event:', error);
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <button
        onClick={handleNewEvent}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-4 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
        Create New Event
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Event title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  <option value="Addiction Recovery">Addiction Recovery 🌱</option>
                  <option value="Childcare & Caregiving">Childcare & Caregiving 👶</option>
                  <option value="Civic & Participation">Civic & Participation 🗺️</option>
                  <option value="Community & Social Connection">Community & Social Connection 🤝</option>
                  <option value="Digital Access">Digital Access 💻</option>
                  <option value="Disaster & Climate">Disaster & Climate 🌪️</option>
                  <option value="Education & Tutoring">Education & Tutoring 📚</option>
                  <option value="Environment & Neighborhood">Environment & Neighborhood 🌳</option>
                  <option value="Faith & Cultural">Faith & Cultural ⛪</option>
                  <option value="Financial Assistance">Financial Assistance 💰</option>
                  <option value="Food & Essentials">Food & Essentials 🍎</option>
                  <option value="Health & Mental Health">Health & Mental Health 🏥</option>
                  <option value="Homelessness Services">Homelessness Services 🏠</option>
                  <option value="Household & Personal Goods">Household & Personal Goods 🏘️</option>
                  <option value="Income & Employment">Income & Employment 💼</option>
                  <option value="Legal & Immigration">Legal & Immigration ⚖️</option>
                  <option value="Mobility & Accessibility">Mobility & Accessibility ♿</option>
                  <option value="Pets & Animal Care">Pets & Animal Care 🐶</option>
                  <option value="Public Benefits & Navigation">Public Benefits & Navigation 📄</option>
                  <option value="Refugees & Newcomers">Refugees & Newcomers 🌍</option>
                  <option value="Reentry & Justice-Impacted">Reentry & Justice-Impacted 🎅</option>
                  <option value="Safety & Crisis">Safety & Crisis 🚨</option>
                  <option value="Seniors">Seniors 👴</option>
                  <option value="Shelter & Housing">Shelter & Housing 🏠</option>
                  <option value="Transportation">Transportation 🚗</option>
                  <option value="Veterans">Veterans 🇺🇸</option>
                  <option value="Youth & Families">Youth & Families 👨‍👩‍👧‍👦</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  placeholder="Event description, notes, or additional information"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => handleInputChange('starts_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {/* Submit Message */}
              {submitMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || profileLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
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

function parseJsonLoose(text: string): any[] | null {
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

async function getGenAIText(resp: any): Promise<string> {
  const r1 = resp?.response?.text;
  if (typeof r1 === "function") {
    const v = r1.call(resp.response);
    return typeof v?.then === "function" ? await v : String(v ?? "");
  }
  const r2 = resp?.text;
  if (typeof r2 === "function") {
    const v = r2.call(resp);
    return typeof v?.then === "function" ? await v : String(v ?? "");
  }
  const parts = resp?.response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("");
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

  return arr.slice(0, count).map((o: any) => {
    const t = o?.type;
    const type: EventType = t === "REQUEST" || t === "OFFER" || t === "VOLUNTEER" ? t : "OFFER";
    const hours = Number.isFinite(+o?.hoursFromNow) ? Math.round(+o.hoursFromNow) : 4;
    const date = new Date(now.getTime() + clamp(hours, -4, 120) * 3600 * 1000);
    const dist = Number.isFinite(+o?.distanceMiles) ? clamp(+o.distanceMiles, 0.2, 12) : 1.2;

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
      const dbEvents = await fetchEventsByCategory(context?.topic, limit);
      setItems(dbEvents);
      setErrorMsg(null);
    } catch (error) {
      console.error('Error refreshing events:', error);
      // Keep existing items if refresh fails
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setErrorMsg(null);
      
      try {
        // First, try to fetch events from database
        const dbEvents = await fetchEventsByCategory(context?.topic, limit);
        
        if (!cancelled && dbEvents.length > 0) {
          setItems(dbEvents);
          return;
        }

        // If no database events, fall back to AI or local events
        const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;
        if (apiKey) {
          const ai = await aiEvents(apiKey, limit, {
            topic: context?.topic,
            area: context?.area,
            when: context?.when,
          });
          if (!cancelled) setItems(ai);
        } else {
          if (!cancelled) setItems(localEvents(limit, context));
        }
      } catch (dbError) {
        console.log('Database fetch failed, falling back to AI/local events:', dbError);
        
        // Fall back to AI or local events if database fails
        const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;
        try {
          if (apiKey) {
            const ai = await aiEvents(apiKey, limit, {
              topic: context?.topic,
              area: context?.area,
              when: context?.when,
            });
            if (!cancelled) setItems(ai);
          } else {
            if (!cancelled) setItems(localEvents(limit, context));
          }
        } catch {
          if (!cancelled) {
            setErrorMsg("Showing local suggestions (AI output wasn't clean JSON).");
            setItems(localEvents(limit, context));
          }
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
      <NewEvent onEventCreated={refreshEvents} />
      {errorMsg && <div className="text-xs text-red-600 mb-2">{errorMsg}</div>}

      <div className="space-y-3">
        {items.map((p, idx) => {
          const b = badge(p.type);
          return (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{p.dateLabel}</span>
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
