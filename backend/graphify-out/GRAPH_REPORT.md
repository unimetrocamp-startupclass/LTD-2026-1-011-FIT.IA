# Graph Report - backend  (2026-05-04)

## Corpus Check
- 35 files · ~57,463 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 74 nodes · 151 edges · 8 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f5cc376`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `NotFoundError` - 11 edges
2. `Start Workout Session Route Task` - 8 edges
3. `GetHome` - 7 edges
4. `WorkoutPlanNotActiveError` - 6 edges
5. `ValidationError` - 6 edges
6. `Home API Route Task` - 6 edges
7. `WorkoutSessionAlreadyStartedError` - 5 edges
8. `WorkoutSessionAlreadyCompletedError` - 5 edges
9. `workoutPlanRoutes()` - 5 edges
10. `StartWorkoutSession` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Update Workout Session Route Task` --conceptually_related_to--> `WorkoutSessionAlreadyCompletedError`  [INFERRED]
  task/02.md → src/erros/index.ts
- `Home API Route Task` --references--> `NotFoundError`  [EXTRACTED]
  task/03.md → src/erros/index.ts
- `Home API Route Task` --references--> `GetHome`  [EXTRACTED]
  task/03.md → src/usecases/GetHome.ts
- `Update Workout Session Route Task` --references--> `UpdateWorkoutSession`  [EXTRACTED]
  task/02.md → src/usecases/UpdateWorkoutSession.ts
- `Start Workout Session API Requirement` --semantically_similar_to--> `Start Workout Session Route Task`  [INFERRED] [semantically similar]
  docs/API_PROMPT.md → task/01.md

## Hyperedges (group relationships)
- **Workout Session Lifecycle Flow** — docs_start_workout_session_api, task01_start_workout_session_api, task02_update_workout_session_api, usecases_startworkoutsession_startworkoutsession, usecases_updateworkoutsession_updateworkoutsession, src_generated_prisma_models_workoutsession_ts [EXTRACTED 1.00]
- **Home Endpoint Domain Flow** — task03_home_api, task03_weekly_consistency, task03_workout_streak, routes_home_homeroutes, usecases_gethome_gethome, src_generated_prisma_models_workoutsession_ts [EXTRACTED 1.00]

## Communities (11 total, 4 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.26
Nodes (7): Start Workout Session API Requirement, WorkoutPlanNotActiveError, WorkoutSessionAlreadyStartedError, workoutPlanRoutes(), Start Workout Session Route Task, Update Workout Session Route Task, StartWorkoutSession

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (3): App Service, Postgres Service, GetWorkoutDay

### Community 5 - "Community 5"
Cohesion: 0.48
Nodes (3): Weekly Consistency in UTC, Workout Streak Calculation, GetHome

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (3): Graphify Workflow, Graphify Query Commands, GRAPH_REPORT.md

## Knowledge Gaps
- **3 isolated node(s):** `GRAPH_REPORT.md`, `Graphify Query Commands`, `Postgres Service`
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GetHome` connect `Community 5` to `Community 3`, `Community 6`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `NotFoundError` connect `Community 3` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `GRAPH_REPORT.md`, `Graphify Query Commands`, `Postgres Service` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._