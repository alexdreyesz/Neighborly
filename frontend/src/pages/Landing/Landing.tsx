import { Link } from 'react-router-dom'
import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import TopNeeds from '../../components/TopNeeds/TopNeeds.tsx'
import MapView from '../../components/MapView'
import EventsFeed from '../../components/EventsFeed'
import PagesURL from '../../router/routes'

import communityArt from '../../assets/art/community.png'

function Landing() {

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">    
            
            {/* Main Hero Section */}
            <div className="h-[85vh] w-viewport flex justify-center items-center relative bottom-5">
                <div className="flex items-center justify-between space-x-15 px-8 py-12 relative left-10">
                    {/* Left Content */}
                    <div className="flex-1 max-w-xl">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            The neighbor network—where offers meet needs and help becomes action
                        </h1>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Need help or ready to help? Post, claim, and coordinate around the specific challenges in your area, from pantry shortages to school supplies and safe rides. With real-time Top Needs, every effort hits where it counts.
                        </p>

                        <div className="flex justify-around relative right-6">
                            <Link 
                                to={PagesURL.SignUp}
                                className="text-black hover:bg-gray-200 px-6 py-3 rounded-md text-lg font-medium transition-colors cursor-pointer"
                            >
                                Ready to Help?
                            </Link>

                            <Link 
                                to={PagesURL.SignUp}
                                className="primary-bg text-white px-6 py-3 rounded-md text-lg font-medium transition-colors cursor-pointer"
                            >
                                Need Help?
                            </Link>
                        </div>
                    </div>
                    
                    {/* Right Illustration */}
                    <div className="flex-1 flex justify-center items-center">
                        <img src={communityArt} className="h-80 w-100"/>
                    </div>
                </div>
            </div>
        
            {/* Top Needs Section */}
            <TopNeeds />

            <br/> <br/><br/><br/><br/><br/><br/>

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

export default Landing
