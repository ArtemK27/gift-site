import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const sampleRate = 44100;
const totalDuration = 147; // 2 minutes 27 seconds (matches track length 2:27 / 147s)
const totalSamples = sampleRate * totalDuration;

const notes = [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 246.94];
const noteInterval = 0.45; // 450ms
const noteDuration = 0.32; // 320ms sounding, slight gentle overlap/tail

// Stereo 16-bit signed PCM buffer
const numChannels = 2;
const buffer = Buffer.alloc(totalSamples * numChannels * 2);

let sampleIdx = 0;
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  
  // Which note index are we in?
  const currentNoteIdx = Math.floor(t / noteInterval);
  const tNote = t - currentNoteIdx * noteInterval;
  
  let leftSample = 0;
  let rightSample = 0;

  // Render current note if active
  if (tNote < noteDuration) {
    const freq = notes[currentNoteIdx % notes.length];
    
    // Triangle wave
    const phase = (tNote * freq) % 1;
    const triangle = 4 * Math.abs(phase - 0.5) - 1;
    
    // Sub-octave gentle bass for warmth (0.5 * freq)
    const subPhase = (tNote * (freq * 0.5)) % 1;
    const subTriangle = 4 * Math.abs(subPhase - 0.5) - 1;

    // Exponential decay (envelope mimicking Web Audio ramp)
    // 0 to 0.005s attack, then exponential decay over noteDuration
    let env = 0;
    if (tNote < 0.006) {
      env = tNote / 0.006;
    } else {
      env = Math.exp(-10.5 * (tNote - 0.006));
    }

    const sound = (triangle * 0.75 + subTriangle * 0.25) * env * 0.45;

    // Subtle stereo ping-pong based on note index
    const pan = ((currentNoteIdx % 8) - 3.5) / 5; // -0.7 to +0.7
    leftSample += sound * (0.5 - pan * 0.3);
    rightSample += sound * (0.5 + pan * 0.3);
  }

  // Also include previous note tail for seamless delay/echo resonance
  if (currentNoteIdx > 0) {
    const prevNoteIdx = currentNoteIdx - 1;
    const tPrevNote = t - prevNoteIdx * noteInterval;
    if (tPrevNote < 0.6) {
      const prevFreq = notes[prevNoteIdx % notes.length];
      const prevPhase = (tPrevNote * prevFreq) % 1;
      const prevTri = 4 * Math.abs(prevPhase - 0.5) - 1;
      const echoEnv = Math.exp(-8 * tPrevNote) * 0.12;
      const echoSound = prevTri * echoEnv;
      leftSample += echoSound * 0.4;
      rightSample += echoSound * 0.4;
    }
  }

  // Soft clip / clamp
  const clamp = (val) => Math.max(-1, Math.min(1, val));
  const intLeft = Math.round(clamp(leftSample) * 32767);
  const intRight = Math.round(clamp(rightSample) * 32767);

  buffer.writeInt16LE(intLeft, sampleIdx);
  buffer.writeInt16LE(intRight, sampleIdx + 2);
  sampleIdx += 4;
}

// Write temp PCM raw file
const rawPath = join(process.cwd(), 'scripts', 'temp_synth.raw');
writeFileSync(rawPath, buffer);

// Convert with ffmpeg to high-quality MP3
const outMp3 = join(process.cwd(), 'public', 'assets', 'audio', 'viperr-heavy-metal.mp3');
console.log('Encoding MP3 with ffmpeg to', outMp3);

const ffmpegCmd = [
  'ffmpeg', '-y',
  '-f', 's16le',
  '-ar', '44100',
  '-ac', '2',
  '-i', `"${rawPath}"`,
  '-c:a', 'libmp3lame',
  '-b:a', '256k',
  `"${outMp3}"`
].join(' ');

execSync(ffmpegCmd, { stdio: 'inherit' });
console.log('Successfully generated original synth audio:', outMp3);
