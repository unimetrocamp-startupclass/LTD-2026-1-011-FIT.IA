---
type: community
cohesion: 0.33
members: 9
---

# Community 1

**Cohesion:** 0.33 - loosely connected
**Members:** 9 nodes

## Members
- [[.execute()_3]] - code - src/usecases/StartWorkoutSession.ts
- [[.execute()_4]] - code - src/usecases/UpdateWorkoutSession.ts
- [[Start Workout Session API Requirement]] - rationale - docs/API_PROMPT.md
- [[Start Workout Session Route Task]] - rationale - task/01.md
- [[StartWorkoutSession]] - code - src/usecases/StartWorkoutSession.ts
- [[Update Workout Session Route Task]] - rationale - task/02.md
- [[UpdateWorkoutSession]] - code - src/usecases/UpdateWorkoutSession.ts
- [[WorkoutSession.ts]] - code - src/generated/prisma/models/WorkoutSession.ts
- [[workoutPlanRoutes()]] - code - src/routes/workout-plan.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_1
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_Community 0]]
- 3 edges to [[_COMMUNITY_Community 6]]
- 3 edges to [[_COMMUNITY_Community 7]]
- 2 edges to [[_COMMUNITY_Community 2]]
- 2 edges to [[_COMMUNITY_Community 3]]
- 1 edge to [[_COMMUNITY_Community 4]]

## Top bridge nodes
- [[WorkoutSession.ts]] - degree 7, connects to 3 communities
- [[Start Workout Session Route Task]] - degree 8, connects to 2 communities
- [[workoutPlanRoutes()]] - degree 5, connects to 2 communities
- [[StartWorkoutSession]] - degree 5, connects to 2 communities
- [[UpdateWorkoutSession]] - degree 4, connects to 2 communities