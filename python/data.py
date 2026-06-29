from types_def import ReviewRecord

REVIEWS: list[ReviewRecord] = [
    # ── R01 (target ~90%) ──────────────────────────────────────────────────────
    ReviewRecord("REV-001","text","hate_speech","User post contains slurs targeting ethnic minority","R01","reject","reject"),
    ReviewRecord("REV-002","text","violence","Description of self-harm methods shared publicly","R01","escalate","escalate"),
    ReviewRecord("REV-003","text","spam","Repeated promotional links to unrelated products","R01","reject","reject"),
    ReviewRecord("REV-004","image","explicit","Profile photo contains partial nudity","R01","reject","reject"),
    ReviewRecord("REV-005","image","violence","Screenshot of graphic injury shared in group chat","R01","escalate","escalate"),
    ReviewRecord("REV-006","image","safe","Landscape photo of mountains with no issues","R01","approve","approve"),
    ReviewRecord("REV-007","audio","hate_speech","Voice clip mocking religious group with slurs","R01","reject","reject"),
    ReviewRecord("REV-008","audio","safe","Podcast excerpt discussing local community events","R01","approve","approve"),
    ReviewRecord("REV-009","video","explicit","Short clip with sexual content in thumbnail","R01","escalate","reject"),   # wrong
    ReviewRecord("REV-010","video","violence","Video of a street fight with visible injuries","R01","escalate","escalate"),
    ReviewRecord("REV-011","text","safe","User asking for restaurant recommendations","R01","approve","approve"),
    ReviewRecord("REV-012","image","spam","Collage of watermarked stock images for ad","R01","reject","reject"),

    # ── R02 (target ~75%) ──────────────────────────────────────────────────────
    ReviewRecord("REV-013","text","hate_speech","Comment using coded language to demean women","R02","approve","reject"),  # wrong
    ReviewRecord("REV-014","text","safe","User sharing a book recommendation with friends","R02","approve","approve"),
    ReviewRecord("REV-015","text","spam","Bulk copy-paste of affiliate links","R02","reject","reject"),
    ReviewRecord("REV-016","image","explicit","Artistic nude painting posted in general feed","R02","escalate","escalate"),
    ReviewRecord("REV-017","image","violence","Cartoon depiction of sword fight","R02","approve","approve"),
    ReviewRecord("REV-018","image","hate_speech","Meme with anti-semitic imagery","R02","approve","reject"),              # wrong
    ReviewRecord("REV-019","audio","safe","User singing a cover song","R02","approve","approve"),
    ReviewRecord("REV-020","audio","violence","Clip of gunshots with aggressive commentary","R02","reject","escalate"),   # wrong
    ReviewRecord("REV-021","video","safe","Tutorial on making pasta","R02","approve","approve"),
    ReviewRecord("REV-022","video","spam","Repeated 30-second ads disguised as content","R02","reject","reject"),
    ReviewRecord("REV-023","text","violence","Threat message sent to a public figure","R02","escalate","escalate"),
    ReviewRecord("REV-024","image","safe","Photo of a family at a birthday party","R02","approve","approve"),

    # ── R03 (target ~83%) ──────────────────────────────────────────────────────
    ReviewRecord("REV-025","text","spam","Newsletter signup disguised as urgent alert","R03","reject","reject"),
    ReviewRecord("REV-026","text","safe","Question about local transit schedule","R03","approve","approve"),
    ReviewRecord("REV-027","text","explicit","Explicit description of sexual encounter in forum","R03","escalate","escalate"),
    ReviewRecord("REV-028","image","safe","User-uploaded photo of their pet cat","R03","approve","approve"),
    ReviewRecord("REV-029","image","explicit","Cropped image with sexual suggestion","R03","reject","escalate"),          # wrong
    ReviewRecord("REV-030","image","violence","News screenshot showing protest injuries","R03","escalate","escalate"),
    ReviewRecord("REV-031","audio","spam","Autodialer recording promoting fake lottery","R03","reject","reject"),
    ReviewRecord("REV-032","audio","hate_speech","Song lyrics glorifying racial violence","R03","escalate","escalate"),
    ReviewRecord("REV-033","video","safe","Vlog of a city walking tour","R03","approve","approve"),
    ReviewRecord("REV-034","video","violence","Clip from action movie with visible gore","R03","escalate","escalate"),
    ReviewRecord("REV-035","text","hate_speech","Post targeting disability community with mockery","R03","reject","reject"),
    ReviewRecord("REV-036","image","hate_speech","Banner with white supremacist symbols","R03","escalate","escalate"),

    # ── R04 (target ~50%) ──────────────────────────────────────────────────────
    ReviewRecord("REV-037","text","violence","Post detailing a planned assault on neighbours","R04","approve","escalate"),  # wrong
    ReviewRecord("REV-038","text","safe","Recipe for chocolate cake shared with friends","R04","reject","approve"),        # wrong
    ReviewRecord("REV-039","text","spam","Phishing email template shared as a warning","R04","approve","reject"),          # wrong
    ReviewRecord("REV-040","image","explicit","Photo of nudity submitted as art","R04","escalate","escalate"),
    ReviewRecord("REV-041","image","safe","Screenshot of a weather app","R04","reject","approve"),                        # wrong
    ReviewRecord("REV-042","image","violence","Close-up of a bloody wound in medical context","R04","approve","escalate"), # wrong
    ReviewRecord("REV-043","audio","safe","Morning meditation recording","R04","approve","approve"),
    ReviewRecord("REV-044","audio","hate_speech","Stand-up comedy using racial slurs","R04","approve","reject"),          # wrong
    ReviewRecord("REV-045","video","violence","Real-life accident footage widely shared","R04","approve","escalate"),     # wrong
    ReviewRecord("REV-046","video","safe","Kids playing soccer in the park","R04","approve","approve"),
    ReviewRecord("REV-047","text","explicit","Adult fiction excerpt shared on public board","R04","reject","reject"),
    ReviewRecord("REV-048","video","spam","Repetitive clickbait compilation video","R04","reject","reject"),

    # ── R05 (target ~70%) ──────────────────────────────────────────────────────
    ReviewRecord("REV-049","text","safe","User sharing travel tips for Southeast Asia","R05","approve","approve"),
    ReviewRecord("REV-050","text","hate_speech","Post dismissing women in STEM with stereotypes","R05","approve","reject"), # wrong
    ReviewRecord("REV-051","text","violence","Call to action targeting a politician","R05","escalate","escalate"),
    ReviewRecord("REV-052","image","spam","Image board flooded with identical sale banners","R05","reject","reject"),
    ReviewRecord("REV-053","image","explicit","Thumbnail with suggestive but non-explicit content","R05","approve","approve"),
    ReviewRecord("REV-054","image","violence","Photo of a knife with threatening caption","R05","approve","escalate"),    # wrong
    ReviewRecord("REV-055","audio","safe","Interview with a local chef","R05","approve","approve"),
    ReviewRecord("REV-056","audio","explicit","Adult content shared via voice note","R05","escalate","escalate"),
    ReviewRecord("REV-057","video","safe","Time-lapse of a city skyline at night","R05","approve","approve"),
    ReviewRecord("REV-058","video","hate_speech","Comedy skit relying on racist caricatures","R05","approve","reject"),  # wrong
    ReviewRecord("REV-059","text","spam","Mass-forwarded chain message about fake giveaway","R05","reject","reject"),
    ReviewRecord("REV-060","video","violence","Clip of a physical altercation at a sports event","R05","escalate","escalate"),
]
