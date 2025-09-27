export default function TopNeeds() {
  return (
    <div className="w-[30%]">
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🔥 Top Community Needs</h2>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
            Updated 2 min ago
          </span>
        </div>
        <div className="space-y-3">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">🍎</span>
              <span className="font-semibold text-sm text-black">Food Assistance</span>
            </div>
            <p className="text-xs opacity-90">23 urgent requests within 5 miles</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">🏠</span>
              <span className="font-semibold text-sm text-black">Housing Support</span>
            </div>
            <p className="text-xs opacity-90">8 families need temporary shelter</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <span className="text-lg mr-2">🚗</span>
              <span className="font-semibold text-sm text-black">Transportation</span>
            </div>
            <p className="text-xs opacity-90">15 rides needed this week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
