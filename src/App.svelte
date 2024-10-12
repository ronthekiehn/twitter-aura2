<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import TwitterInput from './lib/TwitterInput.svelte';
  import ColorPalette from './lib/ColorPalette.svelte';
  import TwitterShareButton from './lib/TwitterShareButton.svelte';
  import pfp from './assets/rawnypfp.jpg';
  import html2canvas from 'html2canvas';

  let username = '';
  interface User {
    username: string;
    profileImageUrl: string;
    bannerImageUrl: string;
    profileColor: string[];
    bannerColor: string[];
    score: number;
    analysis: string;
  }
  
  let currentUser: User | null = null;
  let recentAnalyses = [];
  let error = '';
  let loading = false;
  let resultDiv: HTMLElement | null = null; // Reference to the result div



  onMount(async () => {
    try {
      await getRecentAnalyses();
    } catch (err) {
      error = 'Failed to fetch recent analyses';
    }
  });

  async function getRecentAnalyses() {
    try {
      const response = await fetch('/api/getRecent');
      if (!response.ok) {
        throw new Error('Failed to fetch recent analyses');
      }
      recentAnalyses = await response.json();
      console.log(recentAnalyses);
    } catch (err) {
      error = err.message;
    }
  }

  async function handleSubmit() {
    loading = true;
    error = '';
    try {
      const response = await fetch(`/api/analyze?username=${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

    const data = await response.json();
    currentUser = {
      username: data.username,
      profileImageUrl: data.profileImageUrl,
       bannerImageUrl: data.bannerImageUrl,
      profileColor: data.profileColor,
      bannerColor: data.bannerColor,
      score: data.beautyScore,
      analysis: data.analysis,
    };

     //for testing purposes
     //await new Promise(resolve => setTimeout(resolve, 100));
     //currentUser ={
     //  username: 'rrawnyy',
     //  profileImageUrl: 'https://pbs.twimg.com/profile_images/1841011343379288064/H4QWedNU_normal.jpg',
      // bannerImageUrl: 'https://pbs.twimg.com/profile_banners/1354987346614226948/1726819698',
     //  profileColor: ['#f0f0f0', '#333333', '#333333', '#333333', '#333333'],
     //  bannerColor: ['#f0f0f0', '#333333', '#333333', '#333333', '#333333'],
     //  score: 10,
     //  analysis: 'GoddessGoddessGoddessGoddessGoddessGoddess'
    //  }
     
      const bg = document.getElementById('background');
      if (bg) {
        bg.style.backgroundColor = currentUser.bannerColor[0];
        bg.style.opacity = '0.8';
      }
    } catch (err) {
      error = err.message;
      currentUser = null;
    } finally {
      loading = false;
    }
  }


async function handleShare() {
  if (!currentUser || !resultDiv) return;

  try {
    // Step 1: Capture the canvas
    const canvas = await html2canvas(resultDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Step 2: Convert canvas to PNG Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to generate PNG image');
    }

    // Step 3: Copy Blob to Clipboard
    const clipboardItem = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([clipboardItem]);
    console.log('Image copied to clipboard!');

    // Step 4: Open the tweet intent URL
    const tweetText = `Check out my Twitter Aura! Score: ${currentUser.score.toFixed(1)}/10 #TwitterAura`;


  } catch (err) {
  if (err.name === 'NotAllowedError' && err.message.includes('Document is not focused')) {
    console.warn('Clipboard warning (image may still have copied):', err);
  } else {
    console.error('Failed to generate or share image:', err);
    error = 'Failed to generate image for sharing';
  }
}
}


</script>

<main class="flex flex-col items-center justify-center min-h-screen text-center p-4 m-auto">
  <div class="fixed flex flex-col items-start top-2 left-2">
    <div class='flex items-center justify-center'>
      <span class="text-xs">made by</span>
      <img src={pfp} class="rounded-full border-2 border-black w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 mx-2" alt="pfp">
      <a class="font-bold underline text-xs" target="_blank" href="https://x.com/rrawnyy">@rrawnyy</a>
    </div>
    <div class='flex my-1 sm:my-2'>
      <span class="text-xs mr-2">inspired by</span>
      <a class="font-bold underline text-xs " target="_blank" href="https://www.auralized.com/">auralized dot com</a>
    </div>
    <div class='flex my-1 sm:my-2'>
      <span class="text-xs mr-2">view the</span>
      <a class="font-bold underline text-xs" target="_blank" href="https://github.com/ronthekiehn/twitter-aura2">code</a>
    </div>
      
  </div>
  

  <div id="background" class="fixed inset-0 -z-10 bg-cover bg-center" class:bg-white={currentUser}></div>
  
  {#if loading}
      <div class="fixed animate-spin text-3xl sm:text-4xl md:text-5xl origin-left">Loading</div>
  {/if}

  {#if currentUser === null && !loading}
    <div class="bg-white rounded-3xl shadow-lg border-4 border-black z-10 mb-24 md:p-12 p-8 flex flex-col items-center w-full h-full min-w-72 sm:max-w-md">
      <h1 class="text-xl sm:text-lg md:text-2xl mb-4 md:mb-8">WHAT COLOR IS YOUR AURA</h1>
      <TwitterInput bind:username on:submit={handleSubmit} />
    </div>  

    <h2 class="absolute bottom-48 md:bottom-72 text-md sm:text-xl font-bold mt-6 sm:mt-8">Recent Analyses</h2>
    <div class="flex absolute bottom-3 max-w-full overflow-auto no-scrollbar">
      {#each recentAnalyses as recentAnalysis}
        <div class="border-black border-4 shadow-md p-2 sm:p-4 md:p-6 my-2 flex flex-col items-center rounded-3xl mx-2 w-fit">
          <div class="flex items-center justify-center">
            <span class="mr-2 sm:mr-3 md:mr-4 text-sm sm:text-base">@{recentAnalysis.username}</span>
            <img class="rounded-full border-2 border-black w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" src={recentAnalysis.profileImageUrl} alt="Profile">
          </div>
          <span class="mb-2 text-sm sm:text-base">{recentAnalysis.beautyScore.toFixed(1)} / 10</span>
          <ColorPalette size={100} height={30} palette={recentAnalysis.profileColor} />
        </div>
      {/each}
    </div>
  {/if}
  
  {#if currentUser}
    <div bind:this={resultDiv} class="bg-white rounded-3xl shadow-lg border-4 border-black z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center transition duration-300 w-full max-w-xl lg:max-w-2xl" in:fade={{ delay: 100 }}>
      <div class="mb-4 sm:mb-6 flex flex-col items-center w-full">
        <img class="rounded-lg border-4 border-black mb-4 w-full" src={currentUser.bannerImageUrl} alt="Banner">
        <div class="flex flex-col sm:flex-row items-center p-2">
          <img class="rounded-full border-4 border-black mr-2 sm:mr-4 w-12 h-12 sm:w-16 sm:h-16 my-2" src={currentUser.profileImageUrl} alt="Profile">
          <span class="font-bold text-sm">@{currentUser.username}</span>
          <span class="mx-1 sm:mx-2 text-sm my-2">your aura gives</span>
          <span class="font-bold text-sm">{currentUser.analysis.toLowerCase()}</span>
        </div>
      </div>
      <span class="mb-1 sm:mb-2 text-sm sm:text-base">Beauty: {currentUser.score.toFixed(1)} / 10</span>
      <div class="flex flex-col sm:flex-row justify-between items-center">
        <div class="mb-3 sm:mb-0">
          <span class="mb-1 sm:mb-2 text-sm sm:text-base">PFP Palette</span>
          <ColorPalette size={250} height={75} palette={currentUser.profileColor} />
        </div>
        <div>
          <span class="mb-1 sm:mb-2 text-sm sm:text-base">Header Palette</span>
          <ColorPalette size={250} height={75} palette={currentUser.bannerColor} />
        </div>
      </div>
    </div>
    <div class="d-flex">
    <button class="mt-6 sm:mt-8 p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base"
     on:click={() => {
      currentUser = null;
      getRecentAnalyses();
      const bg = document.getElementById('background');
      if (bg) {
        bg.style.backgroundColor = 'white';
        bg.style.opacity = '1';
      }
    }}>
      Go Back
    </button>
    <TwitterShareButton currentUser={currentUser} disabled={!resultDiv} on:click={handleShare} />
    </div>
    
  {/if}
  
  {#if error}
    <p class="text-red-600 mt-4 text-sm sm:text-base">{error}</p>
  {/if}
</main>