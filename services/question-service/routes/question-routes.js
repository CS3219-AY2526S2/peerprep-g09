import express from "express";
import firebaseApp from "../config/firebase.js";
import { verifyAdmin, verifyAuthenticated } from "../middleware/authMiddleware.js";
import QuestionValidator from "../utils/validation.js";
import sampleQuestions from "../sample_data/sampleQuestions.js";
import ALLOWED_DIFFICULTIES from "../constants/difficulties.js";
import ALLOWED_TOPICS from "../constants/topics.js";

const router = express.Router();
const questionsCollection = firebaseApp.db.collection("questions");

const mapQuestionDocument = (doc) => ({
  id: doc.id,
  ...doc.data(),
});

router.get("/", verifyAuthenticated, async (req, res) => {
  try {
    const { difficulty, topic } = req.query;
    let query = questionsCollection;

    if (difficulty) {
      query = query.where("difficulty", "==", String(difficulty).toLowerCase());
    }

    const snapshot = await query.get();
    let questions = snapshot.docs.map(mapQuestionDocument);

    if (topic) {
      const normalizedTopic = String(topic).toLowerCase();
      questions = questions.filter((question) => question.topics?.includes(normalizedTopic));
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions." });
  }
});
router.get("/metadata/difficulties", async (req, res) => {
    res.status(200).json(ALLOWED_DIFFICULTIES);
});

router.get("/metadata/topics", async (req, res) => {
    res.status(200).json(ALLOWED_TOPICS);
});
router.get("/:id", verifyAuthenticated, async (req, res) => {
  try {
    const doc = await questionsCollection.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.status(200).json(mapQuestionDocument(doc));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question." });
  }
});

router.post("/", verifyAdmin, async (req, res) => {
  const { isValid, errors, normalizedData } = QuestionValidator.validateQuestionPayload(req.body);

  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const timestamp = new Date().toISOString();
    const payload = {
      ...normalizedData,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: req.user.uid,
    };

    const docRef = await questionsCollection.add(payload);
    const createdDoc = await docRef.get();

    res.status(201).json(mapQuestionDocument(createdDoc));
  } catch (error) {
    res.status(500).json({ error: "Failed to create question." });
  }
});

router.patch("/:id", verifyAdmin, async (req, res) => {
  const { isValid, errors, normalizedData } = QuestionValidator.validateQuestionPayload(req.body, {
    partial: true,
  });

  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const docRef = questionsCollection.doc(req.params.id);
    const existingDoc = await docRef.get();

    if (!existingDoc.exists) {
      return res.status(404).json({ error: "Question not found." });
    }

    const updates = Object.fromEntries(
      Object.entries(normalizedData).filter(([, value]) => value !== undefined)
    );

    updates.updatedAt = new Date().toISOString();
    await docRef.update(updates);

    const updatedDoc = await docRef.get();
    res.status(200).json(mapQuestionDocument(updatedDoc));
  } catch (error) {
    res.status(500).json({ error: "Failed to update question." });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const docRef = questionsCollection.doc(req.params.id);
    const existingDoc = await docRef.get();

    if (!existingDoc.exists) {
      return res.status(404).json({ error: "Question not found." });
    }

    await docRef.delete();
    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question." });
  }
});

router.post("/seed", verifyAdmin, async (req, res) => {
  try {
    const batch = firebaseApp.db.batch();

    sampleQuestions.forEach((question) => {
      const docRef = questionsCollection.doc();
      const timestamp = new Date().toISOString();

      batch.set(docRef, {
        ...question,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: req.user.uid,
      });
    });

    await batch.commit();
    res.status(201).json({ message: "Sample questions seeded successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to seed sample questions." });
  }
});


export default router;
