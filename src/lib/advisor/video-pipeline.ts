import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface VideoPipelineResult {
  transcript: string;
  frames: string[];       // base64-encoded JPEG strings
  duration: number;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'unknown';
  error?: string;
}

function detectPlatform(url: string): VideoPipelineResult['platform'] {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  return 'unknown';
}

export async function processVideoUrl(url: string): Promise<VideoPipelineResult> {
  const platform = detectPlatform(url);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'victor-'));

  try {
    const videoPath = path.join(tmpDir, 'video.mp4');
    await execAsync(
      `yt-dlp -f "best[height<=720]" -o "${videoPath}" "${url}" --no-playlist --max-filesize 100m`,
      { timeout: 60000 }
    );

    if (!fs.existsSync(videoPath)) {
      throw new Error('Video download failed or file not found');
    }

    const { stdout: probeOut } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`
    );
    const duration = parseFloat(probeOut.trim()) || 0;

    const framesDir = path.join(tmpDir, 'frames');
    fs.mkdirSync(framesDir);
    const frameInterval = Math.max(2, Math.floor(duration / 15));

    await execAsync(
      `ffmpeg -i "${videoPath}" -vf "fps=1/${frameInterval},scale=720:-1" -frames:v 15 "${framesDir}/frame_%03d.jpg" -y`,
      { timeout: 30000 }
    );

    const frameFiles = fs.readdirSync(framesDir)
      .filter(f => f.endsWith('.jpg'))
      .sort()
      .slice(0, 10); // cap at 10 frames for Claude vision token cost

    const frames = frameFiles.map(f =>
      fs.readFileSync(path.join(framesDir, f)).toString('base64')
    );

    let transcript = '';
    try {
      const audioPath = path.join(tmpDir, 'audio.mp3');
      await execAsync(`ffmpeg -i "${videoPath}" -vn -ar 16000 -ac 1 -b:a 64k "${audioPath}" -y`);
      const { stdout } = await execAsync(
        `python3 -c "import whisper; m=whisper.load_model('base'); r=m.transcribe('${audioPath}'); print(r['text'])"`,
        { timeout: 120000 }
      );
      transcript = stdout.trim();
    } catch {
      transcript = '[Audio transcription not available]';
    }

    return { transcript, frames, duration, platform };
  } catch (error) {
    return {
      transcript: '',
      frames: [],
      duration: 0,
      platform,
      error: error instanceof Error ? error.message : 'Unknown pipeline error',
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
