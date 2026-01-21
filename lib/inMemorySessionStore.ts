// lib/inMemorySessionStore.ts

import { randomUUID } from 'crypto';
import type { Answer, Session } from '@/types/dp';

// Egyszerű in-memory tároló: újraindításkor kiürül.
// MVP / dev célra jó, később DB-re cseréljük.
const sessions = new Map<string, Session>();

type CreateHealthSelfSessionInput = {
  storyId: string;
  selfAnswers: Answer[];
  selfLabel?: string;
  proxyLabel?: string;
};

export function createHealthSelfSession(
  input: CreateHealthSelfSessionInput,
): Session {
  const id = randomUUID();
  const now = new Date().toISOString();

  const session: Session = {
    id,
    domain: 'health',
    storyId: input.storyId,
    flowId: 'health_self_proxy_v1',
    status: 'proxy_pending',
    selfLabel: input.selfLabel,
    proxyLabel: input.proxyLabel,
    selfAnswers: input.selfAnswers,
    proxyAnswers: undefined,
    createdAt: now,
    completedAt: undefined,
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateSessionProxyAnswers(
  id: string,
  proxyAnswers: Answer[],
): Session | undefined {
  const existing = sessions.get(id);
  if (!existing) return undefined;

  const updated: Session = {
    ...existing,
    proxyAnswers,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };

  sessions.set(id, updated);
  return updated;
}

// Későbbi debug / admin célokra jól jöhet
export function listSessions(): Session[] {
  return Array.from(sessions.values());
}
