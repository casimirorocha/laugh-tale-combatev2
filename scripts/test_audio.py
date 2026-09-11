#!/usr/bin/env python3
import os
import math
import struct
import subprocess
import wave

SAMPLE_RATE = 44100

def create_wav_file(filename, samples):
    """Write mono 16-bit PCM WAV file."""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        int_samples = []
        for s in samples:
            val = max(-1.0, min(1.0, s))
            int_samples.append(int(val * 32767.0))
        data = struct.pack('<' + 'h' * len(int_samples), *int_samples)
        wav_file.writeframes(data)

def convert_to_mp3(wav_path, mp3_path):
    """Convert WAV to 192kbps MP3 using ffmpeg."""
    os.makedirs(os.path.dirname(mp3_path), exist_ok=True)
    cmd = [
        'ffmpeg', '-y',
        '-i', wav_path,
        '-codec:a', 'libmp3lame',
        '-b:a', '192k',
        mp3_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

# Math helpers
def envelope(t, attack, decay, sustain_level, release, duration):
    if t < attack:
        return t / max(0.001, attack)
    elif t < attack + decay:
        pct = (t - attack) / max(0.001, decay)
        return 1.0 - (1.0 - sustain_level) * pct
    elif t < duration - release:
        return sustain_level
    elif t < duration:
        pct = (t - (duration - release)) / max(0.001, release)
        return sustain_level * (1.0 - pct)
    return 0.0

def sin_wave(freq, t):
    return math.sin(2.0 * math.pi * freq * t)

def saw_wave(freq, t):
    phase = (freq * t) % 1.0
    return 2.0 * phase - 1.0

def square_wave(freq, t, duty=0.5):
    phase = (freq * t) % 1.0
    return 1.0 if phase < duty else -1.0

def noise():
    import random
    return random.uniform(-1.0, 1.0)

print("Audio synthesizer helpers ready.")
