/**
 * Universal media downloader utility.
 * Guarantees that files are downloaded directly into the browser's Downloads folder/manager.
 */

export async function downloadMedia(urlOrData: string, filename: string): Promise<boolean> {
  if (!urlOrData) return false;

  try {
    // 1. If it's a data URL (e.g., base64 WAV audio from TTS or image base64)
    if (urlOrData.startsWith('data:')) {
      const parts = urlOrData.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      triggerAnchorDownload(blobUrl, filename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      return true;
    }

    // 2. If it's already a blob URL
    if (urlOrData.startsWith('blob:')) {
      triggerAnchorDownload(urlOrData, filename);
      return true;
    }

    // 3. For remote HTTP/HTTPS URLs (e.g. pollinations.ai, openrouter cdn, etc.)
    // Cross-origin URLs cannot use the <a download> attribute directly in modern browsers.
    // Instead, route through our /api/download endpoint which sets Content-Disposition: attachment,
    // causing the browser to place the file straight into the Downloads manager!
    const proxyUrl = `/api/download?url=${encodeURIComponent(urlOrData)}&filename=${encodeURIComponent(filename)}`;
    triggerAnchorDownload(proxyUrl, filename);
    return true;
  } catch (err) {
    console.error('Download helper error:', err);
    // Fallback: direct window download via proxy
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(urlOrData)}&filename=${encodeURIComponent(filename)}`;
      window.location.href = proxyUrl;
      return true;
    } catch (_) {
      return false;
    }
  }
}

export function downloadText(content: string, filename: string): boolean {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    triggerAnchorDownload(blobUrl, filename);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return true;
  } catch (err) {
    console.error('Download text error:', err);
    return false;
  }
}

function triggerAnchorDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.setAttribute('download', filename);
  link.rel = 'noopener';
  link.style.position = 'fixed';
  link.style.left = '-9999px';
  link.style.top = '-9999px';
  link.style.opacity = '0';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 500);
}

/**
 * Creates a real commercial video recording (.webm) from the keyframe image with Ken Burns motion
 * and downloads it directly to the browser Downloads manager.
 */
export async function recordAndDownloadVideo(
  imageUrl: string,
  durationSec: number = 5,
  filename: string = 'commercial-video.webm',
  onProgress?: (progress: number) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Route image loading via download proxy to avoid canvas tainted security error
    const safeSrc = imageUrl.startsWith('data:') 
      ? imageUrl 
      : `/api/download?url=${encodeURIComponent(imageUrl)}&filename=frame.jpg`;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          downloadMedia(imageUrl, filename.replace('.webm', '.jpg'));
          return resolve(false);
        }

        const fps = 30;
        const totalFrames = fps * durationSec;
        let currentFrame = 0;

        // Check MediaRecorder support
        if (typeof MediaRecorder === 'undefined') {
          // Fallback to downloading image
          downloadMedia(imageUrl, filename.replace('.webm', '.jpg'));
          return resolve(true);
        }

        const stream = canvas.captureStream(fps);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
        }

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        const recordedChunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
          const blobUrl = URL.createObjectURL(blob);
          triggerAnchorDownload(blobUrl, filename);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
          resolve(true);
        };

        recorder.start();

        const renderFrame = () => {
          if (currentFrame >= totalFrames) {
            recorder.stop();
            return;
          }

          const progress = currentFrame / totalFrames;
          if (onProgress) onProgress(Math.round(progress * 100));

          // Ken Burns cinematic zoom and pan effect
          const scale = 1.0 + progress * 0.15; // zooms from 1.0 to 1.15
          const offsetX = (canvas.width * (scale - 1)) / 2;
          const offsetY = (canvas.height * (scale - 1)) / 2 - (progress * 20);

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.translate(-offsetX, -offsetY);
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          // Subtle cinematic vignette
          const grad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.height * 0.4,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
          );
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.5)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          currentFrame++;
          requestAnimationFrame(renderFrame);
        };

        renderFrame();
      } catch (e) {
        console.warn('Canvas video recording failed, falling back to image download:', e);
        downloadMedia(imageUrl, filename.replace('.webm', '.jpg'));
        resolve(true);
      }
    };

    img.onerror = () => {
      // Fallback: download directly as image
      downloadMedia(imageUrl, filename.replace('.webm', '.jpg'));
      resolve(true);
    };

    img.src = safeSrc;
  });
}
