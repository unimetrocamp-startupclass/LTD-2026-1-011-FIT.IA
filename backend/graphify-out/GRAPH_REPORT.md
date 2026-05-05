# Graph Report - backend  (2026-05-05)

## Corpus Check
- 38 files · ~58,875 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 86 nodes · 181 edges · 8 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47327a4d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `NotFoundError` - 13 edges
2. `ValidationError` - 8 edges
3. `Start Workout Session Route Task` - 8 edges
4. `GetHome` - 7 edges
5. `GetStats` - 7 edges
6. `WorkoutPlanNotActiveError` - 6 edges
7. `Home API Route Task` - 6 edges
8. `WorkoutSessionAlreadyStartedError` - 5 edges
9. `WorkoutSessionAlreadyCompletedError` - 5 edges
10. `workoutPlanRoutes()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Home API Route Task` --references--> `NotFoundError`  [EXTRACTED]
  task/03.md → src/erros/index.ts
- `Start Workout Session Route Task` --references--> `WorkoutPlanNotActiveError`  [EXTRACTED]
  task/01.md → src/erros/index.ts
- `Start Workout Session Route Task` --references--> `WorkoutSessionAlreadyStartedError`  [EXTRACTED]
  task/01.md → src/erros/index.ts
- `Update Workout Session Route Task` --conceptually_related_to--> `WorkoutSessionAlreadyCompletedError`  [INFERRED]
  task/02.md → src/erros/index.ts
- `Home API Route Task` --references--> `GetHome`  [EXTRACTED]
  task/03.md → src/usecases/GetHome.ts

## Hyperedges (group relationships)
- **Workout Session Lifecycle Flow** — docs_start_workout_session_api, task01_start_workout_session_api, task02_update_workout_session_api, usecases_startworkoutsession_startworkoutsession, usecases_updateworkoutsession_updateworkoutsession, src_generated_prisma_models_workoutsession_ts [EXTRACTED 1.00]
- **Home Endpoint Domain Flow** — task03_home_api, task03_weekly_consistency, task03_workout_streak, routes_home_homeroutes, usecases_gethome_gethome, src_generated_prisma_models_workoutsession_ts [EXTRACTED 1.00]

## Communities (11 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (6): WorkoutPlanNotActiveError, WorkoutSessionAlreadyStartedError, CreateWorkoutPlan, GetWorkoutDay, GetWorkoutPlan, GetWorkoutPlans

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): Start Workout Session API Requirement, WorkoutSessionAlreadyCompletedError, workoutPlanRoutes(), Start Workout Session Route Task, Update Workout Session Route Task, StartWorkoutSession, UpdateWorkoutSession

### Community 4 - "Community 4"
Cohesion: 0.36
Nodes (3): homeRoutes(), statsRoutes(), Home API Route Task

### Community 5 - "Community 5"
Cohesion: 0.48
Nodes (3): Weekly Consistency in UTC, Workout Streak Calculation, GetHome

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): Graphify Workflow, Graphify Query Commands, GRAPH_REPORT.md

## Knowledge Gaps
- **3 isolated node(s):** `GRAPH_REPORT.md`, `Graphify Query Commands`, `Postgres Service`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GetStats` connect `Community 6` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `GetHome` connect `Community 5` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `NotFoundError` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `GRAPH_REPORT.md`, `Graphify Query Commands`, `Postgres Service` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._