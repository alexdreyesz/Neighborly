import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Landing, UserProfile, Onboarding  } from "./pages"
import PagesURL from "./router/routes"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={PagesURL.Landing} element={<Landing />} />
        <Route path={PagesURL.Onboarding} element={<Onboarding />} />
        <Route path={PagesURL.UserProfile} element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
