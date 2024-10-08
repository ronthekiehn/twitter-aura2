<script lang="ts">
  import { onMount } from 'svelte';

  export let username;
  export let profileImageUrl;
  export let bannerImageUrl;
  export let palette;
  export let score;

  let canvas: HTMLCanvasElement;
  let downloadLink: HTMLAnchorElement;

  onMount(async () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context');
      return;
    }
    const cardWidth = 600;
    const cardHeight = 400;

    // Set canvas size
    canvas.width = cardWidth;
    canvas.height = cardHeight;

    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Draw banner
    if (bannerImageUrl) {
      const bannerImage = await loadImage(bannerImageUrl);
      ctx.drawImage(bannerImage, 0, 0, cardWidth, 150);
    }

    // Draw profile image
    const profileImage = await loadImage(profileImageUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(75, 175, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profileImage, 25, 125, 100, 100);
    ctx.restore();

    // Draw username
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`@${username}`, 150, 175);

    // Draw palette
    palette.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(150 + index * 60, 200, 50, 50);
    });

    // Draw score
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`Beauty Score: ${score.toFixed(2)}`, 150, 280);

    // Generate download link
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = `${username}_twitter_analysis.png`;
  });

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
</script>

<div class="user-card">
  <canvas bind:this={canvas}></canvas>
  <a bind:this={downloadLink} class="download-button">Download Card</a>
</div>

<style>
  .user-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  canvas {
    max-width: 100%;
    height: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .download-button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #1da1f2;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
  }
</style>