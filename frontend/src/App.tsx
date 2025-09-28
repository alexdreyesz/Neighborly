import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Landing, UserProfile, Onboarding, Login, SignUp, GeminiNeeds, GetHelp, HelpCommunity } from "./pages"
import PagesURL from "./router/routes"
import { AuthProvider } from "./contexts/AuthContext"

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={PagesURL.Landing} element={<Landing />} />
          <Route path={PagesURL.Onboarding} element={<Onboarding />} />
          <Route path={PagesURL.UserProfile} element={<UserProfile />} />
          <Route path={PagesURL.GeminiNeeds} element={<GeminiNeeds />} />
          <Route path={PagesURL.Login} element={<Login />} />
          <Route path={PagesURL.SignUp} element={<SignUp />} />
          <Route path={PagesURL.GetHelp} element={<GetHelp />} />
          <Route path={PagesURL.HelpCommunity} element={<HelpCommunity />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
