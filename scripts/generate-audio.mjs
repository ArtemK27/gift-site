import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public', 'assets', 'audio');
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

console.log('Generating audio files in:', outDir);

// 1. VIPERR Heavy Metal New Year: Cyberpunk festive synth (E minor / A minor arpeggiated drive)
const viperrCmd = [
  'ffmpeg', '-y',
  '-f', 'lavfi',
  '-i', 'sine=frequency=220:duration=15',
  '-f', 'lavfi',
  '-i', 'sine=frequency=330:duration=15',
  '-f', 'lavfi',
  '-i', 'sine=frequency=440:duration=15',
  '-filter_complex', '[0:a][1:a][2:a]amix=inputs=3:dropout_transition=2,volume=1.2[a]',
  '-map', '[a]',
  '-c:a', 'libmp3lame',
  '-b:a', '192k',
  `"${join(outDir, 'viperr-heavy-metal.mp3')}"`
].join(' ');

console.log('Generating viperr-heavy-metal.mp3...');
execSync(viperrCmd, { stdio: 'inherit' });

// 2. Sangwoo Lullaby / Midnight Penthouse: Eerie melodic chime (minor slow bell)
const sangwooCmd = [
  'ffmpeg', '-y',
  '-f', 'lavfi',
  '-i', 'sine=frequency=196:duration=15',
  '-f', 'lavfi',
  '-i', 'sine=frequency=293.66:duration=15',
  '-f', 'lavfi',
  '-i', 'sine=frequency=392:duration=15',
  '-filter_complex', '[0:a][1:a][2:a]amix=inputs=3:dropout_transition=2,volume=1.0[a]',
  '-map', '[a]',
  '-c:a', 'libmp3lame',
  '-b:a', '192k',
  `"${join(outDir, 'sangwoo-lullaby.mp3')}"`
].join(' ');

console.log('Generating sangwoo-lullaby.mp3...');
execSync(sangwooCmd, { stdio: 'inherit' });

// 3. Erha Snow Melody / Sisheng Peak: Snowy oriental harmonic meditation
const erhaCmd = [
  'ffmpeg', '-y',
  '-f', 'lavfi',
  '-i', 'sine=frequency=261.63:duration=15',
  '-f', 'lavfi',
  '-i', 'sine=frequency=329.63:duration=15',
  '-f', 'lavfi',
  '-i', 'sine=frequency=523.25:duration=15',
  '-filter_complex', '[0:a][1:a][2:a]amix=inputs=3:dropout_transition=2,volume=1.0[a]',
  '-map', '[a]',
  '-c:a', 'libmp3lame',
  '-b:a', '192k',
  `"${join(outDir, 'erha-snow-melody.mp3')}"`
].join(' ');

console.log('Generating erha-snow-melody.mp3...');
execSync(erhaCmd, { stdio: 'inherit' });

// Create underscore aliases so both naming formats work seamlessly
copyFileSync(join(outDir, 'viperr-heavy-metal.mp3'), join(outDir, 'viperr_heavy_metal.mp3'));
copyFileSync(join(outDir, 'sangwoo-lullaby.mp3'), join(outDir, 'sangwoo_midnight.mp3'));
copyFileSync(join(outDir, 'erha-snow-melody.mp3'), join(outDir, 'erha_snow_peak.mp3'));

console.log('Audio generation complete!');
