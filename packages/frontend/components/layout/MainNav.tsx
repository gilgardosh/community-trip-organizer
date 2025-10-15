'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Users,
  MapPin,
  Settings,
  LogOut,
  Menu,
  Crown,
  MessageSquare,
  Calendar,
  Package,
  ActivitySquare,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'דף הבית',
    href: '/family',
    icon: Home,
    roles: ['FAMILY', 'TRIP_ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'המשפחה שלי',
    href: '/family',
    icon: Users,
    roles: ['FAMILY', 'TRIP_ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'טיולים',
    href: '/family/trip',
    icon: MapPin,
    roles: ['FAMILY', 'TRIP_ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'ניהול טיולים',
    href: '/admin/trip',
    icon: Calendar,
    roles: ['TRIP_ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'ציוד',
    href: '/admin/gear',
    icon: Package,
    roles: ['TRIP_ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'הודעות WhatsApp',
    href: '/admin/whatsapp',
    icon: MessageSquare,
    roles: ['TRIP_ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'ניהול משפחות',
    href: '/super-admin/families',
    icon: Users,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'יומן פעילות',
    href: '/super-admin/activity-log',
    icon: ActivitySquare,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'פאנל מנהל',
    href: '/super-admin',
    icon: Crown,
    roles: ['SUPER_ADMIN'],
  },
];

export function MainNav() {
  const { user, family, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  const getRoleBadge = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return (
          <span className="text-xs text-primary font-semibold">סופר אדמין</span>
        );
      case 'TRIP_ADMIN':
        return (
          <span className="text-xs text-secondary-foreground font-semibold">
            מנהל טיול
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <Link
              href="/family"
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              טיולי השכונה
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.profilePhotoUrl}
                      alt={user.name || ''}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="text-right">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    {family && (
                      <p className="text-xs leading-none text-muted-foreground">
                        משפחת {family.name || 'ללא שם'}
                      </p>
                    )}
                    {getRoleBadge()}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Mobile-only navigation items */}
                <div className="md:hidden">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    href="/family"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <span>הגדרות</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  <span>התנתק</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className="w-full justify-start gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
