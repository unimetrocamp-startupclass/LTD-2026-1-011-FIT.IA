---
type: community
members: 7
---

# Community 5

**Members:** 7 nodes

## Members
- [[.buildConsistencyByDay()]] - code - src/usecases/GetHome.ts
- [[.calculateWorkoutStreak()]] - code - src/usecases/GetHome.ts
- [[.execute()_2]] - code - src/usecases/GetHome.ts
- [[.getCompletedSessionDates()]] - code - src/usecases/GetHome.ts
- [[GetHome]] - code - src/usecases/GetHome.ts
- [[Weekly Consistency in UTC]] - rationale - task/03.md
- [[Workout Streak Calculation]] - rationale - task/03.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_5
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_Community 1]]
- 1 edge to [[_COMMUNITY_Community 0]]
- 1 edge to [[_COMMUNITY_Community 4]]

## Top bridge nodes
- [[GetHome]] - degree 7, connects to 2 communities
- [[Weekly Consistency in UTC]] - degree 2, connects to 1 community