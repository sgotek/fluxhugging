import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  model: 'flux' | 'sdxl';
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  steps: number;
  guidance_scale: number;
}

const MODEL_ENDPOINTS = {
  flux: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
  sdxl: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0'
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { model, prompt, negative_prompt, width, height, steps, guidance_scale } = body;

    // Validate required fields
    if (!model || !prompt || !width || !height || !steps || !guidance_scale) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get HF token from environment
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      return NextResponse.json(
        { error: 'HF_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Get the appropriate endpoint
    const endpoint = MODEL_ENDPOINTS[model];
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Invalid model specified' },
        { status: 400 }
      );
    }

    // Prepare request payload
    const payload = {
      inputs: prompt,
      parameters: {
        negative_prompt: negative_prompt || "low quality, blurry, watermark, text",
        width,
        height,
        num_inference_steps: steps,
        guidance_scale
      }
    };

    // Call Hugging Face API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API Error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: `Hugging Face API error: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
