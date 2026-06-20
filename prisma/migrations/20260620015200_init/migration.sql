-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('parent', 'child', 'admin');

-- CreateEnum
CREATE TYPE "LearningContentStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('forge', 'fantasy', 'scifi', 'sports');

-- CreateEnum
CREATE TYPE "TutorTone" AS ENUM ('coach', 'rival', 'robot', 'guide');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('daily', 'subject', 'skill', 'boss', 'review', 'custom');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "AnswerFormat" AS ENUM ('multiple_choice', 'numeric', 'text', 'short_text', 'long_text', 'ordered_list', 'matching_pairs', 'classification_groups');

-- CreateEnum
CREATE TYPE "ValidationMode" AS ENUM ('deterministic', 'ai_rubric', 'hybrid');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "parentUserId" TEXT,
    "displayName" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "age" INTEGER,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avatarKey" TEXT NOT NULL,
    "preferredTheme" "Theme" NOT NULL DEFAULT 'forge',
    "tutorTone" "TutorTone" NOT NULL DEFAULT 'coach',
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "LearningContentStatus" NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillDomain" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "LearningContentStatus" NOT NULL DEFAULT 'active',
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "SkillDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gradeBand" TEXT NOT NULL,
    "status" "LearningContentStatus" NOT NULL DEFAULT 'active',
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSkillProgress" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "streakCorrect" INTEGER NOT NULL DEFAULT 0,
    "streakIncorrect" INTEGER NOT NULL DEFAULT 0,
    "currentDifficulty" INTEGER NOT NULL DEFAULT 1,
    "lastPracticedAt" TIMESTAMP(3),

    CONSTRAINT "StudentSkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTemplate" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "answerFormat" "AnswerFormat" NOT NULL,
    "difficultyMin" INTEGER NOT NULL,
    "difficultyMax" INTEGER NOT NULL,
    "generatorKey" TEXT,
    "validatorKey" TEXT,
    "aiAssistAllowed" BOOLEAN NOT NULL DEFAULT false,
    "status" "LearningContentStatus" NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ActivityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "primarySubjectId" TEXT NOT NULL,
    "questType" "QuestType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "flavorText" TEXT,
    "presentation" JSONB,
    "focusSkillId" TEXT,
    "status" "QuestStatus" NOT NULL DEFAULT 'not_started',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalActivities" INTEGER NOT NULL,
    "completedActivities" INTEGER NOT NULL DEFAULT 0,
    "correctActivities" INTEGER NOT NULL DEFAULT 0,
    "totalProblems" INTEGER NOT NULL,
    "correctProblems" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "coinsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttempt" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "activityTemplateId" TEXT,
    "activityType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "stimulus" JSONB,
    "answerFormat" "AnswerFormat" NOT NULL,
    "choices" JSONB,
    "correctAnswer" JSONB,
    "validationMode" "ValidationMode" NOT NULL DEFAULT 'deterministic',
    "rubric" JSONB,
    "submittedAnswer" JSONB,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "difficulty" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER,
    "explanation" TEXT NOT NULL,
    "hintSequence" TEXT[],
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "ActivityAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardInventory" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "unlockedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equippedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForgeUpgrade" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "upgradeKey" TEXT NOT NULL,
    "upgradeName" TEXT NOT NULL,
    "roomKey" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForgeUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomUpgrade" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "subjectKey" TEXT,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "maxLevel" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RoomUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentProfile_parentUserId_idx" ON "StudentProfile"("parentUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SkillDomain_slug_key" ON "SkillDomain"("slug");

-- CreateIndex
CREATE INDEX "SkillDomain_subjectId_idx" ON "SkillDomain"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_subjectId_idx" ON "Skill"("subjectId");

-- CreateIndex
CREATE INDEX "Skill_domainId_idx" ON "Skill"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSkillProgress_studentProfileId_skillId_key" ON "StudentSkillProgress"("studentProfileId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityTemplate_key_key" ON "ActivityTemplate"("key");

-- CreateIndex
CREATE INDEX "ActivityTemplate_subjectId_idx" ON "ActivityTemplate"("subjectId");

-- CreateIndex
CREATE INDEX "ActivityTemplate_domainId_idx" ON "ActivityTemplate"("domainId");

-- CreateIndex
CREATE INDEX "ActivityTemplate_skillId_idx" ON "ActivityTemplate"("skillId");

-- CreateIndex
CREATE INDEX "Quest_studentProfileId_status_idx" ON "Quest"("studentProfileId", "status");

-- CreateIndex
CREATE INDEX "Quest_primarySubjectId_idx" ON "Quest"("primarySubjectId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_questId_idx" ON "ActivityAttempt"("questId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_studentProfileId_answeredAt_idx" ON "ActivityAttempt"("studentProfileId", "answeredAt");

-- CreateIndex
CREATE INDEX "ActivityAttempt_subjectId_idx" ON "ActivityAttempt"("subjectId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_domainId_idx" ON "ActivityAttempt"("domainId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_skillId_idx" ON "ActivityAttempt"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardInventory_studentProfileId_key" ON "RewardInventory"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ForgeUpgrade_studentProfileId_upgradeKey_key" ON "ForgeUpgrade"("studentProfileId", "upgradeKey");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUpgrade_key_key" ON "RoomUpgrade"("key");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDomain" ADD CONSTRAINT "SkillDomain_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "SkillDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillProgress" ADD CONSTRAINT "StudentSkillProgress_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkillProgress" ADD CONSTRAINT "StudentSkillProgress_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTemplate" ADD CONSTRAINT "ActivityTemplate_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTemplate" ADD CONSTRAINT "ActivityTemplate_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "SkillDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTemplate" ADD CONSTRAINT "ActivityTemplate_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_primarySubjectId_fkey" FOREIGN KEY ("primarySubjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "SkillDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_activityTemplateId_fkey" FOREIGN KEY ("activityTemplateId") REFERENCES "ActivityTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardInventory" ADD CONSTRAINT "RewardInventory_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForgeUpgrade" ADD CONSTRAINT "ForgeUpgrade_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

