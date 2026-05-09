import type {
  getHomeDataResponse,
  getUserTrainDataResponse,
} from "@/app/_lib/api/fetch-generated";

export function hasCompletedOnboarding(
  homeData: getHomeDataResponse,
  trainData: getUserTrainDataResponse,
) {
  return (
    homeData.status === 200 &&
    trainData.status === 200 &&
    Boolean(homeData.data.activeWorkoutPlanId) &&
    Boolean(trainData.data)
  );
}

export function needsOnboarding(
  homeData: getHomeDataResponse,
  trainData: getUserTrainDataResponse,
) {
  return !hasCompletedOnboarding(homeData, trainData);
}
