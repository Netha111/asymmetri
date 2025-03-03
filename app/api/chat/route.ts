import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/auth-options";
import { prisma } from "@/lib/prisma";
import isEmail from 'validator/lib/isEmail';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a landing page code generator. Generate complete, responsive HTML/CSS code for landing pages.

Guidelines:
- output should be html code strictly.
- include images from unsplash.com which are related to the prompt.
- each section should maintain a page size, with good padding and margin.
- text color should not be white
- Generate a good title for the landing page
- Add essential sections (hero, features, CTA, contact).
- every section should have space between them.
- Ensure mobile-friendly design.
- Include CSS in <style> tag.

For modification requests:
- strictly output should be html code.
- If the user asks to modify a specific section, keep other sections unchanged
- When asked to change colors, styles, or content of a section, preserve the overall structure
- Handle requests like "make the header blue" or "change the hero section text"
- Keep existing CSS classes and just modify their properties when styling changes are requested
- Maintain responsive design when making modifications

Example User Prompt: "Create a minimal landing page for a coffee shop || add a section"
Sample example Output:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #f3f3f3, #e0e0e0);
            color: #333;
        }
        header {
            text-align: center;
            padding: 3rem 1rem;
            background: #1a1a2e;
            color: #fff;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        header h1 {
            margin-bottom: 0.5rem;
            font-size: 3rem;
            letter-spacing: 2px;
        }
        header p {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        .container {
            padding: 4rem 2rem;
            text-align: center;
            background: #fff;
            margin: 2rem auto;
            max-width: 900px;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        .container:hover {
            transform: scale(1.02);
        }
        .container h2 {
            margin-bottom: 1.5rem;
            font-size: 2rem;
            color: #1a1a2e;
        }
        .container p {
            margin-bottom: 2rem;
            font-size: 1.2rem;
            color: #555;
            line-height: 1.8;
        }
        .btn {
            display: inline-block;
            padding: 0.9rem 2.5rem;
            background: #1a1a2e;
            color: #fff;
            text-decoration: none;
            border-radius: 50px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            transition: background 0.3s ease, transform 0.3s ease;
        }
        .btn:hover {
            background: #0f3460;
            transform: translateY(-5px);
        }
        footer {
            text-align: center;
            padding: 1.5rem;
            background: #1a1a2e;
            color: #fff;
            position: fixed;
            width: 100%;
            bottom: 0;
            box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3);
        }
        @media (max-width: 768px) {
            header h1 {
                font-size: 2.5rem;
            }
            .container h2 {
                font-size: 1.8rem;
            }
            .container p {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Welcome to Our Landing Page</h1>
        <p>Your Gateway to Excellence</p>
    </header>
    <div class="container">
        <h2>Your Gateway to Amazing Services</h2>
        <p>Discover the best solutions tailored just for you. Join us and transform your ideas into reality with our cutting-edge services and dedicated team.</p>
        <a href="#" class="btn">Get Started</a>
    </div>
    <footer>
        &copy; 2025 Your Company. All rights reserved.
    </footer>
</body>
</html>

Dont add any other text or comments in the output.
`;

async function generateCodeInBackground(email: string, prompt: string, existingCode: string | null) {
  try {
    await prisma.asymmetri.update({
      where: { email },
      data: { status: 'processing' }
    });

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT } as const
    ];

    if (existingCode) {
      messages.push(
        { role: "assistant", content: "Here's the current code:\n" + existingCode } as const,
        { role: "user", content: "Please modify the above code: " + prompt } as const
      );
    } else {
      messages.push({ role: "user", content: prompt } as const);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.4,
      max_tokens: 3000,
    });

    const generatedCode = response.choices[0].message.content;

    await prisma.asymmetri.update({
      where: { email },
      data: { 
        status:'completed',
        code: generatedCode 
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    await prisma.asymmetri.update({
      where: { email },
      data: { status: 'error' }
    });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || !isEmail(session.user.email)) {
    return NextResponse.json(
      { error: "Invalid or missing email" },
      { status: 401 }
    );
  }

  try {
    const { prompt, existingCode } = await req.json();

    // Start generation in background
    generateCodeInBackground(session.user.email, prompt, existingCode);

    // Immediately return response
    return NextResponse.json({ message: 'Generation started' });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
} 