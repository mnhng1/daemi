// Dear Us — Collections: list, detail, create.

function membersOf(app, id) { return app.sortedMemories().filter(m => m.collection === id); }
const COLL_TAG = { trip: 'trip', anniversary: 'anniv.', custom: 'custom' };

function CollectionRow({ c, app }) {
  const members = membersOf(app, c.id);
  const covers = members.filter(m => m.scene).slice(0, 2);
  return (
    <button onClick={() => app.openCollection(c)} className="du-card" style={{ width: '100%', textAlign: 'left',
      display: 'flex', gap: 13, alignItems: 'center', padding: '11px 13px', cursor: 'pointer',
      borderRadius: 16, border: '1px solid var(--line)', background: 'var(--surface)', boxShadow: 'var(--cardShadow)', position: 'relative' }}>
      <div style={{ width: 62, height: 58, position: 'relative', flex: '0 0 auto' }}>
        {[covers[1] || { scene: c.cover }, covers[0] || { scene: c.cover }].map((m, i) => (
          <div key={i} style={{ position: 'absolute', top: i === 0 ? 2 : 8, left: i === 0 ? 12 : 0,
            width: 48, height: 46, borderRadius: 9, overflow: 'hidden', border: '2px solid var(--surface)',
            boxShadow: '0 2px 6px rgba(0,0,0,.14)', transform: `rotate(${i === 0 ? 5 : -4}deg)` }}>
            <SceneFill scene={m.scene} radius={7} /></div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 19, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05 }}>{c.name}</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink2)', marginTop: 3 }}>{collSub(c, members.length)}</div>
      </div>
      <Sticker text={COLL_TAG[c.type]} rotate={6} top={-7} right={8} />
      <Icon name="chevron" size={18} color="var(--ink3)" />
    </button>
  );
}
function collSub(c, n) {
  if (c.start) return `${DU.fmt.monDay(c.start)} – ${DU.fmt.monDay(c.end)} · ${n} memories`;
  return `ongoing · ${n} memories`;
}

function CollectionsScreen({ app }) {
  return (
    <>
      <AppHeader title="Trips &amp; moments" hand sub={`${DU.collections.length} collections`}
        left={<HeaderBtn icon="heart" onClick={() => app.go('timeline')} />}
        right={<HeaderBtn icon="plus" onClick={() => app.set({ newCollection: true })} />} />
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {DU.collections.map(c => <CollectionRow key={c.id} c={c} app={app} />)}
        <button onClick={() => app.set({ newCollection: true })} style={{ marginTop: 4, padding: 16, borderRadius: 16,
          border: '1.5px dashed var(--ink4)', background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--ink2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="plus" size={18} color="var(--ink2)" /> new collection</button>
      </div>
      <BottomNav active="collections" onNav={app.go} onAdd={app.openAdd} />
    </>
  );
}

function CollectionDetailScreen({ c, app }) {
  const members = membersOf(app, c.id);
  // group by date
  const byDate = {};
  members.forEach(m => (byDate[m.date] = byDate[m.date] || []).push(m));
  const dates = Object.keys(byDate).sort();
  const [dayIdx, setDayIdx] = React.useState(0);
  const activeDate = dates[dayIdx] || dates[0];
  return (
    <div className="du-push" style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title={c.name} sub={collSub(c, members.length)}
        left={<HeaderBtn icon="back" onClick={app.closeCollection} />}
        right={<HeaderBtn icon="more" />} />
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--cardShadow)' }}>
            <SceneFill scene={c.cover} h={150} radius={18}>
              <Sticker text={COLL_TAG[c.type]} rotate={-5} top={10} left={10} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,8,.6), transparent 56%)' }} />
              <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'rgba(255,255,255,.9)', marginTop: 4 }}>{c.desc}</div>
              </div>
            </SceneFill>
          </div>
        </div>
        {dates.length > 1 && <div className="du-noscroll" style={{ display: 'flex', gap: 7, padding: '14px 16px 4px', overflowX: 'auto' }}>
          {dates.map((d, i) => <Chip key={d} label={`${DU.fmt.monDay(d)}`} active={i === dayIdx} onClick={() => setDayIdx(i)} />)}
        </div>}
        <div style={{ padding: '12px 16px 28px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--ink3)' }}>
            day {dayIdx + 1} · {DU.fmt.monDay(activeDate)}</div>
          {(byDate[activeDate] || []).map(m => <MemoryCard key={m.id} m={m} rot={0} onOpen={() => app.openMemory(m)} />)}
        </div>
      </div>
    </div>
  );
}

function NewCollectionSheet({ app }) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('trip');
  return (
    <Backdrop onClose={() => app.set({ newCollection: false })}>
      <div className="du-slide-up" style={{ background: 'var(--paper)', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '14px 20px 24px' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--ink4)', margin: '0 auto 14px' }} />
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: 16 }}>new collection</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <EField label="name" autoFocus value={name} onChange={setName} placeholder="paris in june" />
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>type</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['trip', 'anniversary', 'custom'].map(t => <Chip key={t} label={t} active={type === t} onClick={() => setType(t)} />)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}><Field label="start" value="jun 4, 2026" icon="calendar" /></div>
            <div style={{ flex: 1 }}><Field label="end" value="jun 12, 2026" icon="calendar" /></div>
          </div>
          <EField label="note" optional multiline value="" onChange={() => {}} placeholder="what's this one about?" font="var(--font-hand)" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 2 }}>
            <Btn label="cancel" sm onClick={() => app.set({ newCollection: false })} />
            <Btn label="create" primary sm icon="check" onClick={() => app.createCollection(name || 'untitled', type)} />
          </div>
        </div>
      </div>
    </Backdrop>
  );
}

Object.assign(window, { CollectionsScreen, CollectionDetailScreen, NewCollectionSheet, CollectionRow, membersOf, collSub });
