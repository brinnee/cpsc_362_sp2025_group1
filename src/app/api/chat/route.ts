import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  message: string;
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export async function POST(request: Request) {
  const { message, history } = await request.json() as ChatRequest;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        ...history,
        { role: "user", content: message }
      ],
    });

    return Response.json({ 
      reply: completion.choices[0]?.message?.content ?? "I didn't get a response..."
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed to get response" }, { status: 500 });
  }
}
