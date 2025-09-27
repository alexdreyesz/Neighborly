import Logo from '../../src/assets/icons/logo.png';

export default function Navbar() {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            {/* Navbar Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center justify-center">
                        {/* Logo Image */}
                        <div className="flex-shrink-0 relative right-3">
                            <img src={Logo} alt="QtrackeR Logo" className="h-12 w-12" />
                        </div>
                        
                        {/* Logo Text */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-indigo-600">Neighborly</h1>
                        </div>
                    </div>
                    
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="#features" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</a>
                            <a href="#pricing" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Get Started</button>
                        </div>
                    </div>
                    
                    <div className="md:hidden">
                        <button className="text-gray-700 hover:text-indigo-600">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>  
    );
}