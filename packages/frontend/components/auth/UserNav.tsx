'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings } from 'lucide-react'

export function UserNav() {
  const { user, family, logout } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={() => router.push('/auth/login')}
      >
        התחבר
      </Button>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getUserInitials = () => {
    const nameParts = user.name.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return user.name.slice(0, 2).toUpperCase()
  }

  const getRoleName = () => {
    switch (user.role) {
      case 'super_admin':
        return 'מנהל מערכת'
      case 'trip_admin':
        return 'מנהל טיול'
      case 'family':
        return 'משפחה'
      default:
        return ''
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 text-right">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground" dir="ltr">
                {user.email}
              </p>
            )}
            {family?.name && (
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {family.name}
              </p>
            )}
            <p className="text-xs leading-none text-primary mt-1">
              {getRoleName()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')} className="text-right">
          <User className="ml-2 h-4 w-4" />
          <span>הפרופיל שלי</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')} className="text-right">
          <Settings className="ml-2 h-4 w-4" />
          <span>הגדרות</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-right text-destructive">
          <LogOut className="ml-2 h-4 w-4" />
          <span>התנתק</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
