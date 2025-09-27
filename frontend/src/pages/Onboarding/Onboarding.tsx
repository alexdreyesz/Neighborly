import Header from '../../components/Header.tsx'
import Footer from '../../components/Footer.tsx'

function Onboarding() {

  return (
    <div className="h-screen w-screen flex flex-col overflow-auto">
      <Header />

      <div className="h-600 bg-amber-200 flex flex-col justify-center items-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Welcome to Neighborly!</h1>
        <p className="text-lg text-white">Your friendly neighborhood app.</p>
      </div>

      <Footer />
    </div>
  )
}

export default Onboarding
