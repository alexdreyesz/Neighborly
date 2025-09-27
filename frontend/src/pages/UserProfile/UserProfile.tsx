import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import { useState } from 'react'

function UserProfile() {
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
          <div className="bg-gradient-to-r from-green-500 to-blue-600 h-32 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20"></div>
          </div>
          
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end -mt-16 mb-6">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.avatar}
                </div>
              </div>
              <div className="ml-6 pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-lg text-gray-600">Community Member</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white mr-3">
                👤
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-6 h-6 text-gray-400 mr-4 mt-1">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 text-gray-400 mr-4 mt-1">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Gender</p>
                  <p className="text-lg text-gray-900">{user.gender}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 text-gray-400 mr-4 mt-1">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Condition/Status</p>
                  <p className="text-lg text-gray-900">{user.condition}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
                📞
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-6 h-6 text-gray-400 mr-4 mt-1">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Address</p>
                  <p className="text-lg text-gray-900">{user.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 text-gray-400 mr-4 mt-1">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                  <p className="text-lg text-gray-900">{user.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 text-gray-400 mr-4 mt-1">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Make a <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Difference</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our community of neighbors helping neighbors. Whether you need assistance or want to help others, we're here to connect you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <span className="flex items-center justify-center">
                <svg className="mr-3 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Help Neighbors
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>

            <button className="group border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
              <span className="flex items-center justify-center">
                <svg className="mr-3 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Get Help
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Times Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Times Received Help</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4.9★</div>
              <div className="text-sm text-gray-600">Community Rating</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default UserProfile
