DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkoutExercise'
      AND column_name = 'restTimeinSeconds'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkoutExercise'
      AND column_name = 'restTimeInSeconds'
  ) THEN
    ALTER TABLE "WorkoutExercise"
    RENAME COLUMN "restTimeinSeconds" TO "restTimeInSeconds";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkoutExercise'
      AND column_name = 'restTimeInSeconds'
  ) THEN
    ALTER TABLE "WorkoutExercise"
    ADD COLUMN "restTimeInSeconds" INTEGER NOT NULL DEFAULT 90;

    ALTER TABLE "WorkoutExercise"
    ALTER COLUMN "restTimeInSeconds" DROP DEFAULT;
  END IF;
END $$;
