import topNeedsData from "./TopNeeds";
import PagesURL from "../../router/routes";
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function TopNeeds() {
  const { user } = useAuth()

  return (
    <div className={`w-full ${user ? 'h-auto' : 'h-[90vh]'}`}>
      <div className="bg-white rounded-lg p-6 shadow-lg text-white flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold primary-text relative left-120">Top Community Needs</h2>
          <span className="primary-bg text-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
            Updated 7 days ago
          </span>
        </div>


        {user ? (
          // Single card carousel for logged in users
          <div className="flex justify-center items-center py-4">
            <div className="flex gap-4 overflow-x-auto pb-4 max-w-full">
              {topNeedsData.slice(0, 5).map((need, idx) => (
                <Link 
                  key={idx} 
                  to={`${PagesURL.GeminiNeeds}?title=${encodeURIComponent(need.title)}&challenges=${encodeURIComponent(JSON.stringify(need.challenges))}`}
                  className="flex-shrink-0"
                >
                  <div className="w-48 h-32 primary-bg bg-opacity-20 rounded-lg p-3 flex justify-center items-center hover:scale-105 transition-transform duration-200 cursor-pointer">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-sm text-black mb-2">{need.title}</span>
                      <span className="text-lg">{need.emoji}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // Full grid for non-logged in users
          <div className="h-[550px] flex flex-row flex-wrap gap-10 pt-4 justify-center items-center overflow-auto scrollbar-hidden custom-scrollbar-hidden">
            {topNeedsData.map((need, idx) => (
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
        )}
      </div>
    </div>
  );
}
