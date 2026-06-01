import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ClipsPage } from './pages/ClipsPage'
import { ClipDetailPage } from './pages/ClipDetailPage'
import { TournamentPage } from './pages/TournamentPage'
import { TournamentsPage } from './pages/TournamentsPage'
import { PlayersPage } from './pages/PlayersPage'
import { GamesPage } from './pages/GamesPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { PostsPage } from './pages/PostsPage'
import ProfilePage from './pages/profile/page'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CreateTournamentPage } from './pages/CreateTournamentPage'
import { CreateGamePage } from './pages/CreateGamePage'

import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/clips" element={<ClipsPage />} />
      <Route path="/clips/:id" element={<ClipDetailPage />} />
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="/tournament/create" element={<CreateTournamentPage />} />
      <Route path="/tournament/:id" element={<TournamentPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/create" element={<CreateGamePage />} />
      <Route path="/games/:slug" element={<GameDetailPage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/user/:id" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}