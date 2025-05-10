"use client";
import Chatbot from "~/components/chatbot";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/auth/AuthContext";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { getLanguages, createPost } from "~/server/actions/posts";
import type { Language } from "~/lib/types";
import { Loader2 } from "lucide-react";

export default function CreatePostPage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    language: ""
  });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch languages on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const langs = await getLanguages();
        setLanguages(langs.filter(lang => lang.value !== null) as Language[]);
      } catch (err) {
        console.error("Error fetching languages:", err);
        setError("Failed to load languages. Please refresh the page.");
      }
    };

    loadLanguages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      language: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError("Please enter a title for your post");
      return;
    }
    if (!formData.content.trim()) {
      setError("Please enter content for your post");
      return;
    }
    if (!formData.language) {
      setError("Please select a language");
      return;
    }
    if (!user) {
      setError("You must be logged in to create a post");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost({
        title: formData.title,
        content: formData.content,
        languageName: formData.language,
        firebaseUid: user.uid,
      });
      
      setSuccess(true);
      // Redirect after 1.5 seconds to show success state
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be signed in to create posts.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/signin")}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Post</CardTitle>
          <CardDescription>
            Share your question with the community
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>Your post has been created successfully.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="language">Programming Language *</Label>
              <Select 
                value={formData.language} 
                onValueChange={handleLanguageChange}
                disabled={isSubmitting}
              >
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="What's your question or topic?"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Details *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Describe your question in detail..."
                value={formData.content}
                onChange={handleChange}
                className="min-h-[200px]"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Include code snippets, error messages, and what you've tried
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || success}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Chatbot />
    </div>
  );
}
