import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import TopNeeds from '../../components/TopNeedsHelping/TopNeedsHelping.tsx'
import MapView from '../../components/MapView'
import EventsFeedHelping from '../../components/EventsFeedHelping.tsx'

import { useEffect } from 'react'

function HelpCommunity() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ ]);


  return (
    <div className="min-h-screen bg-gray-100">
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">    
            
            {/* Top Needs Section */}
            <TopNeeds />

            {/* Main Content - Map Centered with Right Sidebar */}
            <div className="h-[100vh] bg-white rounded-lg p-6 flex gap-6 shadow-lg pt-35">
                {/* Center Map */}
                <MapView />

                {/* Right Sidebar - Events Feed */}
                <EventsFeedHelping prompt="" context={{}} />
            </div>
        </div>

        <Footer />
    </div>
  )
}

export default HelpCommunity
