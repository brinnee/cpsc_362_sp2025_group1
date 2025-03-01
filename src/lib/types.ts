export type Language = {
    value: string
    label: string
}

export type Post = {
    id: string
    title: string
    content: string
    language: string
    votes: number
    comments: number
    author: string
    createdAt: Date 
}

export type Comment = {
    id: string
    postId: string
    content: string
    author: string
    votes: number
    createdAt: Date
}
