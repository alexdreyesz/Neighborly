import topNeedsData from "./TopNeeds";
import PagesURL from "../../router/routes";
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function TopNeedsAid() {
  const { user } = useAuth()

  return (
    <div className="h-full w-full">
      <div className="h-full w-full bg-white rounded-lg p-6 shadow-lg text-white flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold primary-text relative left-110">Get Help Around Your Community</h2>
        </div>

        <div className="h-full w-full flex flex-row flex-wrap gap-10 pt-4 justify-center items-center">
          {topNeedsData.map((need, idx) => (
            <Link 
              key={idx} 
              to={`${PagesURL.GeminiNeedsHelp}?title=${encodeURIComponent(need.title)}&challenges=${encodeURIComponent(JSON.stringify(need.challenges))}`}
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
