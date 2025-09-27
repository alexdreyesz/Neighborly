

export default function Header() {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">

                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-red-500">Neighborly</h1>
                        </div>
                    </div>
                    
                    {/* Search and Location Section */}
                    <div className="flex items-center space-x-2 flex-1 max-w-md mx-8">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search events"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                            />

                        </div>
                        
                        {/* Location Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Pembroke Pines, FL"
                                className="block w-48 px-3 py-2 border-t border-b border-r border-gray-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                            />
                        </div>
                        
                        {/* Search Button */}
                        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-r-md text-sm font-medium transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Right Navigation */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-1">
                            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-3a5 5 0 00-10 0v3m11 1V9a4 4 0 00-8 0v8a4 4 0 008 0z" />

                            </svg>
                            <span className="text-sm text-gray-600">English</span>
                        </div>
                        
                        <a href="#login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                            Log in
                        </a>
                        
                        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Sign up
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}