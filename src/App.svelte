<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import TwitterInput from './lib/TwitterInput.svelte';
  import ColorPalette from './lib/ColorPalette.svelte';

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

  onMount(async () => {
    const response = await fetch('/api/getRecent');
    recentAnalyses = await response.json();
  });

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
      // await new Promise(resolve => setTimeout(resolve, 2000));
      // currentUser ={
      //   username: 'rrawnyy',
      //   profileImageUrl: 'https://pbs.twimg.com/profile_images/1841011343379288064/H4QWedNU_normal.jpg',
      //   bannerImageUrl: 'https://pbs.twimg.com/profile_banners/1354987346614226948/1726819698',
      //   profileColor: ['#f0f0f0', '#333333', '#333333', '#333333', '#333333'],
      //   bannerColor: ['#f0f0f0', '#333333', '#333333', '#333333', '#333333'],
      //   score: 10,
      //   analysis: 'Goddess'
      // }
     
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
</script>

<main class="flex items-center justify-center min-h-screen text-center p-4 m-auto">
  <div id="background" class="fixed inset-0 -z-10 bg-cover bg-center"></div>
  
  {#if loading}
      <div class="fixed animate-spin text-5xl origin-left">Loading</div>
  {/if}

  {#if currentUser === null && !loading}
    <div class="w-full flex-col">
      <h1 class="text-6xl mb-8">WHAT COLOR IS YOUR AURA</h1>
      <TwitterInput bind:username on:submit={handleSubmit} />
      <h2 class="text-2xl font-bold mt-8 mb-4">Recent Analyses</h2>
      <div>
        {#each recentAnalyses as recentAnalysis}
          <div class="border border-gray-300 p-4 my-4 flex-row items-center">
            <div class="flex">
              <span class="mr-4">{recentAnalysis.username}</span>
              <img class="rounded-full border-3 border-black mr-4" src={recentAnalysis.profileImageUrl} alt="Profile">
            </div>
            <ColorPalette size={100} height={30} palette={recentAnalysis.profileColor} />
          </div>
        {/each}
      </div>
      
    </div>
  {/if}
  
  {#if currentUser}
    <div class="bg-white rounded-3xl shadow-lg border-4 border-black z-10 p-8 flex flex-col items-center transition duration-300" transition:fade>
      <div class="mb-6 flex flex-col items-center">
        <img class="rounded-lg border-2 border-black mb-4 max-w-xl" src={currentUser.bannerImageUrl} alt="Banner">
        <div class="flex items-center justify-between p-2">
          <img class="rounded-full border-2 border-black mr-4" src={currentUser.profileImageUrl} alt="Profile">
          <span class="font-bold">@{currentUser.username}</span>
          <span class="mx-1"> your aura gives </span>
          <span class="font-bold">{currentUser.analysis.toLowerCase()}</span>
        </div>
      </div>
      <span class="mb-4">Beauty: {currentUser.score.toFixed(1)} / 10</span>
      <div class="flex w-full justify-between items-center">
        <div>
          <span class="mb-2">PFP Palette</span>
          <ColorPalette palette={currentUser.profileColor} />
        </div>
        <div>
          <span class="mb-2">Header Palette</span>
          <ColorPalette palette={currentUser.bannerColor} />
        </div>
      </div>
    </div>
  {/if}
  
  {#if error}
    <p class="text-red-600 mt-4">{error}</p>
  {/if}
</main>