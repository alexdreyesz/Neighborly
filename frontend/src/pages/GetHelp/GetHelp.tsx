import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import TopNeedsAid from '../../components/TopNeedsAid/TopNeedsAid.tsx';

import { useEffect } from 'react'

function Landing() {

    useEffect(() => {
    window.scrollTo(0, 0);
    }, [ ]);

  return (
    <div className="min-h-screen bg-gray-100">
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">    
            
        <TopNeedsAid/>
        
        </div>

        <Footer />
    </div>
  )
}

export default Landing
