"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/auth/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowBigUp, MessageSquare, Settings, Languages, ThumbsUp, BookMarked } from "lucide-react";
import { getUserProfile, getUserLikedPosts, getUserFollowedLanguages } from "~/server/actions/users";
import type { Post, Language, UserProfile } from "~/lib/types";
import Link from "next/link";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [followedLanguages, setFollowedLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Store authentication state in localStorage to prevent redirect loops
  useEffect(() => {
    // Only run this once when the component mounts
    if (!initialAuthCheckDone) {
      const storedAuthState = localStorage.getItem('authState');
      
      if (storedAuthState === 'authenticated') {
        // User was previously authenticated, don't redirect
        setInitialAuthCheckDone(true);
      } else if (user) {
        // User is authenticated, store this state
        localStorage.setItem('authState', 'authenticated');
        setInitialAuthCheckDone(true);
      } else {
        // User is not authenticated, redirect
        router.push("/signin");
      }
    }
  }, [user, router, initialAuthCheckDone]);

  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('authState');
    };
  }, []);

  // Fetch user profile data
  useEffect(() => {
    if (initialAuthCheckDone && user) {
      setLoading(true);
      
      const fetchData = async () => {
        try {
          // Fetch user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Fetch liked posts
          const posts = await getUserLikedPosts(user.uid);
          setLikedPosts(posts);
          
          // Fetch followed languages
          const languages = await getUserFollowedLanguages(user.uid);
          setFollowedLanguages(languages);
        } catch (err) {
          console.error("Error fetching profile data:", err);
          setError("Failed to load profile data. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      
      void fetchData();
    }
  }, [initialAuthCheckDone, user]);

  function getTimeAgo(date: Date) {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const days = Math.floor(diffInHours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.photoURL ?? ""} alt={user?.displayName ?? "User"} />
            <AvatarFallback className="text-2xl">{user?.displayName?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{user?.displayName ?? userProfile?.username ?? "User"}</CardTitle>
            <CardDescription>{user?.email ?? ""}</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {userProfile?.postCount ?? 0} posts
              </Badge>
              <Badge variant="outline" className="text-xs">
                {followedLanguages.length} languages followed
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="icon" className="ml-auto">
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="languages">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Languages
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Liked Posts
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            Saved Posts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="languages" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Languages You Follow</h2>
          {followedLanguages.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven&apos;t followed any languages yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/">Browse Languages</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {followedLanguages.map((language) => (
                <Card key={language.value} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{language.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/?language=${language.value}`}>
                        View Posts
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Posts You&apos;ve Liked</h2>
          {likedPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven&apos;t liked any posts yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/">Browse Posts</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {likedPosts.map((post) => (
                <Card key={post.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ArrowBigUp className="h-5 w-5 text-primary" />
                        </Button>
                        <span className="text-sm font-medium">{post.votes}</span>
                      </div>

                      <div className="flex-1">
                        <Link href={`/posts/${post.id}`} className="hover:underline">
                          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
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
                            <span>{post.comments} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Saved Posts</h2>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Saved posts feature coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
