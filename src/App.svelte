<script lang="ts">
  import { onMount } from 'svelte';
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

  onMount(async () => {
    const response = await fetch('/api/getRecent');
    recentAnalyses = await response.json();
  });

  async function handleSubmit() {
    try {
      const response = await fetch(`/api/analyze?username=${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const data = await response.json();
      currentUser = {
        username: data.screen_name,
        profileImageUrl: data.profileImageUrl,
        bannerImageUrl: data.bannerImageUrl,
        profileColor: data.profileColor,
        bannerColor: data.bannerColor,
        score: data.beautyScore,
        analysis: data.analysis,
      };
     
      const bg = document.getElementById('background');
      if (bg) {
        bg.style.zIndex = '0';
        bg.style.backgroundColor = currentUser.profileColor[0];
        bg.style.opacity = '0.8';
      }
    } catch (err) {
      error = err.message;
      currentUser = null;
    }
  }
</script>

<main>
  <div id="background"></div>
  {#if currentUser === null}
    <h1>Twitter Profile Analyzer</h1>
    <TwitterInput bind:username on:submit={handleSubmit} />
  {/if}
  
  {#if currentUser}
    <div class='card'>
      <div class="images">
        <img class="banner" src={currentUser.bannerImageUrl} alt="">
        <div class="info">
          <img class="pfp" src={currentUser.profileImageUrl} alt="">
            <span style="font-weight: bold;">@{currentUser.username}</span>
            <span>&nbsp;your aura gives&nbsp;</span>
            <span style="font-weight: bold;">{currentUser.analysis}</span>
        </div>
      </div>
      <span>Beauty: {currentUser.score.toFixed(1)} / 10</span>
      <div class="palettes">
        <div class="palet">
          <span>PFP Palette</span>
          <ColorPalette palette={currentUser.profileColor} />
        </div>
        <div class="palet">
          <span>Header Palette</span>
          <ColorPalette palette={currentUser.bannerColor} />
        </div>
      </div>
    </div>
    
  {/if}
  
  {#if currentUser === null}
  <h2>Recent Analyses</h2>
  {#each recentAnalyses as recentAnalysis}
    <div class="recent-analysis">
      <span>{recentAnalysis.username}</span>
      <img class="pfp" src={recentAnalysis.profileImageUrl} alt="">
      <ColorPalette palette={recentAnalysis.profileColor} />
    </div>
  {/each}
  {/if}
  
  {#if error}
    <p>{error}</p>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 800px;
    margin: 0 auto;
  }

  #background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-size: cover;
    background-position: center;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  .recent-analysis {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px 0;
  }

  .pfp {
    border: 3px solid #000;
    border-radius: 50%;
  } 
  .banner{
    border: 3px solid #000;
    border-radius: 10px;
    max-width: 650px;
    margin-bottom: 10px;
  }

  .info{
    display: flex;
    padding: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .card{
    position: relative;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 30px;
    box-shadow: 0 0px 20px rgba(255, 255, 255, 0.5);
    border: 3px solid #000;
    z-index: 1;
    padding: 30px;
  }
  .images{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .palettes {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>