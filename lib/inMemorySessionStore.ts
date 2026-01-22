// lib/inMemorySessionStore.ts

import { randomUUID } from 'crypto';
import type { Answer, Domain, Session } from '@/types/dp';

// Egyszerű in-memory tároló – dev / demo-ra elég.
// Prod-ban majd DB lesz, de a Session shape ugyanaz marad.
const sessions = new Map<string, Session>();

function generateId() {
  return randomUUID();
}

type CreateSelfSessionInput = {
  domain: Domain;
  storyId: string;
  selfAnswers: Answer[];
  selfLabel?: string;
  proxyLabel?: string;
};

// Generikus self-session létrehozás bármely domainre (health, match, stb.)
function createSelfSession({
  domain,
  storyId,
  selfAnswers,
  selfLabel,
  proxyLabel,
}: CreateSelfSessionInput): Session {
  const id = generateId();
  const now = new Date().toISOString();

  const session: Session = {
    id,
    domain,
    storyId,
    status: 'proxy_pending',
    selfLabel,
    proxyLabel,
    selfAnswers,
    createdAt: now,
    updatedAt: now, // <- Session típus ezt kötelezően várja
  };

  sessions.set(id, session);
  return session;
}

// Health helper
export function createHealthSelfSession(
  args: Omit<CreateSelfSessionInput, 'domain'>,
): Session {
  return createSelfSession({ domain: 'health', ...args });
}

// Match helper
export function createMatchSelfSession(
  args: Omit<CreateSelfSessionInput, 'domain'>,
): Session {
  return createSelfSession({ domain: 'match', ...args });
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

// Proxy válaszok mentése (health + match közösen)
export function updateSessionProxyAnswers(
  sessionId: string,
  proxyAnswers: Answer[],
  proxyLabel?: string,
): Session | null {
  const existing = sessions.get(sessionId);
  if (!existing) return null;

  const updated: Session = {
    ...existing,
    proxyAnswers,
    proxyLabel: proxyLabel ?? existing.proxyLabel,
    status: 'completed',
    // completedAt nincs a Session típusban → nem használjuk, elég updatedAt
    updatedAt: new Date().toISOString(),
  };

  sessions.set(sessionId, updated);
  return updated;
}
