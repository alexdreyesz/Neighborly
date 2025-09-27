import { Link } from 'react-router-dom'
import PagesURL from '../router/routes'
import { useState } from 'react'

import logo from '../assets/icons/logo.png'
import logoText from '../assets/icons/logo-text-black.png'

export default function Header() {
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState('English')

    const languages = [
        { code: 'en', name: 'English', selected: true },
        { code: 'fr', name: 'Français', selected: false },
        { code: 'tr', name: 'Türkçe', selected: false },
        { code: 'en-au', name: 'English (Australia)', selected: false },
        { code: 'it', name: 'Italiano', selected: false },
        { code: 'th', name: 'ไทย', selected: false },
        { code: 'de', name: 'Deutsch', selected: false },
        { code: 'nl', name: 'Nederlands', selected: false },
        { code: 'ja', name: '日本語', selected: false },
        { code: 'es', name: 'Español', selected: false },
        { code: 'pl', name: 'Polski', selected: false },
        { code: 'ko', name: '한국어', selected: false },
        { code: 'es-es', name: 'Español (España)', selected: false },
        { code: 'pt', name: 'Português', selected: false },
        { code: 'ru', name: 'Русский', selected: false }
    ]

    interface Language {
        code: string;
        name: string;
        selected: boolean;
    }

    const handleLanguageSelect = (language: Language) => {
        setSelectedLanguage(language.name)
        setIsLanguageModalOpen(false)
    }
    
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center relative bottom-0.5">
                        <img src={logo} className="h-10 w-10 pr-1 pt-1"/>
                        
                        <Link to={PagesURL.Landing}>
                            <img src={logoText} className="h-35 w-35 pt-3 cursor-pointer"/>
                        </Link>
                        {/*
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold primary-text">
                                Neighborly
                            </h1>
                        </div>
                        */}
                    </div>
                    
                    {/* Search and Location Section */}
                    <div className="flex items-center flex-1 max-w-md mx-8 relative right-18">
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
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-800 focus:border-green-800 text-sm"
                            />
                        </div>
                        
                        {/* Location Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Miami, FL"
                                className="block w-48 px-3 py-2 border-t border-b border-r border-gray-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-800 focus:border-green-500 text-sm"
                            />
                        </div>
                        
                        {/* Search Button */}
                        <button className="primary-bg text-white px-6 py-[8.5px] rounded-r-md text-sm font-medium transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                    
                     {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsLanguageModalOpen(true)}
                            className="flex items-center space-x-2 px-2 py-1 rounded transition-colors"
                        >
                            <span className="material-symbols-outlined">language</span>
                            <span className="font-medium text-black">{selectedLanguage}</span>
                        </button>
                        
                        <Link to={PagesURL.Login}>
                            <button className=" text-black hover:bg-gray-200 px-6 py-2 rounded-lg text-sm font-medium">
                                Log In
                            </button>
                        </Link>

                        <Link to={PagesURL.SignUp}>
                            <button className="primary-bg text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Sign Up
                            </button>
                        </Link>
                    </div>

                    {/* Language Selection Modal */}
                    {isLanguageModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-96 overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Change your language</h2>
                                    <button 
                                        onClick={() => setIsLanguageModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {languages.map((language) => (
                                        <label key={language.code} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="language"
                                                value={language.code}
                                                checked={selectedLanguage === language.name}
                                                onChange={() => handleLanguageSelect(language)}
                                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{language.name}</span>
                                        </label>
                                    ))}
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                    <button 
                                        onClick={() => setIsLanguageModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

              
                                    <button 
                                        onClick={() => setIsLanguageModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                                        >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}