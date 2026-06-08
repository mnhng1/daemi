// Dear Us — hi-fi UI primitives: phone frame, chrome, scene fills, atoms, icons.
// Everything reads theme via CSS variables (--ink, --paper, --accent, --font-*)
// set by the App on the phone root, so accent / light-dark / font tweaks are live.

// ───────────────────────── Icon set (stroke, 24-grid) ─────────────────────────
const ICON_PATHS = {
  heart:   'M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20Z',
  search:  'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  plus:    'M12 5v14M5 12h14',
  back:    'M15 5l-7 7 7 7',
  chevron: 'M9 6l6 6-6 6',
  up:      'M12 19V5M5 12l7-7 7 7',
  more:    'M6 12h.01M12 12h.01M18 12h.01',
  pin:     'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  folder:  'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  camera:  'M4 8a2 2 0 0 1 2-2h2l1.5-2h5L18 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z M12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  image:   'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM3 16l5-5 4 4 3-3 6 6 M9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  play:    'M8 5v14l11-7-11-7Z',
  film:    'M3 5h18v14H3zM7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4',
  ticket:  'M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7Z M14 6v12',
  tag:     'M4 4h7l9 9-7 7-9-9V4ZM8 8h.01',
  calendar:'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6ZM4 9h16M8 3v4M16 3v4',
  clock:   'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  close:   'M6 6l12 12M18 6L6 18',
  edit:    'M4 20h4l10-10-4-4L4 16v4ZM13.5 6.5l4 4',
  trash:   'M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13',
  send:    'M4 12l16-7-7 16-2-7-7-2Z',
  sliders: 'M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M6 14v4',
  check:   'M5 12l5 5 9-11',
  alert:   'M12 3l9 16H3L12 3ZM12 10v4M12 17h.01',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  wifi:    'M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01',
  globe:   'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18',
  bell:    'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 19a2 2 0 0 0 4 0',
  flame:   'M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 10 9 6 12 3Z',
};
function Icon({ name, size = 18, color = 'currentColor', sw = 1.8, fill = 'none', style }) {
  const d = ICON_PATHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ display: 'block', flex: '0 0 auto', ...style }}>
      <path d={d} stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeLinejoin="round" fill={fill} />
    </svg>
  );
}

// ───────────────────────── Scene fill (warm illustrated "photo") ─────────────────────────
function SceneFill({ scene, h = '100%', w = '100%', radius = 12, kind, children, style, dim = 0, gloss = true }) {
  return (
    <div style={{
      width: w, height: h, position: 'relative', overflow: 'hidden',
      borderRadius: radius, background: DU.sceneBg(scene),
      ...style,
    }}>
      {/* directional gloss */}
      {gloss && <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(125deg, rgba(255,255,255,.22), transparent 42%)',
        pointerEvents: 'none' }} />}
      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        boxShadow: 'inset 0 0 36px rgba(20,14,10,.34), inset 0 -20px 30px rgba(20,14,10,.22)' }} />
      {/* grain */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: DU.grainURI, backgroundSize: '120px 120px', opacity: 0.10, mixBlendMode: 'overlay' }} />
      {dim > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(20,14,10,${dim})` }} />}
      {kind === 'video' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 46, height: 46, borderRadius: 23, background: 'rgba(255,255,255,.22)',
          backdropFilter: 'blur(2px)', border: '1.5px solid rgba(255,255,255,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={20} color="#fff" fill="#fff" sw={0} />
        </div>
      )}
      {children}
    </div>
  );
}

// ───────────────────────── Avatar ─────────────────────────
function Avatar({ who, size = 22, ring }) {
  const p = DU.partners[who] || DU.partners.A;
  const bg = who === 'A' ? 'var(--accent)' : 'var(--ink2)';
  return (
    <div title={p.name} style={{
      width: size, height: size, borderRadius: size, background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
      fontFamily: 'var(--font-ui)', fontSize: size * 0.46, fontWeight: 600,
      border: ring ? '2px solid var(--paper)' : 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,.18)',
    }}>{p.initial}</div>
  );
}

// ───────────────────────── Phone frame ─────────────────────────
function StatusBar({ dark }) {
  const c = dark ? '#f3ebe0' : 'var(--ink)';
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px 0 26px', flex: '0 0 auto',
      position: 'relative', zIndex: 6 }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: c, letterSpacing: 0.2 }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={c}><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="4.5" y="5.5" width="3" height="6.5" rx="1"/><rect x="9" y="3" width="3" height="9" rx="1"/><rect x="13.5" y="0.5" width="3" height="11.5" rx="1" opacity="0.4"/></svg>
        <Icon name="wifi" size={15} color={c} sw={1.6} />
        {/* battery */}
        <svg width="25" height="13" viewBox="0 0 25 13"><rect x="0.5" y="0.5" width="21" height="12" rx="3" fill="none" stroke={c} strokeOpacity="0.5"/><rect x="2" y="2" width="16" height="9" rx="1.5" fill={c}/><rect x="22.5" y="4" width="2" height="5" rx="1" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

function PhoneFrame({ children, dark }) {
  return (
    <div style={{
      width: 372, height: 760, borderRadius: 52, padding: 5,
      background: 'linear-gradient(150deg, #2c2730, #16131a)',
      boxShadow: '0 1px 0 1.5px rgba(255,255,255,.08) inset, 0 40px 80px -24px rgba(20,12,30,.6), 0 12px 28px -10px rgba(20,12,30,.5)',
      position: 'relative', flex: '0 0 auto',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 47, overflow: 'hidden',
        background: 'var(--paper)', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* dynamic island */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 104, height: 30, background: '#0c0a0f', borderRadius: 16, zIndex: 20 }} />
        <StatusBar dark={dark} />
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── App header ─────────────────────────
function AppHeader({ title, sub, left, right, hand }) {
  return (
    <div style={{ padding: '6px 16px 12px', display: 'flex', alignItems: 'center', gap: 10,
      flex: '0 0 auto', borderBottom: '1px solid var(--line)' }}>
      <div style={{ minWidth: 34, display: 'flex', justifyContent: 'flex-start' }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        <div style={{ fontFamily: hand ? 'var(--font-head)' : 'var(--font-ui)',
          fontSize: hand ? 24 : 17, fontWeight: 700, color: 'var(--ink)', lineHeight: 1,
          letterSpacing: hand ? 0.3 : -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink3)',
          marginTop: 3, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      <div style={{ minWidth: 34, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>{right}</div>
    </div>
  );
}

function HeaderBtn({ icon, onClick, active, badge }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: 12, border: '1px solid var(--line)',
      background: active ? 'var(--accent)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      position: 'relative', padding: 0, boxShadow: '0 1px 2px rgba(0,0,0,.05)',
    }}>
      {typeof icon === 'string' ? <Icon name={icon} size={18} color={active ? '#fff' : 'var(--ink)'} /> : icon}
      {badge != null && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15,
        padding: '0 4px', borderRadius: 8, background: 'var(--accent)', color: '#fff',
        fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-ui)', border: '1.5px solid var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
    </button>
  );
}

// ───────────────────────── Bottom nav ─────────────────────────
function BottomNav({ active, onNav, onAdd }) {
  const items = [
    { id: 'timeline', label: 'timeline', icon: 'clock' },
    { id: 'collections', label: 'trips', icon: 'folder' },
    { id: 'add', icon: 'plus', big: true },
    { id: 'places', label: 'places', icon: 'pin' },
    { id: 'search', label: 'find', icon: 'search' },
  ];
  return (
    <div style={{ flex: '0 0 auto', background: 'var(--paper)', borderTop: '1px solid var(--line)',
      padding: '8px 18px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'relative', zIndex: 8 }}>
      {items.map(it => it.big ? (
        <button key={it.id} onClick={onAdd} style={{
          width: 52, height: 52, borderRadius: 26, marginTop: -26, cursor: 'pointer',
          background: 'var(--accent)', color: '#fff', border: '3px solid var(--paper)',
          boxShadow: '0 8px 18px -4px color-mix(in srgb, var(--accent) 60%, transparent), 0 2px 4px rgba(0,0,0,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}><Icon name="plus" size={26} color="#fff" sw={2.4} /></button>
      ) : (
        <button key={it.id} onClick={() => onNav(it.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: active === it.id ? 'var(--accent)' : 'var(--ink3)', width: 54,
        }}>
          <Icon name={it.icon} size={21} color={active === it.id ? 'var(--accent)' : 'var(--ink3)'}
            sw={active === it.id ? 2.1 : 1.7} fill={active === it.id ? 'color-mix(in srgb, var(--accent) 16%, transparent)' : 'none'} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9.5, fontWeight: active === it.id ? 700 : 500 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ───────────────────────── Atoms ─────────────────────────
function Chip({ label, active, icon, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, cursor: 'pointer', flex: '0 0 auto',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
      background: active ? 'var(--accent)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--ink2)',
      fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: active ? 600 : 500,
      display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
    }}>
      {icon && <Icon name={icon} size={13} color={active ? '#fff' : 'var(--ink3)'} sw={2} />}{label}
    </button>
  );
}

function MetaPill({ icon, label, accent }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      borderRadius: 7, maxWidth: '100%', overflow: 'hidden',
      background: accent ? 'var(--accentSoft)' : 'var(--surface2)',
      border: `1px solid ${accent ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--line)'}`,
      fontFamily: 'var(--font-ui)', fontSize: 10.5, fontWeight: 500,
      color: accent ? 'var(--accentText)' : 'var(--ink2)', whiteSpace: 'nowrap' }}>
      {icon && <Icon name={icon} size={11} color={accent ? 'var(--accentText)' : 'var(--ink3)'} sw={2} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </span>
  );
}

function Btn({ label, primary, icon, onClick, w, sm, style }) {
  return (
    <button onClick={onClick} style={{
      padding: sm ? '7px 14px' : '11px 18px', borderRadius: 13, cursor: 'pointer', width: w,
      border: `1px solid ${primary ? 'transparent' : 'var(--line)'}`,
      background: primary ? 'var(--accent)' : 'var(--surface)',
      color: primary ? '#fff' : 'var(--ink)',
      fontFamily: 'var(--font-ui)', fontSize: sm ? 13 : 14.5, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      boxShadow: primary ? '0 6px 14px -5px color-mix(in srgb, var(--accent) 70%, transparent)' : 'none',
      ...style,
    }}>
      {icon && <Icon name={icon} size={16} color={primary ? '#fff' : 'var(--ink)'} />}{label}
    </button>
  );
}

function Sticker({ text, rotate = 0, color, top, right, left, bottom, style }) {
  return (
    <div style={{ position: 'absolute', top, right, left, bottom, transform: `rotate(${rotate}deg)`,
      background: color || 'var(--highlight)', color: 'var(--ink)', padding: '3px 9px', borderRadius: 4,
      fontFamily: 'var(--font-hand)', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
      boxShadow: '0 2px 5px rgba(0,0,0,.16)', zIndex: 4, ...style }}>{text}</div>
  );
}

function Field({ label, value, placeholder, focus, multiline, h, optional, icon, onClick, trailing }) {
  return (
    <div onClick={onClick} style={{ width: '100%', cursor: onClick ? 'pointer' : 'default' }}>
      {label && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
        color: 'var(--ink2)', marginBottom: 5, display: 'flex', gap: 5, alignItems: 'baseline' }}>
        {label}{optional && <span style={{ color: 'var(--ink3)', fontWeight: 400 }}>optional</span>}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: h || 42,
        border: `1.5px solid ${focus ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 12,
        background: 'var(--surface)', padding: '9px 12px',
        boxShadow: focus ? '0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent)' : 'none',
        alignItems: multiline ? 'flex-start' : 'center' }}>
        {icon && <Icon name={icon} size={16} color={value ? 'var(--accent)' : 'var(--ink3)'} />}
        <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: 13.5,
          color: value ? 'var(--ink)' : 'var(--ink3)', whiteSpace: multiline ? 'pre-line' : 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || placeholder}
          {focus && <span className="du-caret" style={{ display: 'inline-block', width: 1.5, height: 15,
            background: 'var(--accent)', marginLeft: 1, verticalAlign: 'middle' }} />}
        </span>
        {trailing}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, ICON_PATHS, SceneFill, Avatar, StatusBar, PhoneFrame,
  AppHeader, HeaderBtn, BottomNav, Chip, MetaPill, Btn, Sticker, Field,
});
