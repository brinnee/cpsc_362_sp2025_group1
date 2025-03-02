"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Send } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Textarea } from "~/components/ui/textarea"
import { getPostById, getPostComments, createReply } from "~/server/actions/posts"
import type { Post, Comment } from "~/lib/types"
import { useAuth } from "~/auth/AuthContext"
import { Alert, AlertDescription } from "~/components/ui/alert"

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setReplyingToComment] = useState<number | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  // Ensure postId is a string
  const postId = id ? (Array.isArray(id) ? id[0] : id) : ""

  useEffect(() => {
    if (!postId) return
    
    setLoading(true)
    
    // Fetch post details
    void getPostById(postId)
      .then((data) => {
        if (data) setPost(data as unknown as Post)
      })
      .catch((e) => console.error("Error fetching post:", e))
      .finally(() => setLoading(false))
    
    // Fetch post comments
    if (postId) {
      void fetchComments()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, postId])

  const fetchComments = async () => {
    if (!postId) return
    
    try {
      const data = await getPostComments(postId)
      setComments(data as unknown as Comment[])
    } catch (e) {
      console.error("Error fetching comments:", e)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!postId) {
      setError("Post ID is missing")
      return
    }
    
    if (!replyContent.trim()) {
      setError("Please enter a comment")
      return
    }
    
    if (!user) {
      // Redirect to signin if not authenticated
      router.push("/signin")
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      await createReply({
        postId,
        content: replyContent,
        firebaseUid: user.uid,
      })
      
      // Clear the form and refresh comments
      setReplyContent("")
      await fetchComments()
      
      // Reset replying state
      setReplyingToComment(null)
    } catch (error) {
      console.error("Error creating reply:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to post comment. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function getTimeAgo(date: Date | null) {
    if (!date) {return null};
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "just now"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const days = Math.floor(diffInHours / 24)
    if (days === 1) return "1 day ago"
    return `${days} days ago`
  }

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
            <span>{getTimeAgo(post.createdAt)}</span>
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

      {/* Reply Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleReplySubmit}>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Textarea
                placeholder="Write a comment..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                  {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{comments.length} Comment{comments.length === 1 ? '' : 's'}</h2>
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
                  <span>{getTimeAgo(comment.createdAt)}</span>
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // Scroll to reply form and focus it
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                      // Set replying state
                      setReplyingToComment(comment.id);
                      // Update reply content to include @username
                      setReplyContent(`@${comment.author} `);
                      // Focus the textarea after scrolling
                      setTimeout(() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          textarea.focus();
                        }
                      }, 500);
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 