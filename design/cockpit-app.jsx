// Cockpit (Orbit + Tweaks)
const { useState, useEffect } = React;

function Mission({ s, onOpen }) {
  return (
    <div className={`mission ${s.id}`} onClick={onOpen}>
      <div className="thumb"><span className="badge">{s.tag}</span></div>
      <div className="body">
        <h3>{s.name}</h3>
        <div className="domain">{s.domain}</div>
        <div className="blurb">{s.blurb}</div>
        <div className="grid4">
          <div className="stat"><div className="v">{(s.visitors/1000).toFixed(1)}k<small className={s.visitorsΔ.startsWith('−')?'down':''}>{s.visitorsΔ}</small></div><div className="l">Visitors · 7d</div></div>
          <div className="stat"><div className="v">{s.rev?'$'+(s.rev/1000).toFixed(1)+'k':'—'}</div><div className="l">{s.revLabel}</div></div>
          <div className="stat"><div className="v">${s.cost.toFixed(0)}</div><div className="l">Cost · MTD</div></div>
          <div className="stat"><div className="v">{s.uptime}%</div><div className="l">Uptime</div></div>
        </div>
        <div className="meta-row">
          <span className="chip good">●&nbsp;Live</span>
          <span className="chip">{s.stack.split(' · ')[0]}</span>
          <span className="chip">{s.deploy}</span>
          <span className={`chip ${s.ssl < 60 ? 'warn' : ''}`} style={{marginLeft:'auto'}}>SSL {s.ssl}d</span>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, ticket, onClose }) {
  if (!ticket) return null;
  const prompt = window.toPrompt(ticket.raw || ticket.preview, ticket.site, ticket.title);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <>
      <div className={`drawer-mask ${open ? 'on' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'on' : ''}`}>
        <div className="h">
          <div>
            <h4>{ticket.title}</h4>
            <span className="id">{ticket.id} · {ticket.site}</span>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="b">
          <div className="label">Raw note</div>
          <div className="raw">{ticket.raw || ticket.preview}</div>
          <div className="label">Generated Claude Code prompt</div>
          <pre className="prompt">{prompt}</pre>
        </div>
        <div className="foot">
          <button className="btn primary" onClick={copy}>{copied ? 'Copied ✓' : 'Copy prompt'}</button>
          <button className="btn">Mark prompted</button>
          <button className="btn accent" style={{marginLeft:'auto'}}>Open in CC ↗</button>
        </div>
      </aside>
    </>
  );
}

function Compose({ draft, setDraft, draftSite, setDraftSite, onSubmit }) {
  return (
    <div className="compose">
      <textarea placeholder="An idea, a bug, a half-formed thought… Cockpit translates it into a Claude Code prompt." value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div className="row">
        <div className="seg">
          {['alvarny','studios','labs'].map((s) => (
            <button key={s} className={`${s} ${draftSite === s ? 'on' : ''}`} onClick={() => setDraftSite(s)}>{s}</button>
          ))}
        </div>
        <button className="btn primary" style={{marginLeft:'auto'}} onClick={onSubmit} disabled={!draft.trim()}>Translate ✦</button>
      </div>
    </div>
  );
}

function CmdPalette({ open, onClose, go }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (open) setTimeout(() => document.querySelector('.cmd input')?.focus(), 50); }, [open]);
  const items = [
    { grp: 'Navigate', label: 'Overview', k: '⌘1', view: 'overview' },
    { grp: 'Navigate', label: 'Properties', k: '⌘2', view: 'sites' },
    { grp: 'Navigate', label: 'Tickets', k: '⌘3', view: 'tickets' },
    { grp: 'Navigate', label: 'Signals', k: '⌘4', view: 'signals' },
    { grp: 'Navigate', label: 'Costs', k: '⌘5', view: 'costs' },
    { grp: 'Quick', label: 'New ticket', k: 'N', view: 'tickets' },
    { grp: 'Quick', label: "Open today's digest", k: 'D', view: 'signals' },
  ].filter(i => !q || i.label.toLowerCase().includes(q.toLowerCase()));
  let lastGrp = '';
  return (
    <div className={`cmd-mask ${open ? 'on' : ''}`} onClick={onClose}>
      <div className="cmd" onClick={(e) => e.stopPropagation()}>
        <input placeholder="Where to?" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="res">
          {items.map((it, i) => {
            const grp = it.grp !== lastGrp ? <div className="grp" key={'g'+i}>{it.grp}</div> : null;
            lastGrp = it.grp;
            return <React.Fragment key={i}>
              {grp}
              <div className={`item ${i===0 && !q ? 'sel' : ''}`} onClick={() => { go(it.view); onClose(); }}>
                <span style={{color:'var(--accent)'}}>✦</span><span>{it.label}</span><span className="k">{it.k}</span>
              </div>
            </React.Fragment>;
          })}
        </div>
      </div>
    </div>
  );
}

function CostsView() {
  const total = DATA.costs.reduce((a,b)=>a+b.m,0);
  const apiTotal = DATA.costs.filter(c=>c.isApi).reduce((a,b)=>a+b.m,0);
  return (
    <div className="ledger">
      <div className="section-h" style={{marginTop:0}}>
        <h2>Money <em>in motion</em></h2>
        <span style={{fontSize:12.5,color:'var(--mute)'}}>May 2026 · to date</span>
      </div>
      <div className="ledger-grid">
        <div className="lcard"><div className="l">Spend · MTD</div><div className="v">${total.toFixed(0)}<small>+5%</small></div></div>
        <div className="lcard"><div className="l">AI APIs</div><div className="v">${apiTotal.toFixed(0)}<small className="down">+18%</small></div></div>
        <div className="lcard"><div className="l">Forecast</div><div className="v">$642</div></div>
        <div className="lcard"><div className="l">Budget</div><div className="v">$700</div></div>
      </div>
      <ul className="vendor-list">
        {DATA.costs.map((c) => (
          <li key={c.name}>
            <div className={`ic ${c.isApi?'api':''}`}>{c.isApi?'API':c.name[0]}</div>
            <div className="name">{c.name}<small>{c.scope}</small></div>
            <div className="cat">{c.cat}</div>
            <div className="scope">
              <div style={{flex:1,height:6,borderRadius:999,background:'var(--bg-2)',overflow:'hidden'}}>
                <div style={{width: `${Math.min(100, (c.m/Math.max(...DATA.costs.map(x=>x.m)))*100)}%`,height:'100%',background:c.isApi?'linear-gradient(90deg,var(--accent),var(--accent-deep))':'var(--ink)'}}></div>
              </div>
            </div>
            <div className="amt">${c.m.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CockpitTweaks({ t, setTweak }) {
  const palettes = [
    ['#d65a3a','#fae6dc','#6a4a7a'],   // Sunset
    ['#5b6a52','#e8ede2','#c0815b'],   // Sage
    ['#2d6a8a','#dde9f0','#3a7a5a'],   // Sea
    ['#1a1814','#ebe6dc','#8a3a1d'],   // Ink
    ['#9a3a8a','#f3e0ee','#3a4a8a'],   // Plum
  ];
  const names = ['Cockpit','Orbit','Atlas','Helm','Vantage','Bearing','Tower','Compass','Beacon','Polestar','Wheelhouse','Meridian','Lookout','Wayfinder','Apex'];
  return (
    <TweaksPanel title="Cockpit Tweaks" defaultOpen={false}>
      <TweakSection title="Brand">
        <TweakSelect label="Name" value={t.name} onChange={(v)=>setTweak('name', v)} options={names.map(n=>({value:n,label:n}))} />
        <TweakColor label="Palette" value={t.accent} onChange={(v)=>setTweak('accent', v)} options={palettes} />
        <TweakToggle label="Serif headlines" value={t.serifHeads} onChange={(v)=>setTweak('serifHeads', v)} />
      </TweakSection>
      <TweakSection title="Layout">
        <TweakRadio label="Density" value={t.density} onChange={(v)=>setTweak('density', v)} options={[{value:'comfy',label:'Comfy'},{value:'dense',label:'Dense'}]} />
        <TweakSlider label="Corner radius" value={t.radius} onChange={(v)=>setTweak('radius', v)} min={4} max={28} step={2} suffix="px" />
      </TweakSection>
      <TweakSection title="Modules">
        <TweakToggle label="Today's focus block" value={t.showFocus} onChange={(v)=>setTweak('showFocus', v)} />
        <TweakToggle label="AI daily digest" value={t.showDigest} onChange={(v)=>setTweak('showDigest', v)} />
        <TweakToggle label="⌘K hint pill" value={t.showCmdHint} onChange={(v)=>setTweak('showCmdHint', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

function App() {
  const [t, setTweak] = useTweaks(window.__cockpitDefaults);
  const [view, setView] = useState('overview');
  const [drawerTicket, setDrawerTicket] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftSite, setDraftSite] = useState('alvarny');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [focusTodo, setFocusTodo] = useState(DATA.focus);

  // Apply tweaks → CSS vars / data attrs on <html>
  useEffect(() => {
    const r = document.documentElement;
    const accent = Array.isArray(t.accent) ? t.accent : ['#d65a3a','#fae6dc','#6a4a7a'];
    r.style.setProperty('--accent', accent[0]);
    r.style.setProperty('--accent-soft', accent[1] || '#fae6dc');
    r.style.setProperty('--accent-deep', accent[2] || '#6a4a7a');
    r.style.setProperty('--radius', t.radius + 'px');
    r.setAttribute('data-density', t.density);
    r.setAttribute('data-serif', t.serifHeads ? 'on' : 'off');
  }, [t]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === 'Escape') { setCmdOpen(false); setDrawerOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openTicket = (tk) => { setDrawerTicket(tk); setDrawerOpen(true); };
  const submitDraft = () => {
    const newT = { id: 'A-' + (143 + Math.floor(Math.random() * 9)), site: draftSite, title: draft.split('\n')[0].slice(0, 60), preview: draft.slice(0, 90), raw: draft, status: 'prompt' };
    setDraft(''); setDrawerTicket(newT); setDrawerOpen(true);
  };

  return (
    <div className="app">
      {!authed && <Login onEnter={() => setAuthed(true)} name={t.name} />}

      <div className="top">
        <div className="brand">
          <div className="planet"></div>
          <div className="name">{t.name}<em>.</em></div>
        </div>
        <nav className="nav">
          {['overview','sites','tickets','signals','costs'].map((v) => (
            <a key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} style={{textTransform:'capitalize'}}>{v === 'sites' ? 'Properties' : v}</a>
          ))}
        </nav>
        <div className="right">
          <span className="pill"><span className="ok"></span>All systems nominal</span>
          {t.showCmdHint && <span className="pill" onClick={() => setCmdOpen(true)} style={{cursor:'pointer'}}>⌘ K</span>}
          <div className="av">A</div>
        </div>
      </div>

      {view === 'overview' && <>
        <div className="hero" style={{gridTemplateColumns: t.showFocus ? '1.6fr 1fr' : '1fr'}}>
          <div className="hello">
            <div className="greet">Friday · {DATA.date.split(',')[1].trim()}</div>
            <h1>Good morning, <em>Alvar.</em></h1>
            <div className="summary">Traffic across the three properties is up <b>+11% week-on-week</b>, mostly driven by studios. Anthropic API spend is on track for <b>~$420 this month</b>. Two leads are waiting in the studios inbox.</div>
            <div className="stats">
              <div className="stat"><div className="v">19.4k<small>+11%</small></div><div className="l">Visitors · 7d</div></div>
              <div className="stat"><div className="v">$498</div><div className="l">Spend · MTD</div></div>
              <div className="stat"><div className="v">12</div><div className="l">Open tickets</div></div>
              <div className="stat"><div className="v">7</div><div className="l">Active leads</div></div>
            </div>
          </div>
          {t.showFocus && (
            <div className="focus">
              <h3>Today's <em>focus</em></h3>
              <div className="when">~ 4 hours · Deep work block</div>
              <ul>
                {focusTodo.map((f, i) => (
                  <li key={i} className={f.done ? 'done' : ''} onClick={() => setFocusTodo(focusTodo.map((x, j) => j === i ? {...x, done: !x.done} : x))}>
                    <span className="check"></span><span>{f.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="section-h"><h2>The three <em>missions</em></h2><span className="more">All properties →</span></div>
        <div className="missions">
          {DATA.sites.map((s) => <Mission key={s.id} s={s} onOpen={() => setView('sites')} />)}
        </div>

        <div className="grid-2" style={{gridTemplateColumns: t.showDigest ? '1.5fr 1fr' : '1fr'}}>
          {t.showDigest && (
            <div className="digest">
              <div className="head">
                <h3>Today, in <em>machines that build software</em></h3>
                <span className="when">06:14 CET</span>
              </div>
              <p>{DATA.digest.paragraph}</p>
              <ul>
                {DATA.digest.items.map((it, i) => (
                  <li key={i}>
                    <span className="src">{it.src}</span>
                    <span className="ttl">{it.em ? <em>{it.ttl}</em> : it.ttl}</span>
                    <span className="when">{it.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="tickets">
            <h3>Tickets <em>&amp; ideas</em></h3>
            <div className="sub">Capture → translate → ship.</div>
            <Compose draft={draft} setDraft={setDraft} draftSite={draftSite} setDraftSite={setDraftSite} onSubmit={submitDraft} />
            <ul className="ticket-list">
              {DATA.tickets.slice(0, 5).map((tk) => (
                <li key={tk.id} onClick={() => openTicket(tk)}>
                  <span className="id">{tk.id}</span>
                  <span className="ttl">{tk.title}<small>{tk.preview}</small></span>
                  <span className="right">
                    <span className={`site-pill ${tk.site}`}>{tk.site}</span>
                    <span className={`status-pill ${tk.status}`}>{tk.status === 'idea' ? 'Idea' : tk.status === 'prompt' ? 'Prompted' : tk.status === 'progress' ? 'In progress' : 'Shipped'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>}

      {view === 'sites' && <>
        <div className="section-h"><h2>The three <em>missions</em></h2><span className="more">3 properties</span></div>
        <div className="missions">
          {DATA.sites.map((s) => <Mission key={s.id} s={s} onOpen={() => {}} />)}
        </div>
        <div className="ledger" style={{marginTop:24}}>
          <div className="section-h" style={{marginTop:0}}><h2>Recent <em>deployments</em></h2></div>
          <ul className="ticket-list">
            {[
              {id:'a1c4f2e', site:'alvarny', msg:'feat: kinetic hero variant behind feature flag', when:'2h ago'},
              {id:'8e7b3a1', site:'labs', msg:'fix: idle SSE timeout on /agent stream', when:'1d ago'},
              {id:'3df2c91', site:'studios', msg:'chore: lead-form copy + a11y pass', when:'5d ago'},
            ].map((d) => (
              <li key={d.id}>
                <span className="id">{d.id}</span>
                <span className="ttl">{d.msg}<small>{d.when}</small></span>
                <span className="right">
                  <span className={`site-pill ${d.site}`}>{d.site}</span>
                  <span className="status-pill shipped">deployed</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </>}

      {view === 'tickets' && <>
        <div className="section-h"><h2>Tickets <em>&amp; ideas</em></h2><span className="more">{DATA.tickets.length} total</span></div>
        <div className="tickets">
          <Compose draft={draft} setDraft={setDraft} draftSite={draftSite} setDraftSite={setDraftSite} onSubmit={submitDraft} />
          <ul className="ticket-list">
            {DATA.tickets.map((tk) => (
              <li key={tk.id} onClick={() => openTicket(tk)}>
                <span className="id">{tk.id}</span>
                <span className="ttl">{tk.title}<small>{tk.preview}</small></span>
                <span className="right">
                  <span className={`site-pill ${tk.site}`}>{tk.site}</span>
                  <span className={`status-pill ${tk.status}`}>{tk.status === 'idea' ? 'Idea' : tk.status === 'prompt' ? 'Prompted' : tk.status === 'progress' ? 'In progress' : 'Shipped'}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </>}

      {view === 'signals' && <>
        <div className="section-h"><h2>Signals <em>from the field</em></h2><span className="more">Updated 2m ago</span></div>
        <div className="digest">
          <div className="head"><h3>Today's <em>digest</em></h3><span className="when">06:14 CET · 1,140 sources</span></div>
          <p>{DATA.digest.paragraph}</p>
          <ul>
            {DATA.digest.items.concat(DATA.digest.items).map((it, i) => (
              <li key={i}>
                <span className="src">{it.src}</span>
                <span className="ttl">{it.em ? <em>{it.ttl}</em> : it.ttl}</span>
                <span className="when">{it.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </>}

      {view === 'costs' && <CostsView />}

      <Drawer open={drawerOpen} ticket={drawerTicket} onClose={() => setDrawerOpen(false)} />
      <CmdPalette open={cmdOpen} onClose={() => setCmdOpen(false)} go={setView} />
      <CockpitTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

function Login({ onEnter, name }) {
  const [going, setGoing] = useState(false);
  const enter = () => { setGoing(true); setTimeout(onEnter, 350); };
  return (
    <div className={`login-overlay ${going ? 'gone' : ''}`}>
      <div className="login-card">
        <div className="planet"></div>
        <h1>{name}<em>.</em></h1>
        <div className="tag">A calm vantage point above everything you ship.</div>
        <div className="login-field"><label>Email</label><input defaultValue="alvar@alvarny.com" /></div>
        <div className="login-field"><label>Passphrase</label><input type="password" defaultValue="••••••••••" /></div>
        <button className="enter" onClick={enter}>Enter {name} ✦</button>
        <div className="colo"><span>Private · single operator</span><span>v0.4.2</span></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
