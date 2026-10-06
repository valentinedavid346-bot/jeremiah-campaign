/* =====================================================================
   JEREMIAH DAVIS CAMPAIGN SITE: ALL THE CONTENT LIVES HERE.
   Edit the text between the quotes. Anything left empty ("" or [])
   hides itself or shows a clean "coming soon" message.
   Tip: keep the commas and quotes exactly as they are.
   ===================================================================== */
const CONFIG = {
  firstName: "Jeremiah",
  lastName: "Davis",
  position: "Student Council President",
  school: "Belmont Preparatory High School",
  slogan: "You say it, we shout it!",   // primary slogan
  tagline: "",                    // optional line under the slogan in the header (empty = hidden). "Make the alarm worth it." now lives on The plan.

  // ---------- HOME ----------
  // Election: date-time in local time, e.g. "2026-10-15T08:00"
  electionDate: "2026-10-29T08:00",
  howToVote: [
    // Steps, in order. Example:
    // "Vote in your homeroom during first period.",
    // "Results are revealed classroom by classroom."
  ],
  photo: "",                    // e.g. "jeremiah.jpg" (square works best)
  bio: [
    "I'm Jeremiah Davis, a senior in the Class of 2027, and I'm running for Student Council President.",
    "I want to make Belmont more community-oriented by using student feedback to improve it. Feel free to reach out with any questions or suggestions."
  ],
  facts: [
    { label: "Grade", value: "Senior" },
    { label: "Class", value: "2027" },
    // { label: "Grade", value: "12" },
    // { label: "Clubs", value: "Robotics, Track" }
  ],
  platform: [
    { title: "A Belmont that feels like a community", detail: "More events that bring every grade together, like spirit weeks, class competitions and senior-underclassmen mentoring, so no one feels left out." },
    { title: "More programs and clubs", detail: "Help students start new clubs and bring back activities people actually want, with a simple way to propose a club and get it approved." },
    { title: "Access to the resources you need", detail: "Make it easier to find and use what Belmont already offers, like tutoring, college and career help, printing and supplies, and push for more where there are gaps, so every student has what they need to succeed." },
    { title: "Your voice, every step", detail: "Regular student surveys and an open suggestion box, with updates on what changed because of them." },
    // { title: "Fix the lunch line", detail: "Two serving lines on Fridays and..." },
  ],

  // ---------- CAMPAIGN VIDEO ----------
  // First one is the featured video. Use a YouTube link (normal, youtu.be or Shorts)
  // or an .mp4 file placed next to this page.
  videos: [
    // { title: "Why I'm running", youtube: "https://youtu.be/XXXXXXXXXXX", caption: "60 seconds on what I'd change." },
    // { title: "Campaign trailer", file: "trailer.mp4", poster: "trailer.jpg" },
  ],

  // ---------- MEET THE CABINET ----------
  cabinet: [
    // { name: "Maria Reyes", role: "Vice President", grade: "12th", photo: "maria.jpg",
    //   bio: "Captain of the track team. Wants more senior events." },
  ],

  // ---------- WHY VOTE JEREMIAH ----------
  // DRAFTS: have Jeremiah read these and put them in his own words.
  reasons: [
    { title: "He listens first", detail: "His whole plan starts with students: regular surveys, an open suggestion box, and an idea wall right on this site. The council's priorities should come from you." },
    { title: "Every grade counts", detail: "Freshman or senior, Belmont should feel like one community. Jeremiah wants events that bring every grade together and mentoring that connects upperclassmen with new students." },
    { title: "He's focused on what you can use", detail: "Tutoring, college and career help, supplies. A lot of what students need already exists at Belmont. Jeremiah wants to make it easy to find and push for more where there are gaps." },
    { title: "He knows Belmont", detail: "As a senior in the Class of 2027, he's seen what works at Belmont and what doesn't, and he's running to make the next year the best one yet." },
  ],

  // ---------- AGENDA BOARD (campaign events) ----------
  // Past events move to "Already happened" automatically.
  events: [
    // { date: "2026-10-02", time: "12:15 PM", title: "Lunch meet & greet",
    //   place: "Cafeteria", detail: "Come say hi and share your ideas." },
    // { date: "2026-10-09", time: "3:00 PM", title: "Candidate debate", place: "Auditorium" },
  ],

  // ---------- Q&A ----------
  // DRAFTS: have Jeremiah rewrite the answers in his own voice.
  faq: [
    { q: "Why are you running?", a: "I want Belmont to feel more like a community, and I think the best way to get there is to actually listen to students and act on what they say." },
    { q: "What's the first thing you'd do if elected?", a: "Put out a student survey so the council's priorities come from you, not just from us. Then share the results and what we're doing about them." },
    { q: "What does \"Make the alarm worth it\" mean?", a: "Everyone knows the feeling of hitting snooze. I want Belmont to be a place that's worth getting up for." },
    { q: "What do you mean by access to resources?", a: "A lot of students don't know what Belmont already offers, like tutoring or college help. I want to make those easy to find and push for more where there are gaps." },
    { q: "How would you help start new clubs?", a: "Make a simple way to propose a club, find an advisor and get it approved, so good ideas don't just die in the hallway." },
    { q: "How can I share an idea with you?", a: "Post it on the idea wall, send a message through the site, or just come find me in school. I want to hear it." },
  ],
  questionsFormUrl: "",         // Google Form where students ask questions

  // ---------- ENDORSEMENTS ----------
  endorsements: [
    // Only with the person's permission.
    // { quote: "Jeremiah shows up for everyone.", name: "Maria R.", role: "Class of 2027" },
  ],
  endorseFormUrl: "",           // Google Form where people can sign on as supporters

  // ---------- CONTACT ----------
  email: "",                    // campaign email (a new Gmail just for the campaign is best)
  sheetEndpoint: "https://script.google.com/macros/s/AKfycbzvR2w9j26DIJAPPFvNLcHmICqQ1VOEksVa0FOJrGljnO1ZJhFKq242shovHUps_PIr/exec",            // Google Sheet inbox: the Apps Script Web app URL (ends in /exec). Every message lands in the sheet + an email alert.
  contactFormEndpoint: "",      // optional: a free Formspree link, e.g. "https://formspree.io/f/abcd1234"
  findHim: "",                  // e.g. "Room 204 during lunch, or after school by the front steps."
  ideasFormUrl: "",             // Google Form for platform ideas
  socials: [
    // { label: "Instagram", url: "https://instagram.com/..." },
    // { label: "TikTok", url: "https://tiktok.com/@..." },
  ],

  // ---------- TURN FEATURES ON / OFF (true = on, false = off) ----------
  features: {
    intro: true,          // ringing alarm clock on a black screen when the site opens, then the countdown
    alarmClock: true,     // tap-the-alarm clock that reveals "The plan" on the home page
    clubQuiz: true,       // club match quiz (on the Start a club page)
    poll: true,           // live "What matters most?" poll on Be a part of Belmont (needs firebase below)
    supporters: true,     // live supporter counter (needs firebase below)
    opportunities: true,  // Get inspired > Opportunities board
    startClub: true,      // Get inspired > Start a club (includes the club quiz)
    advice: false,        // Get inspired > Senior advice (saved for after the win; set true to bring it back)
    spotlight: true,      // Get inspired > Student spotlight
    shoutouts: true,      // Get inspired > Shoutouts (live posting needs firebase)
    challenge: true,      // Get inspired > Weekly challenge (live counter needs firebase)
    dreamCard: true,      // "Dream Belmont" card maker (Get involved menu)
    moodCheck: true,      // "How'd you wake up today?" check-in (Be a part of Belmont page; live totals need firebase)
    easterEgg: true,      // tap the JD logo 5 times
  },
  supportersMinToShow: 10,  // hide the number until at least this many people join
  alarmSound: true,          // alarm clock beeps when tapped (false = silent)

  // ---------- GET INSPIRED ----------
  // Opportunities: double-check dates on each official site before sharing.
  opportunities: [
    { title: "Summer Youth Employment (SYEP)", org: "NYC Dept. of Youth & Community Development", tags: ["Paid", "Summer"],
      detail: "NYC's biggest youth jobs program. Paid summer work experience and career exploration.",
      who: "NYC youth ages 14 to 24", when: "Applications open in the spring. Watch for the next round.", url: "https://nyc.gov/SYEP" },
    { title: "Ladders for Leaders", org: "NYC Dept. of Youth & Community Development", tags: ["Paid", "Summer"],
      detail: "Paid summer internships at real companies and organizations in a bunch of industries.",
      who: "NYC high school and college students", url: "https://www.nyc.gov/site/dycd/services/jobs-internships/nyc-ladders-for-leaders-students.page" },
    { title: "College Now", org: "CUNY (City College)", tags: ["Free", "College"],
      detail: "Take real college courses for free and earn college credit while you're still in high school.",
      who: "NYC public high school students in the Bronx and Manhattan", url: "https://www.ccny.cuny.edu/collegenow/programs" },
    { title: "Einstein Enrichment Program", org: "Albert Einstein College of Medicine", tags: ["Free", "STEM"],
      detail: "Pre-college STEM and health science program for students thinking about medicine or science.",
      who: "Bronx students in grades 7 to 12 with an 85+ average", when: "Runs in the fall and spring", url: "https://einsteinmed.edu/education/pathway-programs/pathway-programs-middle-high-school-students/einstein-enrichment-program" },
    { title: "Project TRUE", org: "Bronx Zoo (WCS) and Fordham University", tags: ["STEM"],
      detail: "Teens research urban ecology and wildlife in the Bronx alongside scientists.",
      who: "NYC teens", url: "https://bronxzoo.com/teens/project-true" },
    { title: "NYPL TeenLink", org: "New York Public Library", tags: ["Free"],
      detail: "Free tutoring, teen centers with tech and art supplies, programs, and paid internships at the library.",
      who: "NYC teens", url: "https://teenlink.nypl.org" },
    { title: "QuestBridge National College Match", org: "QuestBridge", tags: ["Scholarship", "College"],
      detail: "Full four-year scholarships to top colleges for high-achieving students from lower-income families.",
      who: "High school seniors (juniors: plan ahead)", when: "Deadline is early fall of senior year", url: "https://www.questbridge.org/high-school-students/national-college-match" },
  ],

  // Start a club: general steps. Check Belmont's exact process with the administration.
  clubSteps: [
    { title: "Find your people", detail: "Get a few students who would actually show up. Even 5 is a start." },
    { title: "Find an advisor", detail: "Ask a teacher or staff member who's into the same thing to sponsor the club." },
    { title: "Write your pitch", detail: "What the club does, when it meets, and why Belmont needs it. Keep it short." },
    { title: "Get it approved", detail: "Bring your pitch to the administration. Jeremiah wants to make this step easier." },
  ],
  clubStepsNote: "Every school's process is a little different. Ask the main office or the student council how clubs get approved at Belmont.",

  // Senior advice and shoutouts: add ones people give you (with permission).
  advice: [
    // { text: "Join something freshman year. You'll thank yourself.", name: "Maria R.", role: "Class of 2027" },
  ],
  shoutouts: [
    // { text: "Shoutout to Ms. R for staying late to help with chem.", name: "Anonymous", role: "11th grade" },
  ],

  // Student spotlight: one card per student (with their permission).
  spotlights: [
    // { name: "The Cooking Club", grade: "All grades", text: "Tacos from scratch.", photo: "img/cooking-2.jpg" },
  ],

  // Weekly challenge: rotates every Monday starting from challengeStart.
  challengeStart: "2026-10-05",
  challenges: [
    { title: "Sit with someone new at lunch", detail: "Pick a table you've never sat at and say hi. That's it." },
    { title: "Go to a game or show you've never been to", detail: "Support a team, a performance or an event you usually skip." },
    { title: "Thank a teacher", detail: "Tell a teacher who helped you that it mattered. Out loud or on a sticky note." },
    { title: "Visit a club you've never tried", detail: "Sit in on one meeting. Worst case, you got a free snack." },
    { title: "Hype up a classmate", detail: "Notice someone's win, big or small, and say it." },
    { title: "Share one idea for Belmont", detail: "Drop a suggestion on the Be a part of Belmont page. You say it, we shout it." },
    { title: "Leave it better than you found it", detail: "Pick up one thing, fix one thing or help one person at school this week." },
  ],

  // ---------- THEN VS NOW SLIDER (Why Jeremiah page) ----------
  // Put two photos of the same spot next to this page. Stays hidden until both are filled in.
  compare: {
    before: "",                 // e.g. "img/hallway-now.jpg"
    after: "",                  // e.g. "img/hallway-idea.jpg"
    beforeLabel: "Belmont now",
    afterLabel: "Belmont with Jeremiah",
    caption: "",                // optional line above the slider
  },

  // ---------- LIVE FEATURES (Firebase Realtime Database) ----------
  // Paste your project's web config here. Until apiKey and databaseURL are
  // filled in, the poll, supporter counter and idea wall stay hidden.
  firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    appId: "",
  },

  // ---------- CLUB MATCH QUIZ ----------
  // Each answer points to one result type. Change the result text to name
  // real Belmont clubs once you know them.
  quiz: {
    questions: [
      { q: "It's a free period. You're most likely...",
        a: [ { text: "Drawing, writing or making music", type: "create" },
             { text: "Fixing, coding or building something", type: "build" },
             { text: "Shooting hoops or at the gym", type: "compete" },
             { text: "Helping a friend with something", type: "serve" } ] },
      { q: "Pick a superpower.",
        a: [ { text: "Turn any idea into something real", type: "build" },
             { text: "Make anyone laugh or listen", type: "speak" },
             { text: "Never get tired", type: "compete" },
             { text: "Know exactly what people need", type: "serve" } ] },
      { q: "Your group project role is...",
        a: [ { text: "The one presenting", type: "speak" },
             { text: "The one making it look good", type: "create" },
             { text: "The one who makes sure it works", type: "build" },
             { text: "The one keeping everyone together", type: "serve" } ] },
      { q: "What would you watch on a Friday night?",
        a: [ { text: "A big game", type: "compete" },
             { text: "A documentary", type: "serve" },
             { text: "A movie with crazy visuals", type: "create" },
             { text: "A debate or a podcast", type: "speak" } ] },
      { q: "What do you want to leave Belmont with?",
        a: [ { text: "A portfolio I'm proud of", type: "create" },
             { text: "Skills for a real career", type: "build" },
             { text: "A trophy", type: "compete" },
             { text: "A voice people remember", type: "speak" } ] },
    ],
    results: {
      create:  { title: "The Creator",  text: "Art, music, theater, photography or yearbook would be your home." },
      build:   { title: "The Builder",  text: "Robotics, coding, engineering or STEM clubs are calling your name." },
      compete: { title: "The Competitor", text: "Sports teams, intramurals or esports. You were made for game day." },
      serve:   { title: "The Helper",   text: "Community service, peer tutoring or mentoring. You make Belmont better." },
      speak:   { title: "The Voice",    text: "Debate, student government, the school paper or public speaking." },
    },
  },
};
