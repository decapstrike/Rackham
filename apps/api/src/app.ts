import cors from "cors";
import express from "express";
import { z } from "zod";
import { prisma } from "./db/client.js";
import {
  buyForgeUpgrade,
  completeQuest,
  createChildProfile,
  createDailyQuest,
  createRecommendedDailyQuest,
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
} from "./storeAdapter.js";

export const app = express();

app.use(cors());
app.use(express.json());

const asyncRoute = (handler: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res).catch(next);
  };

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

app.get("/ready", asyncRoute(async (_req, res) => {
  if (process.env.NODE_ENV !== "test" && process.env.LEARNINGFORGE_STORE !== "memory") {
    await prisma.$queryRaw`SELECT 1`;
  }
  res.json({ ok: true });
}));

app.post("/child-profiles", asyncRoute(async (req, res) => {
  const input = childProfileSchema.parse(req.body);
  res.status(201).json({ childProfile: await createChildProfile(input) });
}));

app.post("/student-profiles", asyncRoute(async (req, res) => {
  const input = childProfileSchema.parse(req.body);
  const studentProfile = await createStudentProfile(input);
  res.status(201).json({ studentProfile, childProfile: studentProfile });
}));

app.get("/child-profiles/:childProfileId/home", asyncRoute(async (req, res) => {
  res.json(await getHome(req.params.childProfileId));
}));

app.get("/student-profiles/:studentProfileId/home", asyncRoute(async (req, res) => {
  res.json(await getStudentHome(req.params.studentProfileId));
}));

app.get("/subjects", asyncRoute(async (_req, res) => {
  res.json({ subjects: await getSubjects() });
}));

app.get("/subjects/:subjectId", asyncRoute(async (req, res) => {
  res.json({ subject: await getSubject(req.params.subjectId) });
}));

app.post("/child-profiles/:childProfileId/quests/daily", asyncRoute(async (req, res) => {
  const body = z.object({ preferredLength: z.number().int().default(8) }).parse(req.body);
  res.status(201).json({ quest: await createDailyQuest(req.params.childProfileId, body.preferredLength) });
}));

app.post("/student-profiles/:studentProfileId/subjects/:subjectId/quests/daily", asyncRoute(async (req, res) => {
  const body = z.object({ preferredLength: z.number().int().default(8) }).parse(req.body);
  res.status(201).json({ quest: await createSubjectDailyQuest(req.params.studentProfileId, req.params.subjectId, body.preferredLength) });
}));

app.post("/student-profiles/:studentProfileId/quests/daily", asyncRoute(async (req, res) => {
  const body = z.object({ preferredLength: z.number().int().default(8), subjectPreference: z.string().default("auto") }).parse(req.body);
  res.status(201).json({ quest: await createRecommendedDailyQuest(req.params.studentProfileId, body.preferredLength, body.subjectPreference) });
}));

app.post("/student-profiles/:studentProfileId/quests/subject", asyncRoute(async (req, res) => {
  const body = z.object({ subjectKey: z.string(), preferredLength: z.number().int().default(8) }).parse(req.body);
  res.status(201).json({ quest: await createSubjectDailyQuest(req.params.studentProfileId, body.subjectKey, body.preferredLength) });
}));

app.get("/quests/:questId/next-problem", asyncRoute(async (req, res) => {
  res.json({ problem: await getNextProblem(req.params.questId) });
}));

app.get("/quests/:questId/next-activity", asyncRoute(async (req, res) => {
  const activity = await getNextActivity(req.params.questId);
  res.json({ activity, problem: activity });
}));

app.post("/problem-attempts/:attemptId/answer", asyncRoute(async (req, res) => {
  const body = z.object({ submittedAnswer: z.string(), timeSpentSeconds: z.number().int().optional() }).parse(req.body);
  res.json(await submitAnswer(req.params.attemptId, body.submittedAnswer, body.timeSpentSeconds));
}));

app.post("/activity-attempts/:attemptId/answer", asyncRoute(async (req, res) => {
  const body = z.object({ submittedAnswer: z.string(), timeSpentSeconds: z.number().int().optional() }).parse(req.body);
  res.json(await submitActivityAnswer(req.params.attemptId, body.submittedAnswer, body.timeSpentSeconds));
}));

app.post("/problem-attempts/:attemptId/hint", asyncRoute(async (req, res) => {
  const body = z.object({ hintLevel: z.number().int().min(1).max(3) }).parse(req.body);
  res.json(await requestHint(req.params.attemptId, body.hintLevel));
}));

app.post("/activity-attempts/:attemptId/hint", asyncRoute(async (req, res) => {
  const body = z.object({ hintLevel: z.number().int().min(1).max(3) }).parse(req.body);
  res.json(await requestActivityHint(req.params.attemptId, body.hintLevel));
}));

app.post("/quests/:questId/complete", asyncRoute(async (req, res) => {
  res.json(await completeQuest(req.params.questId));
}));

app.post("/child-profiles/:childProfileId/forge/upgrades/:upgradeKey", asyncRoute(async (req, res) => {
  res.json(await buyForgeUpgrade(req.params.childProfileId, req.params.upgradeKey));
}));

app.get("/child-profiles/:childProfileId/parent-summary", asyncRoute(async (req, res) => {
  res.json(await parentSummary(req.params.childProfileId));
}));

app.get("/student-profiles/:studentProfileId/parent-summary", asyncRoute(async (req, res) => {
  res.json(await parentSummary(req.params.studentProfileId));
}));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Validation failed", issues: error.issues });
    return;
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message.includes("not found") ? 404 : 400;
  res.status(status).json({ error: message });
});
