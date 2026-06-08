// Dear Us — Places browse, Search, and network-state visuals.

// ───────── Places ─────────
function placesAgg(app) {
  const map = {};
  app.sortedMemories().forEach(m => { if (m.place) { const key = m.place;
    (map[key] = map[key] || { name: key, count: 0 }).count++; } });
  const faves = { "Pier 25 · nyc": true, "Caf\u00e9 Regular · brooklyn": true, "Lands End · SF": true };
  return Object.values(map).map(p => ({ ...p, fave: !!faves[p.name],
    city: (p.name.split('\u00b7')[1] || '').trim() })).sort((a, b) => b.count - a.count);
}

function PlacesScreen({ app }) {
  const [chip, setChip] = React.useState('all');
  let places = placesAgg(app);
  if (chip === 'faves') places = places.filter(p => p.fave);
  const total = placesAgg(app).reduce((s, p) => s + p.count, 0);
  return (
    <>
      <AppHeader title="Our places" hand sub={`${placesAgg(app).length} spots · ${total} memories`}
        left={<HeaderBtn icon="back" onClick={() => app.go('timeline')} />}
        right={<HeaderBtn icon="search" onClick={() => app.go('search')} />} />
      <div style={{ display: 'flex', gap: 7, padding: '12px 16px 8px', flex: '0 0 auto' }}>
        {['all', 'faves', 'cities'].map(c => <Chip key={c} label={c === 'faves' ? '★ faves' : c} active={chip === c} onClick={() => setChip(c)} />)}
      </div>
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 24px' }}>
        {places.map((p, i) => (
          <button key={p.name} onClick={() => app.searchPlace(p.name)} style={{ width: '100%', textAlign: 'left',
            display: 'flex', gap: 12, alignItems: 'center', padding: '11px 2px', background: 'none', cursor: 'pointer',
            border: 'none', borderBottom: i < places.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flex: '0 0 auto',
              background: p.fave ? 'var(--accent)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="pin" size={18} color={p.fave ? '#fff' : 'var(--ink2)'} fill={p.fave ? '#fff' : 'none'} sw={1.6} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
                display: 'flex', alignItems: 'center', gap: 5 }}>{p.name.split('\u00b7')[0].trim()}
                {p.fave && <Icon name="heart" size={12} color="var(--accent)" fill="var(--accent)" sw={0} />}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink3)' }}>{p.name}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--ink2)',
              padding: '3px 9px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--line)' }}>{p.count}</div>
          </button>
        ))}
      </div>
      <BottomNav active="places" onNav={app.go} onAdd={app.openAdd} />
    </>
  );
}

// ───────── Search ─────────
function SearchScreen({ app }) {
  const [q, setQ] = React.useState(app.state.searchSeed || '');
  React.useEffect(() => { if (app.state.searchSeed) app.set({ searchSeed: '' }); }, []);
  const allTags = [...new Set(DU.memories.flatMap(m => m.tags || []))];
  const topTags = ['anniversary', 'nyc', 'brooklyn', 'sf', 'coffee', 'roadtrip'];
  const query = q.trim().toLowerCase().replace(/^#/, '').replace(/^place:/, '');
  const results = !query ? [] : app.sortedMemories().filter(m => {
    const hay = [m.title, m.body, m.place, m.note, m.ticketTitle, ...(m.tags || [])].join(' ').toLowerCase();
    return hay.includes(query);
  });
  return (
    <>
      <div style={{ padding: '12px 14px 10px', display: 'flex', gap: 10, alignItems: 'center', flex: '0 0 auto', borderBottom: '1px solid var(--line)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--accent)', borderRadius: 12,
          background: 'var(--surface)', padding: '9px 12px' }}>
          <Icon name="search" size={16} color="var(--ink3)" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="search memories, tags, places…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--ink)' }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Icon name="close" size={15} color="var(--ink3)" /></button>}
        </div>
        <button onClick={() => app.go('timeline')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ink2)', fontWeight: 500 }}>cancel</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '12px 14px 6px', flex: '0 0 auto' }}>
        {topTags.map(t => <Chip key={t} label={'#' + t} active={query === t} onClick={() => setQ('#' + t)} />)}
      </div>
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 14px 24px' }}>
        {!query ? (
          <div style={{ textAlign: 'center', marginTop: 40, fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--ink3)' }}>
            nothing yet —<br />try a tag or a place</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40, fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--ink3)' }}>
            no memories match “{q}”</div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--ink2)', marginBottom: 10 }}>
              {results.length} {results.length === 1 ? 'memory' : 'memories'} for “{q}”</div>
            <div style={{ columns: 2, columnGap: 10 }}>
              {results.map(m => <div key={m.id} style={{ breakInside: 'avoid', marginBottom: 10 }}>
                <MemoryCard m={m} rot={0} onOpen={() => app.openMemory(m)} /></div>)}
            </div>
          </>
        )}
      </div>
      <BottomNav active="search" onNav={app.go} onAdd={app.openAdd} />
    </>
  );
}

// ───────── Network banner (offline) ─────────
function NetBanner({ app }) {
  if (app.state.net !== 'offline') return null;
  return (
    <div style={{ flex: '0 0 auto', background: 'var(--highlight)', borderBottom: '1px solid var(--line)',
      padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--ink)' }}>
      <Icon name="alert" size={15} color="var(--ink)" />
      <span style={{ flex: 1 }}>no connection · {app.state.queue} {app.state.queue === 1 ? 'memory' : 'memories'} waiting</span>
      <button onClick={() => app.set({ net: 'online', queue: 0 })} style={{ background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>retry</button>
    </div>
  );
}

// Uploading overlay card (top of day view)
function UploadingCard() {
  return (
    <TLRow date="now" sub="syncing" filled>
      <div style={{ position: 'relative' }}>
        <SceneFill scene="rain" h={120} radius={14} style={{ filter: 'saturate(.7)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,246,239,.82)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>uploading…</div>
            <div style={{ width: 130, height: 7, borderRadius: 4, background: 'var(--surface2)', border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div className="du-progress" style={{ height: '100%', background: 'var(--accent)' }} /></div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink2)' }}>8MB / 13MB</div>
          </div>
        </SceneFill>
      </div>
    </TLRow>
  );
}

Object.assign(window, { PlacesScreen, SearchScreen, NetBanner, UploadingCard, placesAgg });
