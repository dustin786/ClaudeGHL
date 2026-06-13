import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import { ProcessedVideo, VideoMetadata } from '../../types';

// Point fluent-ffmpeg at the bundled binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export function probeVideo(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      const video = data.streams.find((s) => s.codec_type === 'video');
      resolve({
        duration: Math.round(data.format.duration ?? 0),
        width: video?.width ?? 0,
        height: video?.height ?? 0,
        codec: video?.codec_name ?? 'unknown',
        fps: eval(video?.r_frame_rate ?? '30/1') as number,
        fileSizeBytes: data.format.size ?? 0,
      });
    });
  });
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function processVideo(
  inputPath: string,
  jobId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputDir = config.storage.localProcessedPath;
    ensureDir(outputDir);
    const outputPath = path.join(outputDir, `${jobId}_processed.mp4`);

    const signatureExists = fs.existsSync(config.brand.signatureClipPath);
    const watermarkExists = fs.existsSync(config.brand.watermarkPath);

    logger.debug('Processing video', {
      inputPath,
      hasSignature: signatureExists,
      hasWatermark: watermarkExists,
    });

    let cmd = ffmpeg(inputPath);

    if (signatureExists && watermarkExists) {
      // Full pipeline: scale + watermark + concat signature ending
      cmd = cmd
        .input(config.brand.watermarkPath)
        .input(config.brand.signatureClipPath)
        .complexFilter([
          // Scale main video to 1080x1920, pad to fill
          '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[scaled_main]',
          // Scale signature clip the same way
          '[2:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[scaled_sig]',
          // Overlay watermark on main video (top-right, 10% width, 90% opacity)
          '[scaled_main][1:v]overlay=W-w-20:20:alpha=0.9[watermarked]',
          // Concat watermarked main + signature ending
          '[watermarked][0:a][scaled_sig][2:a]concat=n=2:v=1:a=1[outv][outa]',
        ])
        .outputOptions([
          '-map [outv]',
          '-map [outa]',
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart',
        ]);
    } else if (watermarkExists) {
      // Watermark only — no signature clip
      cmd = cmd
        .input(config.brand.watermarkPath)
        .complexFilter([
          '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[scaled]',
          '[scaled][1:v]overlay=W-w-20:20:alpha=0.9[outv]',
        ])
        .outputOptions([
          '-map [outv]',
          '-map 0:a',
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart',
        ]);
    } else {
      // Minimal — just scale/normalize
      cmd = cmd.outputOptions([
        '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart',
      ]);
    }

    cmd
      .output(outputPath)
      .on('start', (cmd) => logger.debug('FFmpeg started', { cmd }))
      .on('progress', (p) => logger.debug('FFmpeg progress', { percent: p.percent }))
      .on('end', () => {
        logger.info('Video processing complete', { outputPath });
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error('FFmpeg error', { error: err.message });
        reject(err);
      })
      .run();
  });
}

export function extractThumbnail(videoPath: string, jobId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputDir = config.storage.localProcessedPath;
    ensureDir(outputDir);
    const thumbPath = path.join(outputDir, `${jobId}_thumb.jpg`);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: path.basename(thumbPath),
        folder: outputDir,
        size: '1080x1920',
      })
      .on('end', () => resolve(thumbPath))
      .on('error', reject);
  });
}
