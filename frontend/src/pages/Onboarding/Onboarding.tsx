import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'
import supabase from '../../config/supabaseClient.ts'
import PagesURL from '../../router/routes'

interface OnboardingData {
  // Step 1: Account Creation
  email: string
  password: string
  confirmPassword: string
  
  // Step 2: Personal Information
  name: string
  skills: string
  languages: string
  
  // Step 3: Contact Information
  phoneNumber: string
}

function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState<OnboardingData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    skills: '',
    languages: '',
    phoneNumber: ''
  })

  const totalSteps = 4

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setMessage('')
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate account creation
      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters')
        return
      }
      
      setLoading(true)
      setMessage('')
      
      try {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          setMessage(error.message)
          setLoading(false)
          return
        } else {
          setMessage('Account created! Please check your email for confirmation.')
          setCurrentStep(2)
        }
      } catch (error) {
        setMessage('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    } else if (currentStep === 2) {
      // Validate personal information
      if (!formData.name || !formData.skills || !formData.languages) {
        setMessage('Please fill in all personal information fields')
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Validate contact information
      if (!formData.phoneNumber) {
        setMessage('Please fill in your phone number')
        return
      }
      // Save profile data to database
      await createProfile()
      setCurrentStep(4)
    } else if (currentStep === 4) {
      // Complete onboarding
      navigate(PagesURL.UserProfile)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setMessage('')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-lg text-gray-600">Let's start by setting up your account credentials</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h2>
              <p className="text-lg text-gray-600">Help us understand your situation to better connect you with your community</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Abilities
                </label>
                <select
                  id="skills"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                >
                  <option value="">Select your primary skill</option>
                  <option value="tutoring">Tutoring</option>
                  <option value="driving">Driving</option>
                  <option value="cooking">Cooking</option>
                  <option value="childcare">Childcare</option>
                  <option value="elder_care">Elder Care</option>
                  <option value="medical">Medical</option>
                  <option value="counseling">Counseling</option>
                  <option value="translation">Translation</option>
                  <option value="tech_support">Tech Support</option>
                  <option value="home_repair">Home Repair</option>
                  <option value="job_coaching">Job Coaching</option>
                  <option value="financial_planning">Financial Planning</option>
                  <option value="legal_aid">Legal Aid</option>
                  <option value="pet_sitting">Pet Sitting</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <select
                  id="languages"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                >
                  <option value="">Select your primary language</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Chinese (Mandarin)">Chinese (Mandarin)</option>
                  <option value="Chinese (Cantonese)">Chinese (Cantonese)</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Russian">Russian</option>
                  <option value="Dutch">Dutch</option>
                  <option value="Swedish">Swedish</option>
                  <option value="Norwegian">Norwegian</option>
                  <option value="Danish">Danish</option>
                  <option value="Finnish">Finnish</option>
                  <option value="Polish">Polish</option>
                  <option value="Czech">Czech</option>
                  <option value="Hungarian">Hungarian</option>
                  <option value="Romanian">Romanian</option>
                  <option value="Bulgarian">Bulgarian</option>
                  <option value="Croatian">Croatian</option>
                  <option value="Serbian">Serbian</option>
                  <option value="Greek">Greek</option>
                  <option value="Turkish">Turkish</option>
                  <option value="Hebrew">Hebrew</option>
                  <option value="Thai">Thai</option>
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="Indonesian">Indonesian</option>
                  <option value="Malay">Malay</option>
                  <option value="Tagalog">Tagalog</option>
                  <option value="Swahili">Swahili</option>
                  <option value="Amharic">Amharic</option>
                  <option value="Yoruba">Yoruba</option>
                  <option value="Igbo">Igbo</option>
                  <option value="Hausa">Hausa</option>
                  <option value="Zulu">Zulu</option>
                  <option value="Afrikaans">Afrikaans</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-lg text-gray-600">Help us connect you with your community</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
              ✓
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Neighborly!</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your profile is complete! You're now ready to connect with your community. 
                Whether you need help or want to help others, we're here to make it happen.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Explore Your Community</h4>
                    <p className="text-sm text-gray-600">See what's happening in your neighborhood</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Post or Respond</h4>
                    <p className="text-sm text-gray-600">Share needs or offer help to neighbors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  
  const createProfile = async () => {
    const { data, error } = await supabase.from('profiles').update({
      email: formData.email,
      display_name: formData.name,
      skills: formData.skills,
      languages: formData.languages,
  }).eq('email', formData.email)
  if (error) console.error("Error updating profile:", error);
    else console.log("Profile updated:", data);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {renderStepContent()}
          
          {/* Message Display */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              message.includes('successful') || message.includes('created') || message.includes('Check your email') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={handleNext}
                  disabled={loading}
                  className="px-8 py-3 primary-bg text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Creating Account...' : currentStep === 3 ? 'Complete Setup' : 'Next'}
                </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center mt-8">
              <button
                onClick={handleNext}
                className="px-8 py-3 primary-bg text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Go to Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Onboarding
