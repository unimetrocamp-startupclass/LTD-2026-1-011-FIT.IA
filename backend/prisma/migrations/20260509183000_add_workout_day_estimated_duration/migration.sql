ALTER TABLE "WorkoutDay"
ADD COLUMN "estimatedDurationInSeconds" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "WorkoutDay"
ALTER COLUMN "estimatedDurationInSeconds" DROP DEFAULT;
