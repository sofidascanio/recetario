import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import MainLayout from './components/layout/MainLayout.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import LoginPage from './pages/Auth/LoginPage.jsx'
import RegisterPage from './pages/Auth/RegisterPage.jsx'
import RecipeDetailPage from './pages/Recipe/RecipeDetailPage.jsx'
import CreateRecipePage from './pages/Recipe/CreateRecipePage.jsx'
import EditRecipePage from './pages/Recipe/EditRecipePage.jsx' 
import EditProfilePage from './pages/Profile/EditProfilePage.jsx' 
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import FridgePage from './pages/Fridge/FridgePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import RecommendationsPage from './pages/Recommendations/RecommendationsPage.jsx'
import NotificationsPage from './pages/Notifications/NotificationsPage.jsx'

// ruta que redirige si no hay sesion
function PrivateRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <AppLoader />
    return user ? children : <Navigate to="/login" replace />
}

// ruta que redirige si ya hay sesion (login/register)
function GuestRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <AppLoader />
    return user ? <Navigate to="/" replace /> : children
}

function AppLoader() {
    return (
        <div className="app-loader">
          	<span className="app-loader__spinner" />
        </div>
    )
}

export default function App() {
    return (
        <ThemeProvider> 
          <BrowserRouter>
              <AuthProvider>
                  <Routes>
                    {/* rutas guest, sin layout */}
                    <Route path="/login" element={
                      	<GuestRoute><LoginPage /></GuestRoute>
                    } />
                    <Route path="/register" element={
                      	<GuestRoute><RegisterPage /></GuestRoute>
                    } />

                    {/* rutas con layout principal */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                        <Route path="/profile/:username" element={<ProfilePage />} />
                        <Route path="/recommendations" element={<RecommendationsPage />} />

                        {/* rutas privadas dentro del layout */}
                        <Route path="/recipes/new" element={
                          	<PrivateRoute><CreateRecipePage /></PrivateRoute>
                        } />
                        <Route path="/recipes/:id/edit" element={
                          	<PrivateRoute><EditRecipePage /></PrivateRoute>
                        } />
                        <Route path="/profile/edit" element={
                          	<PrivateRoute><EditProfilePage /></PrivateRoute>
                        } />
                        <Route path="/fridge" element={
                          	<PrivateRoute><FridgePage /></PrivateRoute>
                        } />
                        <Route path="/notifications" element={
                          	<PrivateRoute><NotificationsPage /></PrivateRoute>
                        } />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
              </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
    )
}