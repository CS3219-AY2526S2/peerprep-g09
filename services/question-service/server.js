import express from "express";
import cors from "cors";
import questionRoutes from "./routes/question-routes.js";

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "question-service" });
});

app.use("/api/questions", questionRoutes);

app.listen(PORT, () => {
  console.log(`Question service listening on port ${PORT}`);
});
