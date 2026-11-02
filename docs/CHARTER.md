# AGUA EN SEGUIMIENTO - PRODUCT CHARTER

Version: 1.0 | Founder: Isabella Zevada | Date: 29 October 2026

Written before the Week 12 rebuild. This charter governs the core build for Weeks 12-17. It describes intended behavior, not functionality or outcomes already validated. The existing Week 11 prototype is the source venture.

## VISION

In three years, Agua en seguimiento aims to help small household water-support programs coordinate leak cases from a reported problem to a documented, verified outcome. Coordinators should be able to see who owns each case, what happens next and why it remains pending without reconstructing the history across separate messages. The product will support accountable follow-up while preserving household participation and honest service limits; it will not claim to create repair capacity, funding or water supply. A foundation or support program is a possible payer, while households would receive pilot support free of charge; neither funding nor willingness to pay has been confirmed.

## USERS

**Primary user:** a coordinator in a small program supporting households with water leaks, initially managing up to ten cases in one area. The coordinator registers and updates cases, assigns responsibility, records the next action and follow-up date, and reviews evidence before closure. This user definition is a hypothesis to validate with a real coordinator.

**Beneficiary and participating actor:** an adult household representative who reports the problem, agrees to contact and access, and confirms whether water loss continues after a repair. Initial contact can occur outside the app through an agreed channel; the household does not need an account for the Week 12 core workflow.

**Supporting actor:** a plumber or authorized verifier provides work details and a suitable functional check. The coordinator records this evidence; a separate provider portal is outside the initial build. The coordinator's identity and the person who performed the check must remain distinguishable.

Laura, age 54, is a fictional coordinator used for synthetic usability review. She is not an interviewed customer. Current workflows, willingness to use the product and willingness to pay remain unverified.

## PRINCIPLES

1. **A reported repair is not a verified resolution.** Closing a case requires a dated repair record, a functional check under suitable water-supply conditions and household confirmation that the reported loss has stopped. Record who checked, how, when and the outcome. Missing or inconclusive evidence keeps the case pending. A household report of continued loss blocks closure or reopens the case for review. Stored records document the check; the software does not independently establish physical truth.
2. **Every active case has an owner and a next step.** Require a responsible person, a specific next action and a follow-up date. Make overdue actions and barriers visible. A referral, unanswered message or automatic acknowledgment does not count as resolution. Lack of household response is not proof of resolution or a reason to blame the household.
3. **The household retains control.** Explain service limits and agreed contact arrangements, ask permission before sharing identifiable information and allow inaccurate records to be corrected. Collect only information needed for follow-up. The rebuilt app requires authenticated access and database row-level security so coordinators can access only their authorized cases. Demos use labeled fictional data.
4. **Measure the underlying benefit, not activity counts.** The shadow clause is that the product must never reward sensor installations, fast closures or completed visits as if they proved a leak was resolved. Keep repaired, verification-pending, referred and unresolved outcomes distinct. Do not exclude a difficult household merely to improve metrics.
5. **Fit the service to real capacity and evidence.** Confirm available staff, repair scope and resources before promising appointments. Prefer a simpler option when it achieves equivalent results at lower total cost. AI and sensors are optional; uncertainty and simulated output must be explicit. Do not claim 10:1 without an equivalent-task comparison at comparable accuracy.

## NON-GOALS

- Never diagnose a leak conclusively from an automated alert, certify drinking-water safety or promise a guaranteed repair or water supply.
- Never close a case automatically because a plumber marked work complete, a deadline passed, a sensor stopped transmitting or a household stopped responding.
- Never replace qualified field judgment, household confirmation or the authority responsible for public-network problems.
- Never sell household information, create public household rankings or use private data for unrelated profiling.
- Never present hypothetical savings, synthetic personas or simulated tests as measured customer outcomes.

**Week 12 scope cut:** one authenticated coordinator workflow: input a case, apply the responsibility-and-verification rules, display the resulting status and missing requirements, and save the record. Editing and reloading must preserve valid state. Home, /product and /about explain this same core. No sensor integration, AI diagnosis, provider marketplace, payments, route optimization, household portal or automated messaging is included. These are outside the current build, not promised future features.

## NORTH STAR

**Verified resolution rate for the intake cohort:** the percentage of accepted pilot cases with documented repair, a conclusive functional check and household confirmation, without a subsequent unresolved reopening at the reporting cutoff.

Formula: qualifying verified cases / all accepted cases in the cohort x 100.

Report cohort intake dates, case count and cutoff date alongside the rate. Pending, referred, unreachable and reopened cases remain in the denominator; rejected or out-of-scope requests are recorded separately and never called resolved. Report zero accepted cases as "no cases yet," not 0% or 100%. No real pilot result is currently available. The metric evaluates the service outcome; prototype task time is a separate validation measure, not proof of water savings.

## CORE CONCEPTS

| Concept | Definition |
| --- | --- |
| Household | The beneficiary unit represented by an adult who participates in the case and its confirmation. |
| Case | A saved record of one reported household water-loss problem and its follow-up history. |
| Owner | The named person accountable for advancing a case and checking its next action. |
| Next action | A specific pending task with an owner and follow-up date. |
| Repair | Documented corrective work reported as completed, which still requires verification. |
| Verification | A dated record of a suitable functional check, its performer and result, plus household confirmation. |
| Evidence | The minimum relevant observations and work records supporting a status change, with source and date. |
| Status | An explicit case state: reported, repair pending, verification pending, verified resolved, referred or reopened. |

New features must operate on these concepts and support the core workflow. Changes to the promise, closure rules or metric require a versioned charter update before implementation.
