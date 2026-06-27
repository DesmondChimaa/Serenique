import { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Leaf, LayoutDashboard, Calendar, Sparkles, Clock, CalendarOff, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setIsAdmin(true);
      }
      setLoading(false);
    }
    
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50">Checking authorization...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Services', href: '/admin/services', icon: Sparkles },
    { name: 'Business Hours', href: '/admin/business-hours', icon: Clock },
    { name: 'Blocked Dates', href: '/admin/blocked-dates', icon: CalendarOff },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex-shrink-0 flex flex-col md:min-h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-stone-100">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
            <span className="text-stone-50 font-serif italic text-lg leading-none">S</span>
          </div>
          <span className="font-semibold text-stone-900 tracking-tight">Admin Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-100">
          <Button variant="ghost" className="w-full justify-start text-stone-600 hover:text-stone-900" onClick={handleSignOut}>
            <LogOut className="h-5 w-5 mr-3 text-stone-400" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col">
        <Outlet />
      </main>

    </div>
  );
}
