"""Synthesizes the soundtrack from out/meta.json -> out/audio.wav.

Layers: a soft musical pad, scene ambience (oilfield, plant, sea, drilling, underground), interface
sounds locked to on-screen events, and the narration clips from out/narration/.
Everything is generated procedurally with numpy.
"""
import json, os, wave
import numpy as np

SR = 44100
meta = json.load(open('out/meta.json'))
TOTAL, PERIOD = meta['total'], meta['period']
N = int(TOTAL * SR) + SR
t = np.arange(N) / SR
rs = np.random.RandomState(11)


def band(lo, hi, seed, n=N):
    r = np.random.RandomState(seed)
    spec = np.fft.rfft(r.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1e-6)) ** 6) / (1 + (f / hi) ** 6)
    x = np.fft.irfft(spec * m, n)
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)


def mask(amb, fade=0.8):
    m = np.zeros(N)
    for s in meta['scenes']:
        if s['amb'] == amb:
            a, b = s['start'], s['start'] + s['dur']
            m = np.maximum(m, np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1))
    return m


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= N:
        return
    n = min(len(sig), N - i)
    buf[i:i + n] += sig[:n] * gain


# ---- musical pad: four slow chords, eight seconds each ----
CH = [[110.0, 164.81, 246.94, 261.63], [87.31, 130.81, 220.0, 329.63], [130.81, 196.0, 293.66, 329.63], [98.0, 146.83, 220.0, 246.94]]
BAR = 8.0
pad = np.zeros(N)
for b in range(int(TOTAL / BAR) + 2):
    n = int((BAR + 3) * SR); x = np.arange(n) / SR
    env = np.clip(x / 3, 0, 1) * np.clip((BAR + 3 - x) / 3, 0, 1)
    env = np.sin(env * np.pi / 2) ** 2
    sig = np.zeros(n)
    for j, f in enumerate(CH[b % 4]):
        sig += (np.sin(2 * np.pi * f * x + j) + 0.3 * np.sin(4 * np.pi * f * x) + 0.12 * np.sin(6 * np.pi * f * x)) * (1 + 0.15 * np.sin(2 * np.pi * (0.13 + 0.03 * j) * x + j)) / (1 + j * 0.35)
    add(pad, sig * env, b * BAR - 1.5, 0.045)

# ---- oilfield ambience: pumpjack motor, counterweight whoosh, creaks, wind ----
u = (t / PERIOD) % 1.0
swing = np.abs(np.sin(2 * np.pi * u))
motor = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(50, .5, 0), (100, .32, 1), (150, .16, 2), (200, .08, .5)])
field = 0.07 * motor * (0.85 + 0.25 * swing) + band(120, 520, 2) * swing ** 1.5 * 0.10 + band(60, 380, 3) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + 1)) * 0.06


def creak(f0, f1, dur, seed):
    n = int(dur * SR); x = np.arange(n) / SR
    f = np.linspace(f0, f1, n) * (1 + 0.012 * np.sin(2 * np.pi * 23 * x))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.sin(np.pi * x / dur) ** 2


cr = np.zeros(N)
for k in range(int(TOTAL / PERIOD) + 1):
    add(cr, creak(380, 560, 0.7, k), k * PERIOD + 0.2, 0.05)
    add(cr, creak(620, 430, 0.6, k), k * PERIOD + PERIOD / 2, 0.04)
field += cr

# ---- process-plant ambience: hum, flow in the pipes, a little hiss ----
plant = (0.05 * (np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 100 * t + 1) + 0.25 * np.sin(2 * np.pi * 150 * t))
         + band(180, 700, 5) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.21 * t)) * 0.055
         + band(1500, 5000, 6) * 0.012 + band(30, 110, 7) * 0.06)
room = band(40, 240, 8) * 0.012

# underground: low rumble.  sea: slow surf.  drilling: rumble + rotary whine
under = band(28, 110, 12) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t)) * 0.08 + band(200, 800, 13) * 0.012
surf = np.clip(np.sin(2 * np.pi * t / 7.5), 0, 1) ** 2 + 0.5 * np.clip(np.sin(2 * np.pi * t / 11.3 + 1), 0, 1) ** 2
seaamb = band(250, 2600, 14) * (0.25 + 0.75 * surf) * 0.055 + band(40, 160, 15) * 0.05
drill = (band(30, 140, 16) * 0.12 + 0.03 * np.sin(2 * np.pi * 86 * t + 2.5 * np.sin(2 * np.pi * 0.7 * t)) * (1 + 0.3 * np.sin(2 * np.pi * 5 * t))
         + band(400, 1800, 17) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.3 * t)) * 0.03)

mix = (pad * (0.55 * mask('field') + 0.7 * mask('plant') + 1.0 * mask('calc') + 0.6 * mask('under') + 0.55 * mask('sea') + 0.45 * mask('drill'))
       + field * mask('field') + plant * mask('plant') + room * mask('calc')
       + under * mask('under') + seaamb * mask('sea') + drill * mask('drill'))


# ---- interface sounds ----
def tick(seed=0):
    n = int(0.09 * SR); x = np.arange(n) / SR
    f = 1150 + 90 * (seed % 5)
    return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x / 0.016)


def ding():
    n = int(0.9 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 880 * x) * np.exp(-x / 0.25) + 0.7 * np.sin(2 * np.pi * 1318.5 * x) * np.exp(-x / 0.18) * (x > 0.07) + 0.2 * np.sin(2 * np.pi * 2637 * x) * np.exp(-x / 0.08))


def alert():
    n = int(0.5 * SR); x = np.arange(n) / SR
    g = ((x % 0.2) < 0.11) * np.exp(-((x % 0.2)) / 0.07)
    return (np.sin(2 * np.pi * 392 * x) + 0.5 * np.sin(2 * np.pi * 784 * x) + 0.25 * np.sin(2 * np.pi * 1176 * x)) * g * (x < 0.4)


def whoosh():
    n = int(0.8 * SR); x = np.arange(n) / SR
    return band(300, 3500, 31, n) * np.sin(np.pi * x / 0.8) ** 2.5


def valve():
    n = int(0.25 * SR); x = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(1750, .6, .03), (3120, .45, .02), (4730, .3, .012)])
    return s + 0.9 * np.sin(2 * np.pi * 130 * x) * np.exp(-x / 0.05)


def bang():
    n = int(0.9 * SR); x = np.arange(n) / SR
    return band(40, 1800, 21, n) * np.exp(-x / 0.12) * 1.2 + np.sin(2 * np.pi * 55 * x) * np.exp(-x / 0.18) * 1.4 + band(1500, 7000, 22, n) * np.exp(-x / 0.015) * 0.8


def thump():
    n = int(1.4 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * 48 * x * (1 - 0.2 * x)) * np.exp(-x / 0.3) + band(60, 500, 24, n) * np.exp(-x / 0.08) * 0.5


GAIN = {'tick': 0.10, 'ding': 0.11, 'alert': 0.10, 'whoosh': 0.09, 'valve': 0.2, 'bang': 0.3, 'thump': 0.22}
ev = np.zeros(N)
for s in meta['scenes']:
    for i, e in enumerate(s['events']):
        ty = e['type']
        sig = {'tick': lambda: tick(i), 'ding': ding, 'alert': alert, 'whoosh': whoosh, 'valve': valve, 'bang': bang, 'thump': thump}.get(ty, lambda: None)()
        if sig is not None:
            add(ev, sig, e['t'], GAIN[ty])
mix += ev


# ---- narration: out/narration/<scene>_<n>.wav, placed at each caption start ----
def load_clip(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float64) / 32767
    n = int(round(len(a) * SR / sr))
    spec = np.fft.rfft(a)
    out = np.zeros(n // 2 + 1, complex)
    k = min(len(spec), len(out)); out[:k] = spec[:k]
    return np.fft.irfft(out, n) * (n / len(a))


voice = np.zeros(N)
speech = np.zeros(N)
LEAD = 0.25
for s in meta['scenes']:
    for i, c in enumerate(s['cues']):
        f = f"out/narration/{s['id']}_{i}.wav"
        if not os.path.exists(f):
            continue
        clip = load_clip(f)
        add(voice, clip, c['start'] + LEAD)
        a, b = c['start'] + LEAD, c['start'] + LEAD + len(clip) / SR
        speech = np.maximum(speech, np.clip((t - a + 0.35) / 0.35, 0, 1) * np.clip((b + 0.5 - t) / 0.5, 0, 1))
has_voice = bool(np.any(voice))

# ---- master ----
mix = mix[:int(TOTAL * SR)]
tm = np.arange(len(mix)) / SR
mix *= np.clip(tm / 1.5, 0, 1) * np.clip((TOTAL - tm) / 3.0, 0, 1)
mix = np.tanh(mix * 1.5)
mix *= 0.5 / np.max(np.abs(mix))
if has_voice:
    voice = voice[:len(mix)]; speech = speech[:len(mix)]
    voice *= 0.2 / np.sqrt(np.mean(voice[np.abs(voice) > 0.01] ** 2))
    mix = mix * (1.0 - 0.5 * speech) + np.tanh(voice * 1.2) / 1.2
    mix *= 0.92 / np.max(np.abs(mix))
pcm = (mix * 32767).astype('<i2')
with wave.open('out/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
print('out/audio.wav', round(TOTAL, 1), 's', 'with narration' if has_voice else 'no narration')
