import Header from './components/Header'
import Footer from './components/Footer'
import TopNeeds from './components/TopNeeds'
import MapView from './components/MapView'
import EventsFeed from './components/EventsFeed'

function App() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex w-full gap-6 mb-8">
          {/* Welcome Text - Left Side (70%) */}
          <div className="w-[70%]">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, Community Member 👋
            </h1>
            <p className="text-lg text-gray-600">
              Connect, help, and strengthen your community
            </p>
          </div>
          
          {/* Top Needs Section - Right Side (30%) */}
          <TopNeeds />
        </div>



        {/* Main Content - Map Centered with Right Sidebar */}
        <div className="flex gap-6 h-[calc(100vh-200px)]">
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

export default App
