import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/page').then(m => ({ default: m.HomePage })))
const ClipsPage = lazy(() => import('./pages/clips/page').then(m => ({ default: m.ClipsPage })))
const ClipDetailPage = lazy(() => import('./pages/clips/[id]/page').then(m => ({ default: m.ClipDetailPage })))
const TournamentPage = lazy(() => import('./pages/tournaments/[id]/page').then(m => ({ default: m.TournamentPage })))
const TournamentsPage = lazy(() => import('./pages/tournaments/page').then(m => ({ default: m.TournamentsPage })))
const PlayersPage = lazy(() => import('./pages/players/page').then(m => ({ default: m.PlayersPage })))
const GamesPage = lazy(() => import('./pages/games/page').then(m => ({ default: m.GamesPage })))
const GameDetailPage = lazy(() => import('./pages/games/[slug]/page').then(m => ({ default: m.GameDetailPage })))
const PostsPage = lazy(() => import('./pages/User/PostsPage').then(m => ({ default: m.PostsPage })))
const ProfilePage = lazy(() => import('./pages/profile/page').then(m => ({ default: m.default })))
const LoginPage = lazy(() => import('./pages/User/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/User/RegisterPage').then(m => ({ default: m.RegisterPage })))
const CreateTournamentPage = lazy(() => import('./pages/tournaments/create/page').then(m => ({ default: m.CreateTournamentPage })))
const CreateGamePage = lazy(() => import('./pages/games/create/page').then(m => ({ default: m.CreateGamePage })))
const SettingsPage = lazy(() => import('./pages/User/SettingsPage').then(m => ({ default: m.SettingsPage })))

export default function App() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
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
    </Suspense>
  )
}