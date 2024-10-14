<script lang="ts">
    import { onMount } from 'svelte';
    import ColorPalette from './ColorPalette.svelte';
  
    let leaderboardData: { top100: any[], totalUsers: number } = { top100: [], totalUsers: 0 };
    let loading = true;
    let error = '';
  
    onMount(async () => {
      try {
        const response = await fetch('/api/getTop100');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        leaderboardData = await response.json();
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  </script>
  
  <div class="bg-white rounded-3xl shadow-lg border-4 border-black z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center w-full max-w-xl lg:max-w-2xl">
    <h2 class="text-xl sm:text-2xl md:text-3xl mb-4 md:mb-6 font-bold">Top 100 Most Beautiful</h2>
    
    {#if loading}
      <div class="text-lg">Loading leaderboard...</div>
    {:else if error}
      <div class="text-red-600 text-lg">Error: {error}</div>
    {:else}
        <div class="text-lg mb-4">Total profiles analyzed: {leaderboardData.totalUsers.toLocaleString()}</div>
      <div class="w-full overflow-auto max-h-96 no-scrollbar">
        {#each leaderboardData.top100 as user, index}
          <div class="flex items-center justify-between mb-2 p-2 border-b border-gray-200">
              <span class="mr-2 font-bold text-sm sm:text-base">{index + 1}.</span>
              <img src={user.profileImageUrl} alt={user.username} class="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-black mr-2">
              <span class="text-sm md:text-base">@{user.username}</span>
              <span class="mr-2 text-sm md:text-base">{user.beautyScore.toFixed(3)}</span>
              <ColorPalette size={75} height={30} palette={user.profileColor} />
          </div>
        {/each}
      </div>
    {/if}
  </div>