export type Language = {
    value: string
    label: string
}

export type Post = {
    id: number
    title: string
    language: string
    votes: number
    comments: number
    author: string
    createdAt: Date 
}
