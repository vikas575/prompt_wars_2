// src/data/electionData.ts
/**
 * @fileoverview Static election data for India, USA, and UK.
 * Structured to match ElectionData interface. Easily migrated to Firestore.
 * Each country includes timeline, eligibility, ballot types, myths, and quiz questions.
 */
import type {
  ElectionData,
  TimelineEvent,
  VoterEligibility,
  BallotType,
  MythFact,
  QuizQuestion,
} from '@/types';

// ─── Shared Ballot Types ────────────────────────────────────────────────────

const ballotTypes: BallotType[] = [
  {
    id: 'evm',
    name: 'Electronic Voting Machine (EVM)',
    description: 'A tamper-proof electronic device used for casting and counting votes electronically.',
    usedIn: ['IN'],
    pros: ['Fast counting', 'Reduces invalid votes', 'Portable and durable'],
    cons: ['Concerns about hacking (though air-gapped)', 'Requires electricity'],
  },
  {
    id: 'paper',
    name: 'Paper Ballot',
    description: 'A printed sheet where voters mark their choice with a pen or stamp.',
    usedIn: ['UK', 'US'],
    pros: ['Auditable paper trail', 'No electricity needed', 'Widely trusted'],
    cons: ['Slow counting', 'Risk of spoilt ballots', 'Environmental cost'],
  },
  {
    id: 'mailin',
    name: 'Mail-in / Postal Ballot',
    description: 'Ballot mailed to registered voters who return it by post before election day.',
    usedIn: ['US', 'UK'],
    pros: ['Accessible for disabled/remote voters', 'Flexible timing'],
    cons: ['Delayed results', 'Risk of lost mail', 'Requires advance planning'],
  },
];

// ─── INDIA ──────────────────────────────────────────────────────────────────

const indiaTimeline: TimelineEvent[] = [
  { id: 'in-1', stage: 'filing', title: 'Model Code of Conduct', description: 'Election Commission announces MCC — political parties and candidates must follow a code of conduct.', daysRelativeToElection: -60, icon: '📋', country: 'IN' },
  { id: 'in-2', stage: 'filing', title: 'Nomination Filing', description: 'Candidates file nomination papers with Returning Officers.', daysRelativeToElection: -45, icon: '📝', country: 'IN' },
  { id: 'in-3', stage: 'primary', title: 'Scrutiny of Nominations', description: 'Returning Officer examines nomination papers for eligibility.', daysRelativeToElection: -40, icon: '🔍', country: 'IN' },
  { id: 'in-4', stage: 'campaign', title: 'Election Campaign Period', description: 'Parties campaign through rallies, media, and door-to-door visits.', daysRelativeToElection: -30, icon: '📣', country: 'IN' },
  { id: 'in-5', stage: 'campaign', title: 'Campaign Silent Period', description: '48-hour silence period before polling — no campaigning allowed.', daysRelativeToElection: -2, icon: '🔇', country: 'IN' },
  { id: 'in-6', stage: 'voting', title: 'Polling Day', description: 'Voters cast their ballots using Electronic Voting Machines (EVMs).', daysRelativeToElection: 0, icon: '🗳️', country: 'IN' },
  { id: 'in-7', stage: 'counting', title: 'Vote Counting', description: 'EVM results are tallied. Postal ballots counted first, then EVMs.', daysRelativeToElection: 3, icon: '🔢', country: 'IN' },
  { id: 'in-8', stage: 'certification', title: 'Result Declaration', description: 'Winning candidates officially declared by Returning Officers.', daysRelativeToElection: 3, icon: '📢', country: 'IN' },
  { id: 'in-9', stage: 'inauguration', title: 'Government Formation', description: 'Winning party/coalition forms government; Prime Minister sworn in.', daysRelativeToElection: 15, icon: '🏛️', country: 'IN' },
];

const indiaEligibility: VoterEligibility = {
  country: 'IN',
  minimumAge: 18,
  citizenshipRequired: true,
  residencyRequirement: 'Must be ordinarily resident in the constituency',
  registrationDeadlineDays: 10,
  additionalRequirements: [
    'Must be registered on the Electoral Roll',
    'Must possess a valid Voter ID (EPIC) or alternative ID',
    'Must not be of unsound mind (as declared by court)',
    'Must not be disqualified under any law',
  ],
};

const indiaMyths: MythFact[] = [
  {
    id: 'in-myth-1',
    myth: 'EVMs can be hacked remotely to change votes.',
    fact: 'EVMs are completely air-gapped (not connected to any network), making remote hacking impossible.',
    explanation: 'The Election Commission of India has conducted multiple technical audits and public demonstrations showing EVMs are standalone devices with no wireless capability.',
    severity: 'high',
    country: 'IN',
  },
  {
    id: 'in-myth-2',
    myth: 'You need money to run for election in India.',
    fact: 'Any eligible citizen can file nomination. The security deposit for Lok Sabha is ₹25,000 (₹12,500 for SC/ST).',
    explanation: 'The deposit is refunded if the candidate receives more than 1/6th of valid votes, making it accessible to independent candidates.',
    severity: 'medium',
    country: 'IN',
  },
  {
    id: 'in-myth-3',
    myth: 'If you don\'t vote, your vote is given to someone else.',
    fact: 'Uncast votes are never assigned to any candidate. Voter turnout is simply recorded as the percentage who voted.',
    explanation: 'Every vote is individually tracked by EVM button press. An unmade choice remains zero — it cannot be fabricated.',
    severity: 'high',
    country: 'IN',
  },
  {
    id: 'in-myth-4',
    myth: 'The indelible ink can be easily removed with chemicals.',
    fact: 'The silver nitrate ink used in India is designed to react with the skin and cannot be removed for several days.',
    explanation: 'Attempts to remove the ink with thinners, detergents, or oils are ineffective. It remains until the skin cells naturally shed.',
    severity: 'medium',
    country: 'IN',
  },
  {
    id: 'in-myth-5',
    myth: 'If a candidate has a criminal case, they are disqualified.',
    fact: 'Only candidates convicted and sentenced to two or more years of imprisonment are disqualified.',
    explanation: 'Candidates with pending cases (not yet convicted) are legally allowed to contest, but must disclose all cases in their affidavit.',
    severity: 'high',
    country: 'IN',
  },
  {
    id: 'in-myth-6',
    myth: 'The VVPAT slip is just a piece of paper that isn\'t used for counting.',
    fact: 'VVPAT slips provide a physical audit trail. The ECI counts VVPAT slips in 5 randomly selected polling stations per constituency to verify EVM results.',
    explanation: 'Voter Verifiable Paper Audit Trail (VVPAT) allows voters to see their choice on paper for 7 seconds before it drops into a sealed box, ensuring their vote is recorded correctly.',
    severity: 'high',
    country: 'IN',
  },
  {
    id: 'in-myth-7',
    myth: 'An NRI (Non-Resident Indian) can vote via the internet from abroad.',
    fact: 'NRIs can register as overseas voters, but they must be physically present at their polling station in India to cast their vote.',
    explanation: 'While there are discussions about "Electronically Transmitted Postal Ballot System" (ETPBS) for NRIs, it is currently only available for service voters (military).',
    severity: 'medium',
    country: 'IN',
  },
  {
    id: 'in-myth-8',
    myth: 'The Election Commission is a government department controlled by the ruling party.',
    fact: 'The ECI is an independent Constitutional body, similar to the Supreme Court, with protected tenure for its commissioners.',
    explanation: 'Article 324 of the Constitution ensures the ECI operates autonomously. Commissioners can only be removed through a rigorous impeachment process in Parliament.',
    severity: 'high',
    country: 'IN',
  },
];

const indiaQuiz: QuizQuestion[] = [
  {
    id: 'in-q1',
    question: 'What is the minimum voting age in India?',
    options: [{ id: 'a', text: '16' }, { id: 'b', text: '18' }, { id: 'c', text: '21' }, { id: 'd', text: '25' }],
    correctOptionId: 'b',
    explanation: 'The 61st Constitutional Amendment Act (1988) lowered the voting age from 21 to 18 years.',
    difficulty: 'easy',
    category: 'eligibility',
    country: 'IN',
  },
  {
    id: 'in-q2',
    question: 'Which body conducts General Elections in India?',
    options: [{ id: 'a', text: 'Supreme Court' }, { id: 'b', text: 'President of India' }, { id: 'c', text: 'Election Commission of India' }, { id: 'd', text: 'Parliament' }],
    correctOptionId: 'c',
    explanation: 'The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering Union and State election processes.',
    difficulty: 'easy',
    category: 'process',
    country: 'IN',
  },
  {
    id: 'in-q3',
    question: 'What is NOTA on an Indian ballot?',
    options: [{ id: 'a', text: 'National Order of Transparent Administration' }, { id: 'b', text: 'None Of The Above' }, { id: 'c', text: 'National Option for Total Abstinence' }, { id: 'd', text: 'Not On The Agenda' }],
    correctOptionId: 'b',
    explanation: 'NOTA (None Of The Above) allows voters to officially reject all candidates. Introduced by the Supreme Court in 2013.',
    difficulty: 'medium',
    category: 'ballot',
    country: 'IN',
  },
  {
    id: 'in-q4',
    question: 'How long before polling does the campaign silent period begin?',
    options: [{ id: 'a', text: '12 hours' }, { id: 'b', text: '24 hours' }, { id: 'c', text: '48 hours' }, { id: 'd', text: '72 hours' }],
    correctOptionId: 'c',
    explanation: 'Section 126 of the Representation of the People Act prohibits campaigning within 48 hours of polling.',
    difficulty: 'medium',
    category: 'timeline',
    country: 'IN',
  },
  {
    id: 'in-q5',
    question: 'What happens if no party wins majority in the Lok Sabha?',
    options: [{ id: 'a', text: 'Re-election is automatically called' }, { id: 'b', text: 'President\'s Rule is imposed nationwide' }, { id: 'c', text: 'A coalition government is formed' }, { id: 'd', text: 'The outgoing PM continues indefinitely' }],
    correctOptionId: 'c',
    explanation: 'In a hung parliament, parties negotiate to form a coalition that commands majority support, and the President invites the coalition leader to form a government.',
    difficulty: 'hard',
    category: 'process',
    country: 'IN',
  },
];

// ─── USA ─────────────────────────────────────────────────────────────────────

const usaTimeline: TimelineEvent[] = [
  { id: 'us-1', stage: 'primary', title: 'Primary Elections', description: 'Registered party members vote to select their party\'s nominees for general election.', daysRelativeToElection: -180, icon: '🏛️', country: 'US' },
  { id: 'us-2', stage: 'campaign', title: 'National Party Conventions', description: 'Parties formally nominate their presidential and vice-presidential candidates.', daysRelativeToElection: -90, icon: '🎪', country: 'US' },
  { id: 'us-3', stage: 'campaign', title: 'Presidential Debates', description: 'Major party candidates debate policy and leadership on national television.', daysRelativeToElection: -45, icon: '🎙️', country: 'US' },
  { id: 'us-4', stage: 'voting', title: 'Election Day', description: 'Voters cast ballots for electors in the Electoral College (first Tuesday after first Monday in November).', daysRelativeToElection: 0, icon: '🗳️', country: 'US' },
  { id: 'us-5', stage: 'counting', title: 'Vote Counting', description: 'States count ballots including mail-in and absentee votes, which may take days.', daysRelativeToElection: 3, icon: '🔢', country: 'US' },
  { id: 'us-6', stage: 'certification', title: 'Electoral College Vote', description: 'Electors cast their official votes for President in their state capitals.', daysRelativeToElection: 42, icon: '📜', country: 'US' },
  { id: 'us-7', stage: 'certification', title: 'Congressional Certification', description: 'Congress officially counts and certifies Electoral College votes.', daysRelativeToElection: 68, icon: '✅', country: 'US' },
  { id: 'us-8', stage: 'inauguration', title: 'Inauguration Day', description: 'New President is sworn in on January 20th.', daysRelativeToElection: 78, icon: '🏛️', country: 'US' },
];

const usaEligibility: VoterEligibility = {
  country: 'US',
  minimumAge: 18,
  citizenshipRequired: true,
  residencyRequirement: 'Must be a resident of the state where you register',
  registrationDeadlineDays: 30,
  additionalRequirements: [
    'Must register before the state deadline (varies by state)',
    'Some states allow same-day registration',
    'Felons may be disenfranchised (varies by state)',
    'Valid government-issued ID may be required (varies by state)',
  ],
};

const usaMyths: MythFact[] = [
  {
    id: 'us-myth-1',
    myth: 'The popular vote winner always becomes President.',
    fact: 'The US uses the Electoral College. A candidate can win the presidency without winning the popular vote (as happened in 2000 and 2016).',
    explanation: 'Each state has a number of electoral votes equal to its Congressional representation. Most states use winner-takes-all allocation.',
    severity: 'high',
    country: 'US',
  },
  {
    id: 'us-myth-2',
    myth: 'Non-citizens can vote in US federal elections.',
    fact: 'Only US citizens 18 or older may vote in federal elections. Non-citizens voting face criminal penalties.',
    explanation: 'Some local jurisdictions permit non-citizen voting in local elections only, but federal elections require citizenship.',
    severity: 'high',
    country: 'US',
  },
  {
    id: 'us-myth-3',
    myth: 'You have to re-register every time there is an election.',
    fact: 'In most states, your registration remains active as long as you do not move or change your name.',
    explanation: 'If you move between states or sometimes between counties, you must update your registration. Periodic "purges" happen, so checking your status is recommended.',
    severity: 'medium',
    country: 'US',
  },
  {
    id: 'us-myth-4',
    myth: 'Voting by mail leads to widespread voter fraud.',
    fact: 'Extensive studies have shown that mail-in voting has extremely low rates of fraud.',
    explanation: 'States use signature verification, secure barcodes, and tracking systems to ensure only one ballot is cast per registered voter.',
    severity: 'high',
    country: 'US',
  },
  {
    id: 'us-myth-5',
    myth: 'Voter ID laws are the same across all US states.',
    fact: 'Voter ID requirements vary significantly by state. Some states require photo ID, while others accept non-photo ID or have no ID requirement at all.',
    explanation: 'State legislatures determine their own voting laws. Always check your specific state\'s requirements well before election day.',
    severity: 'medium',
    country: 'US',
  },
  {
    id: 'us-myth-6',
    myth: 'Dead people voting is a widespread problem that changes election outcomes.',
    fact: 'While isolated clerical errors occur (like a relative of a recently deceased person voting in their name), it is extremely rare and never on a scale to change results.',
    explanation: 'Election offices regularly cross-reference death records. Investigations into "dead voter" claims almost always find they were living people with similar names or birthdates.',
    severity: 'high',
    country: 'US',
  },
  {
    id: 'us-myth-7',
    myth: 'Voting machines are connected to the internet and can be hacked by foreign actors.',
    fact: 'The machines used to count votes are not connected to the internet. They are standalone devices or connected to a secure, closed local network.',
    explanation: 'Election security involves "defense in depth," including physical seals, logic and accuracy tests, and in most cases, a paper ballot that can be manually audited.',
    severity: 'high',
    country: 'US',
  },
];

const usaQuiz: QuizQuestion[] = [
  {
    id: 'us-q1',
    question: 'How many Electoral College votes are needed to win the US Presidency?',
    options: [{ id: 'a', text: '218' }, { id: 'b', text: '270' }, { id: 'c', text: '300' }, { id: 'd', text: '435' }],
    correctOptionId: 'b',
    explanation: 'There are 538 total electoral votes. A candidate needs a majority — 270 or more — to win the presidency.',
    difficulty: 'medium',
    category: 'process',
    country: 'US',
  },
  {
    id: 'us-q2',
    question: 'When is US Election Day held?',
    options: [{ id: 'a', text: 'First Monday of November' }, { id: 'b', text: 'First Tuesday after the first Monday in November' }, { id: 'c', text: 'Last Tuesday of October' }, { id: 'd', text: 'November 15th' }],
    correctOptionId: 'b',
    explanation: 'Federal law sets Election Day as the first Tuesday after the first Monday in November every four years.',
    difficulty: 'medium',
    category: 'timeline',
    country: 'US',
  },
  {
    id: 'us-q3',
    question: 'What happens if no presidential candidate wins 270 Electoral College votes?',
    options: [{ id: 'a', text: 'The election is held again' }, { id: 'b', text: 'The Supreme Court decides' }, { id: 'c', text: 'The House of Representatives elects the President' }, { id: 'd', text: 'The Senate elects the President' }],
    correctOptionId: 'c',
    explanation: 'Under the 12th Amendment, if no candidate wins an Electoral College majority, the House of Representatives votes to elect the President, with each state delegation having one vote.',
    difficulty: 'hard',
    category: 'process',
    country: 'US',
  },
];

// ─── UK ──────────────────────────────────────────────────────────────────────

const ukTimeline: TimelineEvent[] = [
  { id: 'uk-1', stage: 'filing', title: 'Parliament Dissolution', description: 'Parliament is dissolved and writs for election are issued.', daysRelativeToElection: -25, icon: '📜', country: 'UK' },
  { id: 'uk-2', stage: 'filing', title: 'Nomination Deadline', description: 'Candidates submit nomination papers and £500 deposit to their local returning officer.', daysRelativeToElection: -19, icon: '📝', country: 'UK' },
  { id: 'uk-3', stage: 'campaign', title: 'Short Campaign Period', description: 'Parties campaign across constituencies. Spending limits apply from this date.', daysRelativeToElection: -19, icon: '📣', country: 'UK' },
  { id: 'uk-4', stage: 'voting', title: 'Polling Day', description: 'Voters cast paper ballots at polling stations (7am–10pm). Results announced overnight.', daysRelativeToElection: 0, icon: '🗳️', country: 'UK' },
  { id: 'uk-5', stage: 'counting', title: 'Count & Declaration', description: 'Votes counted at local count centres, results declared constituency by constituency.', daysRelativeToElection: 0, icon: '🔢', country: 'UK' },
  { id: 'uk-6', stage: 'certification', title: 'Government Formation', description: 'Party leader with majority invited by the King to form a government as Prime Minister.', daysRelativeToElection: 1, icon: '👑', country: 'UK' },
];

const ukEligibility: VoterEligibility = {
  country: 'UK',
  minimumAge: 18,
  citizenshipRequired: false,
  residencyRequirement: 'Must be registered to vote in a UK constituency',
  registrationDeadlineDays: 12,
  additionalRequirements: [
    'British, Irish, or qualifying Commonwealth citizen',
    'Must register on the Electoral Register',
    'Overseas British nationals can register as overseas voters',
    'Peers in House of Lords may not vote in general elections',
  ],
};

const ukMyths: MythFact[] = [
  {
    id: 'uk-myth-1',
    myth: 'You need to be a British citizen to vote in UK general elections.',
    fact: 'Irish citizens and qualifying Commonwealth citizens resident in the UK can also vote in UK general elections.',
    explanation: 'The Electoral Administration Act extended voting rights to these groups due to historical Commonwealth ties.',
    severity: 'medium',
    country: 'UK',
  },
  {
    id: 'uk-myth-2',
    myth: 'The party with the most votes always wins the UK election.',
    fact: 'The UK uses First Past the Post (FPTP). A party can win more seats (and form government) with fewer total votes than another party.',
    explanation: 'In FPTP, only the candidate with the most votes in each constituency wins — national vote share does not directly determine seat count.',
    severity: 'high',
    country: 'UK',
  },
  {
    id: 'uk-myth-3',
    myth: 'If I spoil my ballot paper by mistake, I cannot get a new one.',
    fact: 'If you make a mistake on your ballot paper, you can give it back to the presiding officer and they will issue a new one.',
    explanation: 'As long as the spoiled ballot hasn\'t been put in the box, the officer can mark it as "spoilt" and give you a fresh sheet.',
    severity: 'low',
    country: 'UK',
  },
  {
    id: 'uk-myth-4',
    myth: 'The Prime Minister is directly elected by the public.',
    fact: 'Voters only elect their local MP. The Prime Minister is the leader of the party that can command a majority in the House of Commons.',
    explanation: 'Unlike a presidential system, the executive is drawn from the legislature. You vote for a representative, not a national leader directly.',
    severity: 'high',
    country: 'UK',
  },
  {
    id: 'uk-myth-5',
    myth: 'You don\'t need any identification to vote in person in the UK.',
    fact: 'As of May 2023, voters in the UK are required to show a valid photo ID to vote in person at some elections.',
    explanation: 'Accepted IDs include a passport, driving license, or a free Voter Authority Certificate if you don\'t have a valid photo ID.',
    severity: 'high',
    country: 'UK',
  },
];

const ukQuiz: QuizQuestion[] = [
  {
    id: 'uk-q1',
    question: 'What voting system does the UK use for General Elections?',
    options: [{ id: 'a', text: 'Proportional Representation' }, { id: 'b', text: 'First Past the Post' }, { id: 'c', text: 'Alternative Vote' }, { id: 'd', text: 'Single Transferable Vote' }],
    correctOptionId: 'b',
    explanation: 'The UK uses First Past the Post (FPTP) for Westminster elections. The candidate with the most votes in each constituency wins, regardless of overall majority.',
    difficulty: 'easy',
    category: 'process',
    country: 'UK',
  },
  {
    id: 'uk-q2',
    question: 'What is the candidate deposit for a UK general election?',
    options: [{ id: 'a', text: '£250' }, { id: 'b', text: '£500' }, { id: 'c', text: '£1,000' }, { id: 'd', text: '£5,000' }],
    correctOptionId: 'b',
    explanation: 'Candidates must pay a £500 deposit, which is forfeited if they receive less than 5% of the valid votes cast in their constituency.',
    difficulty: 'hard',
    category: 'timeline',
    country: 'UK',
  },
];

// ─── Global Myths ────────────────────────────────────────────────────────────

const globalMyths: MythFact[] = [
  {
    id: 'global-myth-1',
    myth: 'Voting doesn\'t make a difference — politicians do what they want anyway.',
    fact: 'Elections have been won by single-digit vote margins. Every vote shapes who represents communities and what policies get passed.',
    explanation: 'Numerous elections at local, state, and national levels have been decided by very narrow margins, demonstrating the decisive power of individual votes.',
    severity: 'high',
    country: 'global',
  },
  {
    id: 'global-myth-2',
    myth: 'If I don\'t know enough about politics, I shouldn\'t vote.',
    fact: 'Voting is your right regardless of how much political knowledge you have. Civic education tools like this app exist precisely to help you make informed choices.',
    explanation: 'Voter turnout increases when citizens feel informed and empowered. No minimum knowledge level is required to exercise your democratic right.',
    severity: 'medium',
    country: 'global',
  },
  {
    id: 'global-myth-3',
    myth: 'Election day is the only time to get involved.',
    fact: 'Democracy is a year-round process. You can engage with your representatives, join community groups, and follow policy debates every day.',
    explanation: 'Holding officials accountable between elections is just as important as the vote itself for a healthy democracy.',
    severity: 'low',
    country: 'global',
  },
  {
    id: 'global-myth-4',
    myth: 'My one vote won\'t change a national result.',
    fact: 'In the 2000 US Presidential Election, the outcome in Florida (and thus the whole country) was decided by just 537 votes.',
    explanation: 'Small margins in specific districts or states can shift the entire national direction. Your vote is part of that critical margin.',
    severity: 'high',
    country: 'global',
  },
];

// ─── Exported Data Map ───────────────────────────────────────────────────────

export const ELECTION_DATA: Record<string, ElectionData> = {
  IN: {
    country: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    timeline: indiaTimeline,
    eligibility: indiaEligibility,
    ballotTypes: ballotTypes.filter((b) => b.usedIn.includes('IN')),
    myths: [...indiaMyths, ...globalMyths],
    quizQuestions: indiaQuiz,
  },
  US: {
    country: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    timeline: usaTimeline,
    eligibility: usaEligibility,
    ballotTypes: ballotTypes.filter((b) => b.usedIn.includes('US')),
    myths: [...usaMyths, ...globalMyths],
    quizQuestions: usaQuiz,
  },
  UK: {
    country: 'UK',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    timeline: ukTimeline,
    eligibility: ukEligibility,
    ballotTypes: ballotTypes.filter((b) => b.usedIn.includes('UK')),
    myths: [...ukMyths, ...globalMyths],
    quizQuestions: ukQuiz,
  },
};

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...indiaQuiz, ...usaQuiz, ...ukQuiz,
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en' as const, label: 'English', nativeLabel: 'English' },
  { code: 'hi' as const, label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'es' as const, label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr' as const, label: 'French', nativeLabel: 'Français' },
  { code: 'de' as const, label: 'German', nativeLabel: 'Deutsch' },
  { code: 'zh' as const, label: 'Chinese', nativeLabel: '中文' },
  { code: 'ar' as const, label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'pt' as const, label: 'Portuguese', nativeLabel: 'Português' },
];
