```
  ContentOS AI — Design System    /\*
```

```
================================================================ DESIGN TOKENS
================================================================ \*/ :root { /\*
Backgrounds \*/ --bg-void: #050508; --bg-base: #080810; --bg-raised: #0D0D1A; --
bg-float: #111122; --bg-overlay: #161628; --bg-hover: #1C1C35; /\* Violet —
Command \*/ --vi-50: #EEE9FF; --vi-100: #D9CFFE; --vi-200: #B8A3FE; --vi-300:
#9671FD; --vi-400: #7A45FA; --vi-500: #6620F5; --vi-600: #5218CC; --vi-700:
#3E12A3; --vi-800: #2C0D7A; --vi-900: #1A0852; /\* Indigo — Depth \*/ --in-400:
#6366F1; --in-500: #4F46E5; /\* Electric Teal — AI Signal \*/ --te-300: #5EEAD4;
--te-400: #2DD4BF; --te-500: #14B8A6; --te-600: #0D9488; /\* Fuchsia — Accent
spark \*/ --fu-400: #E879F9; --fu-500: #D946EF; /\* Semantic \*/ --ok: #22C55E;
--warn: #EAB308; --err: #EF4444; --info: #38BDF8; /\* Text \*/ --tx-1: #F4F2FF;
--tx-2: #9898B8; --tx-3: #56566A; --tx-4: #2E2E40; /\* Borders \*/ --bd-1:
rgba(255,255,255,0.03); --bd-2: rgba(255,255,255,0.07); --bd-3:
rgba(255,255,255,0.12); --bd-v: rgba(102,32,245,0.35); --bd-t:
rgba(20,184,166,0.25); /\* Glows \*/ --glow-v: 0 0 48px rgba(102,32,245,0.2), 0
0 16px rgba(102,32,245,0.1); --glow-t: 0 0 40px rgba(20,184,166,0.18); --glow-
sm: 0 0 20px rgba(102,32,245,0.12); /\* Typography \*/ --ff-display: 'Clash
Display', sans-serif; --ff-body: 'Satoshi', sans-serif; --ff-mono: 'Geist Mono',
monospace; /\* Spacing (4px base) \*/ --s1: 4px; --s2: 8px; --s3: 12px; --s4:
16px; --s5: 20px; --s6: 24px; --s8: 32px; --s10: 40px; --s12: 48px; --s16: 64px;
--s20: 80px; --s24: 96px; /\* Radius \*/ --r2: 4px; --r3: 6px; --r4: 8px; --r6:
12px; --r8: 16px; --r10: 20px; --r12: 24px; --rpill: 9999px; /\* Easing \*/ --
ease: cubic-bezier(0.16, 1, 0.3, 1); --ease-in: cubic-bezier(0.4, 0, 1, 1); --
t1: 120ms; --t2: 200ms; --t3: 350ms; --t4: 500ms; } /\*
================================================================ RESET & BASE
================================================================ \*/ \*,
\*::before, \*::after { box-sizing: border-box; margin: 0; padding: 0; } html
{ scroll-behavior: smooth; } body { background: var(--bg-void); color: var(--
tx-1); font-family: var(--ff-body); font-size: 15px; line-height: 1.65; -webkit-
font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x:
hidden; cursor: default; } /\* Grain overlay \*/ body::after { content: '';
position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg
xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter
id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'
stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate'
values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25'
filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E"); pointer-events: none; z-
index: 9999; opacity: 1; } /\* Ambient orbs \*/ .orb { position: fixed; border-
radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; } .orb-1
{ width: 600px; height: 600px; background: radial-gradient(circle,
rgba(102,32,245,0.12), transparent 70%); top: -200px; right: -100px; } .orb-2
{ width: 500px; height: 500px; background: radial-gradient(circle,
rgba(20,184,166,0.08), transparent 70%); bottom: 200px; left: -100px; } .orb-3 {
width: 300px; height: 300px; background: radial-gradient(circle,
rgba(217,70,239,0.06), transparent 70%); top: 60%; right: 10%; } /\*
================================================================ LAYOUT
================================================================ \*/ .wrapper
{ position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 0
var(--s8); } /\*
================================================================ SECTION
STRUCTURE ================================================================
\*/ .ds-section { padding: var(--s20) 0; border-bottom: 1px solid var(--bd-1); }
.ds-section:last-child { border-bottom: none; } .sec-eyebrow { display: inline-
flex; align-items: center; gap: var(--s2); font-family: var(--ff-mono); font-
size: 10px; font-weight: 500; color: var(--vi-400); letter-spacing: 0.18em;
text-transform: uppercase; margin-bottom: var(--s4); } .sec-eyebrow-dot { width:
5px; height: 5px; border-radius: 50%; background: var(--vi-400); animation:
beatPulse 2.4s ease infinite; } @keyframes beatPulse { 0%, 100% { transform:
scale(1); opacity: 1; } 50% { transform: scale(0.5); opacity: 0.3; } } .sec-
title { font-family: var(--ff-display); font-size: clamp(32px, 4vw, 48px); font-
weight: 700; letter-spacing: -0.035em; line-height: 1.05; color: var(--tx-1);
margin-bottom: var(--s3); } .sec-desc { font-family: var(--ff-body); font-size:
15px; font-weight: 300; color: var(--tx-2); max-width: 580px; line-height: 1.7;
```

```
margin-bottom: var(--s10); } /\*
================================================================ HERO
================================================================ \*/ .hero
{ padding: var(--s24) 0 var(--s16); position: relative; } .hero-grid-bg
{ position: absolute; inset: 0; background-image: linear-
gradient(rgba(102,32,245,0.05) 1px, transparent 1px), linear-gradient(90deg,
rgba(102,32,245,0.05) 1px, transparent 1px); background-size: 48px 48px; mask-
image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent); } .hero-
tag { display: inline-flex; align-items: center; gap: var(--s2); font-family:
var(--ff-mono); font-size: 11px; color: var(--te-400); letter-spacing: 0.1em;
text-transform: uppercase; padding: 6px 14px; border: 1px solid var(--bd-t);
border-radius: var(--rpill); background: rgba(20,184,166,0.07); margin-bottom:
var(--s6); } .hero-title { font-family: var(--ff-display); font-size:
clamp(52px, 8vw, 96px); font-weight: 700; letter-spacing: -0.045em; line-height:
0.95; margin-bottom: var(--s5); } .hero-title .line-1 { display: block; color:
var(--tx-1); } .hero-title .line-2 { display: block; background: linear-
gradient(135deg, var(--vi-300) 0%, var(--te-400) 50%, var(--fu-400) 100%);
-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-
clip: text; } .hero-sub { font-size: 18px; font-weight: 300; color: var(--tx-2);
max-width: 520px; line-height: 1.65; margin-bottom: var(--s8); } .hero-chips
{ display: flex; flex-wrap: wrap; gap: var(--s2); } .hero-chip { font-family:
var(--ff-mono); font-size: 10px; color: var(--tx-3); padding: 4px 10px; border:
1px solid var(--bd-2); border-radius: var(--rpill); background: var(--bg-
raised); } .hero-chip b { color: var(--tx-2); font-weight: 500; } /\*
================================================================ COLORS
================================================================ \*/ .color-
system { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,
1fr)); gap: var(--s4); margin-bottom: var(--s10); } .color-group { display:
flex; flex-direction: column; gap: 3px; } .color-group-label { font-family:
var(--ff-mono); font-size: 9px; color: var(--tx-3); letter-spacing: 0.12em;
text-transform: uppercase; margin-bottom: var(--s2); } .swatch { height: 38px;
border-radius: var(--r3); display: flex; align-items: center; justify-content:
space-between; padding: 0 10px; font-family: var(--ff-mono); font-size: 10px;
transition: transform var(--t1) var(--ease); position: relative; overflow:
hidden; } .swatch:hover { transform: scaleX(1.015); z-index: 1; } .swatch-n
{ font-weight: 500; } .swatch-h { opacity: 0.65; } /\* Surface ramp
\*/ .surface-ramp { display: flex; gap: 3px; margin-bottom: var(--
s10); } .surface-tile { flex: 1; height: 52px; border-radius: var(--r3); border:
1px solid var(--bd-2); position: relative; cursor: default; } .surface-tile-
label { position: absolute; bottom: -22px; left: 50%; transform:
translateX(-50%); font-family: var(--ff-mono); font-size: 9px; color: var(--
tx-3); white-space: nowrap; } /\*
================================================================ TYPOGRAPHY
================================================================ \*/ .font-
specimen { background: var(--bg-raised); border: 1px solid var(--bd-1); border-
radius: var(--r10); padding: var(--s8); margin-bottom: var(--s5); position:
relative; overflow: hidden; } .font-specimen::before { content: ''; position:
absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-
gradient(90deg, var(--vi-500), transparent); } .font-label { font-family: var(--
ff-mono); font-size: 10px; color: var(--tx-3); letter-spacing: 0.12em; text-
transform: uppercase; margin-bottom: var(--s5); display: flex; align-items:
center; justify-content: space-between; } .font-label-r { font-family: var(--ff-
mono); font-size: 10px; color: var(--vi-400); font-weight: 500; } .type-row
{ display: grid; grid-template-columns: 72px 1fr 180px; align-items: baseline;
gap: var(--s4); padding: var(--s3) 0; border-bottom: 1px solid var(--
bd-1); } .type-row:last-child { border-bottom: none; } .type-role { font-family:
var(--ff-mono); font-size: 10px; color: var(--tx-3); } .type-spec { font-family:
var(--ff-mono); font-size: 10px; color: var(--tx-4); text-align: right; } /\*
================================================================ SPACING VIZ
================================================================ \*/ .spacing-
vis { display: flex; flex-direction: column; gap: var(--s3); margin-bottom:
var(--s10); } .sp-row { display: flex; align-items: center; gap: var(--
s4); } .sp-name { font-family: var(--ff-mono); font-size: 11px; color: var(--
tx-2); min-width: 56px; } .sp-bar-track { flex: 1; height: 18px; display: flex;
```

```
align-items: center; } .sp-bar { height: 6px; border-radius: var(--rpill);
background: linear-gradient(90deg, var(--vi-500), var(--te-400)); opacity: 0.75;
transition: opacity var(--t1); } .sp-row:hover .sp-bar { opacity: 1; } .sp-val {
font-family: var(--ff-mono); font-size: 11px; color: var(--tx-3); min-width:
36px; text-align: right; } /\* Radius tiles \*/ .radius-row { display: flex;
gap: var(--s4); align-items: flex-end; flex-wrap: wrap; margin-bottom: var(--
s10); } .r-tile { text-align: center; } .r-box { background: var(--bg-float);
border: 1px solid var(--bd-2); margin: 0 auto var(--s2); transition: border-
color var(--t2) var(--ease); } .r-tile:hover .r-box { border-color: var(--bd-v);
} .r-name { font-family: var(--ff-mono); font-size: 9px; color: var(--
tx-3); } /\* ================================================================
COMPONENT CARDS ================================================================
\*/ .comp-grid { display: grid; grid-template-columns: repeat(auto-fit,
minmax(310px, 1fr)); gap: var(--s4); margin-bottom: var(--s10); } .comp-card
{ background: var(--bg-raised); border: 1px solid var(--bd-1); border-radius:
var(--r10); overflow: hidden; transition: border-color var(--t2) var(--ease),
box-shadow var(--t2) var(--ease); } .comp-card:hover { border-color: var(--bd-
v); box-shadow: var(--glow-sm); } .comp-header { display: flex; align-items:
center; justify-content: space-between; padding: var(--s3) var(--s5); border-
bottom: 1px solid var(--bd-1); background: var(--bg-float); } .comp-name { font-
family: var(--ff-mono); font-size: 10px; color: var(--tx-3); letter-spacing:
0.1em; text-transform: uppercase; } .comp-body { padding: var(--s6); display:
flex; flex-direction: column; gap: var(--s4); align-items: flex-start; } /\*
================================================================ BUTTONS
================================================================ \*/ .btn
{ display: inline-flex; align-items: center; gap: var(--s2); font-family: var(--
ff-body); font-weight: 500; font-size: 14px; border: 1px solid transparent;
border-radius: var(--r4); cursor: pointer; white-space: nowrap; transition: all
var(--t1) var(--ease); text-decoration: none; outline: none; position: relative;
overflow: hidden; } .btn::after { content: ''; position: absolute; inset: 0;
background: rgba(255,255,255,0); transition: background var(--
t1); } .btn:hover::after { background: rgba(255,255,255,0.05); } .btn:active
{ transform: scale(0.97); } .btn-md { height: 40px; padding: 0 18px; } .btn-sm {
height: 32px; padding: 0 12px; font-size: 12px; border-radius: var(--
r3); } .btn-lg { height: 50px; padding: 0 28px; font-size: 16px; border-radius:
var(--r6); } .btn-sq { width: 40px; height: 40px; padding: 0; justify-content:
center; } .btn-sq-sm { width: 32px; height: 32px; padding: 0; justify-content:
center; border-radius: var(--r3); } .btn-primary { background: var(--vi-500);
color: white; } .btn-primary:hover { background: var(--vi-400); box-shadow:
var(--glow-v); transform: translateY(-1px); } .btn-teal { background:
rgba(20,184,166,0.15); color: var(--te-400); border-color: var(--bd-t); } .btn-
teal:hover { background: rgba(20,184,166,0.22); box-shadow: var(--glow-
t); } .btn-secondary { background: var(--bg-overlay); color: var(--tx-1);
border-color: var(--bd-2); } .btn-secondary:hover { background: var(--bg-hover);
border-color: var(--bd-3); } .btn-ghost { background: transparent; color: var(--
tx-2); border-color: var(--bd-1); } .btn-ghost:hover { background: var(--bg-
raised); color: var(--tx-1); } .btn-danger { background: rgba(239,68,68,0.1);
color: #FCA5A5; border-color: rgba(239,68,68,0.2); } .btn-danger:hover
{ background: rgba(239,68,68,0.18); } .btn-gradient { background: linear-
gradient(135deg, var(--vi-500), var(--in-500)); color: white; border:
none; } .btn-gradient:hover { background: linear-gradient(135deg, var(--vi-400),
var(--in-400)); box-shadow: var(--glow-v); transform: translateY(-1px); } .btn-
row { display: flex; flex-wrap: wrap; gap: var(--s2); } /\*
================================================================ INPUTS
================================================================ \*/ .field
{ display: flex; flex-direction: column; gap: var(--s2); width: 100%; } .field-
label { font-size: 12px; font-weight: 500; color: var(--tx-2); } .field-hint
{ font-size: 11px; color: var(--tx-3); } .input, .select, .textarea { width:
100%; background: var(--bg-float); border: 1px solid var(--bd-2); border-radius:
var(--r4); color: var(--tx-1); font-family: var(--ff-body); font-size: 14px;
outline: none; transition: all var(--t1) var(--ease); } .input { height: 44px;
padding: 0 var(--s4); } .textarea { padding: var(--s3) var(--s4); resize:
vertical; min-height: 96px; line-height: 1.6; } .select { height: 44px; padding:
0 var(--s8) 0 var(--s4); appearance: none; cursor: pointer; background-image:
```

```
url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16'
height='16' fill='none'%3E%3Cpath stroke='%2356566A' stroke-width='1.5' stroke-
linecap='round' stroke-linejoin='round' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
background-repeat: no-repeat; background-position: right 12px
center; } .input::placeholder, .textarea::placeholder { color: var(--
tx-3); } .input:focus, .select:focus, .textarea:focus { border-color: var(--
vi-500); box-shadow: 0 0 0 3px rgba(102,32,245,0.15); background: var(--bg-
overlay); } .input-icon-wrap { position: relative; width: 100%; } .input-icon-
wrap .input { padding-left: 40px; } .input-icon { position: absolute; left:
13px; top: 50%; transform: translateY(-50%); color: var(--tx-3); pointer-events:
none; font-size: 15px; line-height: 1; } /\*
```

```
================================================================ BADGES
```

```
================================================================ \*/ .badge
{ display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0
9px; border-radius: var(--rpill); font-family: var(--ff-mono); font-size: 10px;
font-weight: 500; white-space: nowrap; } .badge-dot { width: 4px; height: 4px;
border-radius: 50%; } .b-vi { background: rgba(102,32,245,0.15); color: var(--
vi-300); border: 1px solid rgba(102,32,245,0.3); } .b-te { background:
rgba(20,184,166,0.1); color: var(--te-300); border: 1px solid
rgba(20,184,166,0.2); } .b-fu { background: rgba(217,70,239,0.1); color: var(--
fu-400); border: 1px solid rgba(217,70,239,0.2); } .b-ok { background:
rgba(34,197,94,0.1); color: #86EFAC; border: 1px solid
rgba(34,197,94,0.2); } .b-warn { background: rgba(234,179,8,0.1); color:
#FDE047; border: 1px solid rgba(234,179,8,0.2); } .b-err { background:
rgba(239,68,68,0.1); color: #FCA5A5; border: 1px solid
rgba(239,68,68,0.2); } .b-ghost{ background: var(--bg-float); color: var(--
tx-2); border: 1px solid var(--bd-2); } .badges-wrap { display: flex; flex-wrap:
wrap; gap: var(--s2); } /\* Plan badges \*/ .plan-badge { display: inline-flex;
align-items: center; gap: 6px; height: 26px; padding: 0 12px; border-radius:
var(--rpill); font-family: var(--ff-mono); font-size: 10px; font-weight: 500;
letter-spacing: 0.06em; text-transform: uppercase; } .plan-free { background:
var(--bg-float); color: var(--tx-2); border: 1px solid var(--bd-2); } .plan-
creator { background: rgba(102,32,245,0.15); color: var(--vi-200); border: 1px
solid var(--bd-v); } .plan-agency { background: rgba(20,184,166,0.12); color:
var(--te-300); border: 1px solid var(--bd-t); } /\*
```

```
================================================================ AI OUTPUT BLOCK
================================================================ \*/ .ai-block {
background: rgba(102,32,245,0.05); border: 1px solid rgba(102,32,245,0.2);
border-radius: var(--r8); overflow: hidden; width: 100%; } .ai-block-head
{ display: flex; align-items: center; justify-content: space-between; padding:
var(--s3) var(--s4); border-bottom: 1px solid rgba(102,32,245,0.1); background:
rgba(102,32,245,0.06); } .ai-label { display: flex; align-items: center; gap:
6px; font-family: var(--ff-mono); font-size: 10px; color: var(--vi-300); letter-
spacing: 0.06em; } .ai-star { font-size: 12px; color: var(--vi-400); } .ai-
block-body { padding: var(--s4) var(--s5); font-family: var(--ff-mono); font-
size: 12.5px; line-height: 1.85; color: var(--tx-1); } .ai-tag { color: var(--
vi-400); font-weight: 500; } .ai-cursor { display: inline-block; width: 2px;
height: 14px; background: var(--vi-400); vertical-align: middle; margin-left:
2px; animation: cursorBlink 1.1s step-end infinite; } @keyframes cursorBlink
{ 0%, 100% { opacity: 1; } 50% { opacity: 0; } } .ai-block-foot { display: flex;
gap: var(--s2); padding: var(--s3) var(--s4); border-top: 1px solid
rgba(102,32,245,0.08); background: rgba(102,32,245,0.03); } /\*
================================================================ NAVIGATION
```

```
================================================================ \*/ .nav-demo {
background: var(--bg-raised); border: 1px solid var(--bd-1); border-radius:
var(--r8); padding: var(--s3); width: 224px; } .nav-item { display: flex; align-
items: center; gap: var(--s3); height: 38px; padding: 0 var(--s3); border-
radius: var(--r3); font-size: 13px; font-weight: 500; color: var(--tx-2);
cursor: pointer; border-left: 2px solid transparent; transition: all var(--t1)
var(--ease); margin-bottom: 2px; } .nav-item:hover { background: var(--bg-
overlay); color: var(--tx-1); } .nav-item.on { background:
rgba(102,32,245,0.12); color: var(--tx-1); border-left-color: var(--
vi-500); } .nav-icon { font-size: 15px; flex-shrink: 0; width: 18px; text-align:
center; } .nav-badge { margin-left: auto; font-family: var(--ff-mono); font-
```

```
size: 9px; color: var(--vi-400); background: rgba(102,32,245,0.12); padding: 1px
6px; border-radius: var(--rpill); } /\*
================================================================ TOAST
================================================================ \*/ .toast
{ display: inline-flex; align-items: center; gap: var(--s3); padding: var(--s3)
var(--s4); background: var(--bg-overlay); border: 1px solid var(--bd-2); border-
radius: var(--r6); font-size: 13px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); max-
width: 100%; } .toast-icon { font-size: 15px; flex-shrink: 0; } .t-ok { border-
color: rgba(34,197,94,0.25); } .t-ok .toast-icon { color: var(--ok); } .t-err
{ border-color: rgba(239,68,68,0.25); } .t-err .toast-icon { color: var(--
err); } .t-vi { border-color: rgba(102,32,245,0.3); } .t-vi .toast-icon { color:
var(--vi-300); } /\*
```

```
================================================================ LOADING
```

```
================================================================ \*/ .load-bar {
width: 100%; height: 3px; background: var(--bg-hover); border-radius: var(--
rpill); overflow: hidden; } .load-fill { height: 100%; border-radius: var(--
rpill); background: linear-gradient(90deg, var(--vi-500), var(--te-400), var(--
vi-500)); background-size: 200% 100%; animation: barShimmer 2s linear
infinite; } @keyframes barShimmer { 0% { background-position: 200%; } 100%
{ background-position: -200%; } } .skeleton { background: var(--bg-float);
border-radius: var(--r3); overflow: hidden; position:
relative; } .skeleton::after { content: ''; position: absolute; inset: 0;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03),
transparent); animation: skeletonSweep 1.8s ease infinite; } @keyframes
skeletonSweep { 0% { transform: translateX(-100%); } 100% { transform:
translateX(100%); } } .scan-wrap { background: var(--bg-float); border: 1px
solid var(--bd-1); border-radius: var(--r6); padding: var(--s5); position:
relative; overflow: hidden; } .scan-line { position: absolute; left: 0; right:
0; height: 1px; background: linear-gradient(90deg, transparent, var(--vi-400),
transparent); animation: scanDown 2.2s ease-in-out infinite; opacity: 0.8; }
@keyframes scanDown { 0% { top: 0; opacity: 0; } 8% { opacity: 0.8; } 92%
{ opacity: 0.8; } 100% { top: 100%; opacity: 0; } } /\*
```

```
================================================================ MODULE CARDS
```

```
================================================================ \*/ .module-
grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,
1fr)); gap: var(--s4); margin-bottom: var(--s10); } .module-card { background:
var(--bg-raised); border: 1px solid var(--bd-1); border-radius: var(--r10);
padding: var(--s5); cursor: pointer; transition: all var(--t3) var(--ease);
position: relative; overflow: hidden; } .module-card::before { content: '';
position: absolute; inset: 0; background: radial-gradient(circle at top right,
rgba(102,32,245,0.07), transparent 70%); opacity: 0; transition: opacity var(--
t2) var(--ease); } .module-card:hover { border-color: var(--bd-v); transform:
translateY(-3px); box-shadow: var(--glow-sm); } .module-card:hover::before
{ opacity: 1; } .mod-icon { width: 40px; height: 40px; border-radius: var(--r4);
display: flex; align-items: center; justify-content: center; font-size: 18px;
margin-bottom: var(--s4); background: rgba(102,32,245,0.1); border: 1px solid
rgba(102,32,245,0.2); } .mod-name { font-family: var(--ff-display); font-size:
14px; font-weight: 600; margin-bottom: 4px; } .mod-desc { font-size: 12px;
color: var(--tx-2); line-height: 1.5; } .mod-ai { position: absolute; top: 12px;
right: 12px; font-family: var(--ff-mono); font-size: 9px; color: var(--vi-400);
background: rgba(102,32,245,0.1); border: 1px solid rgba(102,32,245,0.15);
padding: 2px 7px; border-radius: var(--rpill); } /\*
```

```
================================================================ LAYOUT DIAGRAM
================================================================ \*/ .layout-
frame { background: var(--bg-raised); border: 1px solid var(--bd-1); border-
radius: var(--r12); overflow: hidden; height: 440px; display: flex; margin-
bottom: var(--s10); } .l-sidebar { width: 208px; flex-shrink: 0; background:
var(--bg-float); border-right: 1px solid var(--bd-1); display: flex; flex-
direction: column; padding: var(--s4); gap: var(--s2); } .l-logo { display:
flex; align-items: center; gap: var(--s2); padding: var(--s2) var(--s2); margin-
bottom: var(--s3); } .logomark { width: 28px; height: 28px; border-radius: 7px;
background: linear-gradient(135deg, var(--vi-500), var(--te-500)); display:
flex; align-items: center; justify-content: center; font-family: var(--ff-
display); font-size: 13px; font-weight: 700; color: white; } .logo-name { font-
```

```
family: var(--ff-display); font-size: 13px; font-weight: 700; } .l-main { flex:
1; display: flex; flex-direction: column; } .l-topbar { height: 52px; border-
bottom: 1px solid var(--bd-1); background: var(--bg-raised); flex-shrink: 0;
display: flex; align-items: center; justify-content: space-between; padding: 0
var(--s5); } .l-search { display: flex; align-items: center; gap: var(--s2);
padding: 0 var(--s3); height: 32px; background: var(--bg-float); border: 1px
solid var(--bd-1); border-radius: var(--r4); font-size: 12px; color: var(--
tx-3); font-family: var(--ff-body); min-width: 200px; } .l-avatar { width: 28px;
height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--
vi-500), var(--te-500)); } .l-content { flex: 1; padding: var(--s6); overflow:
hidden; } .l-content-label { font-family: var(--ff-mono); font-size: 9px; color:
var(--tx-3); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom:
var(--s4); } .sk-group { display: flex; flex-direction: column; gap: var(--
s3); } .sk-row { display: flex; gap: var(--s3); } .sk { background: var(--bg-
overlay); border-radius: var(--r3); } .sk.animate { animation: skeletonSweep 2s
ease infinite; } .dim-info { display: grid; grid-template-columns: repeat(3,
1fr); gap: var(--s4); margin-bottom: var(--s10); } .dim-card { background:
var(--bg-raised); border: 1px solid var(--bd-1); border-radius: var(--r6);
padding: var(--s4); } .dim-tag { font-family: var(--ff-mono); font-size: 9px;
color: var(--tx-3); letter-spacing: 0.12em; text-transform: uppercase; margin-
bottom: 6px; } .dim-val { font-family: var(--ff-display); font-size: 26px; font-
weight: 700; } .dim-sub { font-size: 12px; color: var(--tx-2); margin-top:
4px; } /\* ================================================================
MOTION TABLE ================================================================
\*/ .motion-tbl { width: 100%; border-collapse: collapse; margin-bottom: var(--
s10); } .motion-tbl th, .motion-tbl td { padding: var(--s3) var(--s4); text-
align: left; border-bottom: 1px solid var(--bd-1); font-size: 13px; } .motion-
tbl th { font-family: var(--ff-mono); font-size: 9px; color: var(--tx-3);
letter-spacing: 0.12em; text-transform: uppercase; } .motion-tbl td:first-child
{ font-family: var(--ff-mono); font-size: 11px; color: var(--vi-300); } .motion-
tbl td:nth-child(2) { font-family: var(--ff-mono); font-size: 11px; color:
var(--tx-2); } .motion-tbl td:nth-child(3) { color: var(--tx-2); } .motion-tbl
tr:hover td { background: rgba(102,32,245,0.03); } /\*
```

```
================================================================ SCREEN SAMPLES
================================================================ \*/ .screens-
grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px,
1fr)); gap: var(--s4); margin-bottom: var(--s10); } .screen-card { background:
var(--bg-raised); border: 1px solid var(--bd-1); border-radius: var(--r10);
overflow: hidden; transition: border-color var(--t2) var(--ease); } .screen-
card:hover { border-color: var(--bd-v); } .screen-head { display: flex; align-
items: center; justify-content: space-between; padding: var(--s3) var(--s4);
border-bottom: 1px solid var(--bd-1); background: var(--bg-float); } .screen-
title { font-family: var(--ff-display); font-size: 13px; font-weight:
600; } .screen-body { padding: var(--s4); display: flex; flex-direction: column;
gap: var(--s3); } /\* Hook cards \*/ .hook-list { display: flex; flex-direction:
column; gap: var(--s2); } .hook-item { display: flex; align-items: flex-start;
gap: var(--s3); padding: var(--s3) var(--s3); background: var(--bg-float);
border: 1px solid var(--bd-1); border-radius: var(--r4); font-size: 12px; color:
var(--tx-2); cursor: pointer; transition: all var(--t1); } .hook-item.selected {
border-color: var(--bd-v); background: rgba(102,32,245,0.1); color: var(--tx-1);
} .hook-n { font-family: var(--ff-mono); font-size: 10px; color: var(--tx-3);
flex-shrink: 0; margin-top: 1px; } /\*
```

```
================================================================ RULES
```

```
================================================================ \*/ .rules-grid
{ display: grid; grid-template-columns: 1fr 1fr; gap: var(--s6); margin-bottom:
var(--s10); } .rules-block { border-radius: var(--r10); overflow:
hidden; } .rules-head { padding: var(--s3) var(--s5); font-family: var(--ff-
mono); font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-
transform: uppercase; } .do-head { background: rgba(34,197,94,0.1); color:
var(--ok); border: 1px solid rgba(34,197,94,0.2); border-bottom: none; } .dont-
head { background: rgba(239,68,68,0.08); color: var(--err); border: 1px solid
rgba(239,68,68,0.15); border-bottom: none; } .rules-body { padding: var(--s5);
background: var(--bg-raised); display: flex; flex-direction: column; gap: var(--
s3); } .do-body { border: 1px solid rgba(34,197,94,0.12); border-top: none;
```

```
border-radius: 0 0 var(--r10) var(--r10); } .dont-body { border: 1px solid
rgba(239,68,68,0.1); border-top: none; border-radius: 0 0 var(--r10) var(--r10);
} .rule-item { display: flex; gap: var(--s2); font-size: 13px; color: var(--
tx-2); line-height: 1.55; } .rule-item::before { flex-shrink: 0; font-weight:
700; margin-top: 1px; } .do-body .rule-item::before { content: '✓'; color:
var(--ok); } .dont-body .rule-item::before { content: '✗'; color: var(--
err); } /\* ================================================================
BREAKPOINTS ================================================================ \*/
.bp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,
1fr)); gap: var(--s4); margin-bottom: var(--s10); } .bp-card { background:
var(--bg-raised); border: 1px solid var(--bd-1); border-radius: var(--r8);
padding: var(--s5); border-top: 2px solid; } .bp-card.vi { border-top-color:
var(--vi-500); } .bp-card.te { border-top-color: var(--te-500); } .bp-card.ok
{ border-top-color: var(--ok); } .bp-card.wa { border-top-color: var(--
warn); } .bp-label { font-family: var(--ff-mono); font-size: 9px; color: var(--
tx-3); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom:
6px; } .bp-val { font-family: var(--ff-display); font-size: 24px; font-weight:
700; } .bp-desc { font-size: 12px; color: var(--tx-2); margin-top: 6px; line-
height: 1.5; } /\*
```

```
================================================================ ICON GRID
```

```
================================================================ \*/ .icon-grid
{ display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
gap: var(--s3); margin-bottom: var(--s10); } .icon-cell { display: flex; flex-
direction: column; align-items: center; gap: var(--s2); padding: var(--s4);
background: var(--bg-raised); border: 1px solid var(--bd-1); border-radius:
var(--r6); cursor: pointer; transition: all var(--t1) var(--ease); } .icon-
cell:hover { border-color: var(--bd-v); background:
rgba(102,32,245,0.06); } .icon-glyph { font-size: 20px; line-height: 1; } .icon-
label { font-family: var(--ff-mono); font-size: 9px; color: var(--tx-3); text-
align: center; } /\*
```

```
================================================================ FOOTER
```

```
================================================================ \*/ .ds-footer
{ padding: var(--s12) 0; border-top: 1px solid var(--bd-1); display: flex;
align-items: center; justify-content: space-between; flex-wrap: wrap; gap:
var(--s4); } .footer-logo { display: flex; align-items: center; gap: var(--
s3); } .footer-meta { font-family: var(--ff-mono); font-size: 10px; color:
var(--tx-3); } .footer-meta b { color: var(--tx-2); } /\*
```

```
================================================================ REVEAL
```

```
ANIMATION ================================================================
\*/ .reveal { opacity: 0; transform: translateY(18px); animation: revealUp
var(--t3) var(--ease) forwards; } .d1 { animation-delay: 80ms; } .d2
{ animation-delay: 160ms; } .d3 { animation-delay: 240ms; } .d4 { animation-
delay: 320ms; } .d5 { animation-delay: 400ms; } @keyframes revealUp { to
{ opacity: 1; transform: none; } } /\* Scrollbar \*/ ::-webkit-scrollbar
{ width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: var(--bg-
void); } ::-webkit-scrollbar-thumb { background: var(--bg-hover); border-radius:
10px; } ::-webkit-scrollbar-thumb:hover { background: var(--vi-800); } /\* Util
\*/ .divider { height: 1px; background: linear-gradient(90deg, transparent,
var(--bd-2), transparent); margin: var(--s8) 0; } .mono { font-family: var(--ff-
mono); } .vi { color: var(--vi-300); } .te { color: var(--te-300); } @media
(max-width: 680px) { .rules-grid { grid-template-columns: 1fr; } .layout-frame {
height: auto; flex-direction: column; } .l-sidebar { width: 100%; height: auto;
flex-direction: row; flex-wrap: wrap; } .type-row { grid-template-columns: 60px
1fr; } .type-spec { display: none; } .dim-info { grid-template-columns: 1fr 1fr;
} }
```

```
◎ Design System · v2.0 · 2026
```

```
ContentOS AI Design Language
============================
```

```
A complete, living design system for the AI content operating system. Every
token, component, motion pattern, and layout rule — documented and interactive.
```

```
Fonts **Clash Display · Satoshi · Geist Mono** Theme **Dark-first** Version
**2.0** By **Growthax, Pune** Year **2026**
```

```
01 — Color
```

```
Color System
------------
```

```
A void-first palette. Near-black backgrounds let violet command attention and
teal signal AI. Every accent is used with intention — no decoration for its own
sake.
```

```
SURFACE RAMP — bg-void → bg-hover
```

```
void
```

```
base
```

```
raised
```

```
float
```

```
overlay
```

```
hover
```

```
Violet — Command (Primary)
```

```
vi-50#EEE9FF
```

```
vi-200#B8A3FE
vi-300#9671FD
vi-400#7A45FA
```

```
vi-500 #6620F5★
```

```
vi-600#5218CC
vi-800#2C0D7A
```

```
Teal — AI Signal (Secondary)
te-100#CCFBF1
te-300#5EEAD4
te-400#2DD4BF
```

```
te-500 #14B8A6★
te-600#0D9488
te-900#134E4A
```

```
Text Scale
```

```
tx-1 Primary#F4F2FF
```

```
tx-2 Secondary#9898B8
```

```
tx-3 Tertiary#56566A
```

```
tx-4 Muted#2E2E40
```

```
Semantic
Success#22C55E
Warning#EAB308
Error#EF4444
Fuchsia — Spark (Rare accent)
fu-400#E879F9
fu-500 #D946EF★
fu-800#86198F
Gradients
primaryvi→te
hero displaytri-tone
button glowvi→in
02 — Typography
Type System
-----------
```

```
Three fonts, three distinct jobs. Clash Display owns every heading. Satoshi
handles all human text. Geist Mono renders every AI output — making machine-
generated content feel genuinely machine-generated.
```

```
CLASH DISPLAY — Headings · Brand · Module names Google Fonts CDN
```

```
ContentOS AI
```

```
Where ideas become viral content
```

```
Script Writer · Carousel Maker · Growth Strategy
```

```
700 Bold
Hero · H1 · H2
600 SemiBold
H3 · Module names
500 Medium
Subheadings · Labels
400 Regular
```

```
Supporting display text
```

```
SATOSHI — Body · UI Labels · Descriptions · Buttons Google Fonts CDN
```

```
ContentOS AI brings together 8 AI-powered modules under one platform —
automating the most time-consuming parts of content creation while giving you
full creative control.
```

```
Choose your niche, set your platform preference, and let the AI handle the heavy
lifting. Scripts, carousels, thumbnails, competitor research — all in one place,
all in minutes.
```

```
700 — Nav, CTAs, strong labels
```

- `500 — Buttons, section labels` 

```
400 — Body copy, descriptions
```

```
300 — Captions, helper text
```

```
GEIST MONO — AI Outputs · Data · Code · Labels Google Fonts CDN
```

- `✦ Generated by ContentOS AI · Script Writer` 

```
GEIST MONO
```

```
\[HOOK\] You're losing 3 hours every single day to content.
What if I told you AI could do it in under 3 minutes?
```

```
\[MAIN\] Here's the exact ContentOS AI workflow I use to produce
a full week of content in one Sunday afternoon session...
```

```
\[CTA\] Try ContentOS AI free. Link in bio.
```

```
Geist Mono is used exclusively for AI-generated outputs. The monospace rhythm
reinforces that content is machine-crafted — never use it for regular UI copy.
```

```
COMPLETE TYPE SCALE
```

```
display
```

```
Hero
```

```
Clash Display 700 · 56–96px · -0.045em
```

```
h1
```

```
Script Writer
Clash Display 700 · 36px · -0.035em
h2
```

```
Module Overview
Clash Display 600 · 24px · -0.02em
```

```
h3
Select Your Hook
Clash Display 500 · 18px
body-lg
Generate scripts in under 60 seconds.
Satoshi 400 · 18px · 1.65lh
```

```
body
```

```
Choose topic, tone, and platform to begin.
Satoshi 400 · 15px · 1.65lh
```

```
caption
```

```
Generated 2 minutes ago · 847 words
```

```
Satoshi 300 · 12px
mono-tag
```

```
\[HOOK\] / \[MAIN\] / \[CTA\]
```

```
Geist Mono 500 · 10px · 0.1em ls
```

```
mono-body
```

```
You're losing 3 hours every day...
```

```
Geist Mono 400 · 13px · 1.85lh
```

```
03 — Space
```

```
Spacing & Radius
```

```
----------------
```

```
4px base unit. All values are multiples of 4. Generous negative space is part of
the visual language — don't fill every pixel.
```

```
s1
```

```
4px
```

```
s2
```

```
8px
```

```
s3
```

```
12px
```

```
s4
```

```
16px
```

```
s5
```

```
20px
```

```
s6
```

```
24px
```

```
s8
```

```
32px
```

```
s10
```

```
40px
```

```
s12
```

```
48px
s16
64px
s20
80px
s24
96px
BORDER RADIUS
r2
4px
r3
6px
r4
8px
r6
12px
r8
16px
r10
20px
r12
24px
pill
9999px
04 — Layout
App Layout
----------
```

```
Three-zone layout: fixed sidebar for navigation, persistent top bar for context,
full-height scrollable content area. The sidebar collapses gracefully at smaller
viewports.
```

```
C
```

```
ContentOS
```

✍️� `Script Writer✦` 

```
💡
Content Ideas
💡
```

```
Carousel Maker
```

🔍 

```
Competitor Intel
```

```
Video Brief
```

🖼️� 

```
Thumbnails
```

```
💡
```

```
Page Setup
```

📈 

```
Growth Strategy
```

```
Prem
```

```
✦ Creator
```

```
ContentOS / Script Writer
```

```
⌘Search modules...
```

```
💡
```

```
Main content · max-width 900px · centered · 48px top padding
```

```
Sidebar
```

```
208px
```

```
Fixed · Icon-only at <1024px
```

```
Top Bar
```

```
52px
```

```
Breadcrumb · K · Avatar⌘
```

```
Content Area
```

```
900px
```

```
Max-width centered · 48px top
```

```
05 — Components
```

```
Component Library
-----------------
```

```
Every component is interactive — hover to feel the transitions. Built on the
same token system: void backgrounds, violet on action, borders over shadows.
Buttons
```

- `✦ Generate Script Save Draft` 

- ⟡ `Agency Mode Cancel` 

```
Delete Get Started Free
```

```
Regenerate Export PDF Copy
```

`✦↻⋯` ⟡ 

```
Form Controls
```

```
Content Topic
```

```
Platform YouTube (8–15 min) Instagram Reels (30–90s) LinkedIn (60–90s) YouTube
Shorts
```

```
Additional context Leave blank for fully AI-generated context
```

```
Badges & Status
```

```
AI Module Live  Pro  Generated Processing Failed Draft✦✓
```

```
PLAN BADGES
```

`Free  Creator  Agency✦` ⟡ 

```
Navigation Items
```

## 

```
Script Writer✦
```

```
💡
```

```
Content Ideas
```

```
💡
```

```
Carousel Maker
```

## 🔍 

```
Competitor Intel
```

## 📈 

```
Growth Strategy
```

```
AI Output Block
```

```
✦Generated by ContentOS AI
```

## ⎘ 

`\[HOOK\] Stop losing hours to content creation. This AI workflow changed everything for me.` ⎘ `Copy ↓ Export` ↻ `Retry` 

```
Loading & Feedback
```

```
AI SCAN LOADER
```

```
Analyzing competitor profile...
```

## `PROGRESS BAR` 

```
✓Script generated successfully
```

- `!API error — please try again` 

- `✦AI is generating your script...` 

```
06 — Modules
```

- `8 Core Modules` 

- `--------------` 

```
Each module card is a self-contained entry point. Hover to feel the elevation —
this is what the sidebar navigation leads to.
```

```
✦ AI
```

```
Script Writer
```

```
Hook → full script → export in 60 seconds
```

- `✦ AI` 

```
💡
```

```
Content Ideas
```

```
30 niche ideas with viral angles and full calendar
```

- `✦ AI` 

```
💡
```

```
Carousel Maker
```

```
AI-written slides → Canva export in 2 minutes
```

```
✦ AI
```

## 🔍 

```
Competitor Intel
```

```
Deep scan of top performers in your niche
```

- `✦ AI` 

## 

```
Video Brief
```

```
Transcript → editing brief + full B-roll list
```

- `✦ AI` 

## 🖼️� 

```
Thumbnail Maker
```

```
5 CTR-optimized thumbnail concepts per video
```

```
✦ AI
```

```
💡
```

```
Page Setup
```

```
Bio, keywords, highlights — fully AI-optimized
```

- `✦ AI` 

📈 

```
Growth Strategy
```

```
90-day plan + monetization roadmap
```

```
07 — Screens
```

```
Screen Samples
```

```
--------------
```

```
Representative UI patterns from key module screens — showing real information
architecture.
```

```
Script Writer  AI✦
```

```
YouTube Educational
```

```
SELECT HOOK
```

```
01You're wasting 10 hours a week — here's how to get them back
```

```
025 tools that replaced my entire content team
```

```
03The AI stack every creator needs in 2026
```

- `✦ Generate Full Script` 

```
Competitor Intel Scanning
```

```
💡
```

```
Analyzing 847 posts...
```

```
Top Content Patterns Ready
```

```
Content Gaps Analyzing
```

```
Generated Script Geist Mono
```

```
✦Script · YouTube · Educational
```

⎘ 

```
\[HOOK\] You're wasting 10 hours a week
and you don't even know it.
```

`\[MAIN\] Here are 5 AI tools that gave me those hours back — starting today.` ⎘ `↓ PDF` ↻ `💡 Teleprompter` 

```
✓Script ready · 847 words · ~8 min
```

```
08 — Motion
```

```
Motion System
-------------
```

```
Every animation earns its place. Slides and fades only — no bouncing, no
elastic, no playful spring. Motion that reinforces the intelligence of the
product.
```

```
Token
```

```
Value
```

```
Use Case
```

```
Duration
```

```
\--ease
cubic-bezier(0.16, 1, 0.3, 1)
Default — all UI transitions
120–350ms
```

```
\--ease-in
cubic-bezier(0.4, 0, 1, 1)
Elements exiting, dismissing
```

```
120ms
```

```
\--t1 fast
120ms
```

```
Hover states, button clicks, icon swaps
120ms
```

```
\--t2 mid
200ms
Card reveal, dropdown open, badge change
200ms
\--t3 slow
350ms
Page transitions, modal entrance
```

```
350ms
page reveal
staggered animation-delay
Hero section reveals sequentially (80ms intervals)
```

```
350ms each
```

```
ai-cursor blink
step-end 1.1s infinite
Streaming text typewriter cursor
```

```
∞
```

```
bar shimmer
linear 2s infinite
AI progress bar gradient sweep
```

```
∞
scan-line
ease-in-out 2.2s infinite
AI scanning/processing skeleton
```

```
∞
skeleton sweep
ease 1.8s infinite
Content loading skeleton shimmer
```

```
∞
beat-pulse
ease 2.4s infinite
Live status dot in nav/badges
```

```
∞
```

```
orb ambient
fixed, blur(120px)
Background atmospheric glow orbs
static
```

```
CARD HOVER
```

```
border → violet · translateY(-3px) · glow-sm shadow
BUTTON PRESS
```

```
scale(0.97) on :active · glow on primary hover · translateY(-1px)
PAGE ENTER
opacity 0→1 · translateY(18px→0) · 80ms stagger per element
09 — Icons
```

```
Icon System
-----------
```

```
Module icons use emoji for personality and instant recognition. UI actions use
inline SVG at 16–20px. No icon library dependency — zero bundle cost.
```

```
Script Writer
💡
```

```
Ideas
💡
Carousel
```

🔍 

```
Intel
```

`Video Brief` 🖼️� 

```
Thumbnail
💡
```

`Page Setup` 📈 `Growth` 

`✦ AI Badge` ↻ `Regenerate` ⎘ `Copy ↓ Export` ⟡ `Agency ⌘ Search ◎` 

```
Live
```

⋯ 

```
More
```

```
10 — Rules
```

```
Design Rules
------------
```

```
Non-negotiable. These constraints are what make ContentOS visually distinct from
every other AI SaaS in 2026.
```

## `✓ Always Do` 

```
Use **#050508 → #111122** as the only backgrounds — no light surfaces
```

```
Use **Clash Display 700/600** for every heading — never Inter, never system
fonts
```

```
Use **Geist Mono exclusively** for all AI-generated output text
```

```
Apply **violet glow** on every active, focused, or selected state
```

```
Use **1px rgba borders** over shadows — shadows vanish on dark backgrounds
Use **scan-line animation** for all AI loading — never a spinning circle
Show **blinking cursor ▌** at end of streaming AI text output
```

```
Add **✦ AI badge** to every AI-generated output block
Apply **letter-spacing: -0.04em** on display headings above 36px
```

```
Collapse sidebar to **icon-only (52px)** at ≤1024px viewport
```

## `✗ Never Do` 

```
Use **white or light gray** as any background — not even in modals
Use **Inter, Roboto, Arial, or any system font** — zero exceptions
Use **purple gradient on white** — the single most overused AI aesthetic
Use **box-shadows on cards** — invisible on dark; use glow or borders
Use **rainbow or multi-color schemes** — violet + teal only
Use **bouncing or elastic animations** — slides and fades only
Use **Geist Mono for UI copy** — it's only for machine-generated content
Add **nested sub-menus** in the sidebar — all 8 modules at top level
Show **empty states without a CTA** — always include one clear action
Use **more than 3 accent colors** per screen — density kills hierarchy
11 — Responsive
```

```
Breakpoints
```

```
-----------
```

```
Mobile-aware from day one. Content always wins — the sidebar adapts, the layout
shrinks, the modules stack.
```

```
Desktop
```

```
≥1280px
```

```
Full sidebar 208px · 3-col module grids · side panels active
```

```
Laptop
1024–1279
Icon-only sidebar 52px · 2-col grids · top bar compressed
```

```
Tablet
768–1023
Sidebar off-canvas · hamburger toggle · overlay drawer
```

```
Mobile
<768px
Bottom tab bar · full-width everything · 1-col stacked
```

```
C
ContentOS AI
Design System · v2.0
Fonts: **Clash Display · Satoshi · Geist Mono**
By: **Growthax, Pune**
Year: **2026**
Confidential
```

