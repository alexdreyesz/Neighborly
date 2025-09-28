import Header from '../../components/Header.tsx';
import Footer from '../../components/Footer.tsx';
import MapView from '../../components/MapView';
import EventsFeed from '../../components/EventsFeed';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

function buildPrompt(title: string, challenges: string[]) {
  const bullets = (challenges || [])
    .filter(Boolean)
    .map(c => `- ${c}`)
    .join('\n') || '- None provided';

  return `
You are a concise, community-friendly writing assistant for a mutual-aid app called Neighborly.

Task: Using the provided title and challenges, explain what this issue is and what can be done to help. Keep it actionable and empathetic.

Title: ${title || 'Community Need'}
Challenges:
${bullets}

Please return:
1) A brief explanation (2–3 sentences).
2) Key challenges (bullets).
3) 3–5 concrete, safe ways a neighbor can help locally (bullets).

Please do not add the 1,2,3 labels in your response; just provide the content as plain text.
`.trim();
}

function GeminiNeeds() {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState<string>('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [aiText, setAiText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Read URL params
  useEffect(() => {
    window.scrollTo(0, 0);

    const titleParam = searchParams.get('title');
    const challengesParam = searchParams.get('challenges');

    if (titleParam) setTitle(titleParam);

    if (challengesParam) {
      try {
        const parsed = JSON.parse(challengesParam);
        setChallenges(Array.isArray(parsed) ? parsed.map(String) : []);
      } catch (error) {
        console.error('Error parsing challenges:', error);
        setChallenges([]);
      }
    }
  }, [searchParams]);

  const prompt = useMemo(() => buildPrompt(title, challenges), [title, challenges]);

  // Call Gemini directly from the browser (demo only)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        setErrorMsg('Missing VITE_GEMINI_API_KEY in your .env (client-side).');
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');
        setAiText('');

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          // config is optional for text-only; including to be explicit:
          config: { responseModalities: ['TEXT'] as const },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const text = (response as any).text ?? '';
        if (!cancelled) setAiText(text);
      } catch (err: any) {
        // If you see "Failed to fetch", it's usually CORS or network issues.
        if (!cancelled) setErrorMsg(err?.message || 'Request failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [prompt]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Gemini Text Reply */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {title || 'Community Need Details'}
          </h1>

          <div className="space-y-3 w-full max-w-3xl">
            <div className=" w-full">
              {loading && <p className="text-gray-500">Generating…</p>}
              {errorMsg && <p className="text-red-600">Error: {errorMsg}</p>}
              {!loading && !errorMsg && (
                <div className="prose max-w-none">
                  <p className="text-gray-800 whitespace-pre-line">{aiText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[100vh] bg-white rounded-lg p-6 flex gap-6 shadow-lg">
          <MapView />
          <EventsFeed />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default GeminiNeeds;