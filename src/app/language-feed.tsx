"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react"
import Link from "next/link"
import { getLanguages, getPosts } from "~/server/actions/posts"
import type { Language, Post } from "~/lib/types"
import { useAuth } from "~/auth/AuthContext"

interface LanguageFeedProps {
  initialPosts?: Post[];
  initialLanguage?: string;
}

export default function LanguageFeed({ initialPosts = [], initialLanguage = "all" }: LanguageFeedProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage)
  const [languages, setLanguages] = useState<Language[]>([])
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const { user } = useAuth()

  useEffect(() => {
    // Fetch languages on mount
    getLanguages().then((langs) => {
      // @ts-expect-error can be null
      setLanguages([{ value: "all", label: "All Languages" }, ...langs])
    }).catch((e) => console.log(e))
  }, [])

  useEffect(() => {
    // Fetch posts when language selection changes
    getPosts(selectedLanguage === "all" ? undefined : selectedLanguage).then(setPosts).catch((e) => console.log(e))
  }, [selectedLanguage])

  function getTimeAgo(date: Date) {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "just now"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const days = Math.floor(diffInHours / 24)
    if (days === 1) return "1 day ago"
    return `${days} days ago`
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Polyglot</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user && (
            <Link href="/create">
              <Button variant="outline" size="sm">
                Create Post
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowBigUp className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-medium">{post.votes}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowBigDown className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1">
                  <Link href={`/posts/${post.id}`} className="hover:underline">
                    <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="capitalize">{post.language}</span>
                    <span>•</span>
                    <span>Posted by {post.author}</span>
                    <span>•</span>
                    <span>{getTimeAgo(post.createdAt)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments} comment{post.comments == 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

