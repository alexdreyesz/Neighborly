import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PagesURL from '../../router/routes.tsx'

function UserProfile() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  // Mock user data - in real app, this would come from your auth/user context
  const [user] = useState({
    name: "Sarah Martinez",
    gender: "Female",
    address: "1234 Oak Street, Pembroke Pines, FL 33026",
    condition: "Single Parent", // or could be "Senior", "Student", "Caregiver", etc.
    phoneNumber: "(754) 555-0123",
    email: "sarah.martinez@email.com",
    avatar: "SM" // initials for avatar
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end  mb-2">
              <div className="bg-white rounded-full mt-7 p-2 shadow-lg">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{backgroundColor: '#19513b'}}>
                  {user.avatar}
                </div>
              </div>
              <div className="ml-6 pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-lg text-gray-600">{t('userProfile.communityMember')}</p>
                <p className="text-lg text-gray-700">📞{user.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('userProfile.readyToMakeDifference')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('userProfile.joinCommunity')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate(PagesURL.Landing)}
              className="group text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl" 
              style={{backgroundColor: '#19513b'}}
            >
              <span className="flex items-center justify-center">
                <svg className="mr-3 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
{t('userProfile.helpNeighbors')}
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>

            <button 
              onClick={() => navigate(PagesURL.Landing)}
              className="group border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center">
                <svg className="mr-3 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
{t('userProfile.getHelp')}
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default UserProfile
