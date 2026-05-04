export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class WorkoutPlanNotActiveError extends Error {
  constructor(message = "Workout plan is not active") {
    super(message);
    this.name = "WorkoutPlanNotActiveError";
    Object.setPrototypeOf(this, WorkoutPlanNotActiveError.prototype);
  }
}

export class WorkoutSessionAlreadyStartedError extends Error {
  constructor(message = "Workout session already started") {
    super(message);
    this.name = "WorkoutSessionAlreadyStartedError";
    Object.setPrototypeOf(this, WorkoutSessionAlreadyStartedError.prototype);
  }
}

export class WorkoutSessionAlreadyCompletedError extends Error {
  constructor(message = "Workout session is already completed") {
    super(message);
    this.name = "WorkoutSessionAlreadyCompletedError";
    Object.setPrototypeOf(this, WorkoutSessionAlreadyCompletedError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
