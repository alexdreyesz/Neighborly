import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import { useNavigate } from 'react-router-dom'
import PagesURL from '../../router/routes.tsx'
import { useProfile } from '../../hooks/useProfile'

function UserProfile() {
  const navigate = useNavigate()
  const { profile, loading, error } = useProfile()

  // Get user data from profile or show loading/error states
  const getUserData = () => {
    if (loading) {
      return {
        name: "Loading...",
        phoneNumber: "Loading...",
        avatar: "L",
        isOrganization: false
      }
    }

    if (error) {
      return {
        name: "Error loading profile",
        phoneNumber: "Please try again",
        avatar: "E",
        isOrganization: false
      }
    }

    if (!profile) {
      return {
        name: "No profile found",
        phoneNumber: "Please complete setup",
        avatar: "?",
        isOrganization: false
      }
    }

    // Use organization data if user is an organization, otherwise use profile data
    const userData = profile.isOrganization ? profile.organization : profile.profile
    
    if (!userData) {
      return {
        name: "Profile not found",
        phoneNumber: "Please complete setup",
        avatar: "?",
        isOrganization: false
      }
    }

    // Generate avatar initials from display name
    const getInitials = (name: string | null) => {
      if (!name) return "U"
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }

    return {
      name: userData.display_name || "Anonymous User",
      phoneNumber: userData.phone || "Not provided",
      avatar: getInitials(userData.display_name),
      isOrganization: profile.isOrganization,
      roles: profile.isOrganization ? (userData as any).types : (userData as any).roles,
      skills: userData.skills || [],
      languages: userData.languages || []
    }
  }

  const user = getUserData()

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
                <p className="text-lg text-gray-600">
                  {user.isOrganization ? 'Organization' : 'Community Member'}
                </p>
                <p className="text-lg text-gray-700">📞{user.phoneNumber}</p>
                {user.roles && user.roles.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Role: </span>
                    <span className="text-sm text-gray-700">
                      {user.roles.join(', ')}
                    </span>
                  </div>
                )}
                {user.skills && user.skills.length > 0 && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-500">Skills: </span>
                    <span className="text-sm text-gray-700">
                      {user.skills.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-2xl mx-auto mb-4">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Error Loading Profile</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mx-auto mb-4 animate-pulse">
                ⏳
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Profile...</h2>
              <p className="text-gray-600">Please wait while we fetch your information.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {user.isOrganization ? 'Ready to Help Your Community?' : 'Ready to Make a Difference?'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {user.isOrganization 
                  ? 'As an organization, you can host events, coordinate programs, and facilitate community initiatives.'
                  : 'Join our community of neighbors helping neighbors. Whether you need assistance or want to help others, we\'re here to connect you.'
                }
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
                {user.isOrganization ? 'Host Events' : 'Help Neighbors'}
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
                {user.isOrganization ? 'Manage Programs' : 'Get Help'}
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default UserProfile
