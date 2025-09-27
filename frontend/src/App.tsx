import { BrowserRouter, Routes, Route } from "react-router-dom"
<<<<<<< HEAD
<<<<<<< HEAD
import { Landing, UserProfile, Onboarding, GeminiNeeds } from "./pages"
=======
import { Landing, UserProfile, Onboarding, Login, SignUp } from "./pages"
>>>>>>> origin/main
=======
import { Landing, UserProfile, Onboarding, Login, SignUp, GeminiNeeds } from "./pages"
>>>>>>> 9cf981994ce1958f2bc629ce6b44e88d042b2aeb
import PagesURL from "./router/routes"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={PagesURL.Landing} element={<Landing />} />
        <Route path={PagesURL.Onboarding} element={<Onboarding />} />
        <Route path={PagesURL.UserProfile} element={<UserProfile />} />
<<<<<<< HEAD
<<<<<<< HEAD

        <Route path={PagesURL.GeminiNeeds} element={<GeminiNeeds />} />
=======
        <Route path={PagesURL.Login} element={<Login />} />
        <Route path={PagesURL.SignUp} element={<SignUp />} />
>>>>>>> origin/main
=======
        <Route path={PagesURL.GeminiNeeds} element={<GeminiNeeds />} />
        <Route path={PagesURL.Login} element={<Login />} />
        <Route path={PagesURL.SignUp} element={<SignUp />} />
>>>>>>> 9cf981994ce1958f2bc629ce6b44e88d042b2aeb
      </Routes>
    </BrowserRouter>
  )
}

export default App
