import type { EmailTemplate, ScheduledEmail } from "../types";

export const emailTemplateData: EmailTemplate[] = [
  {
    id: "et-001",
    name: "Trial Check-In",
    recipient: "Client",
    triggerDays: 7,
    triggerFrom: "trial start",
    recurring: false,
    subject: "Checking in: How's the first week with {{talentName}}?",
    body: `Hi {{contactName}},

It's been one week since {{talentName}} started their trial engagement with {{companyName}}, and we wanted to check in.

We'd love to hear how things are going so far:
- Is {{talentName}} meeting your initial expectations?
- Are there any questions or concerns we can address early?
- Is there anything we can do to make the onboarding smoother?

Your feedback at this stage helps us ensure a great fit for both sides. Please don't hesitate to reach out anytime.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-002",
    name: "Trial Completion Confirmation",
    recipient: "Client",
    triggerDays: 13,
    triggerFrom: "trial start",
    recurring: false,
    subject: "Trial wrap-up: {{talentName}} at {{companyName}}",
    body: `Hi {{contactName}},

{{talentName}}'s trial period at {{companyName}} is coming to a close. We'd like to discuss next steps with you.

A few things to consider:
- Are you satisfied with {{talentName}}'s work quality and communication?
- Would you like to move forward with a long-term engagement?
- Are there any adjustments you'd like to see before committing?

Please let us know your thoughts, and we'll schedule a quick call to finalize the details.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-003",
    name: "First Month Check-In",
    recipient: "Client",
    triggerDays: 14,
    triggerFrom: "long-term engagement start",
    recurring: false,
    subject: "First month update: {{talentName}} at {{companyName}}",
    body: `Hi {{contactName}},

It's been two weeks since {{talentName}} transitioned to a long-term engagement with {{companyName}}. We wanted to touch base and see how things are progressing.

At this stage we like to confirm:
- Is the workload and scope aligned with your expectations?
- Is {{talentName}} integrating well with your team?
- Are there any performance or communication areas we should address?

We're committed to making this partnership a success. Let us know if there's anything we can help with.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-004",
    name: "Monthly Check-In",
    recipient: "Client",
    triggerDays: 45,
    triggerFrom: "long-term engagement start",
    recurring: false,
    subject: "Monthly check-in: {{talentName}} at {{companyName}}",
    body: `Hi {{contactName}},

This is your monthly check-in from the MAVI team regarding {{talentName}}'s engagement with {{companyName}}.

We'd like to hear how things are going:
- Is {{talentName}} meeting your expectations?
- Are there any concerns or feedback you'd like to share?
- Do you have any upcoming needs or changes to the scope we should know about?

Feel free to reply to this email or schedule a call with your account manager.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-005",
    name: "Quarter Check-In",
    recipient: "Client",
    triggerDays: 90,
    triggerFrom: "long-term engagement start",
    recurring: false,
    subject: "Quarterly review: {{companyName}} + MAVI Partnership",
    body: `Hi {{contactName}},

We've hit the 90-day mark in {{talentName}}'s long-term engagement with {{companyName}}, and we'd love to schedule a quarterly review.

This is a great opportunity to:
- Review {{talentName}}'s performance and deliverables
- Discuss any adjustments to hours, scope, or expectations
- Talk about upcoming needs or potential expansion

We'll prepare a brief performance summary ahead of the call. Please let us know your availability this week or next.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-006",
    name: "Quarterly Recurring Check-In",
    recipient: "Client",
    triggerDays: 90,
    triggerFrom: "previous check-in",
    recurring: true,
    subject: "Quarterly check-in: {{companyName}} + MAVI Partnership",
    body: `Hi {{contactName}},

It's time for our quarterly check-in on the {{companyName}}-MAVI partnership.

Here's what we'd like to cover:
- Overall performance review for {{talentName}}
- Hours utilization and workload balance
- Any upcoming projects, deadlines, or staffing needs
- Open issues or areas for improvement

Please let us know a convenient time for a 30-minute call, or feel free to share your feedback directly via email.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-007",
    name: "Annual Appraisal",
    recipient: "Client",
    triggerDays: 365,
    triggerFrom: "trial start, then recurring yearly",
    recurring: true,
    subject: "Annual review: {{talentName}} at {{companyName}}",
    body: `Hi {{contactName}},

We're approaching the one-year anniversary of {{talentName}}'s engagement with {{companyName}}. Congratulations on a successful partnership!

We'd like to schedule an annual review to discuss:
- {{talentName}}'s overall performance and contributions over the past year
- Contract renewal terms and any rate adjustments
- Expansion opportunities — are there additional roles we can help fill?
- Your overall satisfaction with the MAVI partnership

This is an important milestone for us, and we want to make sure we continue delivering value. We'll prepare a comprehensive performance and utilization report ahead of the meeting.

Best regards,
The MAVI Team`,
  },
  // ── Talent Templates ────────────────────────────────────────────
  {
    id: "et-t01",
    name: "Trial Check-In",
    recipient: "Talent",
    triggerDays: 7,
    triggerFrom: "trial start",
    recurring: false,
    subject: "How's your first week at {{companyName}}?",
    body: `Hi {{talentName}},

It's been one week since you started your trial engagement with {{companyName}}, and we wanted to check in on how things are going.

We'd love to hear:
- How are you finding the work and the team?
- Is the scope and workload what you expected?
- Are there any challenges or concerns we can help with?
- Do you have everything you need to be successful?

Your feedback helps us make sure this is a great fit. Don't hesitate to reach out to your account manager anytime.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-t02",
    name: "Trial Completion Confirmation",
    recipient: "Talent",
    triggerDays: 13,
    triggerFrom: "trial start",
    recurring: false,
    subject: "Trial wrap-up: Your engagement with {{companyName}}",
    body: `Hi {{talentName}},

Your trial period with {{companyName}} is wrapping up. We'd like to hear your thoughts before we discuss next steps.

A few things we'd like to know:
- How has the experience been overall?
- Is this a client you'd like to continue working with long-term?
- Are there any concerns about workload, communication, or expectations?
- Is there anything you'd want changed before committing to a long-term engagement?

We'll be in touch shortly to discuss the path forward.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-t03",
    name: "First Month Check-In",
    recipient: "Talent",
    triggerDays: 14,
    triggerFrom: "long-term engagement start",
    recurring: false,
    subject: "First month check-in: Your work with {{companyName}}",
    body: `Hi {{talentName}},

It's been two weeks since your long-term engagement with {{companyName}} began. We wanted to make sure everything is going smoothly.

We'd like to hear about:
- How the transition from trial to long-term has been
- Whether the workload matches what was discussed
- How communication with the client team is going
- Any support you need from us

We're here to make sure you're set up for success. Please reply or schedule a call with your account manager.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-t04",
    name: "Monthly Check-In",
    recipient: "Talent",
    triggerDays: 45,
    triggerFrom: "long-term engagement start",
    recurring: false,
    subject: "Monthly check-in: How's everything going at {{companyName}}?",
    body: `Hi {{talentName}},

This is your monthly check-in from the MAVI team regarding your engagement with {{companyName}}.

We'd like to hear:
- How are things going with the work?
- Are you happy with the engagement?
- Any concerns about hours, scope, or communication?
- Is there anything we can do to improve your experience?

Your satisfaction is important to us. Feel free to reply or reach out anytime.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-t05",
    name: "Quarter Check-In",
    recipient: "Talent",
    triggerDays: 90,
    triggerFrom: "long-term engagement start",
    recurring: false,
    subject: "Quarterly check-in: Your engagement with {{companyName}}",
    body: `Hi {{talentName}},

You've been working with {{companyName}} for 90 days now, and we'd love to do a quarterly check-in.

We'd like to cover:
- Your overall satisfaction with the engagement
- Whether the work is challenging and fulfilling
- Any feedback on the client team or working relationship
- Career development — are there skills you'd like to grow?
- Any concerns about your rate, hours, or working conditions

We value your partnership and want to make sure this continues to be a great experience for you.

Best regards,
The MAVI Team`,
  },
  {
    id: "et-t06",
    name: "Quarterly Recurring Check-In",
    recipient: "Talent",
    triggerDays: 90,
    triggerFrom: "previous check-in",
    recurring: true,
    subject: "Quarterly check-in: Your work with {{companyName}}",
    body: `Hi {{talentName}},

It's time for our quarterly check-in on your engagement with {{companyName}}.

We'd like to hear about:
- How the work has been going this quarter
- Your satisfaction with the engagement
- Any changes in workload, scope, or expectations
- Whether you feel supported by both the client and MAVI
- Any feedback or concerns you'd like to raise

Please take a moment to share your thoughts — it helps us ensure we're supporting you effectively.

Best regards,
The MAVI Team`,
  },
];

export const scheduledEmailData: ScheduledEmail[] = [
  {
    id: "se-001",
    templateId: "et-006",
    companyId: "comp-001",
    companyName: "Apex Financial Group",
    nextSendDate: "2026-04-15",
    lastSentDate: "2026-01-15",
    status: "Active",
  },
  {
    id: "se-002",
    templateId: "et-006",
    companyId: "comp-002",
    companyName: "Brightstone Healthcare",
    nextSendDate: "2026-04-01",
    lastSentDate: "2026-01-01",
    status: "Active",
  },
  {
    id: "se-003",
    templateId: "et-001",
    companyId: "comp-007",
    companyName: "Greenfield Ventures",
    nextSendDate: "2026-01-22",
    lastSentDate: null,
    status: "Active",
  },
  {
    id: "se-004",
    templateId: "et-002",
    companyId: "comp-007",
    companyName: "Greenfield Ventures",
    nextSendDate: "2026-01-28",
    lastSentDate: null,
    status: "Active",
  },
  {
    id: "se-005",
    templateId: "et-006",
    companyId: "comp-005",
    companyName: "Evergreen Logistics",
    nextSendDate: "2026-04-12",
    lastSentDate: "2026-01-12",
    status: "Active",
  },
  {
    id: "se-006",
    templateId: "et-007",
    companyId: "comp-001",
    companyName: "Apex Financial Group",
    nextSendDate: "2026-01-15",
    lastSentDate: null,
    status: "Active",
  },
  {
    id: "se-007",
    templateId: "et-006",
    companyId: "comp-006",
    companyName: "Falcon Security Systems",
    nextSendDate: "2026-05-10",
    lastSentDate: "2026-02-10",
    status: "Active",
  },
  {
    id: "se-008",
    templateId: "et-007",
    companyId: "comp-006",
    companyName: "Falcon Security Systems",
    nextSendDate: "2026-01-10",
    lastSentDate: null,
    status: "Active",
  },
  {
    id: "se-009",
    templateId: "et-006",
    companyId: "comp-008",
    companyName: "Horizon Retail Co",
    nextSendDate: "2026-04-01",
    lastSentDate: "2026-01-01",
    status: "Active",
  },
  {
    id: "se-010",
    templateId: "et-006",
    companyId: "comp-003",
    companyName: "Cedar Manufacturing",
    nextSendDate: "2026-04-14",
    lastSentDate: "2026-01-14",
    status: "Paused",
  },
];
