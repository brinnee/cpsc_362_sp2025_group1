"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/auth/AuthContext"
import { followLanguage, unfollowLanguage, isFollowingLanguage } from "~/server/actions/posts"

export function FollowButton({ language }: { language: string }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      isFollowingLanguage({ language, firebaseUid: user.uid })
        .then(setIsFollowing)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [user, language])

  const handleFollow = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowLanguage({ language, firebaseUid: user.uid })
        setIsFollowing(false)
      } else {
        await followLanguage({ language, firebaseUid: user.uid })
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Error toggling follow status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  )
} 