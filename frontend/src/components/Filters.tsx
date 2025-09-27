export default function Filters() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Nearby Events</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Reset
          </button>
        </div>
        
        <div className="space-y-2">
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Types</option>
            <option>Offers</option>
            <option>Requests</option>
            <option>Volunteer Events</option>
          </select>
          
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Any Distance</option>
            <option>Within 1 mile</option>
            <option>Within 5 miles</option>
            <option>Within 10 miles</option>
          </select>
          
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Categories</option>
            <option>Food</option>
            <option>Housing</option>
            <option>Transportation</option>
            <option>Education</option>
            <option>Healthcare</option>
          </select>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Urgent Only</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" />
              <div className="w-10 h-6 bg-blue-500 rounded-full shadow-inner"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
