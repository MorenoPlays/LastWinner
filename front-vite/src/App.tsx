import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const ClipsPage = lazy(() => import('./pages/ClipsPage').then(m => ({ default: m.ClipsPage })))
const ClipDetailPage = lazy(() => import('./pages/ClipDetailPage').then(m => ({ default: m.ClipDetailPage })))
const TournamentPage = lazy(() => import('./pages/TournamentPage').then(m => ({ default: m.TournamentPage })))
const TournamentsPage = lazy(() => import('./pages/TournamentsPage').then(m => ({ default: m.TournamentsPage })))
const PlayersPage = lazy(() => import('./pages/PlayersPage').then(m => ({ default: m.PlayersPage })))
const GamesPage = lazy(() => import('./pages/GamesPage').then(m => ({ default: m.GamesPage })))
const GameDetailPage = lazy(() => import('./pages/GameDetailPage').then(m => ({ default: m.GameDetailPage })))
const PostsPage = lazy(() => import('./pages/PostsPage').then(m => ({ default: m.PostsPage })))
const ProfilePage = lazy(() => import('./pages/profile/page').then(m => ({ default: m.default })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const CreateTournamentPage = lazy(() => import('./pages/CreateTournamentPage').then(m => ({ default: m.CreateTournamentPage })))
const CreateGamePage = lazy(() => import('./pages/CreateGamePage').then(m => ({ default: m.CreateGamePage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

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