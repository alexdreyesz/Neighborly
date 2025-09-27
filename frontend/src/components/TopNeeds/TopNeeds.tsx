import topNeedsData from "./TopNeeds";

export default function TopNeeds() {
  return (
    <div className="h-[90vh] w-full">
      <div className="bg-white rounded-lg p-6 shadow-lg text-white flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold primary-text relative left-120">Top Community Needs</h2>
          <span className="primary-bg text-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
            Updated 2 min ago
          </span>
        </div>

        <div className="h-[550px] flex flex-row flex-wrap gap-10 pt-4 justify-center items-center overflow-auto scrollbar-hidden custom-scrollbar-hidden">
          {topNeedsData.map((need, idx) => (
            <div key={idx} className="w-[40vh] h-[40vh] primary-bg bg-opacity-20 rounded-lg p-3 flex justify-center items-center">
              <div className="flex flex-col items-center relative top-5">
                <span className="font-semibold text-sm text-black mb-5">{need.title}</span>
                <span className="text-lg mr-2">{need.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
