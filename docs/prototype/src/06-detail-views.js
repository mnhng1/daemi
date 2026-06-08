// Dear Us — memory detail (one per type). Pushed full-screen route.

function DetailChrome({ title, sub, by, onClose, children, footer, paper }) {
  return (
    <div className="du-push" style={{ position: 'absolute', inset: 0, zIndex: 45,
      background: paper ? 'var(--letterPaper)' : 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 14px 11px', display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto',
        borderBottom: '1px solid var(--line)', background: paper ? 'var(--paper)' : 'transparent' }}>
        <HeaderBtn icon="back" onClick={onClose} />
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', lineHeight: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          {sub && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)', marginTop: 2 }}>
            {sub}{by && <> · by {DU.partners[by].name}</>}</div>}
        </div>
        <HeaderBtn icon="more" />
      </div>
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</div>
      {footer}
    </div>
  );
}

function DetailFoot({ m, app }) {
  const [liked, setLiked] = React.useState(false);
  return (
    <div style={{ flex: '0 0 auto', borderTop: '1px solid var(--line)', background: 'var(--paper)',
      padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      {(m.place || m.collection) && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {m.place && <MetaPill icon="pin" label={m.place} />}
        {m.collection && <MetaPill icon="folder" label={collName(m.collection)} accent />}
      </div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {(m.tags || []).map(t => <span key={t} style={{ fontFamily: 'var(--font-ui)', fontSize: 11.5,
          color: 'var(--ink2)', fontWeight: 500 }}>#{t}</span>)}
        <span style={{ flex: 1 }} />
        <button onClick={() => setLiked(!liked)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Icon name="heart" size={19} color="var(--accent)" fill={liked ? 'var(--accent)' : 'none'} /></button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="edit" size={18} color="var(--ink3)" /></button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="trash" size={18} color="var(--ink3)" /></button>
      </div>
    </div>
  );
}

function ReactionLine({ r }) {
  if (!r) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
      padding: '9px 12px', borderRadius: 13, background: 'var(--surface2)', border: '1px solid var(--line)' }}>
      <Avatar who={r.by} size={24} />
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--ink)' }}>
        <span style={{ color: 'var(--ink3)' }}>{DU.partners[r.by].name}: </span>“{r.text}”</div>
    </div>
  );
}

function PhotoDetail({ m, app }) {
  return (
    <DetailChrome title={m.title} sub={`${DU.fmt.monDay(m.date)}${m.time ? ' · ' + m.time : ''}`} by={m.by}
      onClose={app.closeMemory} footer={<DetailFoot m={m} app={app} />}>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 9, border: '1px solid var(--line)', boxShadow: 'var(--cardShadow)' }}>
          <SceneFill scene={m.scene} h={264} radius={12} kind={m.type === 'video' ? 'video' : undefined}>
            {m.type === 'video' && <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.4)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '0 66% 0 0', borderRadius: 2, background: 'var(--accent)' }} /></div>
              <span style={{ background: 'rgba(12,8,6,.6)', color: '#fff', padding: '1px 6px', borderRadius: 6, fontFamily: 'var(--font-ui)', fontSize: 9.5 }}>0:05 / {m.duration}</span>
            </div>}
          </SceneFill>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink)', textAlign: 'center', padding: '10px 4px 2px', lineHeight: 1.25 }}>{m.caption}</div>
        </div>
        <ReactionLine r={m.reaction} />
      </div>
    </DetailChrome>
  );
}

function LetterDetail({ m, app }) {
  return (
    <DetailChrome title={DU.fmt.monDay(m.date)} sub={`letter from ${DU.partners[m.by].name}`} paper
      onClose={app.closeMemory} footer={<DetailFoot m={m} app={app} />}>
      <div style={{ padding: '22px 22px 30px', position: 'relative', minHeight: '100%' }}>
        <div style={{ position: 'absolute', inset: '20px 22px', pointerEvents: 'none', opacity: 0.4,
          backgroundImage: 'repeating-linear-gradient(var(--letterPaper) 0 30px, var(--ink4) 30px 31px)' }} />
        <div style={{ position: 'relative', fontFamily: 'var(--font-hand)', fontSize: 20, lineHeight: '30px',
          color: 'var(--ink)', whiteSpace: 'pre-line' }}>{m.body}</div>
        <div style={{ position: 'relative', marginTop: 22, fontFamily: 'var(--font-ui)', fontSize: 10.5,
          color: 'var(--ink3)', textAlign: 'right' }}>sealed {DU.fmt.monDay(m.date)} · {m.time}</div>
      </div>
    </DetailChrome>
  );
}

function TicketDetail({ m, app }) {
  return (
    <DetailChrome title={m.ticketTitle} sub={`${m.ticketSub}`} by={m.by}
      onClose={app.closeMemory} footer={<DetailFoot m={m} app={app} />}>
      <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ transform: 'rotate(-1deg)' }}><TicketCard m={m} big /></div>
        <SceneFill scene={m.scene} h={150} radius={14}>
          <Sticker text="stub photo" rotate={3} top={10} right={10} />
        </SceneFill>
        {m.note && <div style={{ padding: '11px 14px', borderRadius: 6, background: 'var(--highlight)',
          transform: 'rotate(.6deg)', fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink)',
          boxShadow: '0 3px 8px rgba(0,0,0,.12)' }}>{m.note}</div>}
        <div style={{ display: 'flex', gap: 16 }}>
          {['A', 'B'].map(p => <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink2)' }}>
            <Icon name="heart" size={14} color="var(--accent)" fill="var(--accent)" sw={0} /> {DU.partners[p].name}</span>)}
        </div>
        <ReactionLine r={m.reaction} />
      </div>
    </DetailChrome>
  );
}

// ───────── Day gallery (a day's many pictures) ─────────
function DayGalleryDetail({ gallery, app }) {
  const { date, items } = gallery;
  const place = (items.find(i => i.place) || {}).place;
  const title = items[0].dayTitle || DU.fmt.monDay(date);
  return (
    <div className="du-push" style={{ position: 'absolute', inset: 0, zIndex: 44, background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title={title} hand
        sub={`${DU.fmt.monDay(date)} \u00b7 ${DU.fmt.dow(date)} \u00b7 ${items.length} moments`}
        left={<HeaderBtn icon="back" onClick={app.closeDayGallery} />}
        right={<HeaderBtn icon="more" />} />
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '14px 16px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--ink2)' }}>
          <Avatar who={items[0].by} size={22} />
          <span>{items.length} pictures from {DU.partners[items[0].by].name}'s day</span>
          {place && <><span style={{ flex: 1 }} /><MetaPill icon="pin" label={place} /></>}
        </div>
        <div style={{ columns: 2, columnGap: 11 }}>
          {items.map((m, i) => (
            <div key={m.id} style={{ breakInside: 'avoid', marginBottom: 11 }}>
              <PhotoCard m={m} rot={0} onOpen={() => app.openMemory(m)} imgH={i % 3 === 0 ? 150 : 116} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailScreen({ m, app }) {
  if (!m) return null;
  if (m.type === 'photo' || m.type === 'video') return <PhotoDetail m={m} app={app} />;
  if (m.type === 'letter') return <LetterDetail m={m} app={app} />;
  if (m.type === 'ticket') return <TicketDetail m={m} app={app} />;
  return null;
}

Object.assign(window, { DetailScreen, DetailChrome, DetailFoot, DayGalleryDetail });
