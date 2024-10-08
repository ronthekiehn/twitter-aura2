<script lang="ts">
  import { onMount } from 'svelte';
  import TwitterInput from './lib/TwitterInput.svelte';
  import ColorPalette from './lib/ColorPalette.svelte';
  import Score from './lib/Score.svelte';
  import UserCard from './UserCard.svelte';

  let username = '';
  let palette = [];
  let score = 0;
  let analysis = '';
  let recentAnalyses = [];
  let currentUser = null;

  onMount(async () => {
    const response = await fetch('/api/getRecent');
    recentAnalyses = await response.json();
  });

  async function handleSubmit() {
    const response = await fetch(`/api/analyze?username=${username}`);
    const data = await response.json();
    palette = data.palette;
    score = data.beautyScore;
    analysis = data.analysis;

    currentUser = {
      username: data.username,
      profileImageUrl: data.profileImageUrl,
      bannerImageUrl: data.bannerImageUrl,
      palette: data.palette,
      score: data.beautyScore
    };

    // Add the new analysis to the recent analyses
    recentAnalyses = [data, ...recentAnalyses.slice(0, 9)];
  }
</script>

<main>
  <h1>Twitter Profile Analyzer</h1>
  <TwitterInput bind:username on:submit={handleSubmit} />
  
  {#if currentUser}
    <UserCard {...currentUser} />
    <ColorPalette palette={currentUser.palette} />
    <Score score={currentUser.score} analysis={analysis} />
  {/if}

  <h2>Recent Analyses</h2>
  {#each recentAnalyses as recentAnalysis}
    <div class="recent-analysis">
      <h3>{recentAnalysis.username}</h3>
      <ColorPalette palette={recentAnalysis.palette} />
      <Score score={recentAnalysis.score} analysis={recentAnalysis.analysis} />
    </div>
  {/each}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 800px;
    margin: 0 auto;
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
</style>