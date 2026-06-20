import { PrismaClient } from "@prisma/client";
import { activityTemplates, forgeUpgrades, skillDomains, skills, subjects } from "../packages/shared/src/index.js";

const prisma = new PrismaClient();

async function main() {
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { id: subject.id },
      update: {
        name: subject.name,
        slug: subject.slug,
        roomName: subject.roomName,
        description: subject.description,
        status: subject.status,
        isActive: subject.isActive,
        displayOrder: subject.displayOrder
      },
      create: {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        roomName: subject.roomName,
        description: subject.description,
        status: subject.status,
        isActive: subject.isActive,
        displayOrder: subject.displayOrder
      }
    });
  }

  for (const domain of skillDomains) {
    await prisma.skillDomain.upsert({
      where: { id: domain.id },
      update: {
        subjectId: domain.subjectId,
        name: domain.name,
        slug: domain.slug,
        description: domain.description,
        status: domain.status,
        displayOrder: domain.displayOrder
      },
      create: {
        id: domain.id,
        subjectId: domain.subjectId,
        name: domain.name,
        slug: domain.slug,
        description: domain.description,
        status: domain.status,
        displayOrder: domain.displayOrder
      }
    });
  }

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {
        subjectId: skill.subjectId,
        domainId: skill.domainId,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        gradeBand: skill.gradeBand,
        status: skill.status,
        displayOrder: skill.displayOrder
      },
      create: {
        id: skill.id,
        subjectId: skill.subjectId,
        domainId: skill.domainId,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        gradeBand: skill.gradeBand,
        status: skill.status,
        displayOrder: skill.displayOrder
      }
    });
  }

  for (const template of activityTemplates) {
    await prisma.activityTemplate.upsert({
      where: { id: template.id },
      update: {
        subjectId: template.subjectId,
        domainId: template.domainId,
        skillId: template.skillId,
        activityType: template.activityType,
        key: template.key ?? template.activityType,
        title: template.title,
        description: template.description,
        answerFormat: template.answerFormat,
        difficultyMin: template.difficultyMin,
        difficultyMax: template.difficultyMax,
        generatorKey: template.generatorKey,
        validatorKey: template.validatorKey,
        aiAssistAllowed: template.aiAssistAllowed,
        status: template.status,
        isActive: template.isActive
      },
      create: {
        id: template.id,
        subjectId: template.subjectId,
        domainId: template.domainId,
        skillId: template.skillId,
        activityType: template.activityType,
        key: template.key ?? template.activityType,
        title: template.title,
        description: template.description,
        answerFormat: template.answerFormat,
        difficultyMin: template.difficultyMin,
        difficultyMax: template.difficultyMax,
        generatorKey: template.generatorKey,
        validatorKey: template.validatorKey,
        aiAssistAllowed: template.aiAssistAllowed,
        status: template.status,
        isActive: template.isActive
      }
    });
  }

  for (const upgrade of forgeUpgrades) {
    await prisma.roomUpgrade.upsert({
      where: { key: upgrade.key },
      update: {
        subjectKey: upgrade.key === "crystal_lamp" ? "vocabulary" : "math",
        name: upgrade.name,
        cost: upgrade.cost,
        maxLevel: upgrade.maxLevel,
        isActive: true
      },
      create: {
        id: `room_upgrade_${upgrade.key}`,
        key: upgrade.key,
        subjectKey: upgrade.key === "crystal_lamp" ? "vocabulary" : "math",
        name: upgrade.name,
        cost: upgrade.cost,
        maxLevel: upgrade.maxLevel,
        isActive: true
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
