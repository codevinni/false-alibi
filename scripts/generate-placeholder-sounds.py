#!/usr/bin/env python3
"""
Gera os sons PLACEHOLDER do False Alibi em src/assets/sounds/.

Usa apenas a biblioteca padrão do Python (wave, math, struct, random),
então roda em qualquer máquina: `python scripts/generate-placeholder-sounds.py`

Os arquivos gerados são só para desenvolvimento. Para trocar por sons
definitivos, basta substituir o .wav (mantendo o nome) ou apontar para outro
arquivo em src/services/audio/soundAssets.ts.
"""

import math
import os
import random
import struct
import wave

SAMPLE_RATE = 22050
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'sounds')

# Frequências (Hz) de algumas notas usadas abaixo
NOTE = {
    'A2': 110.00, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
    'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66,
    'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'C5': 523.25,
    'E5': 659.25, 'G5': 783.99,
}


def silence(seconds):
    return [0.0] * int(SAMPLE_RATE * seconds)


def tone(freq, seconds, volume=0.5, attack=0.01, release=0.05, harmonics=(1.0, 0.3, 0.1)):
    """Nota simples com envelope de ataque/decaimento (evita estalos)."""
    n = int(SAMPLE_RATE * seconds)
    a = max(1, int(SAMPLE_RATE * attack))
    r = max(1, int(SAMPLE_RATE * release))
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        s = sum(h * math.sin(2 * math.pi * freq * (k + 1) * t) for k, h in enumerate(harmonics))
        if i < a:
            env = i / a
        elif i > n - r:
            env = max(0.0, (n - i) / r)
        else:
            env = 1.0
        out.append(s * env * volume)
    return out


def mix(*tracks):
    length = max(len(t) for t in tracks)
    return [sum(t[i] for t in tracks if i < len(t)) for i in range(length)]


def concat(*parts):
    out = []
    for p in parts:
        out.extend(p)
    return out


def save(name, samples):
    os.makedirs(OUT_DIR, exist_ok=True)
    peak = max(1e-9, max(abs(s) for s in samples))
    scale = 0.9 / peak if peak > 0.9 else 1.0
    path = os.path.join(OUT_DIR, name)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(b''.join(
            struct.pack('<h', int(max(-1.0, min(1.0, s * scale)) * 32767)) for s in samples
        ))
    print(f'gerado: {os.path.relpath(path)} ({len(samples) / SAMPLE_RATE:.2f}s)')


# ---------------------------------------------------------------- efeitos ---

def button_click():
    random.seed(1)
    n = int(SAMPLE_RATE * 0.04)
    return [
        (random.uniform(-1, 1) * 0.3 + math.sin(2 * math.pi * 1800 * i / SAMPLE_RATE))
        * math.exp(-i / (SAMPLE_RATE * 0.006)) * 0.6
        for i in range(n)
    ]


def new_case():
    return concat(
        tone(NOTE['E4'], 0.18, 0.45),
        tone(NOTE['A4'], 0.45, 0.45, release=0.3),
    )


def accusation():
    hit = tone(NOTE['A2'], 0.9, 0.7, attack=0.005, release=0.7, harmonics=(1.0, 0.6, 0.4, 0.2))
    stab = concat(silence(0.05), tone(NOTE['F4'], 0.35, 0.25, release=0.25),
                  tone(NOTE['E4'], 0.5, 0.25, release=0.4))
    return mix(hit, stab)


def victory():
    return concat(
        tone(NOTE['C4'], 0.14, 0.4), tone(NOTE['E4'], 0.14, 0.4),
        tone(NOTE['G4'], 0.14, 0.4),
        mix(tone(NOTE['C5'], 0.8, 0.4, release=0.6), tone(NOTE['E5'], 0.8, 0.2, release=0.6),
            tone(NOTE['G5'], 0.8, 0.15, release=0.6)),
    )


def defeat():
    return concat(
        tone(NOTE['G4'], 0.3, 0.4), tone(NOTE['F4'], 0.3, 0.4),
        tone(NOTE['D4'], 0.3, 0.4),
        mix(tone(NOTE['B3'], 1.0, 0.4, release=0.8), tone(NOTE['D3'], 1.0, 0.3, release=0.8)),
    )


# ----------------------------------------------------------------- música ---
# Loops de 8 compassos curtos: todas as notas terminam em silêncio, então o
# arquivo pode repetir sem estalo no ponto de emenda.

def arpeggio_loop(chords, note_len, bass_volume=0.25, arp_volume=0.12):
    out = []
    for chord in chords:
        bar_len = note_len * len(chord)
        bass = tone(NOTE[chord[0]] / 2, bar_len, bass_volume, attack=0.05, release=0.2,
                    harmonics=(1.0, 0.2))
        arp = concat(*[tone(NOTE[n], note_len, arp_volume, attack=0.01, release=note_len * 0.7)
                       for n in chord])
        out.extend(mix(bass, arp))
    return out


def main_theme():
    # Am - F - C - E: clima noir, calmo
    chords = [['A3', 'C4', 'E4', 'C4'], ['F3', 'A3', 'C4', 'A3'],
              ['C4', 'E4', 'G4', 'E4'], ['E3', 'G3', 'B3', 'G3']] * 2
    return arpeggio_loop(chords, 0.25)


def investigation():
    # pulso grave e tenso, mais lento
    chords = [['A3', 'A3', 'C4', 'A3'], ['A3', 'A3', 'D4', 'A3'],
              ['F3', 'F3', 'C4', 'F3'], ['E3', 'E3', 'B3', 'E3']] * 2
    return arpeggio_loop(chords, 0.25, bass_volume=0.3, arp_volume=0.1)


if __name__ == '__main__':
    save('button_click.wav', button_click())
    save('new_case.wav', new_case())
    save('accusation.wav', accusation())
    save('victory.wav', victory())
    save('defeat.wav', defeat())
    save('music_main_theme.wav', main_theme())
    save('music_investigation.wav', investigation())
