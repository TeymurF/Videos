"""Synthesizes the soundtrack (machinery, valves, fluid) from out/meta.json -> out/audio.wav.

No narration: every sound is generated procedurally and locked to the animation
timeline (the pumpjack stroke period, valve switch events, perforation shots).
"""
import json, wave, sys
import numpy as np

SR = 44100
meta = json.load(open('out/meta.json'))
TOTAL, PERIOD, TH_BOT = meta['total'], meta['period'], meta['thBot']
N = int(TOTAL * SR) + SR
t = np.arange(N) / SR
rs = np.random.RandomState(7)


def band(lo, hi, seed, n=N):
    """Band-limited noise with soft edges, unit RMS."""
    r = np.random.RandomState(seed)
    spec = np.fft.rfft(r.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1e-6)) ** 6) / (1 + (f / hi) ** 6)
    x = np.fft.irfft(spec * m, n)
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)


def mask(amb, fade=0.6):
    """1 inside scenes of the given ambience type, with crossfades."""
    m = np.zeros(N)
    for s in meta['scenes']:
        if s['amb'] == amb:
            a, b = s['start'], s['start'] + s['dur']
            m = np.maximum(m, np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1))
    return m


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= N:
        return
    n = min(len(sig), N - i)
    buf[i:i + n] += sig[:n] * gain


# ---- stroke phase: u=0 at the bottom of the stroke, upstroke for u<~0.5 ----
u = ((2 * np.pi * t / PERIOD - TH_BOT) / (2 * np.pi)) % 1.0
swing = np.abs(np.sin(2 * np.pi * u))            # rod speed proxy
upstroke = np.clip(np.sin(2 * np.pi * u) * 3, 0, 1)

# ---- surface: motor, belt, counterweight whoosh, creaks, wind ----
load = 0.75 + 0.35 * upstroke
motor = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(50, .5, 0), (100, .32, 1), (150, .16, 2), (200, .08, .5), (300, .04, 1.3)])
motor *= load * (1 + 0.04 * np.sin(2 * np.pi * 0.83 * t))
belt = band(700, 2600, 1) * (0.8 + 0.2 * np.sin(2 * np.pi * 11.7 * t)) * 0.035 * load
whoosh = band(120, 520, 2) * swing ** 1.5 * 0.16
wind = band(60, 380, 3) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + 1)) * 0.05
surface = 0.13 * motor + belt + whoosh + wind


def creak(f0, f1, dur, seed):
    n = int(dur * SR); x = np.arange(n) / SR
    r = np.random.RandomState(seed)
    f = np.linspace(f0, f1, n) * (1 + 0.012 * np.sin(2 * np.pi * 23 * x))
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.sin(np.pi * x / dur) ** 2 * (0.7 + 0.3 * r.rand())
    return (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * env


creaks = np.zeros(N)
k = 0
tt = ((TH_BOT / (2 * np.pi)) % 1) * PERIOD - PERIOD   # first bottom reversal
while tt < TOTAL:
    add(creaks, creak(380, 560, 0.7, k), max(tt - 0.25, 0), 0.10)            # bottom -> up
    add(creaks, creak(620, 430, 0.6, k + 99), max(tt + PERIOD / 2 - 0.2, 0), 0.08)  # top -> down
    tt += PERIOD; k += 1
surface += creaks

# ---- underground: rumble, fluid rush, muffled valve thumps ----
rumble = band(28, 120, 4) * (0.45 + 0.55 * swing) * 0.09
rush = band(180, 900, 5) * upstroke * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t)) * 0.06
under = rumble + rush


def thump(f=70, dur=0.35):
    n = int(dur * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * f * x * (1 - 0.3 * x / dur)) * np.exp(-x / (dur / 4))


def bubble(seed):
    r = np.random.RandomState(seed)
    dur = 0.03 + 0.05 * r.rand(); n = int(dur * SR); x = np.arange(n) / SR
    f0 = 450 + 900 * r.rand()
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f0 * 1.7, n)) / SR
    return np.sin(ph) * np.sin(np.pi * x / dur) ** 2


th = np.zeros(N)
tt = ((TH_BOT / (2 * np.pi)) % 1) * PERIOD - PERIOD
while tt < TOTAL:
    for d in (0.0, PERIOD / 2):
        if tt + d > 0:
            add(th, thump(), tt + d, 0.16)
    tt += PERIOD
under += th
bub = np.zeros(N)
for i in range(int(TOTAL * 5)):
    add(bub, bubble(i), rs.rand() * TOTAL, 0.05 + 0.07 * rs.rand())

# ---- micro (pore scale): soft drone + bubbles; quiet: room tone ----
drone = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(55, .5), (82.6, .3), (110.3, .22), (165.2, .08)]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * t)) * 0.10
seep = band(300, 1400, 6) * 0.018
room = band(40, 240, 8) * 0.02

mix = (surface * mask('surface') + (under + bub * 0.7) * mask('under')
       + (drone + seep + bub * 1.3) * mask('micro') + room * mask('quiet')
       + surface * 0.06 * mask('quiet'))


# ---- events ----
def click(pitch=1.0, seed=0):
    n = int(0.25 * SR); x = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * pitch * x) * np.exp(-x / d) for f, a, d in [(1750, .6, .030), (3120, .45, .020), (4730, .3, .012), (6900, .15, .008)])
    s += 0.9 * np.sin(2 * np.pi * 130 * x) * np.exp(-x / 0.05)
    s += np.random.RandomState(seed).standard_normal(n) * np.exp(-x / 0.004) * 0.3
    return s


def bang():
    n = int(0.9 * SR); x = np.arange(n) / SR
    s = band(40, 1800, 21, n) * np.exp(-x / 0.12) * 1.2 + np.sin(2 * np.pi * 55 * x) * np.exp(-x / 0.18) * 1.4
    s += band(1500, 7000, 22, n) * np.exp(-x / 0.015) * 0.8
    return s


def pound():
    n = int(0.9 * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * 62 * x * (1 - 0.25 * x)) * np.exp(-x / 0.16) * 1.5
    s += band(100, 1200, 23, n) * np.exp(-x / 0.05) * 0.8
    s += np.sin(2 * np.pi * 880 * x) * np.exp(-x / 0.25) * 0.25 + np.sin(2 * np.pi * 1330 * x) * np.exp(-x / 0.18) * 0.15
    return s


def stroke(dur, up, seed):
    n = int(dur * SR); x = np.arange(n) / SR
    env = np.sin(np.pi * x / dur) ** 1.5
    s = band(160, 700 if up else 480, 30 + seed % 5, n) * env * 0.09
    s += band(30, 110, 40 + seed % 5, n) * env * 0.08
    if up:
        s += band(250, 1100, 50 + seed % 5, n) * env * (0.7 + 0.3 * np.sin(2 * np.pi * 3.3 * x)) * 0.05   # fluid rush
    c = creak(400, 520, min(0.6, dur / 3), seed) if up else creak(560, 440, min(0.5, dur / 3), seed)
    s[:len(c)] += c * 0.05
    return s


ev = np.zeros(N)
for s in meta['scenes']:
    for i, e in enumerate(s['events']):
        ty = e['type']
        if ty == 'click':
            add(ev, click(1.0, i), e['t'], 0.34)
        elif ty == 'click2':
            add(ev, click(0.78, i), e['t'], 0.22)
        elif ty == 'bang':
            add(ev, bang(), e['t'], 0.5)
        elif ty == 'pound':
            add(ev, pound(), e['t'], 0.55)
        elif ty in ('up', 'down'):
            add(ev, stroke(e['dur'], ty == 'up', i), e['t'], 1.0)
mix += ev

# ---- master ----
mix = mix[:int(TOTAL * SR)]
tm = np.arange(len(mix)) / SR
mix *= np.clip(tm / 1.5, 0, 1) * np.clip((TOTAL - tm) / 2.5, 0, 1)
mix = np.tanh(mix * 1.6)
mix *= 0.8 / np.max(np.abs(mix))
pcm = (mix * 32767).astype('<i2')
st = np.repeat(pcm[:, None], 2, axis=1)
with wave.open('out/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print('out/audio.wav', round(TOTAL, 1), 's', 'rms', round(float(np.sqrt(np.mean(mix ** 2))), 3))
