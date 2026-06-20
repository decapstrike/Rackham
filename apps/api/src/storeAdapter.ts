import * as memoryStore from "./store.js";

const useMemoryStore = process.env.NODE_ENV === "test" || process.env.LEARNINGFORGE_STORE === "memory";

const runtimeStore = useMemoryStore ? memoryStore : await import("./persistentStore.js");

export const buyForgeUpgrade = runtimeStore.buyForgeUpgrade;
export const completeQuest = runtimeStore.completeQuest;
export const createChildProfile = runtimeStore.createChildProfile;
export const createDailyQuest = runtimeStore.createDailyQuest;
export const createRecommendedDailyQuest = runtimeStore.createRecommendedDailyQuest;
export const createStudentProfile = runtimeStore.createStudentProfile;
export const createSubjectDailyQuest = runtimeStore.createSubjectDailyQuest;
export const getHome = runtimeStore.getHome;
export const getNextActivity = runtimeStore.getNextActivity;
export const getNextProblem = runtimeStore.getNextProblem;
export const getSubject = runtimeStore.getSubject;
export const getSubjects = runtimeStore.getSubjects;
export const getStudentHome = runtimeStore.getStudentHome;
export const parentSummary = runtimeStore.parentSummary;
export const requestActivityHint = runtimeStore.requestActivityHint;
export const requestHint = runtimeStore.requestHint;
export const submitActivityAnswer = runtimeStore.submitActivityAnswer;
export const submitAnswer = runtimeStore.submitAnswer;
