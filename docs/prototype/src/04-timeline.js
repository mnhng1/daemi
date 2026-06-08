// Dear Us — Timeline (home). Vertical spine, dated nodes, cards branch right.
// Three zoom levels: day (full cards) / month (thumbnails) / year (density bars).

const SPINE_X = 72; // px from scroll-content left to node centers
const DATE_W = 46, NODE_W = 20;

function Spine() {
  return <div style={{ position: 'absolute', top: 0, bottom: 0, left: SPINE_X - 1, width: 2,
    background: 'linear-gradient(var(--accent), color-mix(in srgb, var(--accent) 30%, var(--ink4)) 22%, var(--ink4))',
    borderRadius: 2, pointerEvents: 'none' }} />;
}
function Node({ filled, accent, sm }) {
  const s = sm ? 9 : 13;
  return <div style={{ width: s, height: s, borderRadius: s,
    border: `2px solid ${accent ? 'var(--accent)' : 'var(--ink3)'}`,
    background: filled ? (accent ? 'var(--accent)' : 'var(--ink3)') : 'var(--paper)',
    boxShadow: filled ? '0 0 0 3px var(--paper)' : '0 0 0 3px var(--paper)' }} />;
}

function DateCol({ date, sub, accent }) {
  return (
    <div style={{ width: DATE_W, flex: '0 0 auto', textAlign: 'right', paddingRight: 8, paddingTop: 1 }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, lineHeight: 1,
        color: accent ? 'var(--accent)' : 'var(--ink)' }}>{date}</div>
      {sub && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9.5, color: 'var(--ink3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function TLRow({ date, sub, accent, filled, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
      <DateCol date={date} sub={sub} accent={accent} />
      <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center', paddingTop: 3 }}>
        <Node filled={filled} accent={accent} />
      </div>
      <div style={{ width: 14, flex: '0 0 auto', borderTop: '1.5px dashed var(--ink4)', marginTop: 9 }} />
      <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>{children}</div>
    </div>
  );
}

function TLMarker({ label, sub, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 14px' }}>
      <div style={{ width: DATE_W, flex: '0 0 auto' }} />
      <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 15, height: 15, transform: 'rotate(45deg)', borderRadius: 3,
          background: accent ? 'var(--accent)' : 'var(--accentSoft)',
          border: '2px solid var(--paper)', boxShadow: '0 0 0 1.5px var(--accent)' }} />
      </div>
      <div style={{ flex: 1, marginLeft: 12, paddingLeft: 12,
        borderLeft: `2.5px solid ${accent ? 'var(--accent)' : 'var(--accentSoft)'}` }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 19, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{label}</div>
        {sub && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink2)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function TodayCap() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ width: DATE_W, flex: '0 0 auto', textAlign: 'right', paddingRight: 8,
        fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, color: 'var(--ink3)' }}>now</div>
      <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '3px 10px', borderRadius: 12, background: 'var(--accent)', color: '#fff',
          fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px -1px color-mix(in srgb, var(--accent) 60%, transparent)', position: 'relative', zIndex: 2 }}>today</div>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
}

// ── helpers ──
const TYPE_LABEL = { all: 'all', photo: 'photos', video: 'video', letter: 'letters', ticket: 'tickets' };
const TYPE_ICON  = { photo: 'image', video: 'film', letter: 'edit', ticket: 'ticket' };
function tilt(id, factor) { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 7; return (h - 3) * factor; }

function FilterRow({ filter, onFilter }) {
  const types = ['all', 'photo', 'video', 'letter', 'ticket'];
  return (
    <div style={{ display: 'flex', gap: 7, padding: '10px 14px 4px', overflowX: 'auto', flex: '0 0 auto' }} className="du-noscroll">
      {types.map(t => <Chip key={t} label={TYPE_LABEL[t]} icon={TYPE_ICON[t]}
        active={filter === t} onClick={() => onFilter(t)} />)}
    </div>
  );
}

function ZoomBar({ zoom, onZoom }) {
  const levels = ['year', 'month', 'day'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 8px', flex: '0 0 auto' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9.5, fontWeight: 700, letterSpacing: 1,
        textTransform: 'uppercase', color: 'var(--ink3)' }}>zoom</span>
      <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 3, border: '1px solid var(--line)' }}>
        {levels.map(l => (
          <button key={l} onClick={() => onZoom(l)} style={{ padding: '4px 13px', borderRadius: 8, cursor: 'pointer',
            border: 'none', background: zoom === l ? 'var(--surface)' : 'transparent',
            boxShadow: zoom === l ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
            color: zoom === l ? 'var(--ink)' : 'var(--ink3)',
            fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: zoom === l ? 700 : 500 }}>{l}</button>
        ))}
      </div>
      <span style={{ flex: 1 }} />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon name="search" size={12} color="var(--ink3)" /> pinch</span>
    </div>
  );
}

// ── Day view rows ──
function CardWrap({ m, justSavedId, children }) {
  const isNew = m.id === justSavedId;
  return (
    <div className={isNew ? 'du-pop' : ''} style={{ position: 'relative',
      ...(m.queued ? { filter: 'grayscale(.55)', opacity: 0.72 } : {}) }}>
      {children}
      {m.queued && <Sticker text="queued" rotate={8} top={-7} right={-4} color="var(--surface)" />}
    </div>
  );
}
function DayView({ list, onOpen, factor, justSavedId, onOpenDay }) {
  const rows = [];
  let lastMonth = null;
  // group by date, preserving order
  const groups = [], gi = {};
  list.forEach(m => { if (gi[m.date] == null) { gi[m.date] = groups.length; groups.push({ date: m.date, items: [] }); } groups[gi[m.date]].items.push(m); });
  groups.forEach((g) => {
    const mk = DU.fmt.monthKey(g.date);
    if (mk !== lastMonth) {
      lastMonth = mk;
      const dt = DU.fmt.parse(g.date); const isSep = dt.getMonth() === 8;
      if (rows.length) rows.push(<TLMarker key={'mk' + mk} label={DU.fmt.MON[dt.getMonth()]}
        sub={isSep ? 'anniversary month' : dt.getFullYear()} accent={isSep} />);
    }
    const pics = g.items.filter(m => m.type === 'photo' || m.type === 'video');
    const others = g.items.filter(m => m.type !== 'photo' && m.type !== 'video');
    let first = true;
    const dprops = () => { const p = first ? { date: DU.fmt.monDay(g.date), sub: DU.fmt.dow(g.date) } : { date: '', sub: '' }; first = false; return p; };
    if (pics.length >= 2) {
      const keyMem = pics.find(p => p.id === justSavedId) || pics[0];
      rows.push(<TLRow key={g.date + '-cl'} {...dprops()} filled>
        <CardWrap m={keyMem} justSavedId={justSavedId}>
          <ClusterCard items={pics} onOpen={() => onOpenDay(g.date, pics)} />
        </CardWrap></TLRow>);
    } else if (pics.length === 1) {
      const m = pics[0];
      rows.push(<TLRow key={m.id} {...dprops()} accent={m.sticker === '1 yr'} filled>
        <CardWrap m={m} justSavedId={justSavedId}>
          <MemoryCard m={m} rot={tilt(m.id, factor)} onOpen={() => onOpen(m)} />
        </CardWrap></TLRow>);
    }
    others.forEach(m => {
      const accent = m.type === 'letter' || m.sticker === '1 yr';
      rows.push(<TLRow key={m.id} {...dprops()} accent={accent} filled>
        <CardWrap m={m} justSavedId={justSavedId}>
          <MemoryCard m={m} rot={0} onOpen={() => onOpen(m)} />
        </CardWrap></TLRow>);
    });
  });
  return rows;
}

// ── Month view (thumbnails grouped by week) ──
function MiniThumb({ m, onOpen }) {
  const common = { onClick: () => onOpen(m), style: { cursor: 'pointer' } };
  if (m.type === 'letter') return (
    <div {...common} title={DU.fmt.monDay(m.date)} style={{ ...common.style, width: 40, height: 48,
      background: 'var(--letterPaper)', border: '1px solid var(--line)', borderRadius: 5, padding: 4,
      boxShadow: 'var(--cardShadow)', overflow: 'hidden' }}>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 7, color: 'var(--ink3)', lineHeight: 1.3 }}>
        ✎ ~~~<br />~~ ~~<br />~~~ ~<br />~~</div>
    </div>);
  if (m.type === 'ticket') return (
    <div {...common} title={m.ticketTitle} style={{ ...common.style, width: 56, height: 30, borderRadius: 6,
      overflow: 'hidden', boxShadow: 'var(--cardShadow)' }}>
      <SceneFill scene={m.scene} radius={6}><div style={{ position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="ticket" size={13} color="#fff" /></div></SceneFill>
    </div>);
  return (
    <div {...common} title={m.title} style={{ ...common.style, width: 48, height: 48, borderRadius: 7,
      overflow: 'hidden', boxShadow: 'var(--cardShadow)', border: '2px solid var(--surface)' }}>
      <SceneFill scene={m.scene} radius={5} kind={m.type === 'video' ? 'video' : undefined} />
    </div>);
}

function MonthView({ list, onOpen }) {
  const byMonth = {};
  list.forEach(m => { const k = DU.fmt.monthKey(m.date); (byMonth[k] = byMonth[k] || []).push(m); });
  const mval = (s) => { const [y, m] = s.split('-').map(Number); return y * 12 + m; };
  const keys = Object.keys(byMonth).sort((a, b) => mval(b) - mval(a));
  return keys.map((k, ki) => {
    const items = byMonth[k];
    const dt = DU.fmt.parse(items[0].date);
    const isSep = dt.getMonth() === 8;
    // group by week-of-month
    const weeks = {};
    items.forEach(m => { const d = DU.fmt.parse(m.date).getDate(); const w = Math.ceil(d / 7); (weeks[w] = weeks[w] || []).push(m); });
    return (
      <div key={k}>
        <TLMarker label={`${DU.fmt.MON[dt.getMonth()]} ${dt.getFullYear()}`}
          sub={`${items.length} memories${isSep ? ' \u00b7 1-yr anniv.' : ''}`} accent={isSep} />
        {Object.keys(weeks).sort((a, b) => b - a).map(w => (
          <div key={w} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: DATE_W, flex: '0 0 auto', textAlign: 'right', paddingRight: 8, paddingTop: 4,
              fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink3)', fontWeight: 600 }}>wk {w}</div>
            <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center', paddingTop: 6 }}><Node filled sm /></div>
            <div style={{ width: 14, flex: '0 0 auto' }} />
            <div style={{ flex: 1, display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {weeks[w].map(m => <MiniThumb key={m.id} m={m} onOpen={onOpen} />)}
            </div>
          </div>
        ))}
      </div>
    );
  });
}

// ── Year view (density bars) ──
function YearView({ list, onZoomMonth }) {
  const byMonth = {};
  list.forEach(m => { const k = DU.fmt.monthKey(m.date); (byMonth[k] = byMonth[k] || []).push(m); });
  const yval = (s) => { const [y, m] = s.split('-').map(Number); return y * 12 + m; };
  const keys = Object.keys(byMonth).sort((a, b) => yval(b) - yval(a));
  const SEG = { photo: 'var(--ink3)', video: 'var(--ink2)', letter: 'color-mix(in srgb, var(--accent) 40%, var(--ink4))', ticket: 'var(--accent)' };
  return keys.map((k, i) => {
    const items = byMonth[k]; const dt = DU.fmt.parse(items[0].date);
    const counts = { photo: 0, video: 0, letter: 0, ticket: 0 };
    items.forEach(m => counts[m.type]++);
    const total = items.length;
    const isSep = dt.getMonth() === 8, isCur = i === 0;
    const marker = isSep ? '1 yr' : (items.some(m => m.collection && m.collection !== 'c-letters') ? 'trip' : null);
    return (
      <div key={k} onClick={() => onZoomMonth(k)} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 9, cursor: 'pointer' }} className="du-card">
        <div style={{ width: DATE_W, flex: '0 0 auto', textAlign: 'right', paddingRight: 8, paddingTop: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, lineHeight: 1,
            color: isCur ? 'var(--accent)' : 'var(--ink)' }}>{DU.fmt.MON[dt.getMonth()]}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--ink3)' }}>{dt.getFullYear()}</div>
        </div>
        <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center', paddingTop: 3 }}><Node filled accent={isCur} /></div>
        <div style={{ width: 12, flex: '0 0 auto' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: 22, borderRadius: 7, overflow: 'hidden', display: 'flex',
            border: '1px solid var(--line)', background: 'var(--surface)' }}>
            {['photo', 'video', 'letter', 'ticket'].map(t => counts[t] ? <div key={t}
              style={{ flex: counts[t], background: SEG[t] }} /> : null)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3,
            fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink2)' }}>
            <span>{total} memories</span>
            {marker && <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Icon name="heart" size={10} color="var(--accent)" fill="var(--accent)" sw={0} />{marker}</span>}
          </div>
        </div>
      </div>
    );
  });
}

// ── Empty state ──
function EmptyTimeline({ onAdd }) {
  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <Spine />
      <div style={{ padding: '16px 16px 16px 0' }}>
        <TodayCap />
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ width: DATE_W, flex: '0 0 auto' }} />
          <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center', paddingTop: 6 }}><Node /></div>
          <div style={{ width: 14, flex: '0 0 auto', borderTop: '1.5px dashed var(--ink4)', marginTop: 12 }} />
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ border: '1.5px dashed var(--accent)', borderRadius: 16, background: 'var(--surface)', padding: '18px 16px' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 23, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05 }}>your scrapbook<br />starts here.</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--ink2)', margin: '8px 0 14px', lineHeight: 1.4 }}>add a photo, letter, place or anything you want to keep, together.</div>
              <Btn label="add your first memory" icon="plus" primary onClick={onAdd} />
            </div>
            <Sticker text="start here ↓" rotate={6} top={-12} right={-4} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineScreen({ app }) {
  const { zoom, filter, scrolled } = app.state;
  const scrollRef = React.useRef(null);
  const all = app.sortedMemories();
  const list = zoom === 'day' && filter !== 'all' ? all : all; // filtering handled below for day
  const factor = app.tweaks.playful;

  const onScroll = (e) => {
    const top = e.target.scrollTop;
    if ((top > 320) !== scrolled) app.set({ scrolled: top > 320 });
  };
  const jumpTop = () => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Day view with filter ghosts
  let dayContent = null;
  if (zoom === 'day') {
    const up = app.state.uploading ? <UploadingCard key="up" /> : null;
    if (filter === 'all') dayContent = <><TodayCap />{up}{DayView({ list: all, onOpen: app.openMemory, factor, justSavedId: app.state.justSavedId, onOpenDay: app.openDayGallery })}</>;
    else {
      const rows = []; let hidden = 0; let lastMonth = null;
      rows.push(<TodayCap key="cap" />);
      if (up) rows.push(up);
      all.forEach((m, idx) => {
        const mk = DU.fmt.monthKey(m.date);
        if (m.type === filter) {
          if (hidden) { rows.push(<GhostRow key={'g' + idx} n={hidden} />); hidden = 0; }
          if (mk !== lastMonth) { lastMonth = mk; }
          rows.push(<TLRow key={m.id} date={DU.fmt.monDay(m.date)} sub={DU.fmt.dow(m.date)} accent filled>
            <CardWrap m={m} justSavedId={app.state.justSavedId}>
              <MemoryCard m={m} rot={tilt(m.id, factor)} onOpen={() => app.openMemory(m)} />
            </CardWrap></TLRow>);
        } else hidden++;
      });
      if (hidden) rows.push(<GhostRow key="gend" n={hidden} />);
      dayContent = rows;
    }
  }

  return (
    <>
      <AppHeader title="Dear Us" hand
        sub={`day ${DU.story.dayCount} \u00b7 ${DU.story.milesApart} mi apart`}
        left={scrolled
          ? <HeaderBtn icon="up" onClick={jumpTop} active />
          : <HeaderBtn icon="heart" onClick={() => app.go('places')} />}
        right={<HeaderBtn icon="search" onClick={() => app.go('search')} />} />
      <NetBanner app={app} />
      <FilterRow filter={filter} onFilter={(t) => app.set({ filter: t })} />
      <ZoomBar zoom={zoom} onZoom={(z) => app.set({ zoom: z })} />
      <div ref={scrollRef} onScroll={onScroll} className="du-noscroll"
        style={{ flex: 1, overflowY: 'auto', position: 'relative', minHeight: 0 }}>
        {all.length === 0
          ? <EmptyTimeline onAdd={app.openAdd} />
          : <div style={{ position: 'relative', padding: '12px 16px 28px 0' }}>
              <Spine />
              {zoom === 'day' && dayContent}
              {zoom === 'month' && MonthView({ list: all, onOpen: app.openMemory })}
              {zoom === 'year' && YearView({ list: all, onZoomMonth: () => app.set({ zoom: 'month' }) })}
            </div>}
      </div>
    </>
  );
}

function GhostRow({ n }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, opacity: 0.5 }}>
      <div style={{ width: DATE_W, flex: '0 0 auto' }} />
      <div style={{ width: NODE_W, flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, border: '1.5px dashed var(--ink3)' }} />
      </div>
      <div style={{ flex: 1, paddingLeft: 22, fontFamily: 'var(--font-ui)', fontSize: 10.5,
        color: 'var(--ink3)', fontStyle: 'italic' }}>{n} hidden by filter</div>
    </div>
  );
}

Object.assign(window, { TimelineScreen, Spine, Node, TLRow, TLMarker, TodayCap, FilterRow, ZoomBar, tilt });
