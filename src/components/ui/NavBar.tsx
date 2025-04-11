"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, SpeechIcon, Home, PersonStandingIcon, PlusCircle, MessageSquare, Search } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/auth/AuthContext"
import { UserMenu } from "~/components/UserMenu"
import { Input } from "~/components/ui/input"
import { searchPostsByTitle } from "~/server/actions/posts"
import type { Post } from "~/lib/types"
import { Card, CardContent } from "~/components/ui/card"

function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Post[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const search = async () => {
      if (query.length > 0) {
        const posts = await searchPostsByTitle(query)
        setResults(posts as unknown as Post[])
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }

    const timeoutId = setTimeout(() => {
      void search()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleResultClick = (postId: number) => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    router.push(`/posts/${postId}`)
  }

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-2 ml-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          className="pl-8 ml-2 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
      </div>
      {isOpen && results.length > 0 && (
        <Card className="absolute ml-2 top-10 left-0 right-0 max-h-[300px] overflow-y-auto">
          <CardContent className="p-2">
            {results.map((post) => (
              <div
                key={post.id}
                className="p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => handleResultClick(post.id)}
              >
                <div className="text-sm font-medium truncate">{post.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {post.language} • {post.author}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

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
          <div className="hidden md:flex items-center space-x-4 flex-1">
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
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
            <div className="px-3 py-2">
              <SearchBar />
            </div>
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
