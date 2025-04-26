import { getPosts, getLanguages } from "~/server/actions/posts"
import LanguageFeed from "~/app/language-feed"
import { FollowButton } from "./follow-button"

export default async function LanguagePage({ params }: { params: { language: string } }) {
  const posts = await getPosts(params.language)
  const languages = await getLanguages()
  const currentLanguage = languages.find(lang => lang.value?.toLowerCase() === params.language.toLowerCase())

  if (!currentLanguage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Language not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold capitalize">{currentLanguage.label}</h1>
        <FollowButton language={currentLanguage.label} />
      </div>
      
      <LanguageFeed initialPosts={posts} initialLanguage={params.language} />
    </div>
  )
}