import random
random.seed(11)
G = 440
TEAL, PURP, ORNG, AMB = '#2ec4b6', '#a98bff', '#ff7a59', '#f5b042'

def pumpjack(x, ang):
    return f'''<g transform="translate({x},{G})">
 <ellipse cx="0" cy="0" rx="62" ry="5" fill="#000" opacity=".35"/>
 <rect x="-46" y="-9" width="92" height="9" rx="2" fill="#2b3447"/>
 <rect x="-26" y="-19" width="30" height="10" rx="2" fill="#39445c"/>
 <path d="M-15 -9 L0 -74 L15 -9" fill="none" stroke="#6a7792" stroke-width="5" stroke-linejoin="round"/>
 <path d="M-9 -30 L9 -30 M-5 -52 L5 -52" stroke="#6a7792" stroke-width="3"/>
 <circle cx="-30" cy="-26" r="15" fill="#2b3447" stroke="#6a7792" stroke-width="4"/>
 <circle cx="-30" cy="-26" r="4" fill="#9fb0cf"/>
 <g transform="rotate({ang} 0 -76)">
  <rect x="-50" y="-81" width="98" height="9" rx="4" fill="{AMB}"/>
  <rect x="-58" y="-76" width="18" height="26" rx="3" fill="#7d889e"/>
  <path d="M36 -86 Q66 -84 64 -48 L55 -48 Q55 -72 36 -73 Z" fill="{AMB}"/>
 </g>
 <path d="M-47 -74 L-30 -26" stroke="#9fb0cf" stroke-width="3"/>
 <line x1="57" y1="-50" x2="57" y2="-12" stroke="#c9d3e6" stroke-width="2.5"/>
 <rect x="50" y="-14" width="14" height="14" rx="2" fill="#4b5873"/>
 <rect x="53" y="-24" width="8" height="10" fill="#6a7792"/>
</g>'''

def tank(cx, w, h):
    x = cx - w / 2; top = G - 2 - h
    return f'''<g>
 <ellipse cx="{cx}" cy="{G+1}" rx="{w/2+6}" ry="5" fill="#000" opacity=".35"/>
 <rect x="{x}" y="{top}" width="{w}" height="{h}" fill="url(#tk)"/>
 <ellipse cx="{cx}" cy="{top}" rx="{w/2}" ry="6" fill="#8a97b1"/>
 <ellipse cx="{cx}" cy="{top+1.5}" rx="{w/2-5}" ry="4" fill="#566380"/>
 <path d="M{x} {top+h*.34} H{x+w} M{x} {top+h*.68} H{x+w}" stroke="#0b1226" stroke-opacity=".35" stroke-width="1.5"/>
 <path d="M{x+w+2} {top+5} l8 0 l0 {h-6}" fill="none" stroke="#6a7792" stroke-width="2.5"/>
 <rect x="{x+w*.42}" y="{G-16}" width="{w*.16}" height="14" fill="#2b3447"/>
</g>'''

def column(x, w, top, rings):
    s = f'<rect x="{x}" y="{top}" width="{w}" height="{G-top}" fill="url(#tk)"/>'
    s += f'<path d="M{x} {top} Q{x+w/2} {top-w*.6} {x+w} {top} Z" fill="#8a97b1"/>'
    for i in range(1, rings):
        y = top + (G - top) * i / rings
        s += f'<path d="M{x-4} {y:.0f} H{x+w+4}" stroke="#9fb0cf" stroke-width="2"/>'
        s += f'<circle cx="{x+w+4}" cy="{y-3:.0f}" r="1.8" fill="#ffd27a"/>'
    s += f'<path d="M{x+w/2} {top-w*.3} V{top-w*.3-14}" stroke="#6a7792" stroke-width="2"/>'
    return s

def chevron(x, y, d=1, c='#0b1226'):
    return f'<path d="M{x-4*d} {y-5} L{x+3*d} {y} L{x-4*d} {y+5}" fill="none" stroke="{c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'

def chevron_v(x, y, d=1, c='#0b1226'):
    return f'<path d="M{x-5} {y-4*d} L{x} {y+3*d} L{x+5} {y-4*d}" fill="none" stroke="{c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'

stars = ''.join(f'<circle cx="{random.uniform(0,1200):.0f}" cy="{random.uniform(8,200):.0f}" r="{random.uniform(.5,1.3):.1f}"/>' for _ in range(70))
# city skyline behind downstream
city = ''; x = 1000
while x < 1200:
    w = random.randint(16, 30); h = random.randint(28, 92)
    city += f'<rect x="{x}" y="{G-h}" width="{w}" height="{h}" fill="#161c36"/>'
    for wy in range(G - h + 6, G - 6, 8):
        for wx in range(x + 4, x + w - 4, 6):
            if random.random() < .35:
                city += f'<rect x="{wx}" y="{wy}" width="2.5" height="3.5" fill="#ffd27a" opacity="{random.uniform(.35,.9):.2f}"/>'
    x += w + random.randint(1, 5)
# porous speckles in the oil zone
spk = ''.join(f'<circle cx="{random.uniform(20,380):.0f}" cy="{random.uniform(490,570):.0f}" r="{random.uniform(.8,2):.1f}" fill="{random.choice(["#ffd27a","#c98a2a","#e7d6a8"])}" opacity=".7"/>' for _ in range(260))

DOME = 'M20 568 Q200 412 380 568 Z'

svg = f'''<svg width="1200" height="627" viewBox="0 0 1200 627" font-family="G,sans-serif">
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080d1c"/><stop offset=".45" stop-color="#16244a"/><stop offset=".72" stop-color="#6d4a5e"/><stop offset=".88" stop-color="#d9823f"/><stop offset="1" stop-color="{AMB}"/></linearGradient>
 <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2119"/><stop offset=".5" stop-color="#1b1712"/><stop offset="1" stop-color="#0d0c0f"/></linearGradient>
 <linearGradient id="tk" x1="0" x2="1"><stop offset="0" stop-color="#3a4560"/><stop offset=".35" stop-color="#7d8aa6"/><stop offset=".6" stop-color="#5a6785"/><stop offset="1" stop-color="#2c3550"/></linearGradient>
 <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5f8f"/><stop offset="1" stop-color="#0f2740"/></linearGradient>
 <radialGradient id="sun" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="#ffd089" stop-opacity=".85"/><stop offset="1" stop-color="{AMB}" stop-opacity="0"/></radialGradient>
 <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c7" stop-opacity=".55"/><stop offset="1" stop-color="#fff1c7" stop-opacity="0"/></linearGradient>
 <clipPath id="dome"><path d="{DOME}"/></clipPath>
 <filter id="bl"><feGaussianBlur stdDeviation="6"/></filter>
</defs>

<!-- sky -->
<rect width="1200" height="{G}" fill="url(#sky)"/>
<ellipse cx="620" cy="{G+2}" rx="560" ry="160" fill="url(#sun)"/>
<g fill="#fff" opacity=".7">{stars}</g>
<path d="M0 424 Q150 402 300 418 T620 414 T900 410 T1200 416 V{G+4} H0Z" fill="#1d2038"/>
{city}

<!-- ground -->
<rect y="{G}" width="1200" height="{627-G}" fill="url(#gr)"/>
<rect y="{G}" width="1200" height="4" fill="#3a2f26"/>
<g stroke="#000" stroke-opacity=".22"><path d="M0 478 H1200 M0 538 H1200 M0 588 H1200"/></g>

<!-- reservoir anticline -->
<path d="M20 568 Q200 412 380 568" fill="none" stroke="#3b4256" stroke-width="14"/>
<g clip-path="url(#dome)">
 <rect x="0" y="400" width="400" height="106" fill="#cfd6e6" opacity=".35"/>
 <rect x="0" y="505" width="400" height="36" fill="#c8862a"/>
 <rect x="0" y="540" width="400" height="40" fill="#2a5f92"/>
 {spk}
</g>
<g font-family="M" font-weight="700" font-size="9.5" fill="#e9eef8" opacity=".85" letter-spacing=".12em">
 <text x="200" y="501" text-anchor="middle">GAS</text>
 <text x="200" y="527" text-anchor="middle" fill="#1a1206">OIL</text>
 <text x="200" y="557" text-anchor="middle">WATER</text>
</g>

<!-- drilling rig (exploration well) -->
<g>
 <path d="M85 {G} V512" stroke="#9fb0cf" stroke-width="3"/>
 <path d="M80 515 L85 524 L90 515 Z" fill="#c9d3e6"/>
 <path d="M80 {G} V476 M90 {G} V476" stroke="#6a7792" stroke-width="2"/>
 <path d="M55 {G} V411 M115 {G} V411 M55 {G} L115 411 M115 {G} L55 411" stroke="#4b5873" stroke-width="3"/>
 <rect x="46" y="404" width="78" height="8" rx="2" fill="#39445c"/>
 <path d="M60 404 L80 290 M110 404 L90 290" stroke="#8a97b1" stroke-width="3.5"/>
 <path d="M63 386 H107 M67 360 H103 M71 336 H99 M75 312 H95 M63 386 L103 360 M107 386 L67 360 M67 360 L99 336 M103 360 L71 336 M71 336 L95 312 M99 336 L75 312" stroke="#8a97b1" stroke-width="1.6" opacity=".9"/>
 <rect x="75" y="282" width="20" height="9" rx="2" fill="#6a7792"/>
 <circle cx="85" cy="279" r="2.6" fill="#ff5a4a"/><circle cx="85" cy="279" r="8" fill="#ff5a4a" opacity=".3" filter="url(#bl)"/>
 <path d="M85 291 V372" stroke="#c9d3e6" stroke-width="1.4"/>
 <rect x="80" y="362" width="10" height="12" rx="2" fill="{AMB}"/>
 <rect x="124" y="416" width="34" height="24" rx="2" fill="#2b3447"/><rect x="130" y="422" width="8" height="6" fill="#ffd27a" opacity=".8"/>
</g>

<!-- producing well -->
{pumpjack(235, -5)}
<path d="M292 {G} V528" stroke="#6a7792" stroke-width="6"/>
<path d="M292 {G+2} V526" stroke="{AMB}" stroke-width="2.5"/>
<g fill="{AMB}"><circle cx="286" cy="516" r="2"/><circle cx="298" cy="520" r="2"/><circle cx="286" cy="524" r="2"/><circle cx="298" cy="512" r="2"/></g>

<!-- main flow line (oil) -->
<path d="M292 {G-7} H302 Q312 {G-7} 312 {G-4} H622 Q630 {G-4} 630 {G+4} V526 Q630 534 638 534 H804 Q812 534 812 526 V{G+4} Q812 {G-4} 820 {G-4} H840" fill="none" stroke="#7a5a1e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M292 {G-7} H302 Q312 {G-7} 312 {G-4} H622 Q630 {G-4} 630 {G+4} V526 Q630 534 638 534 H804 Q812 534 812 526 V{G+4} Q812 {G-4} 820 {G-4} H840" fill="none" stroke="{AMB}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
{chevron(350, G-4)}{chevron(395, G-4)}{chevron_v(630, 480)}{chevron(690, 534)}{chevron(740, 534)}{chevron_v(812, 490, -1)}
<!-- valve on the line -->
<path d="M418 {G-12} L418 {G+4} L430 {G-4} Z M442 {G-12} L442 {G+4} L430 {G-4} Z" fill="#39445c" stroke="#9fb0cf" stroke-width="1.5"/>
<path d="M430 {G-4} V{G-18} M423 {G-18} H437" stroke="#9fb0cf" stroke-width="2"/>

<!-- pump station -->
<g>
 <rect x="456" y="404" width="56" height="36" fill="#2b3447"/>
 <path d="M452 406 L484 388 L516 406 Z" fill="#39445c"/>
 <rect x="464" y="414" width="10" height="8" fill="#ffd27a" opacity=".8"/><rect x="494" y="414" width="10" height="8" fill="#ffd27a" opacity=".6"/>
 <path d="M476 {G} V426 H492 V{G}" fill="none" stroke="#9fb0cf" stroke-width="2"/>
</g>

<!-- storage tanks -->
{tank(552, 56, 62)}{tank(604, 40, 46)}

<!-- marine terminal: basin, jetty, tanker -->
<path d="M634 {G} L652 506 H790 L806 {G} Z" fill="url(#wt)"/>
<g>
 <path d="M640 {G} V398" stroke="#6a7792" stroke-width="5"/>
 <path d="M640 400 L680 384 L716 404" fill="none" stroke="#9fb0cf" stroke-width="3" stroke-linejoin="round"/>
 <path d="M716 404 V412" stroke="{AMB}" stroke-width="3"/>
 <path d="M622 {G-4} H640" stroke="{AMB}" stroke-width="4"/>
</g>
<g>
 <path d="M652 424 H772 L799 426 L785 458 H667 Z" fill="#a8463a"/>
 <path d="M652 424 H772 L799 426 L796 434 H654 Z" fill="#2b3447"/>
 <rect x="660" y="397" width="30" height="27" fill="#c9d3e6"/>
 <rect x="663" y="402" width="24" height="4" fill="#0b1226"/><rect x="663" y="410" width="24" height="3" fill="#0b1226" opacity=".5"/>
 <rect x="667" y="384" width="11" height="13" fill="#39445c"/><rect x="667" y="388" width="11" height="3" fill="{ORNG}"/>
 <path d="M696 420 H788" stroke="#6a7792" stroke-width="2"/>
 <g fill="#6a7792"><rect x="704" y="416" width="8" height="5"/><rect x="726" y="416" width="8" height="5"/><rect x="748" y="416" width="8" height="5"/><rect x="770" y="416" width="8" height="5"/></g>
 <path d="M716 420 V412 M716 412 H724" stroke="{AMB}" stroke-width="2.5"/>
</g>
<rect x="644" y="448" width="156" height="14" fill="#1d4a75" opacity=".8"/>
<path d="M646 448 Q661 445 676 448 T706 448 T736 448 T766 448 T800 448" fill="none" stroke="#8fc3ec" stroke-width="1.4" opacity=".75"/>

<!-- refinery -->
<g>
 {column(836, 22, 300, 6)}{column(868, 15, 334, 4)}{column(892, 28, 360, 3)}
 <path d="M830 {G-14} H975 M830 {G-22} H975" stroke="#6a7792" stroke-width="3"/>
 <g stroke="#4b5873" stroke-width="2.5" fill="none"><path d="M930 {G} V384 H974 V{G} M930 410 H974 M930 384 L974 410 M974 384 L930 410"/></g>
 <rect x="938" y="392" width="28" height="34" fill="#2b3447"/><rect x="942" y="398" width="20" height="5" fill="{ORNG}" opacity=".7"/>
 <path d="M952 392 V336" stroke="#4b5873" stroke-width="7"/>
 <path d="M990 {G} V294" stroke="#4b5873" stroke-width="4"/>
 <path d="M990 294 Q985 270 994 255 Q1004 274 997 294 Z" fill="#ffb347"/><path d="M990 294 Q989 280 993 271 Q998 282 995 294Z" fill="#fff2c4"/>
 <circle cx="993" cy="279" r="18" fill="#ffb347" opacity=".25" filter="url(#bl)"/>
</g>

<!-- road, truck, station -->
<rect x="1000" y="{G}" width="200" height="11" fill="#22252d"/>
<path d="M1004 {G+5.5} H1200" stroke="#c9d3e6" stroke-width="1.5" stroke-dasharray="8 8" opacity=".6"/>
<g>
 <rect x="1006" y="416" width="56" height="18" rx="9" fill="#c9d3e6"/>
 <rect x="1006" y="424" width="56" height="3" fill="{ORNG}"/>
 <rect x="1004" y="433" width="80" height="4" fill="#2b3447"/>
 <path d="M1065 433 V418 Q1065 414 1069 414 H1078 L1085 424 V433 Z" fill="#e0e6f2"/>
 <rect x="1070" y="417" width="8" height="6" fill="#0b1226"/>
 <g fill="#11141c"><circle cx="1016" cy="439" r="5"/><circle cx="1050" cy="439" r="5"/><circle cx="1077" cy="439" r="5"/></g>
</g>
<g>
 <path d="M1103 392 L1092 {G} H1198 L1194 392 Z" fill="url(#cone)"/>
 <rect x="1098" y="382" width="100" height="10" rx="2" fill="#e0e6f2"/><rect x="1098" y="388" width="100" height="3" fill="{ORNG}"/>
 <path d="M1108 392 V{G} M1188 392 V{G}" stroke="#6a7792" stroke-width="4"/>
 <rect x="1122" y="416" width="11" height="24" rx="2" fill="#c9d3e6"/><rect x="1124" y="420" width="7" height="5" fill="#0b1226"/>
 <path d="M1142 438 V430 L1150 422 H1170 L1178 430 V438 Z" fill="#d14b3c"/>
 <rect x="1152" y="425" width="15" height="5" fill="#0b1226" opacity=".8"/>
 <g fill="#11141c"><circle cx="1150" cy="439" r="4.5"/><circle cx="1171" cy="439" r="4.5"/></g>
 <path d="M1133 426 Q1140 422 1142 432" fill="none" stroke="#0b1226" stroke-width="1.8"/>
</g>

<!-- zone dividers -->
<g stroke="#fff" stroke-opacity=".16" stroke-width="1.5" stroke-dasharray="4 7"><path d="M400 196 V627 M800 196 V627"/></g>

<!-- zone headers -->
<g font-family="M" font-weight="700" font-size="14" letter-spacing=".14em" text-anchor="middle">
 <rect x="118" y="200" width="164" height="30" rx="15" fill="#0b1226" fill-opacity=".7" stroke="{TEAL}" stroke-width="2"/><text x="200" y="220" fill="{TEAL}">01 UPSTREAM</text>
 <rect x="510" y="200" width="180" height="30" rx="15" fill="#0b1226" fill-opacity=".7" stroke="{PURP}" stroke-width="2"/><text x="600" y="220" fill="{PURP}">02 MIDSTREAM</text>
 <rect x="902" y="200" width="196" height="30" rx="15" fill="#0b1226" fill-opacity=".7" stroke="{ORNG}" stroke-width="2"/><text x="1000" y="220" fill="{ORNG}">03 DOWNSTREAM</text>
</g>

<!-- bottom captions -->
<g font-weight="700" font-size="19" fill="#eef2f8" text-anchor="middle">
 <text x="200" y="606">Explore · Drill · Produce</text>
 <text x="600" y="606">Process · Transport · Store</text>
 <text x="1000" y="606">Refine · Distribute · Sell</text>
</g>
<g><rect x="80" y="616" width="240" height="3" rx="1.5" fill="{TEAL}"/><rect x="480" y="616" width="240" height="3" rx="1.5" fill="{PURP}"/><rect x="880" y="616" width="240" height="3" rx="1.5" fill="{ORNG}"/></g>
</svg>'''

html = f'''<!doctype html><meta charset="utf-8"><title>Oil and Gas Value Chain</title>
<style>
@font-face{{font-family:G;font-weight:500;src:url(golos-text-latin-500-normal.woff2)}}
@font-face{{font-family:G;font-weight:700;src:url(golos-text-latin-700-normal.woff2)}}
@font-face{{font-family:M;font-weight:700;src:url(jetbrains-mono-latin-700-normal.woff2)}}
*{{margin:0;box-sizing:border-box}} body{{width:1200px;height:627px;overflow:hidden;background:#0b1226;position:relative;font-family:G,sans-serif}}
svg{{position:absolute;inset:0}}
.hd{{position:absolute;left:58px;top:38px;color:#eef2f8}}
.tag{{font:700 15px M,monospace;letter-spacing:.16em;color:{AMB}}}
h1{{margin-top:14px;font-weight:700;font-size:54px;letter-spacing:-.02em;line-height:1;display:flex;align-items:center;gap:16px}}
h1 i{{display:inline-block;width:34px;height:4px;background:#8fa0bd;position:relative;border-radius:2px}}
h1 i:after{{content:"";position:absolute;right:-2px;top:-6px;border:8px solid transparent;border-left:12px solid #8fa0bd;border-right:0}}
.sub{{margin-top:16px;font-weight:500;font-size:24px;color:#cfd7e8}} .sub b{{color:#fff;font-weight:700}}
</style>
{svg}
<div class="hd"><div class="tag">OIL &amp; GAS VALUE CHAIN</div>
<h1><span style="color:{TEAL}">Upstream</span><i></i><span style="color:{PURP}">Midstream</span><i></i><span style="color:{ORNG}">Downstream</span></h1>
<div class="sub">One barrel, one journey: <b>from the reservoir to your fuel tank.</b></div></div>
'''
open('cover.html', 'w').write(html)
