// Dear Us — App shell: state, theming, routing, overlays, side panel, scaler.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "plum",
  "font": "hand",
  "dark": false,
  "playful": 1,
  "viewer": "A"
}/*EDITMODE-END*/;

const ACCENTS = {
  plum:       { accent: '#8c5a7c', soft: '#ecd6e2' },
  sage:       { accent: '#5f7e49', soft: '#dde7cd' },
  indigo:     { accent: '#4a6ba8', soft: '#d4deef' },
  mustard:    { accent: '#b07d22', soft: '#f0e3bb' },
  terracotta: { accent: '#c4623f', soft: '#f4d9cd' },
};
const FONTS = {
  hand:  { ui: '"Patrick Hand", system-ui, sans-serif', head: '"Caveat", cursive', hand: '"Caveat", cursive' },
  clean: { ui: '"IBM Plex Sans", system-ui, sans-serif', head: '"IBM Plex Sans", system-ui, sans-serif', hand: '"Caveat", cursive' },
};

function themeVars(t) {
  const a = ACCENTS[t.accent] || ACCENTS.plum;
  const f = FONTS[t.font] || FONTS.hand;
  const base = {
    '--accent': a.accent,
    '--font-ui': f.ui, '--font-head': f.head, '--font-hand': f.hand,
  };
  const light = {
    '--ink': '#2c2620', '--ink2': '#5d5246', '--ink3': '#988b7c', '--ink4': '#d6cbb9',
    '--paper': '#f6efe1', '--surface': '#fffdf8', '--surface2': '#efe7d5',
    '--line': 'rgba(44,38,32,.13)', '--letterPaper': '#fdf8ea', '--highlight': '#f6df8c',
    '--accentSoft': a.soft, '--accentText': `color-mix(in srgb, ${a.accent} 72%, #2c2620)`,
    '--cardShadow': '0 5px 16px -8px rgba(70,48,28,.30), 0 1px 2px rgba(70,48,28,.10)',
  };
  const dark = {
    '--ink': '#f0e7da', '--ink2': '#c4b6a6', '--ink3': '#8d8073', '--ink4': '#4c4338',
    '--paper': '#201a24', '--surface': '#2b2431', '--surface2': '#261f2c',
    '--line': 'rgba(255,255,255,.10)', '--letterPaper': '#2a2230', '--highlight': '#b89a4a',
    '--accentSoft': `color-mix(in srgb, ${a.accent} 30%, #2b2431)`,
    '--accentText': `color-mix(in srgb, ${a.accent} 55%, #f0e7da)`,
    '--cardShadow': '0 8px 22px -10px rgba(0,0,0,.6), 0 1px 2px rgba(0,0,0,.4)',
  };
  return { ...base, ...(t.dark ? dark : light) };
}

const SCREEN_NOTES = {
  timeline: 'The home. A vertical spine through time — today on top, scroll back through every shared moment. Pinch or use the zoom control for year / month / day.',
  collections: 'Trips, anniversaries and custom groupings. A memory belongs to at most one collection.',
  collection: 'Inside a collection — cover, story, and memories grouped by day.',
  places: 'Place is metadata, not a type. This lens groups every memory by where it happened.',
  search: 'Search across captions, letters, places and tags. Tap a tag chip to jump.',
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [memories, setMemories] = React.useState(() => DU.memories.slice());
  const [state, setState] = React.useState({
    route: 'timeline', zoom: 'day', filter: 'all', scrolled: false,
    net: 'online', queue: 0, uploading: false,
    selMemory: null, selCollection: null,
    adding: false, addStep: null, addDraft: null, subSheet: null,
    newCollection: false, toast: null, searchSeed: '', justSavedId: null, dayGallery: null, bump: 0,
  });
  const set = (patch) => setState(s => ({ ...s, ...patch }));

  // ── scaler ──
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const wide = window.innerWidth > 900;
      const groupW = wide ? 300 + 40 + 372 : 372;
      const k = Math.min((window.innerWidth - 48) / groupW, (window.innerHeight - 40) / 772, 1.08);
      setScale(Math.max(0.4, k));
    };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  const viewer = () => DU.partners[t.viewer] || DU.partners.A;
  const otherPartner = () => DU.partners[t.viewer === 'A' ? 'B' : 'A'];
  const sortedMemories = () => memories.slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

  const app = {
    state, set, tweaks: { playful: t.playful },
    viewer, otherPartner, sortedMemories,
    go: (r) => set({ route: r, scrolled: false, selMemory: null, selCollection: null }),
    openMemory: (m) => set({ selMemory: m }),
    closeMemory: () => set({ selMemory: null }),
    openCollection: (c) => set({ selCollection: c, route: 'collection' }),
    closeCollection: () => set({ selCollection: null, route: 'collections' }),
    openDayGallery: (date, items) => set({ dayGallery: { date, items } }),
    closeDayGallery: () => set({ dayGallery: null }),
    openAdd: () => set({ adding: true, addStep: 'picker' }),
    closeAdd: () => set({ adding: false, addStep: null, addDraft: null, subSheet: null }),
    pickType: (type) => set({ addStep: type, addDraft: freshDraft(type) }),
    searchPlace: (name) => set({ route: 'search', searchSeed: name }),
    showToast: (text, undo) => { set({ toast: { text, undo } });
      clearTimeout(window.__duToast); window.__duToast = setTimeout(() => set({ toast: null }), 4200); },
    saveDraft: () => doSave(),
    createCollection: (name, type) => {
      const id = 'c' + Date.now();
      DU.collections.push({ id, name, type, start: type === 'custom' ? null : '2026-06-04',
        end: type === 'custom' ? null : '2026-06-12', cover: 'sky', desc: '' });
      const patch = { newCollection: false, bump: state.bump + 1 };
      if (state.addDraft) patch.addDraft = { ...state.addDraft, collection: id };
      set(patch); app.showToast('collection created ✓');
    },
    resetData: () => { setMemories(DU.memories.slice());
      set({ route: 'timeline', zoom: 'day', filter: 'all', net: 'online', queue: 0, selMemory: null, toast: null }); },
  };

  function freshDraft(type) {
    const scenePick = { photo: 'coffee', video: 'rain', ticket: 'concert' }[type] || 'sky';
    return { type, scene: scenePick, date: '2025-10-24', title: '', body: '', tagStr: '',
      place: '', collection: '', ticketTitle: '', whenStr: 'oct 24, 2025', seat: '', note: '' };
  }

  function draftToMemory(d) {
    const id = 'new' + Date.now();
    const by = t.viewer;
    const tags = (d.tagStr || '').split(/[,\s]+/).map(s => s.trim().replace(/^#/, '')).filter(Boolean);
    const base = { id, type: d.type, by, date: '2025-10-24', time: '9:41 am',
      place: d.place || null, collection: d.collection || null, tags, justSaved: true };
    if (d.type === 'photo' || d.type === 'video') return { ...base, title: d.title || 'untitled', scene: d.scene,
      caption: d.title || '', duration: d.type === 'video' ? '0:12' : undefined };
    if (d.type === 'letter') return { ...base, title: '', body: d.body || '…',
      words: (d.body || '').trim().split(/\s+/).filter(Boolean).length };
    return { ...base, ticketTitle: d.ticketTitle || 'ticket', ticketSub: [d.whenStr, d.seat].filter(Boolean).join(' · '),
      ticketSide: 'ADM', scene: d.scene, note: d.note || '' };
  }

  function doSave() {
    const d = state.addDraft; if (!d) return;
    const mem = draftToMemory(d);
    if (state.net === 'offline') {
      mem.queued = true;
      setMemories(ms => [mem, ...ms]);
      set({ adding: false, addStep: null, addDraft: null, subSheet: null, route: 'timeline', zoom: 'day', filter: 'all', scrolled: false, queue: state.queue + 1 });
      app.showToast('saved — will sync when online');
      return;
    }
    // online: show uploading, then land
    set({ adding: false, addStep: null, addDraft: null, subSheet: null, route: 'timeline', zoom: 'day', filter: 'all', scrolled: false, uploading: true });
    setTimeout(() => {
      setMemories(ms => [mem, ...ms]);
      set({ uploading: false, justSavedId: mem.id });
      app.showToast('saved to your scrapbook ♥', true);
      clearTimeout(window.__duSpark); window.__duSpark = setTimeout(() => set({ justSavedId: null }), 2600);
    }, 1600);
  }

  // simulate upload from side panel
  const simulateUpload = () => {
    if (state.uploading) return;
    set({ route: 'timeline', zoom: 'day', filter: 'all', uploading: true, scrolled: false });
    setTimeout(() => { set({ uploading: false }); app.showToast('synced ✓'); }, 2200);
  };

  const route = state.route;
  let screen = null;
  if (route === 'timeline') screen = <TimelineScreen app={app} />;
  else if (route === 'collections') screen = <CollectionsScreen app={app} />;
  else if (route === 'collection') screen = <CollectionDetailScreen c={state.selCollection} app={app} />;
  else if (route === 'places') screen = <PlacesScreen app={app} />;
  else if (route === 'search') screen = <SearchScreen app={app} />;

  const wide = window.innerWidth > 900;

  return (
    <div style={{ ...themeVars(t), position: 'fixed', inset: 0, overflow: 'hidden',
      background: t.dark ? 'radial-gradient(120% 90% at 50% -10%, #2a2233, #14101a 70%)' : 'radial-gradient(120% 90% at 50% -10%, #efe6d2, #ddd0b7 75%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)' }}>
      {/* faint grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: t.dark ? 0.5 : 0.6,
        backgroundImage: `linear-gradient(${t.dark ? 'rgba(255,255,255,.04)' : 'rgba(44,38,32,.05)'} 1px, transparent 1px), linear-gradient(90deg, ${t.dark ? 'rgba(255,255,255,.04)' : 'rgba(44,38,32,.05)'} 1px, transparent 1px)`,
        backgroundSize: '26px 26px' }} />
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center',
        display: 'flex', alignItems: 'center', gap: 40 }}>
        {wide && <SidePanel app={app} t={t} setTweak={setTweak} onSimUpload={simulateUpload} />}
        <PhoneFrame dark={t.dark}>
          {screen}
          {state.dayGallery && <DayGalleryDetail gallery={state.dayGallery} app={app} />}
          {state.selMemory && <DetailScreen m={state.selMemory} app={app} />}
          {state.adding && state.addStep === 'picker' && <TypePicker app={app} />}
          {state.adding && state.addStep === 'photo' && <PhotoComposer app={app} />}
          {state.adding && state.addStep === 'video' && <PhotoComposer app={app} video />}
          {state.adding && state.addStep === 'letter' && <LetterComposer app={app} />}
          {state.adding && state.addStep === 'ticket' && <TicketComposer app={app} />}
          {state.subSheet === 'place' && <LocationPicker app={app} />}
          {state.subSheet === 'collection' && <CollectionPicker app={app} />}
          {state.newCollection && <NewCollectionSheet app={app} />}
          {state.toast && <Toast toast={state.toast} app={app} />}
        </PhoneFrame>
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakColor label="Palette" value={ACCENTS[t.accent].accent}
          options={Object.values(ACCENTS).map(a => a.accent)}
          onChange={(v) => setTweak('accent', Object.keys(ACCENTS).find(k => ACCENTS[k].accent === v) || 'plum')} />
        <TweakSection label="Type & mood" />
        <TweakRadio label="Lettering" value={t.font === 'clean' ? 'Clean' : 'Handwritten'} options={['Handwritten', 'Clean']}
          onChange={(v) => setTweak('font', v === 'Clean' ? 'clean' : 'hand')} />
        <TweakToggle label="Evening (dark)" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakSlider label="Scrapbook tilt" value={t.playful} min={0} max={2} step={0.5}
          onChange={(v) => setTweak('playful', v)} />
        <TweakSection label="Viewing as" />
        <TweakRadio label="Partner" value={t.viewer === 'B' ? 'Jordan' : 'Alex'} options={['Alex', 'Jordan']}
          onChange={(v) => setTweak('viewer', v === 'Jordan' ? 'B' : 'A')} />
      </TweaksPanel>
    </div>
  );
}

// ── Toast ──
function Toast({ toast, app }) {
  return (
    <div className="du-toast" style={{ position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 60,
      background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 12px 28px -8px rgba(0,0,0,.5)' }}>
      <Icon name="heart" size={17} color="var(--accent)" fill="var(--accent)" sw={0} />
      <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: 13 }}>{toast.text}</span>
      {toast.undo && <button onClick={() => app.set({ toast: null })} style={{ background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, color: 'var(--highlight)' }}>undo</button>}
    </div>
  );
}

// ── Side panel (notes + state controls) ──
function SidePanel({ app, t, setTweak, onSimUpload }) {
  const s = app.state;
  const routeName = { timeline: 'Timeline', collections: 'Collections', collection: 'Collection',
    places: 'Places', search: 'Search' }[s.route] || 'Timeline';
  return (
    <div style={{ width: 300, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: 'var(--font-ui)' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 38, fontWeight: 700, color: 'var(--ink)', lineHeight: .9 }}>Dear&nbsp;Us</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink2)', marginTop: 4, lineHeight: 1.45 }}>
          A private shared scrapbook for two people and the distance between them.</div>
      </div>

      <PanelCard>
        <Label>Now viewing</Label>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{routeName}</div>
        <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 6, lineHeight: 1.5 }}>{SCREEN_NOTES[s.route]}</div>
      </PanelCard>

      <PanelCard>
        <Label>State controls</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink2)', flex: 1 }}>Connection</span>
          <Seg value={s.net} options={[['online', 'online'], ['offline', 'offline']]}
            onChange={(v) => app.set({ net: v, queue: v === 'online' ? 0 : s.queue })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <PanelBtn icon="film" label="Upload" onClick={onSimUpload} />
          <PanelBtn icon="plus" label="Add memory" onClick={app.openAdd} />
          <PanelBtn icon="sparkle" label="Anniversary" onClick={() => { app.set({ route: 'timeline', zoom: 'year', filter: 'all' }); }} />
          <PanelBtn icon="trash" label="Reset" onClick={app.resetData} />
        </div>
      </PanelCard>

      <PanelCard>
        <Label>Memory types</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[['image', 'photo'], ['film', 'video'], ['edit', 'letter'], ['ticket', 'ticket']].map(([ic, l]) => (
            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink2)' }}>
              <Icon name={ic} size={14} color="var(--accent)" /> {l}</span>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 10, lineHeight: 1.5 }}>
          Tap <b style={{ color: 'var(--accent)' }}>+</b> to add · open any card for detail · pinch / zoom in the header.</div>
      </PanelCard>
    </div>
  );
}
function PanelCard({ children }) {
  return <div style={{ background: 'color-mix(in srgb, var(--paper) 78%, transparent)', border: '1px solid var(--line)',
    borderRadius: 16, padding: '14px 16px', backdropFilter: 'blur(4px)', boxShadow: 'var(--cardShadow)' }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
    color: 'var(--ink3)', marginBottom: 8 }}>{children}</div>;
}
function PanelBtn({ icon, label, onClick }) {
  return <button onClick={onClick} className="du-card" style={{ display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 10px', borderRadius: 11, border: '1px solid var(--line)', background: 'var(--surface)',
    cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
    <Icon name={icon} size={14} color="var(--accent)" /> {label}</button>;
}
function Seg({ value, options, onChange }) {
  return <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 9, padding: 2, border: '1px solid var(--line)' }}>
    {options.map(([v, l]) => <button key={v} onClick={() => onChange(v)} style={{ padding: '4px 11px', borderRadius: 7, border: 'none',
      cursor: 'pointer', background: value === v ? 'var(--surface)' : 'transparent', boxShadow: value === v ? '0 1px 2px rgba(0,0,0,.12)' : 'none',
      color: value === v ? 'var(--ink)' : 'var(--ink3)', fontFamily: 'var(--font-ui)', fontSize: 11.5, fontWeight: 600 }}>{l}</button>)}
  </div>;
}

Object.assign(window, { App, Toast, SidePanel });
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
