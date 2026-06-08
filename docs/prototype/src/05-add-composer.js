// Dear Us — Add a memory: type picker → composer → save.
// Place & collection are metadata, picked inside any composer. Real inputs.

// Editable field (input / textarea) styled like <Field>
function EField({ label, value, onChange, placeholder, multiline, rows = 2, optional, mono, font, autoFocus }) {
  const base = {
    width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent',
    fontFamily: font || 'var(--font-ui)', fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.45,
  };
  const [foc, setFoc] = React.useState(false);
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
        color: 'var(--ink2)', marginBottom: 5, display: 'flex', gap: 5, alignItems: 'baseline' }}>
        {label}{optional && <span style={{ color: 'var(--ink3)', fontWeight: 400 }}>optional</span>}</div>}
      <div style={{ border: `1.5px solid ${foc ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 12,
        background: 'var(--surface)', padding: '9px 12px',
        boxShadow: foc ? '0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent)' : 'none' }}>
        {multiline
          ? <textarea autoFocus={autoFocus} rows={rows} value={value} placeholder={placeholder}
              onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
              onChange={e => onChange(e.target.value)} style={base} />
          : <input autoFocus={autoFocus} value={value} placeholder={placeholder}
              onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
              onChange={e => onChange(e.target.value)} style={base} />}
      </div>
    </div>
  );
}

// Place / collection meta-row buttons inside composers
function MetaRow({ draft, app }) {
  const setRow = (k, v) => app.set({ addDraft: { ...draft, [k]: v } });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Field label="place" optional icon="pin" value={draft.place}
        placeholder="pin a place" onClick={() => app.set({ subSheet: 'place' })}
        trailing={<Icon name="chevron" size={16} color="var(--ink3)" />} />
      <Field label="collection" optional icon="folder"
        value={draft.collection ? collName(draft.collection) : ''}
        placeholder="add to a trip or collection" onClick={() => app.set({ subSheet: 'collection' })}
        trailing={<Icon name="chevron" size={16} color="var(--ink3)" />} />
    </div>
  );
}

function ComposerChrome({ title, sub, onCancel, onSave, saveLabel = 'save', children, paper }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: paper ? 'var(--letterPaper)' : 'var(--paper)',
      display: 'flex', flexDirection: 'column', zIndex: 40 }} className="du-slide-up">
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center',
        borderBottom: '1px solid var(--line)', flex: '0 0 auto' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--ink2)', fontWeight: 500, padding: 0 }}>cancel</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 21, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{title}</div>
          {sub && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)', marginTop: 2 }}>{sub}</div>}
        </div>
        <button onClick={onSave} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--accent)', fontWeight: 700, padding: 0,
          display: 'inline-flex', alignItems: 'center', gap: 4 }}>{saveLabel}</button>
      </div>
      <div className="du-noscroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</div>
    </div>
  );
}

// Media chooser — cycles scene since there's no real upload
function MediaPicker({ draft, app, h = 168, kind }) {
  const shuffle = () => { const k = DU.SCENE_KEYS[Math.floor(Math.random() * DU.SCENE_KEYS.length)];
    app.set({ addDraft: { ...draft, scene: k } }); };
  return (
    <div style={{ position: 'relative' }}>
      <SceneFill scene={draft.scene} h={h} radius={14} kind={kind}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,14,10,.12)' }} />
        <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 7 }}>
          <button onClick={shuffle} style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 11px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.92)', fontFamily: 'var(--font-ui)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>
            <Icon name="camera" size={14} color="var(--ink)" /> camera</button>
          <button onClick={shuffle} style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 11px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.92)', fontFamily: 'var(--font-ui)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>
            <Icon name="image" size={14} color="var(--ink)" /> library</button>
        </div>
      </SceneFill>
    </div>
  );
}

// ───────── Type picker sheet ─────────
function TypePicker({ app }) {
  const types = [
    { id: 'photo', label: 'photo', icon: 'image', sub: 'snap a moment' },
    { id: 'video', label: 'video', icon: 'film', sub: 'up to 30s' },
    { id: 'letter', label: 'letter', icon: 'edit', sub: 'write to them' },
    { id: 'ticket', label: 'ticket', icon: 'ticket', sub: 'stub · receipt · postcard' },
  ];
  return (
    <Backdrop onClose={app.closeAdd}>
      <div className="du-slide-up" style={{ background: 'var(--paper)', borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: '14px 20px 26px', boxShadow: '0 -12px 32px rgba(20,12,10,.18)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--ink4)', margin: '0 auto 14px' }} />
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 25, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>add a memory</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink3)', textAlign: 'center', marginBottom: 16 }}>what kind?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {types.map(t => (
            <button key={t.id} onClick={() => app.pickType(t.id)} className="du-card" style={{
              border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 16,
              padding: '14px 14px', textAlign: 'left', cursor: 'pointer', boxShadow: 'var(--cardShadow)',
              display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accentSoft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={t.icon} size={20} color="var(--accentText)" /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 19, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{t.label}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)', marginTop: 3 }}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'var(--surface2)',
          border: '1px solid var(--line)', display: 'flex', gap: 9, alignItems: 'center',
          fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink2)', lineHeight: 1.35 }}>
          <Icon name="pin" size={16} color="var(--ink3)" />
          you can pin a place &amp; add to a collection inside any memory.
        </div>
      </div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose, align = 'flex-end' }) {
  return (
    <div onClick={onClose} className="du-fade" style={{ position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(28,18,14,.42)', display: 'flex', flexDirection: 'column', justifyContent: align }}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// ───────── Composers ─────────
function setD(app, draft, patch) { app.set({ addDraft: { ...draft, ...patch } }); }

function PhotoComposer({ app, video }) {
  const d = app.state.addDraft;
  return (
    <ComposerChrome title={video ? 'new video' : 'new photo'} onCancel={app.closeAdd}
      onSave={app.saveDraft} saveLabel="save">
      <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MediaPicker draft={d} app={app} kind={video ? 'video' : undefined} h={video ? 150 : 168} />
        {video && <div style={{ height: 26, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)',
          padding: 3, display: 'flex', gap: 1.5, position: 'relative' }}>
          {Array.from({ length: 22 }).map((_, i) => <div key={i} style={{ flex: 1, borderRadius: 1,
            background: i < 10 ? 'var(--ink4)' : 'var(--surface2)' }} />)}
          <div style={{ position: 'absolute', top: -3, bottom: -3, left: '45%', width: 2.5, borderRadius: 2, background: 'var(--accent)' }} />
        </div>}
        {video && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)', textAlign: 'right', marginTop: -6 }}>trim · 0:14 / 0:30</div>}
        <EField label="caption" value={d.title} onChange={v => setD(app, d, { title: v })} placeholder={video ? 'what happened?' : 'say something'} font="var(--font-hand)" />
        <Field label="when" value={`today \u00b7 ${DU.fmt.monDay(d.date)}`} icon="calendar" />
        <MetaRow draft={d} app={app} />
        <EField label="tags" optional value={d.tagStr} onChange={v => setD(app, d, { tagStr: v })} placeholder="coffee  ours  nyc" />
      </div>
    </ComposerChrome>
  );
}

function LetterComposer({ app }) {
  const d = app.state.addDraft;
  const to = app.otherPartner();
  return (
    <ComposerChrome title={`to ${to.name.toLowerCase()}`} onCancel={app.closeAdd}
      onSave={app.saveDraft} saveLabel="send ♥" paper>
      <div style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '14px 18px', pointerEvents: 'none', opacity: 0.4,
          backgroundImage: 'repeating-linear-gradient(var(--letterPaper) 0 28px, var(--ink4) 28px 29px)' }} />
        <textarea autoFocus value={d.body} placeholder={`dear ${to.name.toLowerCase()},`}
          onChange={e => setD(app, d, { body: e.target.value })}
          style={{ flex: 1, minHeight: 320, border: 'none', outline: 'none', resize: 'none', background: 'transparent',
            fontFamily: 'var(--font-hand)', fontSize: 19, lineHeight: '28px', color: 'var(--ink)', position: 'relative', zIndex: 1 }} />
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)', textAlign: 'right',
          position: 'relative', zIndex: 1 }}>— {app.viewer().name.toLowerCase()} · {(d.body || '').trim().split(/\s+/).filter(Boolean).length} words</div>
      </div>
      <div style={{ flex: '0 0 auto', background: 'var(--paper)', borderTop: '1px solid var(--line)',
        padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 18, color: 'var(--ink2)' }}><b>B</b> <i>I</i></span>
        <span style={{ flex: 1 }} />
        <button onClick={() => app.set({ subSheet: 'place' })} style={pillBtn}>{d.place ? <Icon name="pin" size={13} color="var(--accent)" /> : '+'} place</button>
        <button onClick={() => app.set({ subSheet: 'collection' })} style={pillBtn}>{d.collection ? <Icon name="folder" size={13} color="var(--accent)" /> : '+'} collection</button>
      </div>
    </ComposerChrome>
  );
}
const pillBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 9,
  border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer',
  fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--ink2)' };

function TicketComposer({ app }) {
  const d = app.state.addDraft;
  return (
    <ComposerChrome title="new ticket" onCancel={app.closeAdd} onSave={app.saveDraft}>
      <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <MediaPicker draft={d} app={app} h={120} />
          <Sticker text="auto-cropped" rotate={-4} top={8} left={8} />
        </div>
        <EField label="what" value={d.ticketTitle} onChange={v => setD(app, d, { ticketTitle: v })} placeholder="Bon Iver · Brooklyn Steel" />
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1.4 }}><EField label="when" value={d.whenStr} onChange={v => setD(app, d, { whenStr: v })} placeholder="oct 18, 2025" /></div>
          <div style={{ flex: 1 }}><EField label="seat" value={d.seat} onChange={v => setD(app, d, { seat: v })} placeholder="row F · 12" /></div>
        </div>
        <MetaRow draft={d} app={app} />
        <EField label="note" optional multiline rows={2} value={d.note} onChange={v => setD(app, d, { note: v })} placeholder="how was it?" font="var(--font-hand)" />
      </div>
    </ComposerChrome>
  );
}

// ───────── Location picker ─────────
function LocationPicker({ app }) {
  const d = app.state.addDraft;
  const [q, setQ] = React.useState(d.place || '');
  const recents = [...new Set(DU.memories.map(m => m.place).filter(Boolean))].slice(0, 5);
  const choose = (p) => { app.set({ addDraft: { ...d, place: p }, subSheet: null }); };
  return (
    <Backdrop onClose={() => app.set({ subSheet: null })}>
      <div className="du-slide-up" style={{ background: 'var(--paper)', borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: '14px 18px 24px', maxHeight: 560, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--ink4)', margin: '0 auto 12px' }} />
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>pin a place</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--accent)', borderRadius: 12,
          background: 'var(--surface)', padding: '9px 12px', marginBottom: 12 }}>
          <Icon name="search" size={16} color="var(--ink3)" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="search or paste an address…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--ink)' }} />
        </div>
        <div style={{ height: 120, borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 14,
          background: 'linear-gradient(160deg, #e7ddc6, #d8ccae)' }}>
          <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
            <path d="M0 78 Q 80 60 150 70 T 300 50" stroke="rgba(0,0,0,.18)" strokeWidth="6" fill="none" />
            <path d="M0 78 Q 80 60 150 70 T 300 50" stroke="#f0e8d4" strokeWidth="2" fill="none" />
            <path d="M60 0 L 90 120" stroke="rgba(0,0,0,.1)" strokeWidth="4" /><path d="M210 0 L 180 120" stroke="rgba(0,0,0,.1)" strokeWidth="4" />
          </svg>
          <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-100%)' }}>
            <Icon name="pin" size={30} color="var(--accent)" fill="var(--accent)" sw={1.5} />
          </div>
        </div>
        <div className="du-noscroll" style={{ overflowY: 'auto' }}>
          {q && <PlaceRow name={q} addr="use this place" onClick={() => choose(q)} accent />}
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', color: 'var(--ink3)', margin: '10px 0 6px' }}>recent places</div>
          {recents.map(p => <PlaceRow key={p} name={p} onClick={() => choose(p)} />)}
        </div>
      </div>
    </Backdrop>
  );
}

function PlaceRow({ name, addr, onClick, accent }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 4px',
      background: 'none', border: 'none', borderBottom: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left' }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: accent ? 'var(--accent)' : 'var(--surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <Icon name="pin" size={16} color={accent ? '#fff' : 'var(--ink2)'} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        {addr && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink3)' }}>{addr}</div>}
      </div>
    </button>
  );
}

// ───────── Collection picker ─────────
function CollectionPicker({ app }) {
  const d = app.state.addDraft;
  const choose = (id) => app.set({ addDraft: { ...d, collection: id }, subSheet: null });
  return (
    <Backdrop onClose={() => app.set({ subSheet: null })}>
      <div className="du-slide-up" style={{ background: 'var(--paper)', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '14px 18px 24px' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--ink4)', margin: '0 auto 12px' }} />
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>add to collection</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DU.collections.map(c => (
            <button key={c.id} onClick={() => choose(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 12px', borderRadius: 13, cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${d.collection === c.id ? 'var(--accent)' : 'var(--line)'}`,
              background: d.collection === c.id ? 'var(--accentSoft)' : 'var(--surface)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, overflow: 'hidden', flex: '0 0 auto' }}>
                <SceneFill scene={c.cover} radius={9} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'var(--ink3)' }}>{c.type}</div>
              </div>
              {d.collection === c.id && <Icon name="check" size={18} color="var(--accent)" />}
            </button>
          ))}
          <button onClick={() => app.set({ subSheet: null, newCollection: true })} style={{ display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 12px', borderRadius: 13, cursor: 'pointer', border: '1.5px dashed var(--ink4)', background: 'transparent',
            fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink2)' }}>
            <Icon name="plus" size={17} color="var(--ink2)" /> new collection</button>
        </div>
      </div>
    </Backdrop>
  );
}

Object.assign(window, {
  EField, MetaRow, ComposerChrome, MediaPicker, TypePicker, Backdrop,
  PhotoComposer, LetterComposer, TicketComposer, LocationPicker, CollectionPicker, PlaceRow, pillBtn,
});
