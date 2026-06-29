import type { ReviewRecord } from "@/types";

// 60 records — 3 per reviewer × 4 modalities = 5 reviewers × 12 each
// Accuracy targets: R01 ~90%, R02 ~75%, R03 ~83%, R04 ~50%, R05 ~70%
export const REVIEWS: ReviewRecord[] = [

  // ── TEXT (15 records) ──────────────────────────────────────────────────────
  // R01 text — 3 records, 2 correct (missed 1 spam)
  { review_id:"REV-001", content_type:"text", reviewer_id:"R01", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Post containing racial slurs targeting a specific ethnic community.", category:"hate_speech", timestamp:"2026-06-01T09:00:00Z" },
  { review_id:"REV-002", content_type:"text", reviewer_id:"R01", reviewer_decision:"approve", ground_truth:"approve", content_description:"Discussion thread about cryptocurrency investment strategies with no misleading claims.", category:"safe", timestamp:"2026-06-01T09:30:00Z" },
  { review_id:"REV-003", content_type:"text", reviewer_id:"R01", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Chain letter promising financial rewards if forwarded to 20 people.", category:"spam", timestamp:"2026-06-01T10:00:00Z" }, // wrong

  // R02 text — 3 records, 2 correct
  { review_id:"REV-004", content_type:"text", reviewer_id:"R02", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Phishing message impersonating bank support asking for account credentials.", category:"spam", timestamp:"2026-06-01T10:30:00Z" },
  { review_id:"REV-005", content_type:"text", reviewer_id:"R02", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"Post with borderline self-harm content requiring specialist review.", category:"violence", timestamp:"2026-06-01T11:00:00Z" },
  { review_id:"REV-006", content_type:"text", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Coordinated bot network posting identical promotional content at scale.", category:"spam", timestamp:"2026-06-01T11:30:00Z" }, // wrong

  // R03 text — 3 records, 3 correct
  { review_id:"REV-007", content_type:"text", reviewer_id:"R03", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Death threats directed at a journalist with personal details exposed.", category:"violence", timestamp:"2026-06-01T12:00:00Z" },
  { review_id:"REV-008", content_type:"text", reviewer_id:"R03", reviewer_decision:"approve", ground_truth:"approve", content_description:"Recipe post for a traditional family dessert with step-by-step instructions.", category:"safe", timestamp:"2026-06-01T12:30:00Z" },
  { review_id:"REV-009", content_type:"text", reviewer_id:"R03", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"User report alleging another user is stalking them with location sharing.", category:"violence", timestamp:"2026-06-01T13:00:00Z" },

  // R04 text — 3 records, 1 correct (low accuracy reviewer)
  { review_id:"REV-010", content_type:"text", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Post glorifying domestic violence and discouraging victims from seeking help.", category:"violence", timestamp:"2026-06-01T13:30:00Z" }, // wrong
  { review_id:"REV-011", content_type:"text", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"approve", content_description:"Community update from a local nonprofit about upcoming volunteer schedules.", category:"safe", timestamp:"2026-06-01T14:00:00Z" }, // correct
  { review_id:"REV-012", content_type:"text", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Threatening message doxing a public figure with home address and routine.", category:"violence", timestamp:"2026-06-01T14:30:00Z" }, // wrong

  // R05 text — 3 records, 2 correct
  { review_id:"REV-013", content_type:"text", reviewer_id:"R05", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Xenophobic rant targeting Eastern European immigrants with repeated slurs.", category:"hate_speech", timestamp:"2026-06-01T15:00:00Z" },
  { review_id:"REV-014", content_type:"text", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"approve", content_description:"User sharing travel tips for Southeast Asia with photos and local insights.", category:"safe", timestamp:"2026-06-01T15:30:00Z" },
  { review_id:"REV-015", content_type:"text", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Message with hidden redirect links leading to phishing credential harvesting pages.", category:"spam", timestamp:"2026-06-01T16:00:00Z" }, // wrong

  // ── IMAGE (15 records) ─────────────────────────────────────────────────────
  // R01 image — 3 records, 3 correct
  { review_id:"REV-016", content_type:"image", reviewer_id:"R01", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Photo showing graphic injuries from an alleged assault posted without warning.", category:"violence", timestamp:"2026-06-02T09:00:00Z" },
  { review_id:"REV-017", content_type:"image", reviewer_id:"R01", reviewer_decision:"approve", ground_truth:"approve", content_description:"Infographic on nutrition habits sourced from peer-reviewed dietary research.", category:"safe", timestamp:"2026-06-02T09:30:00Z" },
  { review_id:"REV-018", content_type:"image", reviewer_id:"R01", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"Meme containing potentially coded extremist symbolism needing specialist review.", category:"hate_speech", timestamp:"2026-06-02T10:00:00Z" },

  // R02 image — 3 records, 2 correct (weaker on image)
  { review_id:"REV-019", content_type:"image", reviewer_id:"R02", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Screenshot of extremist propaganda poster featuring banned hate group insignia.", category:"hate_speech", timestamp:"2026-06-02T10:30:00Z" },
  { review_id:"REV-020", content_type:"image", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Before/after image promoting a dangerous crash diet with false medical claims.", category:"spam", timestamp:"2026-06-02T11:00:00Z" }, // wrong
  { review_id:"REV-021", content_type:"image", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"approve", content_description:"Diagram on home electrical safety tips authored by a certified electrician.", category:"safe", timestamp:"2026-06-02T11:30:00Z" },

  // R03 image — 3 records, 3 correct (best modality)
  { review_id:"REV-022", content_type:"image", reviewer_id:"R03", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Graphic road accident photo shared publicly without any content warning.", category:"violence", timestamp:"2026-06-02T12:00:00Z" },
  { review_id:"REV-023", content_type:"image", reviewer_id:"R03", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"Screenshot from an account with CSAM-adjacent content needing immediate expert review.", category:"explicit", timestamp:"2026-06-02T12:30:00Z" },
  { review_id:"REV-024", content_type:"image", reviewer_id:"R03", reviewer_decision:"approve", ground_truth:"approve", content_description:"Photo essay documenting industrial pollution legally for an environmental nonprofit.", category:"safe", timestamp:"2026-06-02T13:00:00Z" },

  // R04 image — 3 records, 1 correct
  { review_id:"REV-025", content_type:"image", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Collage promoting white-supremacist ideology using subtle coded visual symbols.", category:"hate_speech", timestamp:"2026-06-02T13:30:00Z" }, // wrong
  { review_id:"REV-026", content_type:"image", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"approve", content_description:"Photograph of a civil rights protest march with informational placards.", category:"safe", timestamp:"2026-06-02T14:00:00Z" }, // correct
  { review_id:"REV-027", content_type:"image", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Deepfake image superimposing a politician into compromising explicit content.", category:"explicit", timestamp:"2026-06-02T14:30:00Z" }, // wrong

  // R05 image — 3 records, 2 correct
  { review_id:"REV-028", content_type:"image", reviewer_id:"R05", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Screenshot of a phishing website mimicking a major bank's login interface.", category:"spam", timestamp:"2026-06-02T15:00:00Z" },
  { review_id:"REV-029", content_type:"image", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"approve", content_description:"Photo of a community garden event shared by a local neighbourhood association.", category:"safe", timestamp:"2026-06-02T15:30:00Z" },
  { review_id:"REV-030", content_type:"image", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Image glamorising self-harm as a coping mechanism with encouraging captions.", category:"violence", timestamp:"2026-06-02T16:00:00Z" }, // wrong

  // ── AUDIO (15 records) ─────────────────────────────────────────────────────
  // R01 audio — 3 records, 3 correct
  { review_id:"REV-031", content_type:"audio", reviewer_id:"R01", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Recorded call where a caller explicitly threatens a government official with harm.", category:"violence", timestamp:"2026-06-03T09:00:00Z" },
  { review_id:"REV-032", content_type:"audio", reviewer_id:"R01", reviewer_decision:"approve", ground_truth:"approve", content_description:"Podcast on mental health awareness featuring a licensed psychologist.", category:"safe", timestamp:"2026-06-03T09:30:00Z" },
  { review_id:"REV-033", content_type:"audio", reviewer_id:"R01", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"Voice memo with ambiguous coded language that may reference human trafficking.", category:"violence", timestamp:"2026-06-03T10:00:00Z" },

  // R02 audio — 3 records, 2 correct
  { review_id:"REV-034", content_type:"audio", reviewer_id:"R02", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Song lyrics glorifying gang violence and illegal weapon acquisition.", category:"violence", timestamp:"2026-06-03T10:30:00Z" },
  { review_id:"REV-035", content_type:"audio", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"approve", content_description:"Radio segment on local traffic updates and community news from a licensed station.", category:"safe", timestamp:"2026-06-03T11:00:00Z" },
  { review_id:"REV-036", content_type:"audio", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Automated robocall spreading misinformation about upcoming voter registration deadlines.", category:"spam", timestamp:"2026-06-03T11:30:00Z" }, // wrong

  // R03 audio — 3 records, 2 correct
  { review_id:"REV-037", content_type:"audio", reviewer_id:"R03", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Extremist sermon audio calling followers to acts of religiously motivated violence.", category:"hate_speech", timestamp:"2026-06-03T12:00:00Z" },
  { review_id:"REV-038", content_type:"audio", reviewer_id:"R03", reviewer_decision:"approve", ground_truth:"approve", content_description:"Audiobook excerpt from a published mystery thriller novel with no policy violations.", category:"safe", timestamp:"2026-06-03T12:30:00Z" },
  { review_id:"REV-039", content_type:"audio", reviewer_id:"R03", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Interview where subject provides detailed step-by-step methods for illegal drug synthesis.", category:"violence", timestamp:"2026-06-03T13:00:00Z" }, // wrong

  // R04 audio — 3 records, 2 correct
  { review_id:"REV-040", content_type:"audio", reviewer_id:"R04", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Call centre recording of an agent verbally abusing and demeaning a caller.", category:"hate_speech", timestamp:"2026-06-03T13:30:00Z" }, // correct
  { review_id:"REV-041", content_type:"audio", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"approve", content_description:"Recorded university lecture on the sociology of online community formation.", category:"safe", timestamp:"2026-06-03T14:00:00Z" }, // correct
  { review_id:"REV-042", content_type:"audio", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Voice note threatening to publish private photos unless a payment is received.", category:"violence", timestamp:"2026-06-03T14:30:00Z" }, // wrong

  // R05 audio — 3 records, 2 correct
  { review_id:"REV-043", content_type:"audio", reviewer_id:"R05", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Podcast spreading dangerous medical misinformation recommending unproven home treatments.", category:"spam", timestamp:"2026-06-03T15:00:00Z" },
  { review_id:"REV-044", content_type:"audio", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"approve", content_description:"Children's educational story read aloud by a teacher for a school literacy programme.", category:"safe", timestamp:"2026-06-03T15:30:00Z" },
  { review_id:"REV-045", content_type:"audio", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Recorded voice clip using racial slurs in a clearly discriminatory context.", category:"hate_speech", timestamp:"2026-06-03T16:00:00Z" }, // wrong

  // ── VIDEO (15 records) ─────────────────────────────────────────────────────
  // R01 video — 3 records, 2 correct
  { review_id:"REV-046", content_type:"video", reviewer_id:"R01", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Tutorial video demonstrating step-by-step synthesis of controlled illegal substances.", category:"violence", timestamp:"2026-06-04T09:00:00Z" },
  { review_id:"REV-047", content_type:"video", reviewer_id:"R01", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"Livestream of coordinated harassment targeting a specific individual in real time.", category:"hate_speech", timestamp:"2026-06-04T09:30:00Z" },
  { review_id:"REV-048", content_type:"video", reviewer_id:"R01", reviewer_decision:"reject",  ground_truth:"approve", content_description:"Documentary clip about historical military conflicts using verified archival footage.", category:"safe", timestamp:"2026-06-04T10:00:00Z" }, // wrong (over-flag)

  // R02 video — 3 records, 2 correct (weakest modality)
  { review_id:"REV-049", content_type:"video", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"approve", content_description:"Cooking tutorial demonstrating traditional dishes from multiple global cuisines.", category:"safe", timestamp:"2026-06-04T10:30:00Z" },
  { review_id:"REV-050", content_type:"video", reviewer_id:"R02", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Video glorifying drug use at an event with minors visibly present in the background.", category:"explicit", timestamp:"2026-06-04T11:00:00Z" }, // wrong
  { review_id:"REV-051", content_type:"video", reviewer_id:"R02", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Short-form video spreading election misinformation using fabricated polling statistics.", category:"spam", timestamp:"2026-06-04T11:30:00Z" },

  // R03 video — 3 records, 2 correct
  { review_id:"REV-052", content_type:"video", reviewer_id:"R03", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Video tutorial explaining how to surveil and stalk a named target individual.", category:"violence", timestamp:"2026-06-04T12:00:00Z" },
  { review_id:"REV-053", content_type:"video", reviewer_id:"R03", reviewer_decision:"approve", ground_truth:"approve", content_description:"Short documentary on urban beekeeping and sustainable city food production.", category:"safe", timestamp:"2026-06-04T12:30:00Z" },
  { review_id:"REV-054", content_type:"video", reviewer_id:"R03", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Prank video where a subject is physically assaulted without apparent prior consent.", category:"violence", timestamp:"2026-06-04T13:00:00Z" }, // wrong

  // R04 video — 3 records, 1 correct
  { review_id:"REV-055", content_type:"video", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Video demonstrating residential lock-picking techniques for an explicitly criminal audience.", category:"violence", timestamp:"2026-06-04T13:30:00Z" }, // wrong
  { review_id:"REV-056", content_type:"video", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"approve", content_description:"Timelapse of a community mural being painted legally as part of a funded arts project.", category:"safe", timestamp:"2026-06-04T14:00:00Z" }, // correct
  { review_id:"REV-057", content_type:"video", reviewer_id:"R04", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Video promoting an illegal pyramid scheme disguised as a cryptocurrency tutorial.", category:"spam", timestamp:"2026-06-04T14:30:00Z" }, // wrong

  // R05 video — 3 records, 2 correct
  { review_id:"REV-058", content_type:"video", reviewer_id:"R05", reviewer_decision:"reject",  ground_truth:"reject",  content_description:"Viral clip showing an organised flash mob robbery with perpetrators' faces visible.", category:"violence", timestamp:"2026-06-04T15:00:00Z" },
  { review_id:"REV-059", content_type:"video", reviewer_id:"R05", reviewer_decision:"escalate",ground_truth:"escalate",content_description:"Video of a distressed individual making statements indicating possible imminent self-harm.", category:"violence", timestamp:"2026-06-04T15:30:00Z" },
  { review_id:"REV-060", content_type:"video", reviewer_id:"R05", reviewer_decision:"approve", ground_truth:"reject",  content_description:"Video normalising underage drinking presented as an aspirational teen lifestyle vlog.", category:"explicit", timestamp:"2026-06-04T16:00:00Z" }, // wrong
];
