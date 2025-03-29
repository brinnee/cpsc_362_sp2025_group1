"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/auth/AuthContext";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { getLanguages, createPost } from "~/server/actions/posts";
import type { Language } from "~/lib/types";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // Store authentication state in localStorage to prevent redirect loops
  useEffect(() => {
    // Only run this once when the component mounts
    if (!initialAuthCheckDone) {
      const storedAuthState = localStorage.getItem('authState');
      
      if (storedAuthState === 'authenticated') {
        // User was previously authenticated, don't redirect
        setInitialAuthCheckDone(true);
      } else if (!loading) {
        // First auth check is complete
        setInitialAuthCheckDone(true);
        
        if (user) {
          // User is authenticated, store this state
          localStorage.setItem('authState', 'authenticated');
        } else {
          // User is not authenticated, redirect
          router.push("/signin");
        }
      }
    }
  }, [user, loading, router, initialAuthCheckDone]);

  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('authState');
    };
  }, []);

  // Fetch languages when component mounts
  useEffect(() => {
    if (initialAuthCheckDone && user) {
      getLanguages()
        .then((langs) => {
          // Filter out any languages with null values
          const validLanguages = langs.filter(lang => lang.value !== null) as Language[];
          setLanguages(validLanguages);
        })
        .catch((e) => {
          console.error("Error fetching languages:", e);
          setError("Failed to load languages. Please try again.");
        });
    }
  }, [initialAuthCheckDone, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Please enter a title for your post.");
      return;
    }
    
    if (!content.trim()) {
      setError("Please enter content for your post.");
      return;
    }
    
    if (!selectedLanguage) {
      setError("Please select a language for your post.");
      return;
    }
    
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createPost({
        title,
        content,
        languageName: selectedLanguage,
        firebaseUid: user.uid,
      });
      
      // Redirect to home page after successful post creation
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (loading || !initialAuthCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If we've checked auth and there's no user, don't render the form
  if (initialAuthCheckDone && !user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Post</CardTitle>
          <CardDescription>
            Share your question!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
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
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's your question or topic?"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Describe your question..."
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                className="min-h-[200px]"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
