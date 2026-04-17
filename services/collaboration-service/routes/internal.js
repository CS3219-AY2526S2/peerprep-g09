import express from 'express';

import verifyInternalService from '../middleware/internalAuth.js';
import { createSession, getSession } from '../sessionStore.js';

const router = express.Router();

router.use(express.json());
router.use(verifyInternalService);

router.post('/sessions', (req, res) => {
  const {
    participants,
    questionId,
    question,
    topic,
    difficulty,
    matchedAt,
    durationMs,
  } = req.body;

  try {
    const session = createSession({
      participants,
      questionId: questionId || question?.id,
      question,
      topic,
      difficulty,
      matchedAt,
      durationMs,
    });

    res.status(201).json({
      ...session,
      joinPath: `/collab/${session.sessionId}`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to create session.' });
  }
});

router.get('/sessions/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  res.status(200).json(session);
});

export default router;
