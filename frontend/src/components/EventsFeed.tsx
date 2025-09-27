import Filters from './Filters'

export default function EventsFeed() {
  return (
    <div className="w-96 flex-shrink-0 overflow-y-auto">
      <Filters />
      
      {/* Feed Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Events</h2>
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          + Create
        </button>
      </div>

      {/* Post Cards */}
      <div className="space-y-3">
        {/* Post 1 - Request */}
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🍎</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">TODAY • 2:30 PM</span>
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  URGENT
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                Need groceries for family of 4
              </h3>
              <p className="text-gray-600 text-xs mb-2">
                Sarah M. • 0.8 miles away
              </p>
              <p className="text-gray-700 text-xs mb-2 line-clamp-2">
                Lost job last week and need help with basic groceries...
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">3 interested</span>
                <div className="flex space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-sm">📤</span>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-sm">🔖</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post 2 - Offer */}
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🚗</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">TODAY • 1:15 PM</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  OFFER
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                Free rides to medical appointments
              </h3>
              <p className="text-gray-600 text-xs mb-2">
                Mike R. • 2.1 miles away
              </p>
              <p className="text-gray-700 text-xs mb-2 line-clamp-2">
                Available weekday mornings for medical appointments...
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">7 interested</span>
                <div className="flex space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-sm">📤</span>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-sm">🔖</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post 3 - Volunteer Event */}
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👥</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">SAT, SEP 28 • 9:00 AM</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  VOLUNTEER
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                Community Garden Cleanup
              </h3>
              <p className="text-gray-600 text-xs mb-2">
                Miami Community Center • 1.5 miles away
              </p>
              <p className="text-gray-700 text-xs mb-2 line-clamp-2">
                Help us clean up and prepare the community garden...
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">12 volunteers needed</span>
                <div className="flex space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-sm">📤</span>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-sm">🔖</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
