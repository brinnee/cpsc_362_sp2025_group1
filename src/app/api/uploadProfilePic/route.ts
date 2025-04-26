import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
  }

  // Optional: Log file info
  console.log("Received file:", file.name, file.type, file.size);
  const fileName = (file.name || 'upload').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');

  // Simulate successful upload by returning a placeholder URL
  const mockUrl = "https://dummyimage.com/300x300/cccccc/000000&text=Uploaded";


  return NextResponse.json({ url: mockUrl });
}
