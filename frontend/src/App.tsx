import { BrowserRouter, Routes, Route } from "react-router-dom"
<<<<<<< HEAD
import { Landing, UserProfile, Onboarding, GeminiNeeds } from "./pages"
=======
import { Landing, UserProfile, Onboarding, Login, SignUp } from "./pages"
>>>>>>> origin/main
import PagesURL from "./router/routes"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={PagesURL.Landing} element={<Landing />} />
        <Route path={PagesURL.Onboarding} element={<Onboarding />} />
        <Route path={PagesURL.UserProfile} element={<UserProfile />} />
<<<<<<< HEAD

        <Route path={PagesURL.GeminiNeeds} element={<GeminiNeeds />} />
=======
        <Route path={PagesURL.Login} element={<Login />} />
        <Route path={PagesURL.SignUp} element={<SignUp />} />
>>>>>>> origin/main
      </Routes>
    </BrowserRouter>
  )
}

export default App
