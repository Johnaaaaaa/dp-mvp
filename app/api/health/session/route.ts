// app/api/health/session/route.ts

import { NextResponse } from 'next/server';
import type { Answer } from '@/types/dp';
import {
  createHealthSelfSession,
  getSession,
  updateSessionProxyAnswers,
} from '@/lib/inMemorySessionStore';

// POST /api/health/session
// Body: { storyId: string; selfAnswers: Answer[]; selfLabel?: string; proxyLabel?: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const storyId = body.storyId as string | undefined;
    const selfAnswers = body.selfAnswers as Answer[] | undefined;
    const selfLabel = body.selfLabel as string | undefined;
    const proxyLabel = body.proxyLabel as string | undefined;

    if (!storyId || !Array.isArray(selfAnswers)) {
      return NextResponse.json(
        { error: 'Invalid payload: storyId + selfAnswers required.' },
        { status: 400 },
      );
    }

    const session = createHealthSelfSession({
      storyId,
      selfAnswers,
      selfLabel,
      proxyLabel,
    });

    return NextResponse.json(
      {
        sessionId: session.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/health/session error', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}

// GET /api/health/session?id=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Missing id query parameter.' },
      { status: 400 },
    );
  }

  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }

  return NextResponse.json(session, { status: 200 });
}

// PUT /api/health/session
// Body: { sessionId: string; proxyAnswers: Answer[] }
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const sessionId = body.sessionId as string | undefined;
    const proxyAnswers = body.proxyAnswers as Answer[] | undefined;

    if (!sessionId || !Array.isArray(proxyAnswers)) {
      return NextResponse.json(
        { error: 'Invalid payload: sessionId + proxyAnswers required.' },
        { status: 400 },
      );
    }

    const updated = updateSessionProxyAnswers(sessionId, proxyAnswers);
    if (!updated) {
      return NextResponse.json(
        { error: 'Session not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/health/session error', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
