import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  // @eslint-ignore 
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { message } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      messages: [{ role: "user", content: message }],
    });

    return Response.json({ 
      reply: completion.choices[0]?.message?.content ?? "I didn't get a response..."
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed to get response" }, { status: 500 });
  }
}
