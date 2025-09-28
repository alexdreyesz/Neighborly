import topNeedsHelpingData from "./TopNeedsHelpingData";
import PagesURL from "../../router/routes";
import { Link } from 'react-router-dom'

export default function TopNeedsHelping() {
  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return (
    <div className="h-[90vh] w-full">
      <div className="bg-white rounded-lg p-6 shadow-lg text-white flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold primary-text relative left-120">Top Community Needs</h2>
          <span className="primary-bg text-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
            Updated 7 days ago
          </span>
        </div>

        <div className="h-[550px] flex flex-row flex-wrap gap-10 pt-4 justify-center items-center overflow-auto scrollbar-hidden custom-scrollbar-hidden">
          {shuffleArray(topNeedsHelpingData).slice(0, 10).map((need, idx) => (
            <Link 
              key={idx} 
              to={`${PagesURL.GeminiNeeds}?title=${encodeURIComponent(need.title)}&challenges=${encodeURIComponent(JSON.stringify(need.challenges))}`}
            >
              <div className="w-[40vh] h-[40vh] relative rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer">
                <img
                  src={need.image}
                  alt={need.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center">
                  <span className="font-bold text-white text-lg text-center px-2">{need.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
