// Dear Us — data layer (plain JS, attached to window.DU)
// Rich believable memory set + "warm illustrated" scene-fill gradients
// that read as photographs without using real photos.

(function () {
  // ── People & story ────────────────────────────────────────────
  const partners = {
    A: { id: 'A', name: 'Alex',   city: 'San Francisco', short: 'SF',  initial: 'A' },
    B: { id: 'B', name: 'Jordan', city: 'Brooklyn',      short: 'BK',  initial: 'J' },
  };
  const story = {
    metDate: '2024-09-30',
    dayCount: 389,
    milesApart: '2,906',
    daysUntilReunion: 47,
  };

  // ── Scene fills ───────────────────────────────────────────────
  // Each scene is a full CSS `background` value: impressionistic, layered
  // gradients (subject light on top, base wash beneath). A shared grain +
  // vignette overlay is applied by the SceneFill component.
  const SCENES = {
    coffee: `radial-gradient(34% 30% at 45% 44%, #fcf1de 0%, #ecd3a8 42%, transparent 72%),
             radial-gradient(70% 64% at 42% 48%, #d8ab74 0%, #b07c47 46%, transparent 78%),
             linear-gradient(155deg, #7c5734 0%, #4c3320 72%, #341f12 100%)`,
    sky: `radial-gradient(50% 40% at 72% 24%, #fff7e6 0%, transparent 60%),
          radial-gradient(38% 30% at 30% 38%, #ffffff 0%, transparent 64%),
          linear-gradient(180deg, #8ec3e6 0%, #b9dcee 46%, #e7f1e4 100%)`,
    rain: `radial-gradient(60% 50% at 50% 18%, #c8d2d6 0%, transparent 66%),
           radial-gradient(40% 60% at 26% 70%, #6f7e84 0%, transparent 70%),
           linear-gradient(175deg, #56646b 0%, #3e4a51 60%, #2c353b 100%)`,
    concert: `radial-gradient(40% 48% at 50% 30%, #f2b66b 0%, #c8743f 28%, transparent 64%),
              radial-gradient(70% 60% at 50% 96%, #7c3f73 0%, transparent 70%),
              linear-gradient(180deg, #2a1838 0%, #1c1026 70%, #120a18 100%)`,
    airport: `radial-gradient(46% 56% at 78% 36%, #ffe9c2 0%, #f3cf94 32%, transparent 70%),
              radial-gradient(60% 50% at 22% 60%, #aebfcb 0%, transparent 72%),
              linear-gradient(170deg, #8a9bab 0%, #6c7d8d 58%, #515f6c 100%)`,
    park: `radial-gradient(44% 40% at 70% 22%, #fbf3c4 0%, transparent 60%),
           radial-gradient(70% 60% at 36% 78%, #8fae5a 0%, #5f8540 46%, transparent 80%),
           linear-gradient(170deg, #a9c46f 0%, #7ba24f 60%, #4d7637 100%)`,
    food: `radial-gradient(36% 34% at 50% 46%, #fff0d0 0%, #f0c98c 44%, transparent 72%),
           radial-gradient(72% 66% at 50% 52%, #d79f5e 0%, transparent 76%),
           linear-gradient(160deg, #b07c45 0%, #87592f 72%, #5e3b1d 100%)`,
    pier: `radial-gradient(50% 32% at 50% 26%, #fdeecb 0%, transparent 58%),
           radial-gradient(80% 50% at 50% 92%, #4f93a6 0%, #2f6f86 50%, transparent 88%),
           linear-gradient(180deg, #bfe0e7 0%, #7bb6c4 46%, #3d7e93 100%)`,
    night: `radial-gradient(8% 10% at 30% 40%, #ffd98a 0%, transparent 70%),
            radial-gradient(7% 9% at 64% 30%, #ffcaa0 0%, transparent 70%),
            radial-gradient(6% 8% at 78% 56%, #ffe2a8 0%, transparent 70%),
            radial-gradient(70% 60% at 50% 100%, #3a4a7a 0%, transparent 72%),
            linear-gradient(180deg, #16213f 0%, #101933 64%, #0a1022 100%)`,
    sunset: `radial-gradient(54% 46% at 50% 78%, #ffd27a 0%, #f59b56 36%, transparent 72%),
             radial-gradient(60% 40% at 50% 24%, #f4889a 0%, transparent 70%),
             linear-gradient(180deg, #6a5a9c 0%, #c47b86 48%, #f4a96a 100%)`,
    home: `radial-gradient(40% 44% at 70% 36%, #ffe6ad 0%, #f0c074 36%, transparent 72%),
           radial-gradient(70% 70% at 30% 70%, #b98a55 0%, transparent 78%),
           linear-gradient(160deg, #8c6238 0%, #5f4126 70%, #422c18 100%)`,
    snow: `radial-gradient(50% 40% at 50% 20%, #ffffff 0%, transparent 64%),
           radial-gradient(60% 60% at 40% 82%, #dfe7ee 0%, transparent 76%),
           linear-gradient(180deg, #eef4f7 0%, #d2dde6 52%, #b3c2d0 100%)`,
    forest: `radial-gradient(40% 34% at 66% 18%, #eaf2c2 0%, transparent 58%),
             radial-gradient(70% 70% at 38% 80%, #3f6b3a 0%, transparent 80%),
             linear-gradient(170deg, #5d8a4a 0%, #36602f 60%, #1f3d20 100%)`,
    beach: `radial-gradient(50% 34% at 50% 22%, #fff3d4 0%, transparent 58%),
            radial-gradient(80% 38% at 50% 62%, #5fb6c4 0%, #3f93a8 50%, transparent 86%),
            linear-gradient(180deg, #bfe3e6 0%, #eadfbe 58%, #ddc491 100%)`,
    flowers: `radial-gradient(34% 30% at 40% 42%, #ffd9e6 0%, #f2a3bd 42%, transparent 72%),
              radial-gradient(40% 40% at 70% 64%, #cdd98a 0%, transparent 74%),
              linear-gradient(160deg, #e7b9c8 0%, #b98ba2 64%, #7e6f8c 100%)`,
    fireworks: `radial-gradient(7% 9% at 32% 32%, #ffd27a 0%, transparent 64%),
                radial-gradient(9% 11% at 64% 26%, #f48fb1 0%, transparent 66%),
                radial-gradient(6% 8% at 50% 48%, #9fe0ff 0%, transparent 66%),
                linear-gradient(180deg, #141a36 0%, #0e1428 70%, #080c1a 100%)`,
    train: `radial-gradient(46% 60% at 80% 40%, #dfe7ee 0%, transparent 70%),
            radial-gradient(50% 50% at 24% 64%, #8392a3 0%, transparent 74%),
            linear-gradient(165deg, #9aa7b5 0%, #6f7e8e 58%, #4f5c6a 100%)`,
    paper: `linear-gradient(160deg, #fbf4e6 0%, #f3e7cf 100%)`,
  };
  // Build scene list for random / pickers
  const SCENE_KEYS = Object.keys(SCENES).filter(k => k !== 'paper');

  function sceneBg(scene) {
    return SCENES[scene] || SCENES.coffee;
  }

  // Subtle film grain (very light), shared overlay.
  const grainURI =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

  // ── Collections ───────────────────────────────────────────────
  const collections = [
    { id: 'c-first', name: 'First weekend together', type: 'anniversary',
      start: '2024-09-30', end: '2024-10-02', cover: 'airport',
      desc: 'The weekend we met. Three days that started everything.' },
    { id: 'c-nyc', name: 'NYC, in the snow', type: 'trip',
      start: '2025-03-12', end: '2025-03-16', cover: 'snow',
      desc: 'Five snowy days, one small apartment, zero plans.' },
    { id: 'c-bigsur', name: 'Big Sur, june', type: 'trip',
      start: '2025-06-12', end: '2025-06-15', cover: 'pier',
      desc: 'Highway 1, no signal, all coast.' },
    { id: 'c-letters', name: 'Letters', type: 'custom',
      start: null, end: null, cover: 'paper',
      desc: 'Everything we couldn\u2019t say out loud.' },
  ];

  // ── Memories ──────────────────────────────────────────────────
  // by: 'A' = Alex (SF), 'B' = Jordan (Brooklyn)
  const memories = [
    // —— October 2025 (current) ——
    { id: 'm24', type: 'photo', by: 'B', date: '2025-10-24', time: '8:12 am',
      title: 'morning coffee', scene: 'coffee',
      caption: 'the cup you sent me last christmas. still my favorite.',
      place: 'Caf\u00e9 Regular \u00b7 brooklyn', tags: ['coffee', 'ours'],
      reaction: { by: 'A', text: 'miss this' }, sticker: 'new' },

    { id: 'm23', type: 'letter', by: 'B', date: '2025-10-24', time: '9:42 pm',
      title: '', collection: 'c-letters', place: null, tags: ['anniversary', 'blue'],
      words: 71,
      body: `my love,

the sky here is the same blue as
the day we sat on the bench at
pier 25 and you said you'd wait
for me \u2014 even though i told you
not to. you are still waiting.
i am still amazed.

312 days. 47 more.

yours,
jordan` },

    { id: 'm22', type: 'video', by: 'B', date: '2025-10-19', time: '6:30 pm',
      title: 'rainy walk home', scene: 'rain', duration: '0:14',
      caption: 'walked home from the train. said hi from the airport.',
      place: 'Smith St \u00b7 brooklyn', tags: ['rainy', 'brooklyn'] },

    // —— a single day, many pictures (day album) ——
    { id: 'd1', type: 'photo', by: 'B', date: '2025-10-20', time: '9:10 am',
      title: 'first frost coffee', scene: 'coffee', dayTitle: 'a sunday wander',
      caption: 'walked the whole neighborhood for you. picture proof.',
      place: 'Caf\u00e9 Regular \u00b7 brooklyn', tags: ['sunday', 'brooklyn'],
      reaction: { by: 'A', text: 'take me with you next time' } },
    { id: 'd2', type: 'photo', by: 'B', date: '2025-10-20', time: '11:25 am',
      title: 'the corner bookshop', scene: 'home', dayTitle: 'a sunday wander',
      caption: 'found the poetry one you love. left it on the shelf, on purpose.',
      place: 'Books Are Magic \u00b7 brooklyn', tags: ['books', 'sunday'] },
    { id: 'd3', type: 'video', by: 'B', date: '2025-10-20', time: '1:40 pm',
      title: 'leaves coming down', scene: 'park', duration: '0:09', dayTitle: 'a sunday wander',
      caption: 'stood under the big tree and just filmed it for a minute.',
      place: 'Fort Greene Park \u00b7 brooklyn', tags: ['fall', 'sunday'] },
    { id: 'd4', type: 'photo', by: 'B', date: '2025-10-20', time: '2:15 pm',
      title: 'everything bagel, extra', scene: 'food', dayTitle: 'a sunday wander',
      caption: 'ordered two out of habit. ate both, also out of habit.',
      place: 'brooklyn', tags: ['food', 'sunday'], sticker: 'x2' },
    { id: 'd5', type: 'photo', by: 'B', date: '2025-10-20', time: '5:50 pm',
      title: 'golden hour, your bench', scene: 'sunset', dayTitle: 'a sunday wander',
      caption: 'the light hit your spot exactly at 5:50. saved you the photo.',
      place: 'Brooklyn Bridge Park', tags: ['sunset', 'sunday'] },

    { id: 'm21', type: 'ticket', by: 'B', date: '2025-10-18',
      ticketTitle: 'Bon Iver', ticketSub: 'Brooklyn Steel \u00b7 row F \u00b7 seat 12',
      ticketSide: 'ADM ONE', scene: 'concert',
      note: 'cried at \u201cholocene.\u201d worth it.',
      place: 'Brooklyn Steel \u00b7 brooklyn', tags: ['concert', 'nyc'],
      reaction: { by: 'A', text: 'wish i was there' } },

    { id: 'm20', type: 'photo', by: 'A', date: '2025-10-12', time: '4:05 pm',
      title: 'bianca in the park', scene: 'park',
      caption: 'your dog misses you more than she\u2019ll admit.',
      place: 'Dolores Park \u00b7 SF', tags: ['bianca', 'sf'] },

    { id: 'm19', type: 'photo', by: 'A', date: '2025-10-06', time: '7:40 am',
      title: 'foggy run', scene: 'rain',
      caption: 'ran our route. the bench was wet. sat anyway.',
      place: 'Lands End \u00b7 SF', tags: ['morning', 'sf'] },

    { id: 'm18', type: 'letter', by: 'A', date: '2025-10-03', time: '11:20 pm',
      title: '', collection: 'c-letters', tags: ['soup'], words: 54,
      body: `i made the soup. i cried
a little. you were right
about the lemon.

next time i want you
stealing bites before
it's even done.

\u2014 a` },

    // —— September 2025 (anniversary) ——
    { id: 'm17', type: 'letter', by: 'B', date: '2025-09-30', time: '12:01 am',
      title: '', collection: 'c-letters', tags: ['anniversary'], words: 96,
      body: `happy 1 year.

here are 12 things i never
told you \u2014

1) you snore in 3/4 time.
2) i kept the receipt from
   our first coffee.
3) i practice your name
   in different fonts.
\u2026 (9 more inside)

i'd cross every mile again.

\u2014 j` },

    { id: 'm16', type: 'photo', by: 'A', date: '2025-09-30', time: '6:48 pm',
      title: 'one year of us', scene: 'sunset',
      caption: 'watched the same sunset, three time zones apart.',
      place: 'Twin Peaks \u00b7 SF', tags: ['anniversary', 'sf'], sticker: '1 yr' },

    { id: 'm15', type: 'video', by: 'B', date: '2025-09-21', time: '9:15 pm',
      title: 'subway buskers', scene: 'night', duration: '0:22',
      caption: 'they played our song on the L platform. obviously.',
      place: 'Bedford Ave \u00b7 brooklyn', tags: ['music', 'brooklyn'] },

    { id: 'm14', type: 'photo', by: 'A', date: '2025-09-14', time: '10:30 am',
      title: 'farmers market haul', scene: 'food',
      caption: 'bought peaches for one. ate them thinking of you.',
      place: 'Ferry Building \u00b7 SF', tags: ['food', 'sunday'] },

    // —— August 2025 ——
    { id: 'm13', type: 'photo', by: 'B', date: '2025-08-23', time: '7:55 pm',
      title: 'rooftop, golden hour', scene: 'sunset',
      caption: 'saved you the good chair.',
      place: 'Williamsburg roof \u00b7 brooklyn', tags: ['summer', 'sky'] },

    { id: 'm12', type: 'letter', by: 'A', date: '2025-08-09', time: '1:10 am',
      title: '', collection: 'c-letters', tags: ['late'], words: 38,
      body: `can't sleep. it's 1am here,
4 there. you're probably
dreaming.

just wanted today's last
thought to be you.

\u2014 a` },

    // —— July 2025 ——
    { id: 'm11', type: 'ticket', by: 'B', date: '2025-07-04',
      ticketTitle: 'East River fireworks', ticketSub: 'ferry \u00b7 pier 6 \u00b7 8:30pm',
      ticketSide: 'BOARD', scene: 'fireworks',
      note: 'face-timed you the whole finale.',
      place: 'Pier 6 \u00b7 brooklyn', tags: ['july4', 'fireworks'] },

    { id: 'm10', type: 'photo', by: 'A', date: '2025-07-19', time: '5:20 pm',
      title: 'beach day, alone-ish', scene: 'beach',
      caption: 'cold water. warmer if you were yelling about it.',
      place: 'Ocean Beach \u00b7 SF', tags: ['beach', 'summer'] },

    // —— June 2025 — Big Sur trip ——
    { id: 'm9', type: 'photo', by: 'A', date: '2025-06-14', time: '2:00 pm',
      title: 'McWay Falls', scene: 'pier', collection: 'c-bigsur',
      caption: 'you said \u201cokay this one\u2019s the screensaver.\u201d',
      place: 'McWay Falls \u00b7 big sur', tags: ['roadtrip', 'coast'], sticker: 'trip' },

    { id: 'm8', type: 'ticket', by: 'B', date: '2025-06-13',
      ticketTitle: 'Highway 1 \u2014 day pass', ticketSub: 'Monterey \u2192 Big Sur \u00b7 the green car',
      ticketSide: 'ROAD', scene: 'forest', collection: 'c-bigsur',
      note: 'no signal for 40 miles. best 40 miles.',
      place: 'Bixby Bridge', tags: ['roadtrip'] },

    { id: 'm7', type: 'photo', by: 'B', date: '2025-06-12', time: '11:00 am',
      title: 'among the redwoods', scene: 'forest', collection: 'c-bigsur',
      caption: 'we whispered. felt rude to be loud in there.',
      place: 'Pfeiffer Big Sur', tags: ['trees', 'quiet'] },

    // —— March 2025 — NYC snow trip ——
    { id: 'm6', type: 'photo', by: 'A', date: '2025-03-14', time: '9:30 am',
      title: 'snow in the park', scene: 'snow', collection: 'c-nyc',
      caption: 'first snow either of us had shared. you cried. i pretended not to.',
      place: 'Central Park \u00b7 nyc', tags: ['snow', 'nyc'], sticker: '\u2744' },

    { id: 'm5', type: 'ticket', by: 'B', date: '2025-03-13',
      ticketTitle: 'Amtrak NER 173', ticketSub: 'NYP \u2192 BOS \u00b7 seat 14C',
      ticketSide: 'RAIL', scene: 'train', collection: 'c-nyc',
      note: 'you slept on my shoulder the whole way.',
      place: 'Penn Station \u00b7 nyc', tags: ['train', 'trip'] },

    { id: 'm4', type: 'photo', by: 'A', date: '2025-03-12', time: '8:00 am',
      title: 'first morning', scene: 'home', collection: 'c-nyc',
      caption: 'your apartment. my coffee mug already had a spot.',
      place: 'brooklyn', tags: ['home', 'morning'] },

    // —— October 2024 — first weekend ——
    { id: 'm3', type: 'photo', by: 'A', date: '2024-10-02', time: '6:10 am',
      title: 'goodbye, the first one', scene: 'airport', collection: 'c-first',
      caption: 'we said \u201csee you soon\u201d like we knew when.',
      place: 'JFK \u00b7 terminal 5', tags: ['airport', 'goodbye'] },

    { id: 'm2', type: 'photo', by: 'B', date: '2024-10-01', time: '3:30 pm',
      title: 'the bench at pier 25', scene: 'pier', collection: 'c-first',
      caption: 'where you said you\u2019d wait. you did.',
      place: 'Pier 25 \u00b7 nyc', tags: ['firsts', 'nyc'], sticker: '\u2665' },

    { id: 'm1', type: 'photo', by: 'A', date: '2024-09-30', time: '7:45 pm',
      title: 'airport hug', scene: 'airport', collection: 'c-first',
      caption: 'day one. 0 days down, all of them to go.',
      place: 'JFK \u00b7 terminal 5', tags: ['firsts', 'airport'], sticker: '\u2665' },
  ];

  // ── Date helpers ──────────────────────────────────────────────
  const MON = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const DOW = ['sun','mon','tue','wed','thu','fri','sat'];
  function parse(d) { const [y,m,day] = d.split('-').map(Number); return new Date(y, m-1, day); }
  function monDay(d) { const dt = parse(d); return `${MON[dt.getMonth()]} ${dt.getDate()}`; }
  function dow(d) { return DOW[parse(d).getDay()]; }
  function monthKey(d) { const dt = parse(d); return `${dt.getFullYear()}-${dt.getMonth()}`; }
  function monthLabel(d) { const dt = parse(d); return `${MON[dt.getMonth()]} ${dt.getFullYear()}`; }

  window.DU = {
    partners, story, SCENES, SCENE_KEYS, sceneBg, grainURI,
    collections, memories,
    fmt: { monDay, dow, monthKey, monthLabel, MON, DOW, parse },
  };
})();
