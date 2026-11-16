"""Sound design for the film: out/meta.json -> out/audio.wav.

No narration and no music: only location sound, synthesized with numpy. Every shot lists the
continuous layers it uses ("snd"); one-off sounds are placed by the shots' events.
"""
import json, wave
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
    x = np.fft.irfft(spec / (1 + (lo / np.maximum(f, 1e-6)) ** 6) / (1 + (f / hi) ** 6), n)
    return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)


def slow(rate, seed, lo=0.0):
    """Smooth random modulation in lo..1."""
    x = band(rate * .2, rate, seed); x = (x - x.min()) / (x.max() - x.min())
    return lo + (1 - lo) * x


def sines(parts):
    return sum(a * np.sin(2 * np.pi * f * t + i) for i, (f, a) in enumerate(parts))


FIRE = 46.7   # firing frequency of a four-cylinder engine at about 1400 rpm
LAYERS = {
    'water':      lambda: band(70, 800, 1) * slow(.4, 2, .5) * .3 + band(900, 3200, 3) * .04,
    'waves':      lambda: band(200, 1500, 4) * (np.clip(np.sin(2 * np.pi * t / 5.5), 0, 1) ** 2) * .5,
    'rock':       lambda: band(22, 85, 5) * .2,
    'deep':       lambda: band(18, 65, 6) * .16 + .02 * np.sin(2 * np.pi * 37 * t),
    'seep':       lambda: band(140, 620, 7) * slow(.8, 8, .4) * .22,
    'drillfar':   lambda: band(24, 110, 9) * (.45 + .55 * np.clip(np.sin(2 * np.pi * 3.2 * t), 0, 1)) * .9 + band(110, 380, 10) * .1,
    'drill':      lambda: band(55, 900, 11) * (.55 + .45 * np.clip(np.sin(2 * np.pi * 3.2 * t), 0, 1)) * .55 + band(1400, 5200, 12) * slow(9, 13, .3) * .16 + .2 * np.sin(2 * np.pi * 55 * t),
    'mudflow':    lambda: band(220, 1500, 14) * slow(1.5, 15, .6) * .3,
    'steel':      lambda: band(280, 2400, 16) * slow(2.5, 17) * .16 + band(30, 110, 18) * .3,
    'pump':       lambda: band(38, 190, 19) * .4,
    'rushup':     lambda: band(160, 2600, 20) * .5 + band(40, 150, 21) * .3,
    'rush':       lambda: band(240, 3400, 22) * slow(3, 23, .7) * .42 + band(45, 150, 24) * .3,
    'gasliquid':  lambda: band(280, 2100, 25) * slow(7, 26) ** 2 * .7,
    'hiss':       lambda: band(3200, 9500, 27) * .32,
    'wind':       lambda: band(140, 700, 28) * slow(.3, 29, .4) * .3,
    'vessel':     lambda: band(90, 700, 30) * .26 + band(28, 90, 31) * .22,
    'pumphum':    lambda: sines([(48, .22), (96, .14), (144, .07), (240, .03)]) + band(200, 900, 32) * .07,
    'piperumble': lambda: band(28, 160, 33) * .6 + band(200, 700, 34) * .1,
    'furnace':    lambda: band(38, 300, 35) * (.7 + .3 * slow(9, 36)) * .6 + band(400, 1500, 37) * .1,
    'vapor':      lambda: band(1400, 7000, 38) * slow(1.2, 39, .6) * .3 + band(200, 800, 40) * .14,
    'compressor': lambda: sines([(62, .2), (124, .13), (186, .08), (310, .04)]) * (1 + .08 * np.sin(2 * np.pi * 1.7 * t)) + band(500, 2500, 41) * .08,
    'mix':        lambda: band(200, 1900, 42) * slow(2, 43, .4) * .34,
    'flow':       lambda: band(380, 3000, 44) * slow(4, 45, .6) * .34,
    'slosh':      lambda: band(180, 1200, 46) * (np.clip(np.sin(2 * np.pi * 1.3 * t), 0, 1) ** 2) * .5,
    'whirr':      lambda: sines([(520, .08), (1040, .05), (1560, .025)]) * (1 + .05 * np.sin(2 * np.pi * 31 * t)) + band(700, 3000, 47) * .05,
    'buzz':       lambda: sines([(100, .18), (200, .08), (300, .04)]),
    'truck':      lambda: band(45, 260, 48) * .5 + sines([(82, .2), (164, .08)]) + band(500, 2200, 49) * .1,
    'engine':     lambda: (np.sign(np.sin(2 * np.pi * FIRE * t)) * .12 + sines([(FIRE, .3), (FIRE * 2, .18), (FIRE * 3, .08), (FIRE / 2, .1)])) * (1 + .1 * slow(6, 50)) + band(100, 700, 51) * .12,
    'exhaustgas': lambda: band(70, 520, 52) * (.5 + .5 * np.clip(np.sin(2 * np.pi * FIRE * t), 0, 1)) * .5,
    'tires':      lambda: band(450, 2600, 53) * .28 + band(70, 210, 54) * .2,
    'outdoor':    lambda: band(180, 900, 55) * slow(.25, 56, .4) * .12,
}
RAMP = {'rushup', 'drillfar'}   # layers that swell across their shot


def window(a, b, f=0.07):
    return np.clip((t - a + f) / (2 * f), 0, 1) * np.clip((b + f - t) / (2 * f), 0, 1)


mix = np.zeros(N)
used = sorted({name for s in meta['shots'] for name, g in s['snd'] if g > 0 and name in LAYERS})
for name in used:
    env = np.zeros(N)
    for s in meta['shots']:
        for n2, g in s['snd']:
            if n2 == name and g > 0:
                w = window(s['start'], s['start'] + s['dur']) * g
                if name in RAMP:
                    w *= np.clip((t - s['start']) / s['dur'], 0, 1) ** 1.6
                env += w
    mix += LAYERS[name]() * env


# ---- one-off sounds ----
def seg(dur):
    n = int(dur * SR); return n, np.arange(n) / SR


def ev_creak():
    n, x = seg(1.4); f = np.linspace(72, 52, n); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .4 * np.sin(2.01 * ph)) * np.sin(np.pi * x / 1.4) ** 2 * .5 + band(30, 120, 61, n) * np.sin(np.pi * x / 1.4) ** 2 * .4


def ev_clank():
    n, x = seg(.7)
    return sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(520, .5, .12), (1340, .35, .08), (2210, .2, .05), (3470, .1, .03)]) + np.sin(2 * np.pi * 90 * x) * np.exp(-x / .06)


def ev_thud():
    n, x = seg(.6); return np.sin(2 * np.pi * 58 * x * (1 - .2 * x)) * np.exp(-x / .11) + band(60, 400, 62, n) * np.exp(-x / .03) * .4


def ev_pulse():
    n, x = seg(.34); return band(38, 220, 63, n) * np.sin(np.pi * x / .34) ** 2


def ev_shot():   # compact, muffled detonation
    n, x = seg(.5); return np.sin(2 * np.pi * 52 * x * (1 - .5 * x)) * np.exp(-x / .09) * 1.4 + band(40, 900, 64, n) * np.exp(-x / .035) + band(900, 4000, 65, n) * np.exp(-x / .008) * .4


def ev_ring():
    n, x = seg(1.1); return sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / d) for f, a, d in [(1830, .5, .3), (2910, .3, .2), (4180, .15, .12)])


def ev_boomtail():
    n, x = seg(3.2); return band(18, 85, 66, n) * np.exp(-x / .8) * 1.3 + band(90, 500, 67, n) * np.exp(-x / .25) * .4


def ev_trickle():
    n, x = seg(1.9); out = np.zeros(n); r = np.random.RandomState(5)
    for k in range(34):
        i = int(r.rand() * (n - 3000)); m = np.arange(2400) / SR; f0 = 700 + r.rand() * 1600
        out[i:i + 2400] += np.sin(2 * np.pi * (f0 + 2500 * m) * m) * np.exp(-m / .012) * .5
    return out


def ev_click():
    n, x = seg(.12); return np.sin(2 * np.pi * 2500 * x) * np.exp(-x / .006) + np.sin(2 * np.pi * 320 * x) * np.exp(-x / .02)


def ev_tick():
    n, x = seg(.05); return np.sin(2 * np.pi * 4200 * x) * np.exp(-x / .003) + band(2000, 9000, 68, n) * np.exp(-x / .002) * .5


def ev_spark():
    n, x = seg(.08); return band(1500, 12000, 69, n) * np.exp(-x / .006)


def ev_burn():   # one slowed combustion pulse
    n, x = seg(3.4); a = np.clip(x / .12, 0, 1)
    return band(28, 420, 70, n) * a * np.exp(-x / .9) * 1.4 + band(300, 2600, 71, n) * a * np.exp(-x / .5) * .5 + np.sin(2 * np.pi * 44 * x) * a * np.exp(-x / .5)


EV = {'creak': (ev_creak, .5), 'clank': (ev_clank, .45), 'thud': (ev_thud, .7), 'pulse': (ev_pulse, .55), 'shot': (ev_shot, 1.5), 'ring': (ev_ring, .22),
      'boomtail': (ev_boomtail, .9), 'trickle': (ev_trickle, .4), 'click': (ev_click, .5), 'tick': (ev_tick, .4), 'spark': (ev_spark, .6), 'burn': (ev_burn, 1.0)}
for s in meta['shots']:
    for e in s['events']:
        if e['type'] in EV:
            fn, g = EV[e['type']]; sig = fn() * g; i = int(e['t'] * SR)
            if 0 <= i < N:
                k = min(len(sig), N - i); mix[i:i + k] += sig[:k]

# ---- master: keep the quiet quiet and the perforation the loudest moment ----
mix = mix[:int(TOTAL * SR)]
tm = np.arange(len(mix)) / SR
mix *= np.clip(tm / 1.5, 0, 1) * np.clip((TOTAL - tm) / 2.0, 0, 1)
mix = np.tanh(mix * 0.5)
mix *= 0.92 / np.max(np.abs(mix))
pcm = (mix * 32767).astype('<i2')
with wave.open('out/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
print('out/audio.wav', round(TOTAL, 1), 's; layers:', len(used))
