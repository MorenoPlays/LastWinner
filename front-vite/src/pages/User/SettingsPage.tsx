import { MainNav } from '../../components/main-nav'
import { Button } from '../../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User, Bell, Shield, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="glass-card card-hover rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-indigo-300 mb-4">Account</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{user?.username || 'Not logged in'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card card-hover rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-indigo-300 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Notifications</span>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Language</span>
                </div>
                <span className="text-sm text-muted-foreground">Português</span>
              </div>
            </div>
          </div>

          <div className="glass-card card-hover rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}