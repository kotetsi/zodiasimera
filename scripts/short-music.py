# Σταθερή μουσική υπόκρουση για τα καθημερινά Shorts (ίδια κάθε μέρα, seed 7).
# Ήρεμο «κοσμικό» pad: συγχορδίες Am–F–C–G με απαλά αρμονικά, αργό arpeggio και ηχώ.
# Χρήση: python3 scripts/short-music.py out.wav [δευτερόλεπτα]
import sys, wave
import numpy as np

SR = 44100
out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 60.0
rng = np.random.default_rng(7)
n = int(SR * dur)
t = np.arange(n) / SR

def note(f):
    return 440.0 * 2 ** ((f - 69) / 12)

chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
bar = 4.0
pad = np.zeros(n)
for k in range(int(np.ceil(dur / bar))):
    ch = chords[k % 4]
    s, e = int(k * bar * SR), min(n, int((k + 1) * bar * SR + 1.5 * SR))
    tt = t[s:e] - k * bar
    env = np.minimum(1, tt / 1.2) * np.exp(-np.maximum(0, tt - bar) / 0.6)
    for m in ch:
        f = note(m)
        for h, a in [(1, 1.0), (2, 0.25), (3, 0.08)]:
            pad[s:e] += a * env * np.sin(2 * np.pi * f * h * tt + rng.uniform(0, 6.28)) * 0.06
    # αργό arpeggio μια οκτάβα πάνω
    for j, m in enumerate(ch + [ch[1]]):
        s2 = int((k * bar + j) * SR)
        if s2 >= n:
            break
        e2 = min(n, s2 + int(1.8 * SR))
        t2 = (np.arange(e2 - s2)) / SR
        pad[s2:e2] += 0.05 * np.exp(-t2 * 2.2) * np.sin(2 * np.pi * note(m + 12) * t2)

# ηχώ
for d, g in [(0.37, 0.35), (0.74, 0.18)]:
    k = int(d * SR)
    pad[k:] += g * pad[:-k]
# fade in / out
fade = int(1.5 * SR)
pad[:fade] *= np.linspace(0, 1, fade)
pad[-fade * 2:] *= np.linspace(1, 0, fade * 2)
pad = pad / (np.abs(pad).max() + 1e-9) * 0.5
data = (pad * 32767).astype(np.int16)
stereo = np.stack([data, data], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
