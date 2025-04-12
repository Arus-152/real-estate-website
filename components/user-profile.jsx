"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

export function UserProfile() {
  const { user, signOut, isGuest } = useAuth()

  if (!user) return null

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"
  const displayName = isGuest ? "Guest User" : user.email ? user.email.split("@")[0] : "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={displayName} />
            <AvatarFallback className={`${isGuest ? "bg-blue-100 text-blue-800" : "bg-[#f7f7f7] text-black"}`}>
              {isGuest ? "G" : userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-black font-medium">{displayName}</span>
          {isGuest && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Guest</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isGuest && (
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isGuest ? "Exit Guest Mode" : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
