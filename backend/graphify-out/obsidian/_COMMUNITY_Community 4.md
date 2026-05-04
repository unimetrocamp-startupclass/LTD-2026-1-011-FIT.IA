---
type: community
members: 6
---

# Community 4

**Members:** 6 nodes

## Members
- [[.buildConsistencyByDay()]] - code - src/usecases/GetHome.ts
- [[.calculateWorkoutStreak()]] - code - src/usecases/GetHome.ts
- [[.execute()_1]] - code - src/usecases/GetHome.ts
- [[.getCompletedSessionDates()]] - code - src/usecases/GetHome.ts
- [[GetHome]] - code - src/usecases/GetHome.ts
- [[Workout Streak Calculation]] - rationale - task/03.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_4
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Community 2]]
- 1 edge to [[_COMMUNITY_Community 0]]

## Top bridge nodes
- [[GetHome]] - degree 7, connects to 1 community
- [[.buildConsistencyByDay()]] - degree 3, connects to 1 community