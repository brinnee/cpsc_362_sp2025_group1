export type Language = {
    value: string
    label: string
}

export type Post = {
    id: number
    title: string
    content: string
    language: string
    votes: number
    comments: number
    author: string
    createdAt: Date 
}

export type Comment = {
    id: number
    postId: number
    content: string | null
    author: string | null
    votes: number
    createdAt: Date | null
}

export type UserProfile = {
    id: number
    username: string | null
    postCount: number
    followedLanguages?: Language[]
    likedPosts?: Post[]
}
