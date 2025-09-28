import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import communityArt from '../../assets/art/community.png'

function Landing() {

  return (
    <div className="min-h-screen bg-gray-100">
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
                    </div>
                    
                    {/* Right Illustration */}
                    <div className="flex-1 flex justify-center items-center">
                        <img src={communityArt} className="h-90 w-110"/>
                    </div>
                </div>
            </div>
        
        </div>

        <Footer />
    </div>
  )
}

export default Landing
