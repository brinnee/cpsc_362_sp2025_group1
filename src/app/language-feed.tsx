"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react"
import Link from "next/link"

// Mock data
const languages = [
  { value: "all", label: "All Languages" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "japanese", label: "Japanese" },
  { value: "german", label: "German" },
]

const posts = [
  {
    id: 1,
    title: "How do you differentiate between 'por' and 'para' in Spanish?",
    language: "spanish",
    votes: 127,
    comments: 45,
    author: "language_learner",
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    title: "What's the difference between は (wa) and が (ga) particles?",
    language: "japanese",
    votes: 89,
    comments: 32,
    author: "nihongo_newbie",
    timeAgo: "4 hours ago",
  },
  {
    id: 3,
    title: "When to use 'le' vs 'les' in French?",
    language: "french",
    votes: 56,
    comments: 28,
    author: "french_student",
    timeAgo: "6 hours ago",
  },
  {
    id: 4,
    title: "Understanding German cases: Akkusativ vs Dativ",
    language: "german",
    votes: 92,
    comments: 37,
    author: "deutsch_lerner",
    timeAgo: "8 hours ago",
  },
  {
    id: 5,
    title: "Tips for rolling your R's in Spanish?",
    language: "spanish",
    votes: 145,
    comments: 52,
    author: "pronunciation_pro",
    timeAgo: "12 hours ago",
  },
]

export default function LanguageFeed() {
  const [selectedLanguage, setSelectedLanguage] = useState("all")

  const filteredPosts = selectedLanguage === "all" ? posts : posts.filter((post) => post.language === selectedLanguage)

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Language Learning Feed</h1>
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
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowBigUp className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-medium">{post.votes}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowBigDown className="h-5 w-5" />
                  </Button>
                </div>

                {/* Post content */}
                <div className="flex-1">
                  <Link href="#" className="hover:underline">
                    <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="capitalize">{post.language}</span>
                    <span>•</span>
                    <span>Posted by {post.author}</span>
                    <span>•</span>
                    <span>{post.timeAgo}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments} comments</span>
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

