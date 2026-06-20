import cors from "cors";
import express from "express";
import { z } from "zod";
import {
  buyForgeUpgrade,
  completeQuest,
  createChildProfile,
  createDailyQuest,
  createStudentProfile,
  createSubjectDailyQuest,
  getHome,
  getNextProblem,
  getSubjects,
  getSubject,
  getStudentHome,
  getNextActivity,
  parentSummary,
  requestActivityHint,
  requestHint,
  submitActivityAnswer,
  submitAnswer
} from "./store.js";

export const app = express();

app.use(cors());
app.use(express.json());

const childProfileSchema = z.object({
  displayName: z.string().min(1).max(40),
  gradeLevel: z.number().int().min(1).max(12).default(6),
  interests: z.array(z.string().min(1).max(30)).max(8).default([]),
  avatarKey: z.enum(["ember_smith", "rune_ranger", "star_mage", "gear_knight"]).default("ember_smith"),
  preferredTheme: z.enum(["forge", "fantasy", "scifi", "sports"]).default("forge"),
  tutorTone: z.enum(["coach", "rival", "robot", "guide"]).default("coach"),
  dailyGoalMinutes: z.number().int().min(5).max(30).default(10)
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/child-profiles", (req, res) => {
  const input = childProfileSchema.parse(req.body);
  res.status(201).json({ childProfile: createChildProfile(input) });
});

app.post("/student-profiles", (req, res) => {
  const input = childProfileSchema.parse(req.body);
  const studentProfile = createStudentProfile(input);
  res.status(201).json({ studentProfile, childProfile: studentProfile });
});

app.get("/child-profiles/:childProfileId/home", (req, res) => {
  res.json(getHome(req.params.childProfileId));
});

app.get("/student-profiles/:studentProfileId/home", (req, res) => {
  res.json(getStudentHome(req.params.studentProfileId));
});

app.get("/subjects", (_req, res) => {
  res.json({ subjects: getSubjects() });
});

app.get("/subjects/:subjectId", (req, res) => {
  res.json({ subject: getSubject(req.params.subjectId) });
});

app.post("/child-profiles/:childProfileId/quests/daily", async (req, res) => {
  const body = z.object({ preferredLength: z.number().int().default(8) }).parse(req.body);
  res.status(201).json({ quest: await createDailyQuest(req.params.childProfileId, body.preferredLength) });
});

app.post("/student-profiles/:studentProfileId/subjects/:subjectId/quests/daily", async (req, res) => {
  const body = z.object({ preferredLength: z.number().int().default(8) }).parse(req.body);
  res.status(201).json({ quest: await createSubjectDailyQuest(req.params.studentProfileId, req.params.subjectId, body.preferredLength) });
});

app.get("/quests/:questId/next-problem", (req, res) => {
  res.json({ problem: getNextProblem(req.params.questId) });
});

app.get("/quests/:questId/next-activity", (req, res) => {
  const activity = getNextActivity(req.params.questId);
  res.json({ activity, problem: activity });
});

app.post("/problem-attempts/:attemptId/answer", (req, res) => {
  const body = z.object({ submittedAnswer: z.string(), timeSpentSeconds: z.number().int().optional() }).parse(req.body);
  res.json(submitAnswer(req.params.attemptId, body.submittedAnswer, body.timeSpentSeconds));
});

app.post("/activity-attempts/:attemptId/answer", (req, res) => {
  const body = z.object({ submittedAnswer: z.string(), timeSpentSeconds: z.number().int().optional() }).parse(req.body);
  res.json(submitActivityAnswer(req.params.attemptId, body.submittedAnswer, body.timeSpentSeconds));
});

app.post("/problem-attempts/:attemptId/hint", (req, res) => {
  const body = z.object({ hintLevel: z.number().int().min(1).max(3) }).parse(req.body);
  res.json(requestHint(req.params.attemptId, body.hintLevel));
});

app.post("/activity-attempts/:attemptId/hint", (req, res) => {
  const body = z.object({ hintLevel: z.number().int().min(1).max(3) }).parse(req.body);
  res.json(requestActivityHint(req.params.attemptId, body.hintLevel));
});

app.post("/quests/:questId/complete", (req, res) => {
  res.json(completeQuest(req.params.questId));
});

app.post("/child-profiles/:childProfileId/forge/upgrades/:upgradeKey", (req, res) => {
  res.json(buyForgeUpgrade(req.params.childProfileId, req.params.upgradeKey));
});

app.get("/child-profiles/:childProfileId/parent-summary", (req, res) => {
  res.json(parentSummary(req.params.childProfileId));
});

app.get("/student-profiles/:studentProfileId/parent-summary", (req, res) => {
  res.json(parentSummary(req.params.studentProfileId));
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Validation failed", issues: error.issues });
    return;
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message.includes("not found") ? 404 : 400;
  res.status(status).json({ error: message });
});
