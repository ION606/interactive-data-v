# Interactive Data Visualization Paper Part I

## Itamar Oren-Naftalovich

<br>

## A. Problem Identification

### 1. Core problem

Kubernetes now has thousands of active code contributors and 50k+ production deployments, but the maintainers, contributors, and downstream user feedback collaboration graph is not well surfaced; who the people are that look at code, where the new folks start, and what holds back end-users is all too often determined by tacit knowledge rather than data-driven insight ([CNCF][1], [Edge Delta][2]).

### 2. Guiding questions

-   How centralized are review and merge decisions among SIG-level maintainers relative to the broader contributor pool?
-   Which contributor cohorts (new, occasional, sustained) accelerate or delay pull-request (PR) throughput?
-   How does end-user issue traffic (bug vs. feature vs. security) correlate with release cadence and SIG ownership?
-   Where do onboarding bottlenecks occur along the contributor ladder (member → reviewer → approver → maintainer)?([Kubernetes][3])
-   Are there “silent” end-user segments whose operational pain never reaches core maintainers?

## B. Objectives

| #   | Objective                                                         | Key data relationships to show                        |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Expose structural roles (maintainer vs. reviewer vs. contributor) | Network centrality, node type comparison              |
| 2   | Reveal PR life-cycle efficiency over releases                     | Time-series distribution, box-plot of PR age          |
| 3   | Show newcomer retention/attrition across the ladder               | Sankey flow from first PR to sustained activity       |
| 4   | Correlate end-user-filed issues with SIG ownership                | Bipartite mapping, heat-map intensity                 |
| 5   | Highlight geographic & company diversity trends                   | Stacked area over time, categorical breakdown         |
| 6   | Surface feedback loops that close performance gaps                | Lag correlation between issue labels and merged fixes |

## C. Audience Analysis

| Segment                     | Primary/Secondary | Demographics                        | Lifestyle & Work Context             | Occupation                     | Education         | Topic Knowledge | Interest | Tasks w/ Viz                                      |
| --------------------------- | ----------------- | ----------------------------------- | ------------------------------------ | ------------------------------ | ----------------- | --------------- | -------- | ------------------------------------------------- |
| Core Maintainers            | Primary           | 30–50, global; heavy OSS experience | Volunteer + employer-sponsored hours | Principal engineers, SIG leads | B.Sc.–M.Sc.       | Deep internals  | High     | Assess workload balance, discover triage hotspots |
| Active Contributors         | Primary           | 20–45; distributed                  | “Side project” evenings, hackathons  | Software devs, SREs            | B.Sc.             | Medium          | High     | Find entry points, mentors, open PR queues        |
| End-User Platform Engineers | Primary           | 25–55; enterprise or start-up       | On-call rotations, CI/CD ownership   | DevOps leads                   | B.Sc.             | Operational     | High     | Escalate issues, track fix velocity               |
| CNCF Program Managers       | Secondary         | 30–60                               | Conference & report cycles           | Community mgrs.                | B.A.–M.B.A.       | Surface-level   | Medium   | Report contributor diversity & growth             |
| Researchers & Educators     | Secondary         | 25–65                               | Academic calendars                   | Faculty, grad students         | M.Sc.–Ph.D.       | Theory          | Medium   | Mine data for OSS governance studies              |
| Prospective Contributors    | Secondary         | 18–35                               | Learning & job-seekers               | Junior devs, students          | High-school–B.Sc. | Low             | High     | Locate “good first issue,” mentors                |

## D. Design Implications

### 1. Interface considerations

-   **Role-aware dashboards**—default view switches between Maintainer, Contributor, or End-User mode to declutter metrics that are irrelevant to a persona.
-   **Dynamic filtering** on SIG, label, or release milestone; maintainers need macro filters, newcomers need micro filters.
-   **Accessible globalization**: color-blind safe palettes and unicode-safe names for international contributors (over 52 % of users are US-based but the rest span six continents)([Edge Delta][2]).

### 2. Visualization principles

-   Use **network graphs** with progressive disclosure (expand neighbor radius on hover) to avoid “hairball” overload.
-   Pair **distribution + trend** (e.g., violin for PR age alongside 30-day rolling mean) for temporal metrics.
-   Annotate **release cut dates** (Kubernetes rolls four releases per year) to align spikes with events([Kubernetes][4]).
-   Maintain **small-multiple grids** for cross-persona comparison rather than one dense mega-chart.

## E. User Profiles / Personas

| Persona                                            | Snapshot                                                                                                 | Key Tasks                                                                                                                             |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Ada the Architect (Maintainer)**                 | 42, Berlin; principal engineer at a cloud provider; PhD in CS; deep scheduler and scalability expert     | • Identify which SIG maintainers are overloaded with reviews<br>• Spot neglected or stalled Kubernetes Enhancement Proposals (KEPs)   |
| **Ben the Busy Reviewer (Contributor)**            | 29, São Paulo; site reliability engineer at a fintech; B.Sc. in CE; contributes on evenings and weekends | • Find open PRs tagged with his expertise areas<br>• Monitor his personal PR turnaround time and merge latency                        |
| **Chloe the Newcomer (Contributor)**               | 22, Toronto; recent CS graduate; self-taught in containers; eager to break into OSS                      | • Locate “good first issue” PRs or issues with mentor assignment<br>• Track her progress from first PR to reviewer status             |
| **Deepa the DevOps Lead (End-User)**               | 35, Bangalore; runs 200-node production clusters; MBA + B.S. EE; on-call for critical incidents          | • Correlate open bug counts and severity with upcoming upgrade plans<br>• Gauge average time from issue report to patch release       |
| **Evan the Educator (Researcher)**                 | 55, Boston; professor of Software Engineering; Ph.D.; studies OSS governance and community dynamics      | • Export raw network and time-series data for academic analysis<br>• Examine long-term trends in contributor roles evolution          |
| **Farah the Foundation PM (CNCF Program Manager)** | 38, San Francisco; MBA; compiles quarterly community and diversity reports for CNCF leadership           | • Generate high-level charts showing contributor growth and diversity<br>• Illustrate per-release participation rates by organization |

**Persona-driven content choices**

-   Ada & Ben need **ownership overlays** (who reviews what).
-   Chloe needs **on-ramp indicators** (issues tagged `good-first-issue` vs. mentor availability).
-   Deepa wants **issue-to-patch lead-time charts** filtered by severity.
-   Evan needs **export options** (CSV/GraphML) and longitudinal trends.
-   Farah values **high-level diversity infographics** for annual reports.

## F. Data Relationships Selection

### 1. Relationships to evaluate

| #   | Relationship & Chart Type                                                    | **Data Compared**                                                                          | **Filter Variables**                                     | **Extra Detail via Tooltip / Pop-up**                                                                   |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | **Degree centrality vs. role rank**<br/>_(network scatter / strip plot)_     | Node degree and betweenness ⟶ _y-axis_<br/>Role hierarchy (member → maintainer) ⟶ _x-axis_ | Time window, SIG, company, geo region                    | Card shows: contributor handle, exact centrality values, PRs reviewed, first-contrib date, current role |
| 2   | **PR age distribution by release**<br/>_(violin + box, per release)_         | Time-to-merge (hrs) for every PR; grouped by release tag                                   | Release series, SIG, label (`bug`,`feature`), org        | Hover violin slice to show count, median, p90 age; click to open list of longest-running PRs            |
| 3   | **Contributor-ladder transition flow**<br/>_(Sankey / alluvial)_             | Counts moving: _first PR_ → _≥ 3 PRs_ → _reviewer_ → _approver_ → _maintainer_             | Cohort year, SIG, employer type (vendor / user)          | Node tooltip: retention %, avg days in stage; edge tooltip: # who progressed / dropped                  |
| 4   | **Geographic diversity over time**<br/>_(stacked area or ridgeline)_         | Contributors per ISO-country over months                                                   | Continent toggle, company vs. individual, role filter    | Hover country slice: exact counts, % of total, first-time contributors this month                       |
| 5   | **Company affiliation vs. contribution volume**<br/>_(stacked bar / stream)_ | Commits & reviews per company per quarter                                                  | Quarter range, role (code / review / docs), code-area    | Tooltip: company logo, top 3 employees, % share of total activity, trend arrow vs. last quarter         |

### 2. Team-member assignment

Itamar Oren-Naftalovich: Everything

---

### References

-   Kubernetes Roles & Responsibilities page⁠([Kubernetes][3])
-   Community membership ladder doc (member → reviewer → approver)⁠([Kubernetes][5])
-   Kubernetes v1.30 release blog (cadence & milestones)⁠([Kubernetes][4])
-   CNCF Kubernetes Project Journey Report (7,800 orgs contributing)⁠([CNCF][1])
-   Edge Delta 2025 adoption statistics (96 % enterprise use, 50 k users)⁠([Edge Delta][2])
-   CNCF Annual Survey 2024 (750 respondents; cloud-native penetration)⁠([CNCF][6])
-   OWNERS file governance guide⁠([Kubernetes Contributors][7])
-   Kubernetes Code-of-Conduct (maintainer rights & duties)⁠([Kubernetes][8])
-   SIG Scheduling spotlight interview (maintainer responsibilities example)⁠([Kubernetes][9])
-   Kubernetes Release Team README (milestone-maintainers role)⁠([Kubernetes][10])
-   NextPlatform analysis of resource over-provisioning by K8s users (illustrates end-user pain points)⁠([The Next Platform][11])
-   OpenSource.com article on Kubernetes solving real-world orchestration problems⁠([opensource.com][12])

[1]: https://www.cncf.io/reports/kubernetes-project-journey-report/?utm_source=chatgpt.com "Kubernetes Project Journey Report | CNCF"
[2]: https://edgedelta.com/company/blog/kubernetes-adoption-statistics "Latest Kubernetes Adoption Statistics: Global Insights"
[3]: https://kubernetes.io/docs/contribute/participate/roles-and-responsibilities/?utm_source=chatgpt.com "Roles and responsibilities | Kubernetes"
[4]: https://kubernetes.io/blog/2024/04/17/kubernetes-v1-30-release/?utm_source=chatgpt.com "Kubernetes v1.30: Uwubernetes"
[5]: https://kubernetes.io/docs/contribute/participate/?utm_source=chatgpt.com "Participating in SIG Docs - Kubernetes"
[6]: https://www.cncf.io/reports/cncf-annual-survey-2024/ "Cloud Native 2024: Approaching a Decade of Code, Cloud, and Change | CNCF"
[7]: https://www.kubernetes.dev/docs/guide/owners/?utm_source=chatgpt.com "OWNERS Files - Kubernetes Contributors"
[8]: https://kubernetes.io/community/static/cncf-code-of-conduct/?utm_source=chatgpt.com "CNCF Community Code of Conduct v1.3 - Kubernetes"
[9]: https://kubernetes.io/blog/2024/09/24/sig-scheduling-spotlight-2024/?utm_source=chatgpt.com "Spotlight on SIG Scheduling - Kubernetes"
[10]: https://kubernetes.io/releases/release/?utm_source=chatgpt.com "Kubernetes Release Cycle"
[11]: https://www.nextplatform.com/2024/03/04/kubernetes-clusters-have-massive-overprovisioning-of-compute-and-memory/?utm_source=chatgpt.com "Kubernetes Clusters Have Massive Overprovisioning Of Compute ..."
[12]: https://opensource.com/article/18/1/5-reasons-kubernetes-real-deal?utm_source=chatgpt.com "5 reasons Kubernetes is the real deal - Opensource.com"
