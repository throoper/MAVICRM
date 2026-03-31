import type { Upsell } from "../types";

export const upsellData: Upsell[] = [
  {
    id: "ups-001",
    contractId: "c-002",
    companyId: "comp-001",
    companyName: "Apex Financial Group",
    talentId: "t-002",
    talentName: "Carlos Mendez",
    status: "Proposed",
    currentHoursPerWeek: 20,
    proposedHoursPerWeek: 40,
    expansionValue: 4160, // 20 extra hrs * $52/hr * 4 weeks
    dateIdentified: "2026-02-18",
    targetCloseDate: "2026-04-15",
    owner: "Dave",
    notes: "Tom Bradley mentioned their AR workload has doubled since they onboarded a new division. Carlos is already exceeding expectations on the part-time engagement and the client has expressed interest in moving him to full-time. Strong candidate for conversion — Carlos is also open to increasing his hours.",
    actionLog: [
      {
        id: "act-ups-001",
        date: "2026-02-18",
        author: "Dave",
        note: "Tom mentioned increased AR workload during quarterly check-in. Flagged as potential upsell.",
      },
      {
        id: "act-ups-002",
        date: "2026-02-25",
        author: "Dave",
        note: "Confirmed with Carlos that he's open to full-time. His other engagement ends in April.",
      },
      {
        id: "act-ups-003",
        date: "2026-03-10",
        author: "Dave",
        note: "Sent formal proposal to Tom for full-time conversion at current rate. Awaiting budget approval from Sarah Mitchell.",
      },
    ],
  },
  {
    id: "ups-002",
    contractId: "c-008",
    companyId: "comp-006",
    companyName: "Falcon Security Systems",
    talentId: "t-008",
    talentName: "Yuki Tanaka",
    status: "Identified",
    currentHoursPerWeek: 25,
    proposedHoursPerWeek: 40,
    expansionValue: 4680, // 15 extra hrs * $78/hr * 4 weeks
    dateIdentified: "2026-03-20",
    targetCloseDate: "2026-05-30",
    owner: "Kath",
    notes: "Gregory Stone's team is preparing for a major DCAA audit in Q3. Current 25 hrs/week won't be enough to handle both ongoing SOX compliance and the additional audit prep. Yuki has the bandwidth and the skills — this is a natural expansion.",
    actionLog: [
      {
        id: "act-ups-004",
        date: "2026-03-20",
        author: "Kath",
        note: "Gregory mentioned upcoming DCAA audit during status call. Team is stretched thin — need more hours from Yuki.",
      },
    ],
  },
];
