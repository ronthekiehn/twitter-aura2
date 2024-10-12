<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let disabled;
  export let currentUser;
  const dispatch = createEventDispatcher();

  let showInstructions = false;
  
  function handleClick() {
    dispatch('click');
    showInstructions = true;
  }

  function closeInstructions() {
    showInstructions = false;
    const tweetText = `Check out my Twitter Aura! Score: ${currentUser.score.toFixed(1)}/10 #TwitterAura`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  }
</script>

<button
  on:click={handleClick}
  class="mt-6 sm:mt-8 p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base"
  {disabled}
>
  Share on 𝕏
</button>

{#if showInstructions}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={closeInstructions} transition:fade>
    <div class="bg-white p-6 rounded-lg max-w-md" on:click|stopPropagation>
      <h2 class="text-xl font-bold mb-4">Share Your Twitter Aura</h2>
      <p class="mb-4">Your image has been copied to the clipboard. In the new Twitter window:</p>
      <ol class="list-decimal list-inside mb-4">
        <li>Click on the tweet box</li>
        <li>Press Ctrl+V (or Cmd+V on Mac) to paste your image</li>
        <li>Click the "Tweet" button to share!</li>
      </ol>
      <button 
        on:click={closeInstructions}
        class="mt-6 sm:mt-8 p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base"
      >
        Share Now!
      </button>
    </div>
  </div>
{/if}