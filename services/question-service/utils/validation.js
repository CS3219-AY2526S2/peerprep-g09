import ALLOWED_TOPICS from "../constants/topics.js";
import ALLOWED_DIFFICULTIES from "../constants/difficulties.js";

const normalizeTopics = (topics) => {
  if (!Array.isArray(topics)) {
    return [];
  }

  return topics
    .map((topic) => String(topic).trim().toLowerCase())
    .filter(Boolean);
};

const hasOnlyAllowedTopics = (topics) =>
  topics.every((topic) => ALLOWED_TOPICS.includes(topic));

const normalizeExamples = (examples) => {
  if (!Array.isArray(examples)) {
    return [];
  }

  return examples
    .map((example) => ({
      input: String(example.input || "").trim(),
      output: String(example.output || "").trim(),
      explanation: String(example.explanation || "").trim(),
    }))
    .filter((example) => example.input && example.output);
};

class QuestionValidator {
  static validateQuestionPayload(payload, { partial = false } = {}) {
    const errors = [];

    if (!partial || payload.title !== undefined) {
      if (!payload.title || String(payload.title).trim().length < 3) {
        errors.push("title must be at least 3 characters long.");
      }
    }

    if (!partial || payload.description !== undefined) {
      if (!payload.description || String(payload.description).trim().length < 10) {
        errors.push("description must be at least 10 characters long.");
      }
    }

    if (!partial || payload.difficulty !== undefined) {
      const normalizedDifficulty = payload.difficulty
        ? String(payload.difficulty).trim().toLowerCase()
        : "";

      if (!ALLOWED_DIFFICULTIES.includes(normalizedDifficulty)) {
        errors.push("difficulty must be one of: easy, medium, hard.");
      }
    }

    if (!partial || payload.topics !== undefined) {
      const normalizedTopics = normalizeTopics(payload.topics);

      if (normalizedTopics.length === 0) {
        errors.push("topics must contain at least one topic.");
      } else if (!hasOnlyAllowedTopics(normalizedTopics)) {
        errors.push(`topics must be chosen from the allowed list: ${ALLOWED_TOPICS.join(", ")}.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedData: {
        title: payload.title ? String(payload.title).trim() : undefined,
        description: payload.description ? String(payload.description).trim() : undefined,
        difficulty: payload.difficulty
          ? String(payload.difficulty).trim().toLowerCase()
          : undefined,
        topics: payload.topics !== undefined ? normalizeTopics(payload.topics) : undefined,
        constraints: Array.isArray(payload.constraints)
          ? payload.constraints.map((constraint) => String(constraint).trim()).filter(Boolean)
          : undefined,
        examples: payload.examples !== undefined ? normalizeExamples(payload.examples) : undefined,
        sourceUrl: payload.sourceUrl ? String(payload.sourceUrl).trim() : null,
        imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : null,
      },
    };
  }
}

export default QuestionValidator;
