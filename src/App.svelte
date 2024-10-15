<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import TwitterInput from './lib/TwitterInput.svelte';
  import ColorPalette from './lib/ColorPalette.svelte';
  import TwitterShareButton from './lib/TwitterShareButton.svelte';
  import Leaderboard from './lib/Leaderboard.svelte';
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

  let copied = 0;
  let ranking = '';
  let showLeaderboard = false;
  let currentUser: User | null = null;
  let recentAnalyses = [];
  let error = '';
  let loading = false;
  let resultDiv: HTMLElement | null = null;

  let showCodes = false;
  let showGenerativeAIInfo = false;
  let saveNotification = '';

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

  // New made up ranking function
  function scoreToPercentile(score, totalUsers) {
    const total = totalUsers;
    const ranges = [
      { min: 9, max: 10, count: 4000, basePercentile: 0.968 }, // 96.8th percentile and above
      { min: 8, max: 9, count: 54000, basePercentile: 0.536 }, // 53.6 to 96.8th percentile
      { min: 7, max: 8, count: 25000, basePercentile: 0.336 }, // 33.6 to 53.6th percentile
      { min: 6, max: 7, count: 22000, basePercentile: 0.16 },  // 16 to 33.6th percentile
      { min: 5, max: 6, count: 14000, basePercentile: 0.048 }, // 4.8 to 16th percentile
      { min: 4, max: 5, count: 2000, basePercentile: 0.032 },  // 3.2 to 4.8th percentile
      { min: 0, max: 4, count: 6000, basePercentile: 0 }       // 0 to 3.2nd percentile
    ];

    for (let range of ranges) {
      if (score >= range.min && score <= range.max) {
        const scoreFraction = (score - range.min) / (range.max - range.min);
        const percentile = 1 - (range.basePercentile + (scoreFraction * (range.count / total)));
        return (percentile * 100).toFixed(2);
      }
    }

    return "Invalid score";
  }

  async function handleSubmit() {
    showGenerativeAIInfo = false;
    
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

      //For testing purposes
      // await new Promise(resolve => setTimeout(resolve, 100));
      // currentUser = {
      //   username: 'rrawnyy',
      //   profileImageUrl: 'https://pbs.twimg.com/profile_images/1841011343379288064/H4QWedNU_normal.jpg',
      //   bannerImageUrl: 'https://pbs.twimg.com/profile_banners/1354987346614226948/1726819698',
      //   profileColor: ['#f0f0f0', '#333333', '#f0f0f0', '#333333','#f0f0f0', '#333333','#f0f0f0', '#333333','#f0f0f0', '#333333','#f0f0f0', '#333333',],
      //   bannerColor: ['#f0f0f0', '#333333', '#333333', '#333333', '#333333'],
      //   score: 10,
      //   analysis: 'GoddessGoddessGoddessGoddessGoddessGoddess'
      // }

      const leaderboardResponse = await fetch('/api/getTop100');
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        const userRank = leaderboardData.top100.findIndex(user => user.username === currentUser.username) + 1;
        if (userRank) {
          ranking = `#${userRank}`;
        } else {
          ranking = `Top ${scoreToPercentile(currentUser.score, leaderboardData.totalUsers)}%`;
        }
      }
     
      const bg = document.getElementById('background');
      if (bg) {
        if (currentUser.bannerColor) {
          bg.style.backgroundColor = currentUser.bannerColor[0];
        } else {
          bg.style.backgroundColor = currentUser.profileColor[0];
        }
        bg.style.opacity = '0.8';
      }
    } catch (err) {
      console.error('Failed to analyze user:', err);
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

    // Step 2: Try to copy to clipboard (will work on desktop)
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });

      if (!blob) {
        throw new Error('Failed to generate PNG image');
      }

      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);
      copied = 1;
      console.log('Image copied to clipboard');
    } catch (clipboardError) {
      console.warn('Clipboard write failed, opening image in new tab:', clipboardError);
      
      // Fallback: Open canvas in new tab
      const imageUrl = canvas.toDataURL('image/png');
      const newTab = window.open();
      if (newTab) {
        copied = 2;
        newTab.document.write('<img src="' + imageUrl + '" alt="Shared Image"/>');
        newTab.document.close();
        console.log('Image opened in new tab');
      } else {
        console.error('Failed to open new tab. Pop-ups might be blocked.');
        error = 'Failed to open image. Please allow pop-ups and try again.';
      }
    }

  } catch (err) {
    console.error('Failed to generate or share image:', err);
    error = 'Failed to generate image for sharing';
  }
}

  function toggleColorCodes() {
    showCodes = !showCodes;
  }

  async function copyPalettes() {
    if (!currentUser) return;
    // check for colours
    const profileColors = currentUser.profileColor.join('\n');
    const bannerColors = currentUser.bannerColor ? currentUser.bannerColor.join('\n') : 'No banner colors';
    const content = `Profile Colors:\n${profileColors}\n\nBanner Colors:\n${bannerColors}`;
    // export to clipboard
    try {
      await navigator.clipboard.writeText(content);
      saveNotification = 'Palettes copied to clipboard!';
    } catch (err) {
      console.error('Failed to copy palettes:', err);
      saveNotification = 'Failed to copy palettes. Please try again.';
    }

    setTimeout(() => {
      saveNotification = '';
    }, 3000);
  }
</script>

<main class="flex flex-col items-center justify-end min-h-screen text-center p-4 m-auto">
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
      <span class="text-xs mr-2">this project uses</span>
      <button class="font-bold underline text-xs"
        on:click={() => showGenerativeAIInfo = !showGenerativeAIInfo}
      >
        generative ai
      </button>
    </div>

    {#if showGenerativeAIInfo}
      <div class="fixed md:relative z-50 border-gray-300 border-2 text-left p-0 md:p-2 rounded bg-white">
        {#if window.innerWidth < 768}
        <button class="text-xs text-red-500 underline" on:click={() => showGenerativeAIInfo = false}>Close</button>
      {/if}
      <li class="list-none text-xs z-50">this project uses google gemini to generate a description of your aura.</li>
      <li class="list-none text-xs">only the palette colors are sent to gemini, not your banner, profile picture, or any other profile information</li>
      <li class="list-none text-xs">if you have any questions, dm me on twitter or put an issue on github</li>
      <li class="list-none text-xs">feel free to view the code as well</li>
      </div>
    {/if}

    <div class='flex my-1 sm:my-2'>
      <span class="text-xs mr-2">view the</span>
      <a class="font-bold underline text-xs" target="_blank" href="https://github.com/ronthekiehn/twitter-aura2">code</a>
    </div>

    <div class='flex my-1 sm:my-2'>
      <span class="text-xs mr-2">consider</span>
      <a class="font-bold underline text-xs mr-2" target="_blank" href="https://buymeacoffee.com/ronthekiehn">donating</a>
      <span class="text-xs">to pay my vercel bills</span>
    </div>
  </div>
  
  <div id="background" class="fixed inset-0 -z-10 bg-cover bg-center" class:bg-white={currentUser}></div>
  
  {#if loading}
    <div class="fixed inset-1/2 animate-spin text-3xl sm:text-4xl md:text-5xl origin-left">Loading</div>
  {/if}

  {#if currentUser === null && !loading}
    <div class="bg-white rounded-3xl shadow-lg border-4 border-black z-10 md:p-12 p-8 flex flex-col items-center w-full h-full min-w-72 sm:max-w-md">
      <h1 class="text-lg md:text-2xl">WHAT COLOR IS YOUR AURA</h1>
      <TwitterInput bind:username on:submit={handleSubmit} />
    </div>  

    <button
      class="my-1 md:my-4 p-1 md:p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm md:text-base hover:shadow-lg hover:translate-y-[-2px]"
      on:click={() => showLeaderboard = !showLeaderboard}
    >
      {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
    </button>

    {#if showLeaderboard}
      <Leaderboard />
    {:else}
      <h2 class="text-sm md:text-base font-bold">Recent Analyses</h2>
      <div class="my-1 flex max-w-full overflow-auto no-scrollbar">
        {#each recentAnalyses as recentAnalysis}
          <div class="border-black border-4 shadow-md p-2 sm:p-4 md:p-6 my-2 flex flex-col items-center rounded-3xl mx-2 w-fit">
            <div class="flex items-center justify-center">
              <span class="mr-2 sm:mr-3 md:mr-4 text-xs md:text-base">@{recentAnalysis.username}</span>
              <img class="rounded-full border-2 border-black w-8 h-8 md:w-12 md:h-12" src={recentAnalysis.profileImageUrl} alt="Profile">
            </div>
            <span class="mb-2 text-sm md:text-base">{recentAnalysis.beautyScore.toFixed(3)} / 10</span>
            <ColorPalette size={100} height={30} palette={recentAnalysis.profileColor} {showCodes} />
          </div>
        {/each}
      </div>
    {/if}
  {/if}
  
  {#if currentUser}
    <div bind:this={resultDiv} class="bg-white rounded-3xl shadow-lg border-4 border-black z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center transition duration-300 w-full max-w-xl lg:max-w-2xl" in:fade={{ delay: 100 }}>
      <div class="mb-2 flex flex-col items-center w-full">
        <img class="rounded-lg border-4 border-black mb-4 w-full" src={currentUser.bannerImageUrl} alt="Banner">
        <div class="flex flex-col sm:flex-row items-center p-2">
          <img class="rounded-full border-4 border-black mr-2 sm:mr-4 w-12 h-12 sm:w-16 sm:h-16 my-2" src={currentUser.profileImageUrl} alt="Profile">
          <span class="font-bold text-sm">@{currentUser.username}</span>
          <span class="mx-1 sm:mx-2 text-sm my-2">your aura gives</span>
          <span class="font-bold text-sm">{currentUser.analysis.toLowerCase()}</span>
        </div>
      </div>
      <span class="mb-1 sm:mb-2 text-sm md:text-base">Beauty: {currentUser.score.toFixed(3)} / 10</span>
      <span class="mb-1 sm:mb-2 text-sm md:text-base">Ranking: {ranking}</span>
      <div class="flex flex-col sm:flex-row mt-2 justify-between items-center">
        <div class="mb-3 sm:mb-0">
          <span class="mb-1 sm:mb-2 text-sm md:text-base">PFP Palette</span>
          <ColorPalette size={250} height={80} palette={currentUser.profileColor} {showCodes} />
        </div>
        {#if currentUser.bannerColor}
          <div>
            <span class="mb-1 sm:mb-2 text-sm md:text-base">Header Palette</span>
            <ColorPalette size={250} height={80} palette={currentUser.bannerColor} {showCodes} />
          </div>
        {/if}
      </div>
    </div>

    <div class="flex space-x-2 mt-2 md:mt-4">
      <button 
        on:click={toggleColorCodes} 
        class="p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base hover:shadow-lg hover:translate-y-[-2px]"
      >
        {showCodes ? 'Hide' : 'Show'} Color Codes
      </button>
      <button 
        on:click={copyPalettes} 
        class="p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base hover:shadow-lg hover:translate-y-[-2px]"
      >
        Copy Palettes
      </button>
    </div>
    {#if saveNotification}
      <div class="mt-2 text-green-600" transition:fade>
        {saveNotification}
      </div>
    {/if}
    <div class="flex space-x-2 mt-2 md:mt-4">
      <button class="p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-red-400 transition-colors text-sm sm:text-base hover:shadow-lg hover:translate-y-[-2px]"
        on:click={() => {
          currentUser = null;
          copied = 0;
          error = '';
          resultDiv = null;
          getRecentAnalyses();
          ranking = '';
          showCodes = false;
          const bg = document.getElementById('background');
          if (bg) {
            bg.style.backgroundColor = 'white';
            bg.style.opacity = '1';
          }
        }}>
        Go Back
      </button>
      <TwitterShareButton disabled={!resultDiv} {copied} on:click={handleShare} />
      <button class="p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-yellow-400 transition-colors text-sm sm:text-base hover:shadow-lg hover:translate-y-[-2px]"
        on:click={() => window.open('https://buymeacoffee.com/ronthekiehn', '_blank')}
      >
        Donate
      </button>
    </div>
  {/if}
  
  {#if error}
    <p class="text-red-600 mt-4 text-sm md:text-base">{error}</p>
  {/if}
</main>
