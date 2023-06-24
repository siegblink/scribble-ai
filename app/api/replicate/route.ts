import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  // 1. Get the request data (in JSON format) from the client
  const { image, prompt } = await request.json();

  // 2. Initialize the replicate object with our Replicate API token
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN as string,
  });

  // 3. Set the model that we're about to run
  const model = `jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117`;

  // 4. Set the input image which is the image we upload from the client
  const input = {
    image,
    prompt,
    a_prompt: 'best quality, extremely detailed',
    n_prompt:
      'longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality',
  };

  // 5. Run the model and get the output image
  const output = await replicate.run(model, { input });

  // 6. Check if the output image is null then return the error back to the client
  if (!output) {
    console.error('Something went wrong');
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }

  // 7. Otherwise, we show the output in the console (server-side)
  // and return the output back to the client
  console.log('output', output);
  return NextResponse.json({ output }, { status: 201 });
}
