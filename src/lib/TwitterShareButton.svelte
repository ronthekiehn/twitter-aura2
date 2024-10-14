<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  //import { fade } from 'svelte/transition';

  export let disabled;
  export let copied = 0;
  //export let currentUser;
  const dispatch = createEventDispatcher();

  //let showInstructions = false;
  
  function handleClick() {
    dispatch('click');
    //showInstructions = true;
  }

  // function sendTweet() {
  //    showInstructions = false;
    // const tweetText = `Check out my Twitter Aura! Score: ${currentUser.score.toFixed(1)}/10`;
    // const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    // window.open(tweetUrl, '_blank');
  // }
</script>

<button
  on:click={handleClick}
  class="mt-8 sm:mt-6 p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base"
  {disabled}
>
  {#if copied == 0}
    Share
  {:else if copied == 1}
    Copied!
  {:else if copied == 2}
    Downloaded!
  {:else}
    Error
  {/if}
</button>

<!-- not using tweet/instructions for now, I think copying is cleaner -->
<!-- {#if showInstructions}
  <button class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={closeInstructions} transition:fade>
    <button class="bg-white p-6 rounded-lg max-w-md" on:click|stopPropagation>
      <h2 class="text-xl font-bold mb-4">Share Your Twitter Aura</h2>
      <p class="mb-4">Your image has been copied to the clipboard. In the new Twitter window:</p>
      <ol class="list-decimal list-inside mb-4">
        <li>Click on the tweet box</li>
        <li>Press Ctrl+V (or Cmd+V on Mac) to paste your image</li>
        <li>Click the "Tweet" button to share!</li>
      </ol>
      <button 
        on:click={sendTweet}
        class="mt-6 sm:mt-8 p-2 bg-white border-black shadow-md border-4 text-black rounded-lg hover:bg-slate-100 transition-colors text-sm sm:text-base"
      >
        Share Now!
      </button>
    </button>
  </button>
{/if} -->