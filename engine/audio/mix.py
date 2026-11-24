# mix.py : voice placement + an original score + sound effects, synthesized with numpy (no samples).
#   python mix.py <story_dir>
# Reads <story>/audio/cues.json (written by render.mjs: DUR, cues, lines), <story>/voice/satir/<id>.wav and
# <story>/voice/satirlar.json (who speaks), writes <story>/audio/{voice,music,sfx,premix,mix}.wav.
# Loudness: the reference hooks measure -14.9 .. -15.6 LUFS, peaks -1.4 .. -1.9 dBFS -> target -15 LUFS, -1.5 dBTP.
import sys, json, subprocess, pathlib, re
import numpy as np

SR = 48000
story = pathlib.Path(sys.argv[1]); AUD = story / 'audio'
cfg = json.load(open(AUD / 'cues.json', encoding='utf-8'))
DUR = cfg['DUR']; N = int(DUR * SR)
who = {L['id']: L.get('kim', 'anlatici') for L in json.load(open(story / 'voice' / 'satirlar.json', encoding='utf-8'))}
rng = np.random.default_rng(11)

def load(p, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', str(p)] + (['-af', af] if af else []) + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()
def save(p, x):
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', str(p)], input=st.astype(np.float32).tobytes(), check=True)
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4); return np.fft.irfft(X * m, len(x))
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(d, 1e-4))
def put(buf, t, x, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf) and j > i: buf[i:j] += x[:j - i] * g
def hz(n):  # 'D4' -> Hz
    m = re.match(r'([A-G])(b|#)?(-?\d)', n); k = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}[m[1]] + {'b': -1, '#': 1, None: 0}[m[2]]
    return 440 * 2 ** ((k + 12 * (int(m[3]) + 1) - 69) / 12)

# ------------------------------------------------------------------ instruments
def piano(f, dur=2.0, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k in range(1, 7):
        x += np.sin(2 * np.pi * f * k * (1 + .0004 * k * k) * t) * (1 / k ** 1.4) * np.exp(-t * (1.2 + k * .9))
    return x * env(n, .004, 9) * vel * .35
def bell(f, dur=2.5, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * r * t) * a * np.exp(-t * d) for r, a, d in [(1, 1, 1.6), (2.76, .35, 3.5), (5.4, .15, 7), (2, .2, 2.5)])
    return x * env(n, .002, 9) * vel * .22
def pad(fs, dur, amp=.06, bright=1200):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f in fs:
        for d in (1, 1.0035, .9968): x += ((t * f * d) % 1 * 2 - 1)
    x = band(x, 60, bright) * amp / len(fs)
    return x * np.minimum(1, np.minimum(t / 1.2, (dur - t) / 1.0)).clip(0, 1)
def pluck(f, dur=.9, bright=.5):
    n = int(dur * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * (.996 + bright * .003)
    return band(out, 80, 5000) * env(n, .001, dur * .6) * .5
def noise(n): return rng.standard_normal(n)
def boom(dur=2.6, f0=55, f1=28, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .003, .9)
    x += band(noise(n), 40, 400) * env(n, .002, .25) * .5
    return x * amp
def whoosh(dur=.7, lo=300, hi=3000, amp=.5, rev=False):
    n = int(dur * SR); t = np.arange(n) / SR; x = noise(n)
    k = np.sin(np.pi * t / dur) ** 2; out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        c = lo + (hi - lo) * (i / n if not rev else 1 - i / n); y = band(x[i:i + seg], c * .5, c * 1.6) if len(x[i:i + seg]) > 64 else x[i:i + seg] * 0
        out[i:i + seg] = y
    return out * k * amp
def click(amp=.4):
    n = int(.05 * SR); x = band(noise(n), 1500, 7000) * env(n, .0003, .004)
    y = np.zeros(int(.07 * SR)); y[:n] += x; y[int(.018 * SR):int(.018 * SR) + n] += x * .6; return y * amp
def blip(f=900, dur=.12, amp=.3):
    n = int(dur * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * env(n, .002, dur * .35) * amp
def pop(amp=.35):
    n = int(.09 * SR); t = np.arange(n) / SR; f = 520 * np.exp(-t * 18) + 180; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .03) * amp
def thud(amp=.5):
    n = int(.25 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * .8 + band(noise(n), 200, 2500) * .5) * env(n, .001, .05) * amp
def reverb(x, dec=1.8, mix=.25):
    n = int(dec * SR); ir = noise(n) * np.exp(-np.arange(n) / SR * 6.9 / dec); ir = band(ir, 200, 6000); ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n; F = 1 << (L - 1).bit_length(); y = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]
    return x * (1 - mix) + y * mix * 3

# ------------------------------------------------------------------ voice
voice = np.zeros(N)
# One voice for everybody (a single TTS voice): the friend and "you" are told apart by pitch.
# A separate voice per role (voice/ses.json {"ayri_sesler": true}, e.g. AI Studio): no shift.
ses = story / 'voice' / 'ses.json'
SHIFT = {} if ses.exists() and json.load(open(ses, encoding='utf-8')).get('ayri_sesler') else \
        {'arkadas': 'rubberband=pitch=1.26:tempo=1.0', 'sen': 'rubberband=pitch=1.12:tempo=1.0'}
spans = []
for lid, t0 in cfg['lines']:
    w = load(story / 'voice' / 'satir' / f'{lid}.wav', SHIFT.get(who.get(lid)))
    w = band(w, 70, 12000); w /= max(1e-6, np.sqrt(np.mean(w ** 2))) / .1
    put(voice, t0, w); spans.append((t0, t0 + len(w) / SR))

# ------------------------------------------------------------------ score: D minor, 84 bpm, lifts to F major for the title
B = 60 / 84
mus = np.zeros(N)
def chord(t, names, dur, amp=.06, bright=1200): put(mus, t, pad([hz(n) for n in names], dur, amp, bright))
# night (0 - 7.4): pad + music box
chord(0, ['D2', 'A2', 'D3', 'F3'], 7.6, .07, 700)
for i, n in enumerate(['A4', 'F4', 'D5', 'C5', 'A4', 'F4', 'E4', 'D4']): put(mus, .4 + i * B * 1.2, bell(hz(n), 2.2, .7))
# the night of work (7.4 - 15.8): arpeggio that speeds up
prog = [(['D3', 'F3', 'A3', 'D4'], 'D2'), (['Bb2', 'D3', 'F3', 'Bb3'], 'Bb1'), (['F3', 'A3', 'C4', 'F4'], 'F2'), (['C3', 'E3', 'G3', 'C4'], 'C2')]
t = 7.4; k = 0
while t < 15.7:
    notes, bass = prog[k % 4]; dur = 2 * B if t < 11.8 else B
    chord(t, notes, dur + .3, .05, 900); put(mus, t, piano(hz(bass), dur + .5, .8))
    step = B / 2 if t < 11.8 else B / 4
    for j in range(int(dur / step)): put(mus, t + j * step, piano(hz(notes[j % 4].replace('3', '5').replace('2', '4').replace('4', '5') if False else notes[j % 4]) * 2, .6, .45))
    t += dur; k += 1
rs = int(1.6 * SR); put(mus, 14.2, band(noise(rs), 2000, 9000) * np.linspace(0, 1, rs) ** 2 * .12)          # riser into dawn
# dawn (15.8 - 22.4): lighter plucks; the music stops for the crash (19.0 - 19.8)
for i, (n, tt) in enumerate([('F4', 15.85), ('A4', 16.3), ('C5', 16.75), ('A4', 17.2), ('G4', 17.65), ('E4', 18.1), ('F4', 18.55)]): put(mus, tt, pluck(hz(n), 1.0, .6), .55)
chord(15.8, ['F3', 'A3', 'C4'], 3.3, .045, 1400)
chord(19.85, ['Bb2', 'D3', 'F3', 'A3'], 2.6, .05, 1200)
for i, n in enumerate(['D5', 'C5', 'A4', 'F4']): put(mus, 19.9 + i * B, bell(hz(n), 1.6, .6))
# the number card (22.4 - 30.4): low drone + a pulse, then silence before the hit
chord(22.4, ['D2', 'A2', 'D3'], 5.6, .07, 500)
for i in range(int(5.0 / B)): put(mus, 22.6 + i * B, piano(hz('D2'), .5, .5))
chord(27.6, ['D2', 'Ab2', 'D3'], 1.8, .07, 600)
# the title (30.4 - 40): warm swell
chord(30.4, ['Bb2', 'F3', 'D4', 'F4'], 3.0, .075, 1600)
chord(33.2, ['F2', 'C3', 'A3', 'F4'], 2.8, .07, 1600)
chord(35.8, ['C3', 'G3', 'E4', 'G4'], 2.4, .065, 1500)
chord(38.0, ['D3', 'A3', 'F4'], 2.2, .06, 1300)
for i, n in enumerate(['F5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5', 'F5', 'A5', 'G5', 'F5']): put(mus, 31.2 + i * B * .9, piano(hz(n), 1.6, .55))
mus = reverb(mus, 2.4, .3)

# ------------------------------------------------------------------ sfx
sfx = np.zeros(N)
for c in cfg['cues']:
    t0, s, g = c['t'], c['s'], c.get('g', 1.0)
    if s == 'klik': put(sfx, t0, click(.25), g)
    elif s == 'whoosh': put(sfx, t0 - .35, whoosh(.8, 250, 3500, .35))
    elif s == 'whoosh2': put(sfx, t0 - .3, whoosh(.7, 3000, 300, .3, rev=True))
    elif s == 'cut': put(sfx, t0 - .1, whoosh(.3, 800, 3000, .12))
    elif s == 'pop': put(sfx, t0, pop(.35)); put(sfx, t0 + .02, thud(.25))
    elif s == 'strum':
        for j, n in enumerate(['D3', 'A3', 'D4', 'F4']): put(sfx, t0 + j * .014, pluck(hz(n), 1.1, .7), .45)
    elif s == 'ticks':
        tt = t0
        while tt < 13.0: put(sfx, tt, band(noise(int(.012 * SR)), 2500, 9000) * env(int(.012 * SR), .0005, .003) * .5); tt += max(.035, .16 - (tt - t0) * .11)
    elif s == 'kana': put(sfx, t0, blip(1320, .14, .18)); put(sfx, t0 + .05, blip(1760, .1, .1))
    elif s == 'shimmer':
        for j, n in enumerate(['A5', 'C6', 'E6', 'A6', 'C7']): put(sfx, t0 + j * .09, bell(hz(n), 1.5, .35))
    elif s == 'door':
        n = int(.6 * SR); tt = np.arange(n) / SR; f = 180 + 90 * np.sin(tt * 9) + 60 * tt
        put(sfx, t0, band(((np.cumsum(f) / SR) % 1 * 2 - 1) * (1 + .5 * noise(n)), 300, 2500) * env(n, .05, .3) * .07); put(sfx, t0 + .55, click(.2))
    elif s == 'yawn': pass
    elif s == 'sting': put(sfx, t0, piano(hz('D3'), 1.4, .9) + piano(hz('Ab3'), 1.4, .7) + piano(hz('D4'), 1.4, .6)); put(sfx, t0, band(noise(int(.4 * SR)), 300, 6000) * env(int(.4 * SR), .002, .08) * .15)
    elif s == 'crash':
        for j in range(22): put(sfx, t0 + .02 + j * .035 + rng.uniform(0, .02), thud(.4 * rng.uniform(.5, 1)))
        put(sfx, t0 + .7, thud(.6))
    elif s == 'tick': put(sfx, t0, blip(2200, .05, .15))
    elif s == 'hit': put(sfx, t0, boom(1.6, 70, 35, .55)); put(sfx, t0, band(noise(int(.3 * SR)), 800, 8000) * env(int(.3 * SR), .001, .06) * .3)
    elif s == 'boom':
        rs = int(1.4 * SR); put(sfx, t0 - 1.4, band(noise(rs), 1500, 9000) * np.linspace(0, 1, rs) ** 3 * .25)
        put(sfx, t0, boom(3.0, 60, 30, .8))
    elif s == 'room': pass
    # the bars close: a low swell that rises under the cut (the reference gets 5-7 dB louder and its low band peaks there)
    elif s == 'dar':
        n = int(1.6 * SR); tt = np.arange(n) / SR; f = 44 + 28 * np.exp(-tt * 2.5); ph = 2 * np.pi * np.cumsum(f) / SR
        e = np.minimum(1, tt / .14) * np.exp(-tt / .55)
        put(sfx, t0 - .08, (np.sin(ph) * .52 + np.sin(2 * ph) * .18 + band(noise(n), 60, 320) * .25) * e)
        put(sfx, t0 - .3, whoosh(.55, 900, 140, .16, rev=True))
    # the bars open: a short breath of air
    elif s == 'ac': put(sfx, t0, whoosh(.4, 500, 2600, .07))
# ambience: city night outside, room tone inside, birds at dawn
amb = np.zeros(N)
def seg(a, b, x, g): put(amb, a, x[:int((b - a) * SR)] * np.minimum(1, np.minimum(np.arange(int((b - a) * SR)) / (.3 * SR), (int((b - a) * SR) - np.arange(int((b - a) * SR))) / (.3 * SR))), g)
city = band(noise(N), 80, 900); seg(0, 7.4, city, .05); seg(30.4, DUR, city, .04)
room = band(noise(N), 60, 400); seg(7.4, 22.4, room, .025)
for j in range(14):
    tt = 30.6 + rng.uniform(0, 9); n = int(.12 * SR); x = np.arange(n) / SR
    put(amb, tt, np.sin(2 * np.pi * np.cumsum(3200 + 1400 * np.sin(x * 90)) / SR) * env(n, .005, .04) * .05)

# ------------------------------------------------------------------ duck music under the voice, sum, loudness
vo_env = np.zeros(N)
for a, b in spans: vo_env[int(a * SR):int(b * SR)] = 1
k = int(.25 * SR); vo_env = np.convolve(vo_env, np.ones(k) / k, mode='same')
music = mus * (1 - .55 * vo_env)
pre = voice * 1.0 + music * 1.0 + sfx * .9 + amb
save(AUD / 'voice.wav', voice); save(AUD / 'music.wav', music); save(AUD / 'sfx.wav', sfx + amb); save(AUD / 'premix.wav', pre)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(AUD / 'premix.wav'), '-af', 'loudnorm=I=-15:TP=-1.5:LRA=8:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = f"loudnorm=I=-15:TP=-1.5:LRA=8:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(AUD / 'premix.wav'), '-af', af, '-ar', '48000', str(AUD / 'mix.wav')], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(AUD / 'mix.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('mix', ' '.join(l.strip() for l in r.splitlines() if l.strip().startswith(('I:', 'Peak:'))))
