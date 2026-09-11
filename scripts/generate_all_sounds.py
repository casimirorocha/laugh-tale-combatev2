#!/usr/bin/env python3
import os
import math
import struct
import random
import subprocess
import wave

SAMPLE_RATE = 44100
random.seed(42)

def clamp(v, low=-1.0, high=1.0):
    return max(low, min(high, v))

def create_wav_file(filename, samples):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        int_samples = []
        for s in samples:
            val = clamp(s)
            int_samples.append(int(val * 32767.0))
        data = struct.pack('<' + 'h' * len(int_samples), *int_samples)
        wav_file.writeframes(data)

def convert_to_mp3(wav_path, mp3_path):
    os.makedirs(os.path.dirname(mp3_path), exist_ok=True)
    cmd = [
        'ffmpeg', '-y',
        '-i', wav_path,
        '-codec:a', 'libmp3lame',
        '-b:a', '192k',
        mp3_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def copy_file(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(src, 'rb') as fsrc, open(dst, 'wb') as fdst:
        fdst.write(fsrc.read())

def env_adsr(t, a, d, s, r, dur):
    if t < 0 or t > dur:
        return 0.0
    if t < a:
        return t / max(0.0001, a)
    elif t < a + d:
        p = (t - a) / max(0.0001, d)
        return 1.0 - (1.0 - s) * p
    elif t < dur - r:
        return s
    else:
        p = (t - (dur - r)) / max(0.0001, r)
        return s * (1.0 - p)

def sin_osc(freq, t):
    return math.sin(2.0 * math.pi * freq * t)

def saw_osc(freq, t):
    p = (freq * t) % 1.0
    return 2.0 * p - 1.0

def square_osc(freq, t, duty=0.5):
    p = (freq * t) % 1.0
    return 1.0 if p < duty else -1.0

def triangle_osc(freq, t):
    p = (freq * t) % 1.0
    return 4.0 * abs(p - 0.5) - 1.0

def noise():
    return random.uniform(-1.0, 1.0)

# Note frequencies (Hz) with dynamic lookup fallback to prevent KeyErrors
class NoteFreqsDict(dict):
    def __missing__(self, key):
        bases = {
            'C': 16.35, 'C#': 17.32, 'Db': 17.32, 'D': 18.35, 'D#': 19.45, 'Eb': 19.45, 
            'E': 20.60, 'F': 21.83, 'F#': 23.12, 'Gb': 23.12, 'G': 24.50, 'G#': 25.96, 
            'Ab': 25.96, 'A': 27.50, 'A#': 29.14, 'Bb': 29.14, 'B': 30.87
        }
        try:
            if len(key) >= 3:
                name = key[:2]
                octave = int(key[2:])
            elif len(key) == 2:
                name = key[:1]
                octave = int(key[1:])
            else:
                return 440.0
            base_f = bases.get(name, 27.50)
            return base_f * (2 ** octave)
        except Exception:
            return 440.0

NOTE_FREQS = NoteFreqsDict({
    'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98
})

def brass_note(freq, t, dur):
    # Rich brass harmonic mixture (saw + triangle + subtle sub)
    if t < 0 or t > dur:
        return 0.0
    amp = env_adsr(t, 0.04, 0.12, 0.75, 0.15, dur)
    # Filter envelope simulation: more bright harmonics at start
    bright = math.exp(-t * 3.5)
    s1 = saw_osc(freq, t) * (0.6 + 0.3 * bright)
    s2 = saw_osc(freq * 1.003, t) * 0.3
    t1 = triangle_osc(freq, t) * 0.4
    octave = saw_osc(freq * 2.0, t) * (0.2 + 0.25 * bright)
    return amp * (s1 + s2 + t1 + octave) * 0.45

def string_note(freq, t, dur):
    if t < 0 or t > dur:
        return 0.0
    amp = env_adsr(t, 0.1, 0.2, 0.8, 0.25, dur)
    # Chorused detuned saws for lush orchestral string sound
    w1 = saw_osc(freq * 0.998, t)
    w2 = saw_osc(freq * 1.002, t)
    w3 = triangle_osc(freq, t) * 0.5
    return amp * (w1 + w2 + w3) * 0.25

def bass_note(freq, t, dur):
    if t < 0 or t > dur:
        return 0.0
    amp = env_adsr(t, 0.02, 0.08, 0.7, 0.1, dur)
    sub = sin_osc(freq, t) * 0.7
    punch = square_osc(freq, t, 0.4) * 0.3 * math.exp(-t * 8.0)
    body = triangle_osc(freq * 2.0, t) * 0.3
    return amp * (sub + punch + body) * 0.5

def drum_kick(t):
    if t < 0 or t > 0.4:
        return 0.0
    f = 140.0 * math.exp(-t * 28.0) + 45.0
    amp = math.exp(-t * 12.0)
    click = noise() * math.exp(-t * 90.0) * 0.3
    return (sin_osc(f, t) + click) * amp * 0.75

def drum_snare(t):
    if t < 0 or t > 0.3:
        return 0.0
    tone = sin_osc(180.0 * math.exp(-t * 20.0), t) * math.exp(-t * 15.0) * 0.5
    snare_noise = noise() * math.exp(-t * 10.0) * 0.6
    return (tone + snare_noise) * 0.55

def drum_hihat(t, open_hat=False):
    dur = 0.25 if open_hat else 0.06
    if t < 0 or t > dur:
        return 0.0
    decay = 12.0 if open_hat else 45.0
    # High-pitched metallic noise
    h = (noise() * 0.7 + square_osc(8400.0, t) * 0.3) * math.exp(-t * decay)
    return h * 0.25

# -------------------------------------------------------------
# 1. BATTLE MUSIC GENERATORS
# -------------------------------------------------------------

def generate_overtaken(duration=18.0):
    """
    Overtaken (One Piece Battle Theme)
    Iconic heroic pirate battle march with brass fanfare, marching snares, and timpani.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    bpm = 122.0
    beat_sec = 60.0 / bpm

    # Melody motif (Brass): D4, F4, G4, A4, G4, F4, D4...
    # (start_beat, note, dur_beats)
    melody = [
        (0.0, 'D4', 1.0), (1.0, 'F4', 1.0), (2.0, 'G4', 1.0), (3.0, 'A4', 1.5),
        (4.5, 'G4', 0.5), (5.0, 'F4', 1.0), (6.0, 'D4', 2.0),
        (8.0, 'D4', 1.0), (9.0, 'F4', 1.0), (10.0, 'G4', 1.0), (11.0, 'A4', 1.0),
        (12.0, 'C5', 1.0), (13.0, 'D5', 2.0), (15.0, 'C5', 1.0),
        (16.0, 'D5', 2.0), (18.0, 'A4', 1.5), (19.5, 'G4', 0.5), (20.0, 'F4', 1.0),
        (21.0, 'G4', 1.0), (22.0, 'A4', 2.0),
        (24.0, 'D4', 0.5), (24.5, 'D4', 0.5), (25.0, 'F4', 1.0), (26.0, 'A4', 1.0),
        (27.0, 'D5', 2.5), (30.0, 'C5', 1.0), (31.0, 'D5', 3.0)
    ]

    # Chords / Bass progression (D minor, Bb Major, C Major, D minor)
    chords = [
        (0.0, ['D3', 'F3', 'A3', 'D2'], 8.0),
        (8.0, ['Bb2', 'D3', 'F3', 'Bb2'], 8.0),
        (16.0, ['C3', 'E3', 'G3', 'C2'], 8.0),
        (24.0, ['D3', 'F3', 'A3', 'D2'], 12.0)
    ]

    total_beats = int(duration / beat_sec)

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        cur_beat = t / beat_sec
        val = 0.0

        # Melody
        for m_beat, m_note, m_dur in melody:
            t_start = m_beat * beat_sec
            t_dur = m_dur * beat_sec
            if t_start <= t <= t_start + t_dur + 0.2:
                freq = NOTE_FREQS[m_note]
                val += brass_note(freq, t - t_start, t_dur)
                # Octave reinforcement on heroic brass
                val += brass_note(freq * 2.0, t - t_start, t_dur) * 0.35

        # Chords & String pads
        for c_beat, chord_notes, c_dur in chords:
            t_start = c_beat * beat_sec
            t_dur = c_dur * beat_sec
            if t_start <= t <= t_start + t_dur:
                for cn in chord_notes:
                    if '2' in cn:
                        val += bass_note(NOTE_FREQS[cn], t - t_start, t_dur) * 0.6
                    else:
                        val += string_note(NOTE_FREQS[cn], t - t_start, t_dur) * 0.4

        # Marching drums
        beat_idx = int(cur_beat)
        t_in_beat = (cur_beat - beat_idx) * beat_sec
        # Kick on 1 and 3
        if beat_idx % 2 == 0:
            val += drum_kick(t_in_beat)
        # Snare on 2 and 4, plus military snare rolls
        if beat_idx % 2 == 1:
            val += drum_snare(t_in_beat)
        # Hihat marching sixteenths
        sub_beat = (cur_beat * 4.0) % 1.0
        val += drum_hihat(sub_beat * (beat_sec / 4.0)) * 0.5

        samples[i] = val * 0.85

    return samples

def generate_very_strongest(duration=16.0):
    """
    The Very Very Very Strongest
    Epic slow, monumental orchestral tension theme with soaring brass and thunderous percussion.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    bpm = 88.0
    beat_sec = 60.0 / bpm

    # C minor / G minor epic crescendo
    melody = [
        (0.0, 'G3', 2.0), (2.0, 'C4', 2.0), (4.0, 'Eb4', 1.5), (5.5, 'D4', 0.5),
        (6.0, 'C4', 2.0), (8.0, 'G4', 3.0), (11.0, 'F4', 1.0),
        (12.0, 'Eb4', 2.0), (14.0, 'D4', 1.0), (15.0, 'Eb4', 1.0), (16.0, 'C4', 3.0),
        (19.0, 'G4', 1.0), (20.0, 'C5', 3.0), (23.0, 'Bb4', 1.0), (24.0, 'C5', 4.0)
    ]

    chords = [
        (0.0, ['C2', 'G2', 'Eb3', 'G3'], 8.0),
        (8.0, ['Ab2', 'Eb3', 'Ab3', 'C4'], 8.0),
        (16.0, ['Bb2', 'F3', 'Bb3', 'D4'], 8.0)
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        cur_beat = t / beat_sec
        val = 0.0

        for m_beat, m_note, m_dur in melody:
            t_start = m_beat * beat_sec
            t_dur = m_dur * beat_sec
            if t_start <= t <= t_start + t_dur + 0.3:
                freq = NOTE_FREQS[m_note]
                val += brass_note(freq, t - t_start, t_dur) * 1.1
                val += string_note(freq * 0.5, t - t_start, t_dur) * 0.4

        for c_beat, chord_notes, c_dur in chords:
            t_start = c_beat * beat_sec
            t_dur = c_dur * beat_sec
            if t_start <= t <= t_start + t_dur:
                for cn in chord_notes:
                    if '2' in cn:
                        val += bass_note(NOTE_FREQS[cn], t - t_start, t_dur) * 0.7
                    else:
                        val += string_note(NOTE_FREQS[cn], t - t_start, t_dur) * 0.5

        # Dramatic heavy orchestral hits on beat 0, 4, 8, 12, 16, 20
        beat_idx = int(cur_beat)
        t_in_beat = (cur_beat - beat_idx) * beat_sec
        if beat_idx % 4 == 0:
            val += drum_kick(t_in_beat) * 1.3
            # Low brass sub-rumble
            val += sin_osc(55.0, t) * math.exp(-t_in_beat * 4.0) * 0.4
        if beat_idx % 4 == 2:
            val += drum_snare(t_in_beat) * 0.8

        samples[i] = val * 0.85

    return samples

def generate_fierce_attack(duration=15.0):
    """
    Luffy's Fierce Attack
    High-BPM 150 BPM blistering combat rhythms, rapid staccato leads, drive bass.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    bpm = 152.0
    beat_sec = 60.0 / bpm

    melody = [
        (0.0, 'E4', 0.5), (0.5, 'E4', 0.5), (1.0, 'G4', 0.5), (1.5, 'A4', 0.5),
        (2.0, 'B4', 1.0), (3.0, 'A4', 0.5), (3.5, 'G4', 0.5),
        (4.0, 'E4', 1.0), (5.0, 'D4', 0.5), (5.5, 'E4', 0.5), (6.0, 'G4', 2.0),
        (8.0, 'E4', 0.5), (8.5, 'E4', 0.5), (9.0, 'G4', 0.5), (9.5, 'A4', 0.5),
        (10.0, 'C5', 1.0), (11.0, 'B4', 0.5), (11.5, 'A4', 0.5),
        (12.0, 'B4', 1.5), (13.5, 'A4', 0.5), (14.0, 'G4', 0.5), (14.5, 'F#4', 0.5),
        (15.0, 'E4', 2.5),
        (18.0, 'E5', 1.0), (19.0, 'D5', 0.5), (19.5, 'C5', 0.5), (20.0, 'B4', 1.0),
        (21.0, 'A4', 1.0), (22.0, 'G4', 1.0), (23.0, 'F#4', 1.0), (24.0, 'E4', 3.0)
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        cur_beat = t / beat_sec
        val = 0.0

        # Fast punchy synth lead
        for m_beat, m_note, m_dur in melody:
            t_start = m_beat * beat_sec
            t_dur = m_dur * beat_sec
            if t_start <= t <= t_start + t_dur + 0.1:
                freq = NOTE_FREQS[m_note]
                lead = saw_osc(freq, t) * env_adsr(t - t_start, 0.01, 0.05, 0.7, 0.05, t_dur)
                val += lead * 0.6
                val += square_osc(freq * 1.002, t, 0.3) * 0.3 * env_adsr(t - t_start, 0.01, 0.05, 0.7, 0.05, t_dur)

        # Driving eighth-note rock/synth bass
        eighth_idx = int(cur_beat * 2.0)
        t_eighth = (cur_beat * 2.0 - eighth_idx) * (beat_sec / 2.0)
        bass_freq = NOTE_FREQS['E2'] if (eighth_idx // 16) % 2 == 0 else NOTE_FREQS['G2']
        val += bass_note(bass_freq, t_eighth, beat_sec / 2.0) * 0.65

        # Relentless kick & snare
        beat_idx = int(cur_beat)
        t_in_beat = (cur_beat - beat_idx) * beat_sec
        val += drum_kick(t_in_beat) * 0.8
        if beat_idx % 2 == 1:
            val += drum_snare(t_in_beat) * 0.9

        # Hihat driving sixteenths
        sub_beat = (cur_beat * 4.0) % 1.0
        val += drum_hihat(sub_beat * (beat_sec / 4.0)) * 0.4

        samples[i] = val * 0.85

    return samples

def generate_gear5(duration=16.0):
    """
    Drums of Liberation (Gear 5 Joy Boy)
    Heartbeat rhythm (THUMP-thump-thump), joyous carnival whistle/chimes, triumphant funky bounce.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    bpm = 118.0
    beat_sec = 60.0 / bpm

    # Playful bouncy pentatonic theme
    melody = [
        (0.0, 'G4', 0.5), (0.75, 'A4', 0.5), (1.5, 'C5', 1.0), (3.0, 'D5', 0.5),
        (3.75, 'C5', 0.5), (4.5, 'A4', 0.75), (5.5, 'G4', 1.0),
        (7.0, 'A4', 0.5), (7.75, 'C5', 0.5), (8.5, 'D5', 1.0), (10.0, 'E5', 1.5),
        (12.0, 'G5', 1.0), (13.5, 'E5', 0.5), (14.25, 'D5', 0.5), (15.0, 'C5', 2.0),
        (18.0, 'A4', 0.5), (19.0, 'C5', 0.5), (20.0, 'D5', 1.0), (21.5, 'G5', 1.5),
        (23.5, 'E5', 1.0), (25.0, 'D5', 0.5), (25.5, 'C5', 0.5), (26.0, 'C5', 3.0)
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        cur_beat = t / beat_sec
        val = 0.0

        # Whimsical brass/flute melody
        for m_beat, m_note, m_dur in melody:
            t_start = m_beat * beat_sec
            t_dur = m_dur * beat_sec
            if t_start <= t <= t_start + t_dur + 0.15:
                freq = NOTE_FREQS[m_note]
                # Funky playful horn + whistle
                horn = brass_note(freq, t - t_start, t_dur) * 0.7
                whistle = sin_osc(freq * 2.0, t) * env_adsr(t - t_start, 0.02, 0.1, 0.5, 0.1, t_dur) * 0.35
                val += horn + whistle

        # Characteristic "Drums of Liberation" heartbeat pattern:
        # Pattern per 2 beats: [0.0 (accent kick), 0.66 (mid kick), 1.0 (accent kick), 1.66 (mid kick)]
        two_beat = cur_beat % 2.0
        # Syncopated groove
        for hit_pos in [0.0, 0.66, 1.0, 1.66]:
            dt = (two_beat - hit_pos) * beat_sec
            if 0.0 <= dt < 0.4:
                val += drum_kick(dt) * (1.1 if hit_pos in [0.0, 1.0] else 0.7)

        # Snare / Handclaps on upbeat
        beat_idx = int(cur_beat)
        t_in_beat = (cur_beat - beat_idx) * beat_sec
        if beat_idx % 2 == 1:
            val += drum_snare(t_in_beat) * 0.75

        # Upbeat carnival chimes
        if cur_beat % 1.0 > 0.5 and cur_beat % 1.0 < 0.7:
            val += triangle_osc(2093.0, t) * 0.25 * math.exp(-((cur_beat % 1.0) - 0.5) * 15.0)

        # Bouncy bass
        b_idx = int(cur_beat)
        b_t = (cur_beat - b_idx) * beat_sec
        val += bass_note(NOTE_FREQS['C2'], b_t, beat_sec) * 0.5

        samples[i] = val * 0.85

    return samples

def generate_three_admirals(duration=16.0):
    """
    The Three Admirals
    Regal, dark, imposing marine justice brass march with heavy bass strings.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    bpm = 105.0
    beat_sec = 60.0 / bpm

    melody = [
        (0.0, 'B3', 1.0), (1.0, 'D4', 1.0), (2.0, 'F#4', 1.5), (3.5, 'E4', 0.5),
        (4.0, 'D4', 1.0), (5.0, 'C#4', 1.0), (6.0, 'B3', 2.0),
        (8.0, 'F#4', 1.0), (9.0, 'A4', 1.0), (10.0, 'B4', 2.0),
        (12.0, 'C5', 1.5), (13.5, 'B4', 0.5), (14.0, 'A4', 1.0), (15.0, 'F#4', 1.0),
        (16.0, 'G4', 1.5), (17.5, 'F#4', 0.5), (18.0, 'E4', 1.0), (19.0, 'D4', 1.0),
        (20.0, 'C#4', 2.0), (22.0, 'B3', 4.0)
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        cur_beat = t / beat_sec
        val = 0.0

        for m_beat, m_note, m_dur in melody:
            t_start = m_beat * beat_sec
            t_dur = m_dur * beat_sec
            if t_start <= t <= t_start + t_dur + 0.2:
                freq = NOTE_FREQS[m_note]
                val += brass_note(freq, t - t_start, t_dur) * 1.0
                val += saw_osc(freq * 0.5, t) * env_adsr(t - t_start, 0.05, 0.1, 0.6, 0.1, t_dur) * 0.4

        # Imposing low B minor drone
        val += bass_note(NOTE_FREQS['B2'], t % beat_sec, beat_sec) * 0.6
        val += string_note(NOTE_FREQS['F#3'], t % (beat_sec * 4.0), beat_sec * 4.0) * 0.35

        # Strict military snare
        beat_idx = int(cur_beat)
        t_in_beat = (cur_beat - beat_idx) * beat_sec
        val += drum_kick(t_in_beat) * 0.9
        if beat_idx % 2 == 1:
            val += drum_snare(t_in_beat) * 1.0

        samples[i] = val * 0.85

    return samples

# -------------------------------------------------------------
# 2. VICTORY FANFARES GENERATORS
# -------------------------------------------------------------

def generate_victory_fanfare(duration=6.0):
    """
    Classic arcade trumpet victory fanfare with sparkling celebration finish.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples

    # Fanfare arpeggio: G4 -> C5 -> E5 -> G5 -> C6 hold
    notes = [
        (0.0, 'G4', 0.2), (0.2, 'C5', 0.2), (0.4, 'E5', 0.2), (0.6, 'G5', 0.4),
        (1.0, 'E5', 0.2), (1.2, 'G5', 0.8),
        (2.0, 'A5', 0.3), (2.3, 'B5', 0.3), (2.6, 'C6', 2.8)
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0

        for n_start, n_name, n_dur in notes:
            if n_start <= t <= n_start + n_dur + 0.2:
                freq = NOTE_FREQS[n_name]
                val += brass_note(freq, t - n_start, n_dur) * 1.1
                val += brass_note(freq * 0.5, t - n_start, n_dur) * 0.4

        # Grand major chord backing on finale (C Major: C3, G3, C4, E4)
        if t >= 2.6:
            c_t = t - 2.6
            val += string_note(NOTE_FREQS['C4'], c_t, 3.2) * 0.5
            val += string_note(NOTE_FREQS['E4'], c_t, 3.2) * 0.4
            val += string_note(NOTE_FREQS['G4'], c_t, 3.2) * 0.4
            val += bass_note(NOTE_FREQS['C2'], c_t, 3.2) * 0.6
            # Sparkle chimes
            val += sin_osc(3135.96, t) * math.exp(-c_t * 1.5) * 0.3

        # Timpani / Cymbal
        if 0.0 <= t < 0.4:
            val += drum_kick(t)
        if 2.6 <= t < 3.2:
            val += drum_kick(t - 2.6) * 1.2
            val += drum_hihat(t - 2.6, open_hat=True) * 0.8

        samples[i] = val * 0.9

    return samples

def generate_victory_heroic(duration=6.0):
    """
    Heroic triumphant ascending chord fanfare.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples

    notes = [
        (0.0, 'D4', 0.25), (0.25, 'F#4', 0.25), (0.5, 'A4', 0.3),
        (0.9, 'A4', 0.2), (1.1, 'B4', 0.2), (1.3, 'C#5', 0.3),
        (1.7, 'D5', 0.8), (2.6, 'C#5', 0.3), (2.9, 'B4', 0.3), (3.2, 'A4', 0.4),
        (3.7, 'D5', 2.2)
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0

        for n_start, n_name, n_dur in notes:
            if n_start <= t <= n_start + n_dur + 0.2:
                freq = NOTE_FREQS[n_name]
                val += brass_note(freq, t - n_start, n_dur) * 1.2

        if t >= 3.7:
            c_t = t - 3.7
            val += string_note(NOTE_FREQS['D4'], c_t, 2.2) * 0.5
            val += string_note(NOTE_FREQS['F#4'], c_t, 2.2) * 0.4
            val += bass_note(NOTE_FREQS['D2'], c_t, 2.2) * 0.7
            val += drum_hihat(c_t, open_hat=True) * 0.7

        samples[i] = val * 0.9

    return samples

def generate_victory_drums(duration=6.0):
    """
    Celebratory festival pirate drumming with triumphant horn blasts.
    """
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples

    drum_hits = [
        0.0, 0.2, 0.4, 0.6, 0.75, 0.9, 1.05, 1.2, 1.35, 1.5,
        1.7, 1.85, 2.0, 2.15, 2.3, 2.45, 2.6
    ]

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0

        # Drum crescendo roll
        for dh in drum_hits:
            dt = t - dh
            if 0.0 <= dt < 0.2:
                vol = 0.4 + (dh / 2.6) * 0.7
                val += drum_kick(dt) * vol
                if dh >= 1.5:
                    val += drum_snare(dt) * vol * 0.6

        # Big celebratory horn burst on 2.6
        if t >= 2.6:
            c_t = t - 2.6
            val += brass_note(NOTE_FREQS['G4'], c_t, 3.2) * 0.7
            val += brass_note(NOTE_FREQS['B4'], c_t, 3.2) * 0.6
            val += brass_note(NOTE_FREQS['D5'], c_t, 3.2) * 0.8
            val += brass_note(NOTE_FREQS['G5'], c_t, 3.2) * 0.9
            val += drum_kick(c_t) * 1.5
            val += drum_hihat(c_t, open_hat=True)

        samples[i] = val * 0.9

    return samples

# -------------------------------------------------------------
# 3. STAGE AMBIENT SFX GENERATORS
# -------------------------------------------------------------

def generate_ice_crack():
    dur = 1.4
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    # Multiple sharp crystalline crackles
    cracks = [0.0, 0.08, 0.14, 0.22, 0.35]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for c in cracks:
            dt = t - c
            if 0.0 <= dt < 0.3:
                # High resonant snap
                snap = (noise() * 0.7 + saw_osc(3800.0, dt) * 0.3) * math.exp(-dt * 40.0)
                # Resonant sub crack
                sub = sin_osc(300.0 * math.exp(-dt * 15.0), dt) * math.exp(-dt * 20.0)
                val += (snap + sub * 0.5)
        # Cavernous cold reverb tail
        if t > 0.2:
            val += noise() * 0.08 * math.exp(-(t - 0.2) * 2.5) * sin_osc(1200.0, t)
        samples[i] = val * 0.8
    return samples

def generate_water_splash():
    dur = 1.8
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Heavy low thud impact
        impact = sin_osc(90.0 * math.exp(-t * 12.0), t) * math.exp(-t * 10.0) * 0.8
        # Foaming water noise spray
        foam = noise() * math.exp(-t * 3.0) * 0.5
        # Water droplets bubbling
        bubble1 = sin_osc(800.0 + 400.0 * math.sin(t * 50.0), t) * math.exp(-t * 4.0) * 0.25
        samples[i] = (impact + foam + bubble1) * 0.85
    return samples

def generate_wind_howl():
    dur = 3.2
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Dynamic howling frequency modulation
        freq = 320.0 + 180.0 * math.sin(t * 1.8) + 60.0 * math.sin(t * 4.5)
        n = noise() * 0.6
        # Resonant sine modulation creating wind resonance
        howl = sin_osc(freq, t) * (0.5 + 0.5 * math.sin(t * 2.2)) * math.sin(math.pi * (t / dur))
        samples[i] = (howl * 0.65 + n * 0.25 * math.sin(math.pi * (t / dur))) * 0.8
    return samples

def generate_thunder_rumble():
    dur = 3.5
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Sub bass rumble 40-90Hz
        f1 = 55.0 + 20.0 * math.sin(t * 3.0)
        f2 = 75.0 + 15.0 * math.cos(t * 4.0)
        sub = (sin_osc(f1, t) + 0.5 * sin_osc(f2, t)) * math.exp(-t * 0.7)
        # Distant low crackle
        crackle = noise() * math.exp(-t * 1.5) * 0.3 * (1.0 + 0.5 * math.sin(t * 12.0))
        samples[i] = (sub * 0.7 + crackle * 0.3) * 0.95
    return samples

def generate_lightning_strike():
    dur = 2.2
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        # Piercing initial high-voltage zap (0 to 0.15s)
        if t < 0.15:
            zap = (noise() * 0.7 + saw_osc(4500.0, t) * 0.5) * math.exp(-t * 30.0)
            val += zap * 1.2
        # Massive thunder concussion
        if t >= 0.03:
            t_th = t - 0.03
            boom = sin_osc(60.0 * math.exp(-t_th * 3.0), t) * math.exp(-t_th * 1.8) * 0.9
            val += boom
        samples[i] = val * 0.9
    return samples

def generate_roof_debris():
    dur = 1.6
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    hits = [0.0, 0.08, 0.15, 0.24, 0.38, 0.52, 0.68, 0.85, 1.05]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for h in hits:
            dt = t - h
            if 0.0 <= dt < 0.2:
                # Ceramic clatter tone
                tile = square_osc(850.0 + random.uniform(-100, 100), dt) * math.exp(-dt * 35.0) * 0.3
                thud = sin_osc(140.0, dt) * math.exp(-dt * 25.0) * 0.4
                val += tile + thud
        samples[i] = val * 0.75
    return samples

def generate_cyber_pulse():
    dur = 2.0
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Sweeping futuristic filter (400 -> 2400 -> 600 Hz)
        sweep = 600.0 + 1800.0 * math.sin(math.pi * (t / dur))
        pulse = saw_osc(sweep, t) * math.sin(math.pi * (t / dur)) * 0.5
        hum = square_osc(120.0, t, 0.3) * 0.3 * math.sin(math.pi * (t / dur))
        samples[i] = (pulse + hum) * 0.75
    return samples

def generate_hologram_glitch():
    dur = 1.2
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        step = int(t * 24.0)
        freq = 800.0 + (step * 337) % 2400
        blip = square_osc(freq, t) * math.exp(-(t % (1.0/24.0)) * 50.0) * 0.5
        glitch = (noise() if (step % 3 == 0) else 0.0) * 0.3
        samples[i] = (blip + glitch) * math.exp(-t * 1.5) * 0.8
    return samples

def generate_robot_hum():
    dur = 3.0
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Dual servo frequency
        f1 = 110.0 + 5.0 * math.sin(t * 8.0)
        f2 = 330.0 + 10.0 * math.cos(t * 6.0)
        s = (saw_osc(f1, t) * 0.5 + triangle_osc(f2, t) * 0.4) * math.sin(math.pi * (t / dur))
        samples[i] = s * 0.7
    return samples

def generate_ancient_echo():
    dur = 3.5
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    bell_freqs = [440.0, 884.0, 1326.0, 1768.0]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for idx, bf in enumerate(bell_freqs):
            decay = 1.0 + idx * 0.8
            val += sin_osc(bf, t) * math.exp(-t * decay) * (0.5 / (idx + 1))
        # Reverb echoes at 0.5s, 1.0s, 1.5s
        for echo_t, echo_vol in [(0.5, 0.35), (1.0, 0.2), (1.5, 0.1)]:
            if t > echo_t:
                val += sin_osc(440.0, t) * math.exp(-(t - echo_t) * 1.5) * echo_vol
        samples[i] = val * 0.85
    return samples

def generate_gold_shimmer():
    dur = 2.2
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    chimes = [1046.5, 1318.5, 1568.0, 2093.0, 2637.0, 3136.0]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for idx, cf in enumerate(chimes):
            t_start = idx * 0.12
            if t >= t_start:
                dt = t - t_start
                val += sin_osc(cf, t) * math.exp(-dt * 3.5) * 0.25
        samples[i] = val * 0.85
    return samples

def generate_distant_waves():
    dur = 3.8
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Surf sweep
        swell = math.sin(math.pi * (t / dur)) ** 2
        f = 250.0 + 400.0 * swell
        n = noise() * swell * 0.5
        tone = sin_osc(f, t) * swell * 0.3
        samples[i] = (n + tone) * 0.75
    return samples

def generate_candy_crunch():
    dur = 0.8
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    snaps = [0.0, 0.04, 0.09, 0.16]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for s in snaps:
            dt = t - s
            if 0.0 <= dt < 0.15:
                val += (noise() * 0.8 + saw_osc(2800.0, dt) * 0.4) * math.exp(-dt * 45.0)
        samples[i] = val * 0.85
    return samples

def generate_homie_giggle():
    dur = 1.4
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    # Whimsical bounce chirps
    chirps = [
        (0.0, 659.25), (0.15, 880.0), (0.3, 1174.66), (0.45, 880.0),
        (0.65, 1174.66), (0.8, 1318.51)
    ]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for c_t, c_f in chirps:
            dt = t - c_t
            if 0.0 <= dt < 0.15:
                val += sin_osc(c_f, t) * math.exp(-dt * 20.0) * 0.4
                val += triangle_osc(c_f * 2.0, t) * math.exp(-dt * 25.0) * 0.2
        samples[i] = val * 0.85
    return samples

def generate_syrup_bubble():
    dur = 1.0
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    bubbles = [0.0, 0.2, 0.45, 0.7]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for b_t in bubbles:
            dt = t - b_t
            if 0.0 <= dt < 0.25:
                # Rising frequency bubble chirp
                bf = 300.0 + 800.0 * (dt / 0.25)
                val += sin_osc(bf, dt) * math.exp(-dt * 15.0) * 0.5
        samples[i] = val * 0.85
    return samples

# -------------------------------------------------------------
# 4. COMBAT & UI SFX GENERATORS
# -------------------------------------------------------------

def generate_clash():
    dur = 1.2
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Metallic blade ring (disharmonic high sines)
        m1 = sin_osc(1850.0, t) * 0.4
        m2 = sin_osc(2750.0, t) * 0.3
        m3 = sin_osc(4120.0, t) * 0.2
        metal = (m1 + m2 + m3) * math.exp(-t * 6.0)
        # Visceral punch impact burst
        punch = sin_osc(120.0 * math.exp(-t * 20.0), t) * math.exp(-t * 12.0) * 0.8
        # Black lightning static crackle
        static = noise() * math.exp(-t * 15.0) * 0.5
        samples[i] = (metal + punch + static) * 0.85
    return samples

def generate_hit():
    dur = 0.6
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Heavy visceral punch impact
        f = 160.0 * math.exp(-t * 25.0) + 40.0
        thump = sin_osc(f, t) * math.exp(-t * 14.0) * 0.85
        click = noise() * math.exp(-t * 60.0) * 0.4
        samples[i] = (thump + click) * 0.9
    return samples

def generate_select():
    dur = 0.25
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Arcade two-tone blip (E5 -> A5)
        f = 659.25 if t < 0.08 else 880.0
        dt = t if t < 0.08 else t - 0.08
        s = square_osc(f, t, 0.4) * math.exp(-dt * 25.0) * 0.5
        samples[i] = s * 0.8
    return samples

def generate_ko():
    dur = 2.5
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Seismic sub impact (70Hz falling to 30Hz)
        f = 70.0 * math.exp(-t * 2.0)
        sub = sin_osc(f, t) * math.exp(-t * 1.5) * 0.9
        # Dramatic gong ring (220Hz + 440Hz + 660Hz)
        gong = (sin_osc(220.0, t) * 0.5 + sin_osc(440.0, t) * 0.3) * math.exp(-t * 1.8)
        # White noise explosion burst
        burst = noise() * math.exp(-t * 18.0) * 0.6
        samples[i] = (sub + gong + burst) * 0.9
    return samples

def generate_match_victory():
    dur = 2.0
    num_samples = int(SAMPLE_RATE * dur)
    samples = [0.0] * num_samples
    chimes = [(0.0, 523.25), (0.15, 659.25), (0.3, 783.99), (0.45, 1046.5)]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for c_t, c_f in chimes:
            dt = t - c_t
            if 0.0 <= dt < 1.5:
                val += sin_osc(c_f, t) * math.exp(-dt * 3.0) * 0.35
                val += triangle_osc(c_f * 2.0, t) * math.exp(-dt * 4.0) * 0.15
        samples[i] = val * 0.85
    return samples

# -------------------------------------------------------------
# MAIN BUILD SCRIPT
# -------------------------------------------------------------

def main():
    print("=== Starting Smart AI Audio & MP3 Generation ===")
    
    # Destination directories (both in src/audio and public/audio)
    target_dirs = [
        ('src/audio/music', 'public/audio/music', 'music'),
        ('src/audio/sfx', 'public/audio/sfx', 'sfx')
    ]
    for s_dir, p_dir, _ in target_dirs:
        os.makedirs(s_dir, exist_ok=True)
        os.makedirs(p_dir, exist_ok=True)

    tmp_dir = '/tmp/audio_gen'
    os.makedirs(tmp_dir, exist_ok=True)

    tasks = [
        # Battle Themes
        ('music', 'overtaken', generate_overtaken),
        ('music', 'very_strongest', generate_very_strongest),
        ('music', 'fierce_attack', generate_fierce_attack),
        ('music', 'gear5', generate_gear5),
        ('music', 'three_admirals', generate_three_admirals),

        # Victory Fanfares
        ('music', 'victory_fanfare', generate_victory_fanfare),
        ('music', 'victory_heroic', generate_victory_heroic),
        ('music', 'victory_drums', generate_victory_drums),

        # Stage Ambients
        ('sfx', 'ice_crack', generate_ice_crack),
        ('sfx', 'water_splash', generate_water_splash),
        ('sfx', 'wind_howl', generate_wind_howl),
        ('sfx', 'thunder_rumble', generate_thunder_rumble),
        ('sfx', 'lightning_strike', generate_lightning_strike),
        ('sfx', 'roof_debris', generate_roof_debris),
        ('sfx', 'cyber_pulse', generate_cyber_pulse),
        ('sfx', 'hologram_glitch', generate_hologram_glitch),
        ('sfx', 'robot_hum', generate_robot_hum),
        ('sfx', 'ancient_echo', generate_ancient_echo),
        ('sfx', 'gold_shimmer', generate_gold_shimmer),
        ('sfx', 'distant_waves', generate_distant_waves),
        ('sfx', 'candy_crunch', generate_candy_crunch),
        ('sfx', 'homie_giggle', generate_homie_giggle),
        ('sfx', 'syrup_bubble', generate_syrup_bubble),

        # Combat & UI SFX
        ('sfx', 'clash', generate_clash),
        ('sfx', 'hit', generate_hit),
        ('sfx', 'select', generate_select),
        ('sfx', 'ko', generate_ko),
        ('sfx', 'match_victory', generate_match_victory),
    ]

    total = len(tasks)
    print(f"Generating {total} audio assets into .mp3 and .wav formats...")

    for idx, (category, name, generator_fn) in enumerate(tasks, 1):
        print(f"[{idx}/{total}] Generating {category}/{name} ...")
        samples = generator_fn()
        tmp_wav = os.path.join(tmp_dir, f"{name}.wav")
        tmp_mp3 = os.path.join(tmp_dir, f"{name}.mp3")

        # 1. Create temporary WAV
        create_wav_file(tmp_wav, samples)
        # 2. Encode to high-quality 192k MP3 with ffmpeg
        convert_to_mp3(tmp_wav, tmp_mp3)

        # 3. Copy to destination folders (both src/audio and public/audio)
        for base in ['src/audio', 'public/audio']:
            dest_cat = os.path.join(base, category)
            # copy both .mp3 and .wav
            copy_file(tmp_mp3, os.path.join(dest_cat, f"{name}.mp3"))
            copy_file(tmp_wav, os.path.join(dest_cat, f"{name}.wav"))

    print("=== Successfully Generated ALL Missing Audio (.mp3 and .wav) Assets! ===")

if __name__ == '__main__':
    main()
