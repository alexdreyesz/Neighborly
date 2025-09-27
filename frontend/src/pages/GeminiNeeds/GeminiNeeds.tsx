import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import MapView from '../../components/MapView'
import EventsFeed from '../../components/EventsFeed'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function GeminiNeeds() {
    const [searchParams] = useSearchParams();
    const [title, setTitle] = useState<string>('');
    const [challenges, setChallenges] = useState<string[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Get data from URL parameters
        const titleParam = searchParams.get('title');
        const challengesParam = searchParams.get('challenges');
        
        if (titleParam) {
            setTitle(titleParam);
        }
        
        if (challengesParam) {
            try {
                const parsedChallenges = JSON.parse(challengesParam);
                setChallenges(parsedChallenges);
            } catch (error) {
                console.error('Error parsing challenges:', error);
                setChallenges([]);
            }
        }
    }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100">
        <Header />

        {/* Gemini Text Reply */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">    
            <div className="bg-white rounded-lg p-6 shadow-lg mb-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{title || 'Community Need Details'}</h1>
                <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Common Challenges:</h2>
                    {challenges.map((challenge: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                            <span className="text-blue-500">•</span>
                            <p className="text-gray-700 capitalize">{challenge}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">    
            {/* Main Content - Map Centered with Right Sidebar */}
            <div className="h-[100vh] bg-white rounded-lg p-6 flex gap-6 shadow-lg">
                {/* Center Map */}
                <MapView />

                {/* Right Sidebar - Events Feed */}
                <EventsFeed />
            </div>
        </div>

        <Footer />
    </div>
  )
}

export default GeminiNeeds