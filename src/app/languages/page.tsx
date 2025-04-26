import { getLanguages } from "~/server/actions/posts"
import Link from "next/link"
import { Card, CardContent } from "~/components/ui/card"

export default async function LanguagesPage() {
  const languages = await getLanguages()

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supported Languages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((language) => (
          <Link key={language.value} href={`/languages/${language.value}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold capitalize">{language.label}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}