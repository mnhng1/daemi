// Dear Us — memory cards. One visual per type; <MemoryCard> dispatches.
// Used on the timeline (tappable) and reused (larger) in detail views.

function snippet(body, n = 3) {
  return (body || '').split('\n').filter(l => l.trim()).slice(0, n).join('\n');
}

// Reaction + author footer used on photo/video cards
function CardFoot({ m }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
      {m.place && <MetaPill icon="pin" label={m.place} />}
      {m.collection && <MetaPill icon="folder" label={collName(m.collection)} accent />}
      <span style={{ flex: 1 }} />
      {m.reaction && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        <Icon name="heart" size={13} color="var(--accent)" fill="var(--accent)" sw={0} />
      </span>}
      <Avatar who={m.by} size={19} />
    </div>
  );
}
function collName(id) { const c = DU.collections.find(c => c.id === id); return c ? c.name : id; }

// ───────── Photo / Video ─────────
function PhotoCard({ m, rot = 0, onOpen, w = '100%', imgH = 132, big }) {
  return (
    <div onClick={onOpen} style={{ transform: `rotate(${rot}deg)`, cursor: 'pointer', width: w,
      transition: 'transform .18s, box-shadow .18s' }} className="du-card">
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 7,
        border: '1px solid var(--line)', boxShadow: 'var(--cardShadow)' }}>
        <SceneFill scene={m.scene} h={imgH} radius={11} kind={m.type === 'video' ? 'video' : undefined}>
          {m.type === 'video' && m.duration && (
            <div style={{ position: 'absolute', bottom: 7, right: 7, background: 'rgba(12,8,6,.6)',
              color: '#fff', padding: '2px 7px', borderRadius: 7, fontFamily: 'var(--font-ui)',
              fontSize: 10.5, fontWeight: 600, backdropFilter: 'blur(2px)' }}>{m.duration}</div>)}
          {m.sticker && <Sticker text={m.sticker} rotate={7} top={-7} right={-6} />}
        </SceneFill>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: big ? 22 : 17, fontWeight: 600,
          color: 'var(--ink)', marginTop: 7, lineHeight: 1.05, padding: '0 2px' }}>{m.title}</div>
        <div style={{ padding: '0 2px' }}><CardFoot m={m} /></div>
      </div>
    </div>
  );
}

// ───────── Letter ─────────
function LetterCard({ m, onOpen, full }) {
  return (
    <div onClick={onOpen} style={{ cursor: onOpen ? 'pointer' : 'default' }} className="du-card">
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden',
        background: 'var(--letterPaper)', border: '1px solid var(--line)', boxShadow: 'var(--cardShadow)',
        padding: '13px 15px 11px' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45,
          backgroundImage: 'repeating-linear-gradient(var(--letterPaper) 0 22px, var(--ink4) 22px 23px)',
          backgroundPosition: '0 30px' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2.5,
          background: 'color-mix(in srgb, var(--accent) 55%, transparent)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Icon name="edit" size={13} color="var(--ink3)" />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, fontWeight: 600,
              color: 'var(--ink3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
              letter from {DU.partners[m.by].name}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: full ? 19 : 16.5,
            lineHeight: full ? 1.5 : 1.32, color: 'var(--ink)', whiteSpace: 'pre-line' }}>
            {full ? m.body : snippet(m.body, 3) + '\u2026'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8,
            fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{DU.fmt.monDay(m.date)} {m.time ? '\u00b7 ' + m.time : ''}</span>
            {m.words && <span style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>{m.words} words</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────── Ticket ─────────
function TicketCard({ m, onOpen, big }) {
  return (
    <div onClick={onOpen} style={{ cursor: onOpen ? 'pointer' : 'default', position: 'relative' }} className="du-card">
      <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', position: 'relative',
        background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--cardShadow)',
        minHeight: big ? 110 : 84 }}>
        <SceneFill scene={m.scene} w={big ? 130 : 98} h="auto" radius={0} style={{ flex: '0 0 auto' }}>
          <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: 'var(--font-ui)',
            fontSize: 8.5, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.85)',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{m.ticketSide}</div>
        </SceneFill>
        {/* perforation */}
        <div style={{ position: 'relative', width: 0 }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: -0.5, width: 1,
            borderLeft: '1.5px dashed var(--ink4)' }} />
          <div style={{ position: 'absolute', top: -7, left: -7, width: 14, height: 14, borderRadius: 7,
            background: 'var(--paper)', border: '1px solid var(--line)' }} />
          <div style={{ position: 'absolute', bottom: -7, left: -7, width: 14, height: 14, borderRadius: 7,
            background: 'var(--paper)', border: '1px solid var(--line)' }} />
        </div>
        <div style={{ flex: 1, padding: big ? '14px 16px' : '11px 13px', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <Icon name="ticket" size={13} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9.5, fontWeight: 700,
              letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink3)' }}>admit one</span>
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: big ? 23 : 18, fontWeight: 700,
            color: 'var(--ink)', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.ticketTitle}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--ink2)', marginTop: 3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.ticketSub}</div>
          {(m.place || m.collection) && <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
            {m.place && <MetaPill icon="pin" label={m.place} />}
            {m.collection && <MetaPill icon="folder" label={collName(m.collection)} accent />}
          </div>}
        </div>
      </div>
    </div>
  );
}

// ───────── Day album / cluster (many pictures, one day) ─────────
function ClusterTile({ m, radius = 8, overlay }) {
  return (
    <div style={{ position: 'relative', borderRadius: radius, overflow: 'hidden', width: '100%', height: '100%' }}>
      <SceneFill scene={m.scene} radius={radius} kind={m.type === 'video' ? 'video' : undefined} h="100%" />
      {overlay && <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,14,10,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700 }}>+{overlay}</div>}
    </div>
  );
}

function ClusterCard({ items, onOpen }) {
  const n = items.length;
  const place = (items.find(i => i.place) || {}).place;
  const title = items[0].dayTitle || `${n} moments`;
  const extra = n - 4;
  const H = 150;
  let collage;
  if (n === 2) {
    collage = <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: H }}>
      <ClusterTile m={items[0]} /><ClusterTile m={items[1]} /></div>;
  } else if (n === 3) {
    collage = <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, height: H }}>
      <div style={{ gridRow: '1 / 3' }}><ClusterTile m={items[0]} /></div>
      <ClusterTile m={items[1]} /><ClusterTile m={items[2]} /></div>;
  } else {
    collage = <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, height: H }}>
      <ClusterTile m={items[0]} /><ClusterTile m={items[1]} /><ClusterTile m={items[2]} />
      <ClusterTile m={items[3]} overlay={extra > 0 ? extra : null} /></div>;
  }
  return (
    <div onClick={onOpen} className="du-card" style={{ cursor: 'pointer', position: 'relative' }}>
      {/* stacked-paper hint behind */}
      <div style={{ position: 'absolute', inset: '6px -5px -5px 6px', borderRadius: 16,
        background: 'var(--surface)', border: '1px solid var(--line)', transform: 'rotate(1.4deg)', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', borderRadius: 16, padding: 7,
        border: '1px solid var(--line)', boxShadow: 'var(--cardShadow)' }}>
        <div style={{ position: 'relative' }}>
          {collage}
          <div style={{ position: 'absolute', top: 7, right: 7, display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 8, background: 'rgba(20,14,10,.62)', color: '#fff',
            fontFamily: 'var(--font-ui)', fontSize: 10.5, fontWeight: 600, backdropFilter: 'blur(2px)' }}>
            <Icon name="image" size={12} color="#fff" /> {n}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '0 2px' }}>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', lineHeight: 1, flex: 1 }}>{title}</div>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, fontWeight: 600, color: 'var(--accentText)',
            padding: '2px 8px', borderRadius: 7, background: 'var(--accentSoft)' }}>day album</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, padding: '0 2px', flexWrap: 'wrap' }}>
          {place && <MetaPill icon="pin" label={place} />}
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)' }}>tap to open</span>
          <Avatar who={items[0].by} size={19} />
        </div>
      </div>
    </div>
  );
}

// ───────── Dispatcher ─────────
function MemoryCard({ m, rot, onOpen }) {
  if (m.type === 'photo' || m.type === 'video') return <PhotoCard m={m} rot={rot} onOpen={onOpen} />;
  if (m.type === 'letter') return <LetterCard m={m} onOpen={onOpen} />;
  if (m.type === 'ticket') return <TicketCard m={m} onOpen={onOpen} />;
  return null;
}

Object.assign(window, {
  snippet, collName, CardFoot, PhotoCard, LetterCard, TicketCard, MemoryCard, ClusterCard, ClusterTile,
});
