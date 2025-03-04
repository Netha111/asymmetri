import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const existingUser = await prisma.asymmetri.findUnique({
      where: { email }
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.asymmetri.create({
      data: {
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({
      success: true,
      email: user.email
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}
