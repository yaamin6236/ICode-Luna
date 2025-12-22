import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, LogOut, Menu, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-organic-mesh flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border/50 shadow-organic-xl z-50 texture-paper"
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo with organic leaf motif */}
          <div className="mb-8 mt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-2xl">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-gradient-organic">
                ICode Portal
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">
              Camp Management
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-organic'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium font-display">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content - Full width container */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/50 -ml-48 pl-48">
          <div className="flex items-center justify-between pr-8 py-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-full -ml-40"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-sm text-muted-foreground font-display">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 py-8 -ml-48 pr-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
