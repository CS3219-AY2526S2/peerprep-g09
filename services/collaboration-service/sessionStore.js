import { randomUUID } from 'crypto';

const DEFAULT_SESSION_DURATION_MS = Number(
  process.env.SESSION_DURATION_MS || 2 * 60 * 1000,
);

const sessions = new Map();

const cloneQuestion = (question) => {
  if (!question || typeof question !== 'object') {
    return null;
  }

  return JSON.parse(JSON.stringify(question));
};

const cloneSession = (session) => {
  if (!session) {
    return null;
  }

  return {
    ...session,
    participants: [...session.participants],
    question: cloneQuestion(session.question),
  };
};

const normalizeParticipants = (participants) => {
  if (!Array.isArray(participants)) {
    return [];
  }

  return [...new Set(
    participants
      .map((participant) => String(participant || '').trim())
      .filter(Boolean),
  )];
};

export const createSession = ({
  participants,
  questionId,
  question = null,
  topic = null,
  difficulty = null,
  matchedAt,
  durationMs,
}) => {
  const normalizedParticipants = normalizeParticipants(participants);

  if (normalizedParticipants.length < 2) {
    throw new Error('At least two distinct participants are required.');
  }

  const sessionId = randomUUID();
  const resolvedDurationMs =
    Number(durationMs) > 0 ? Number(durationMs) : DEFAULT_SESSION_DURATION_MS;

  const session = {
    sessionId,
    roomId: sessionId,
    participants: normalizedParticipants,
    questionId: questionId ? String(questionId).trim() : null,
    question: cloneQuestion(question),
    topic: topic ? String(topic).trim() : null,
    difficulty: difficulty ? String(difficulty).trim() : null,
    createdAt: matchedAt || new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    endedReason: null,
    notifiedAt: null,
    status: 'pending',
    durationMs: resolvedDurationMs,
  };

  sessions.set(sessionId, session);
  return cloneSession(session);
};

export const getSession = (sessionId) => {
  if (!sessionId) {
    return null;
  }

  return cloneSession(sessions.get(String(sessionId).trim()));
};

export const isParticipant = (sessionId, userId) => {
  const session = sessions.get(String(sessionId || '').trim());

  if (!session || !userId) {
    return false;
  }

  return session.participants.includes(String(userId).trim());
};

export const startSession = (sessionId) => {
  const session = sessions.get(String(sessionId || '').trim());

  if (!session) {
    return null;
  }

  if (!session.startedAt) {
    session.startedAt = new Date().toISOString();
  }

  if (session.status === 'pending') {
    session.status = 'active';
  }

  return cloneSession(session);
};

export const attachQuestion = (sessionId, question) => {
  const session = sessions.get(String(sessionId || '').trim());

  if (!session) {
    return null;
  }

  session.question = cloneQuestion(question);
  if (!session.questionId && question?.id) {
    session.questionId = String(question.id);
  }

  return cloneSession(session);
};

export const getRemainingMs = (sessionId) => {
  const session = sessions.get(String(sessionId || '').trim());

  if (!session) {
    return 0;
  }

  if (!session.startedAt) {
    return session.durationMs;
  }

  const elapsed = Date.now() - new Date(session.startedAt).getTime();
  return Math.max(0, session.durationMs - elapsed);
};

export const endSession = (sessionId, reason = 'completed') => {
  const session = sessions.get(String(sessionId || '').trim());

  if (!session) {
    return { changed: false, session: null };
  }

  if (session.status === 'ended') {
    return { changed: false, session: cloneSession(session) };
  }

  session.status = 'ended';
  session.endedReason = reason;
  session.endedAt = new Date().toISOString();

  return { changed: true, session: cloneSession(session) };
};

export const markSessionNotified = (sessionId) => {
  const session = sessions.get(String(sessionId || '').trim());

  if (!session) {
    return null;
  }

  session.notifiedAt = new Date().toISOString();
  return cloneSession(session);
};

export const removeSession = (sessionId) => {
  sessions.delete(String(sessionId || '').trim());
};
