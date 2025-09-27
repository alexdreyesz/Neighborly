import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Landing, UserProfile, Onboarding, Login, SignUp, GeminiNeeds } from "./pages"
import PagesURL from "./router/routes"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={PagesURL.Landing} element={<Landing />} />
        <Route path={PagesURL.Onboarding} element={<Onboarding />} />
        <Route path={PagesURL.UserProfile} element={<UserProfile />} />
        <Route path={PagesURL.GeminiNeeds} element={<GeminiNeeds />} />
        <Route path={PagesURL.Login} element={<Login />} />
        <Route path={PagesURL.SignUp} element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
