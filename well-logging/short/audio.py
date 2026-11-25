"""Synthesizes the soundtrack from out/meta.json -> out/audio.wav.

Layers: a soft musical pad, a rig-site ambience (generator, wind, winch) for the
surface scenes, a quiet room tone elsewhere, sounds locked to on-screen events
(detector clicks whose rate follows the log, sonic pings, whooshes, chimes) and
the narration clips from out/narration/. Everything is generated with numpy.
"""
import json, os, wave
import numpy as np

SR = 44100
meta = json.load(open('out/meta.json'))
TOTAL = meta['total']
N = int(TOTAL * SR) + SR
t = np.arange(N) / SR


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


# ---- musical pad: slow chords ----
CH = [[110.0, 164.81, 220.0, 277.18], [98.0, 146.83, 196.0, 246.94], [87.31, 130.81, 174.61, 220.0], [98.0, 146.83, 220.0, 293.66]]
BAR = 8.0
pad = np.zeros(N)
for b in range(int(TOTAL / BAR) + 2):
    n = int((BAR + 3) * SR); x = np.arange(n) / SR
    env = np.sin(np.clip(x / 3, 0, 1) * np.clip((BAR + 3 - x) / 3, 0, 1) * np.pi / 2) ** 2
    sig = np.zeros(n)
    for j, f in enumerate(CH[b % 4]):
        sig += (np.sin(2 * np.pi * f * x + j) + 0.3 * np.sin(4 * np.pi * f * x) + 0.1 * np.sin(6 * np.pi * f * x)) * (1 + 0.15 * np.sin(2 * np.pi * (0.11 + 0.03 * j) * x + j)) / (1 + j * 0.35)
    add(pad, sig * env, b * BAR - 1.5, 0.04)

# ---- rig ambience: generator, wind, cable winch ----
gen = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(60, .5, 0), (120, .3, 1), (180, .14, 2), (240, .06, .4)])
rig = 0.06 * gen * (0.9 + 0.1 * np.sin(2 * np.pi * 0.3 * t)) + band(150, 900, 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t + 1)) * 0.05 \
    + band(800, 2400, 3) * 0.018 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * t) ** 2)
room = band(40, 240, 8) * 0.012 + band(2000, 6000, 9) * 0.003

mix = pad * (0.6 * mask('rig') + 1.0 * mask('lab')) + rig * mask('rig') + room * mask('lab')

# ---- optional light beat (short cut): kick on the beat, hat on the off-beat ----
BEAT = float(os.environ.get('BEAT_BPM', '0'))
if BEAT > 0:
    beat = np.zeros(N); bt = 60 / BEAT
    nk = int(0.25 * SR); xk = np.arange(nk) / SR
    kick = np.sin(2 * np.pi * (48 + 70 * np.exp(-xk / 0.03)) * xk) * np.exp(-xk / 0.11)
    hat = band(6000, 14000, 41, int(0.05 * SR)) * np.exp(-np.arange(int(0.05 * SR)) / SR / 0.012)
    k = 0
    while k * bt < TOTAL:
        add(beat, kick, k * bt, 0.16 if k % 4 == 0 else 0.11)
        add(beat, hat, k * bt + bt / 2, 0.022)
        k += 1
    mix += beat * np.clip(t / 2.0, 0, 1)


# ---- event sounds ----
def click(seed):
    r = np.random.RandomState(seed); n = int(0.012 * SR); x = np.arange(n) / SR
    return r.standard_normal(n) * np.exp(-x / 0.0018) + 0.6 * np.sin(2 * np.pi * 3200 * x) * np.exp(-x / 0.002)


def ping():
    n = int(0.6 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2350 * x) * np.exp(-x / 0.05) + 0.5 * np.sin(2 * np.pi * 4700 * x) * np.exp(-x / 0.03)
            + 0.35 * np.sin(2 * np.pi * 1175 * x) * np.exp(-x / 0.12))


def whoosh():
    n = int(0.8 * SR); x = np.arange(n) / SR
    return band(300, 3500, 31, n) * np.sin(np.pi * x / 0.8) ** 2.5


def ding():
    n = int(0.9 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 880 * x) * np.exp(-x / 0.25) + 0.7 * np.sin(2 * np.pi * 1318.5 * x) * np.exp(-x / 0.18) * (x > 0.07) + 0.2 * np.sin(2 * np.pi * 2637 * x) * np.exp(-x / 0.08))


GAIN = {'click': 0.10, 'ping': 0.07, 'whoosh': 0.08, 'ding': 0.09}
ev = np.zeros(N)
for s in meta['scenes']:
    for i, e in enumerate(s['events']):
        ty = e['type']
        sig = click(i) if ty == 'click' else ping() if ty == 'ping' else whoosh() if ty == 'whoosh' else ding() if ty == 'ding' else None
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
