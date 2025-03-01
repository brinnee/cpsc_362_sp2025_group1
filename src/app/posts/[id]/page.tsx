"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { getPostById, getPostComments } from "~/server/actions/posts"
import type { Post, Comment } from "~/lib/types"

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    
    const postId = Array.isArray(id) ? id[0] : id
    
    setLoading(true)
    
    // Fetch post details
    getPostById(postId)
      .then(setPost)
      .catch((e) => console.error("Error fetching post:", e))
      .finally(() => setLoading(false))
    
    // Fetch post comments
    getPostComments(postId)
      .then(setComments)
      .catch((e) => console.error("Error fetching comments:", e))
  }, [id])

//   function getTimeAgo(date: Date) {
//     const now = new Date()
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
//     if (diffInHours < 1) return "just now"
//     if (diffInHours === 1) return "1 hour ago"
//     if (diffInHours < 24) return `${diffInHours} hours ago`
//     const days = Math.floor(diffInHours / 24)
//     if (days === 1) return "1 day ago"
//     return `${days} days ago`
//   }

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6">Loading...</div>
  }

  if (!post) {
    return <div className="max-w-3xl mx-auto p-6">Post not found</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <span className="capitalize">{post.language}</span>
            <span>•</span>
            <span>Posted by {post.author}</span>
            <span>•</span>
            {/* <span>{getTimeAgo(post.createdAt)}</span> */}
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowBigUp className="h-6 w-6" />
              </Button>
              <span className="text-lg font-medium">{post.votes}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowBigDown className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-lg">{post.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{comments.length} Comments</h2>
        </div>
        
        {comments.length === 0 ? (
          <p className="text-muted-foreground py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{comment.author}</span>
                  <span>•</span>
                  {/* <span>{getTimeAgo(comment.createdAt)}</span> */}
                </div>
                <p>{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ArrowBigUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{comment.votes}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ArrowBigDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">Reply</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 