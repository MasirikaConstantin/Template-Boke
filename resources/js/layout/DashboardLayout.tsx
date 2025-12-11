import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  User,
  Package,
  CreditCard,
  Shield,
  UserCog,
  DollarSign,
  BookCheckIcon,
  BookAIcon,
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import classes from '@/routes/classes';
import eleves from '@/routes/eleves';
import configurationFrais from '@/routes/configuration-frais';
import tranches from '@/routes/tranches';
import paiements from '@/routes/paiements';
import recouvrement from '@/routes/recouvrement';
import budgets from '@/routes/budgets';
import depenses from '@/routes/depenses';
import categoriesDepense from '@/routes/categories-depense';
import caisse from '@/routes/caisse';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  variant?: 'default' | 'ghost';
  badge?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  activeRoute?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  variant?: 'default' | 'ghost';
  badge?: string;
}

export function DashboardLayout({ 
  children, 
  activeRoute = '/dashboard' 
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems: NavItem[] = [
    {
      title: 'Aperçu',
      href: dashboard().url,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Utilisateurs',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Analytics',
      href: '#',
      icon: <BarChart3 className="h-5 w-5" />,
      badge: 'Nouveau',
    },
    {
      title: 'Classes',
      href: classes.index().url,
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: 'Élèves',
      href: eleves.index().url,
      icon: <UserCog className="h-5 w-5" />,
    },
    {
      title: 'Configurations de frais',
      href: configurationFrais.index().url,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: 'Tranches',
      href: tranches.index().url,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Caisse',
      href: paiements.index().url,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Rapport Caisse',
      href: caisse.index().url,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Recouvrement',
      href: recouvrement.index().url,
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title : 'Budgets',
      href : budgets.index().url,
      icon : <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Categories Depenses',
      href: categoriesDepense.index().url,
      icon: <BookAIcon className="h-5 w-5" />,
    },
    {
      title: 'Depenses',
      href: depenses.index().url,
      icon: <BookCheckIcon className="h-5 w-5" />,
    }
  ];

  const secondaryNavItems: NavItem[] = [
    {
      title: 'Paramètres',
      href: '#',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: 'Support',
      href: '#',
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      title: 'Administration',
      href: '#',
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => {
    return activeRoute === path || activeRoute.startsWith(`${path}/`);
  };

  const user = (usePage().props as any).auth.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[380px]">
            <div className="flex flex-col h-100%">  
              <div className="flex h-26 items-center border-b p-6">
                <Link href="/" className="flex items-center gap-2 p-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="font-bold text-primary-foreground">L</span>
                  </div>
                  <span className="text-xl font-bold">Frais Scolaire</span>
                </Link>
              </div>
              <ScrollArea className="flex-1 py-4">
                <nav className="px-4 space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.title}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
                <Separator className="my-4" />
                <nav className="px-4 space-y-1">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Tableau de bord</h1>
        </div>
        <MobileUserDropdown user={user} />
      </header>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r bg-background transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Sidebar Header */}
          <div className="flex h-36 items-center border-b px-4 p-4">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 transition-all",
                sidebarCollapsed && "justify-center w-full"
              )}
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="font-bold text-primary-foreground">L</span>
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold truncate">Frais Scolaire</span>
              )}
            </Link>
          </div>

          {/* Sidebar Content */}
          <ScrollArea className="flex-1 py-4">
            {/* Main Navigation */}
            <nav className="px-3 space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </nav>

            <Separator className="my-4" />

            {/* Secondary Navigation */}
            <nav className="px-3 space-y-1">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && (
                    <span className="flex-1 truncate">{item.title}</span>
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <DesktopUserDropdown user={user} />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function DesktopUserDropdown({user} : {user?: any}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className=" h-full rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background " align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name} </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="#">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="#">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout" method="post" as="button">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileUserDropdown({user}: {user?: any}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="#">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="#">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout" method="post" as="button">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}