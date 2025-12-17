// resources/js/layout/ParentLayout.tsx
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Home,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  Menu,
  User,
  Users,
  BookOpen,
  CalendarDays,
  FileText,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface ParentLayoutProps {
  children: React.ReactNode;
  activeRoute?: string;
}

export default function ParentLayout({ children, activeRoute }: ParentLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { auth } = usePage().props as any;

  const menuItems = [
    { href: '/parent/dashboard', icon: Home, label: 'Tableau de bord' },
    { href: '/parent/enfants', icon: Users, label: 'Mes enfants' },
    { href: '/parent/notes', icon: BookOpen, label: 'Notes' },
    { href: '/parent/presences', icon: CalendarDays, label: 'Présences' },
    { href: '/parent/bulletins', icon: FileText, label: 'Bulletins' },
    { href: '/parent/communications', icon: MessageSquare, label: 'Communications' },
    { href: '/parent/finances', icon: CreditCard, label: 'Finances' },
    { href: '/parent/aide', icon: HelpCircle, label: 'Aide' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo et menu mobile */}
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-12">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-2 py-4 border-b">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Parent Dupont</p>
                      <p className="text-xs text-muted-foreground">espace@parent.fr</p>
                    </div>
                  </div>
                  
                  <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          activeRoute === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/parent/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden md:inline-block">
                Espace Parent
              </span>
            </Link>
          </div>

          {/* Recherche et actions */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 w-64"
              />
            </div>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline-block">Parent</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:block w-64 border-r bg-background">
          <div className="h-full px-3 py-6">
            <div className="flex items-center gap-3 px-3 py-4 mb-6 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Parent Dupont</p>
                <p className="text-xs text-muted-foreground">2 enfants inscrits</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeRoute === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.label === 'Communications' && (
                    <Badge className="ml-auto">3</Badge>
                  )}
                </Link>
              ))}
            </nav>

            <Separator className="my-6" />

            {/* Informations rapides */}
            <div className="space-y-4">
              <div className="px-3">
                <p className="text-sm font-medium mb-2">Mes enfants</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <div className="h-8 w-8 rounded-full bg-blue-100"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Lucas Dupont</p>
                      <p className="text-xs text-muted-foreground">Terminale S</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <div className="h-8 w-8 rounded-full bg-pink-100"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Emma Dupont</p>
                      <p className="text-xs text-muted-foreground">4ème C</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-3">
                <p className="text-sm font-medium mb-2">Prochain événement</p>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs font-medium">Réunion parents-professeurs</p>
                  <p className="text-xs text-muted-foreground">20 Mars, 18h</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto">
          <div className="container p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                © 2024 École Excellence. Tous droits réservés.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/parent/aide" className="text-sm text-muted-foreground hover:text-foreground">
                Aide
              </Link>
              <Link href="/parent/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/parent/confidentialite" className="text-sm text-muted-foreground hover:text-foreground">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}