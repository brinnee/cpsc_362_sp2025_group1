"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, SpeechIcon, Home, PersonStandingIcon, PlusCircle, MessageSquare } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/auth/AuthContext"
import { UserMenu } from "~/components/UserMenu"

export function NavBar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/languages", label: "Languages", icon: MessageSquare},
    ...(user ? [
      { href: "/profile", label: "Profile", icon: PersonStandingIcon },
    ] : [])
  ]

  const handleSignIn = () => {
    router.push("/signin")
  }

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <SpeechIcon className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Polyglot</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}

            {!loading && (
              user ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      // Set auth state before navigating
                      localStorage.setItem('authState', 'authenticated');
                      router.push("/create");
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Post
                  </Button>
                  <UserMenu />
                </>
              ) : (
                <Button onClick={handleSignIn} className="ml-4">
                  Sign In
                </Button>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {!loading && !user && (
              <Button onClick={handleSignIn} variant="outline" size="sm" className="mr-2">
                Sign In
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            {!loading && user && (
              <>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full justify-start"
                  onClick={() => {
                    // Set auth state before navigating
                    localStorage.setItem('authState', 'authenticated');
                    router.push("/create");
                    setIsOpen(false);
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Post
                </Button>
                <div className="px-3 py-2">
                  <UserMenu />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
