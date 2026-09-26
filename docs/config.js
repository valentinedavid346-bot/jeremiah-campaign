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
  slogan: "Make the alarm worth it.",
  tagline: "A Belmont worth waking up for.",   // smaller line under the slogan

  // ---------- HOME ----------
  // Election: date-time in local time, e.g. "2026-10-15T08:00"
  electionDate: "",
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
  reasons: [
    // { title: "He listens first", detail: "Every idea on this site started as a student's message..." },
    // { title: "He's already done the work", detail: "..." },
  ],

  // ---------- AGENDA BOARD (campaign events) ----------
  // Past events move to "Already happened" automatically.
  events: [
    // { date: "2026-10-02", time: "12:15 PM", title: "Lunch meet & greet",
    //   place: "Cafeteria", detail: "Come say hi and share your ideas." },
    // { date: "2026-10-09", time: "3:00 PM", title: "Candidate debate", place: "Auditorium" },
  ],

  // ---------- Q&A ----------
  faq: [
    // { q: "Why are you running?", a: "Because..." },
    // { q: "What's the first thing you'd change?", a: "..." },
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
  contactFormEndpoint: "",      // optional: a free Formspree link, e.g. "https://formspree.io/f/abcd1234"
  findHim: "",                  // e.g. "Room 204 during lunch, or after school by the front steps."
  ideasFormUrl: "",             // Google Form for platform ideas
  socials: [
    // { label: "Instagram", url: "https://instagram.com/..." },
    // { label: "TikTok", url: "https://tiktok.com/@..." },
  ],

  // ---------- TURN FEATURES ON / OFF (true = on, false = off) ----------
  features: {
    alarmClock: true,     // tap-to-wake alarm clock that reveals the plan
    photoFrame: true,     // "I'm voting Jeremiah" photo frame maker (Join in page)
    clubQuiz: true,       // club match quiz (Join in page)
    poll: true,           // live "What matters most?" poll (needs firebase below)
    supporters: true,     // live supporter counter (needs firebase below)
    ideaWall: true,       // live idea wall with approval (needs firebase below)
  },
  supportersMinToShow: 10,   // hide the number until at least this many people join

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
