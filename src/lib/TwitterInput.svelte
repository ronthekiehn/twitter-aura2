<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let username: string = '';
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', { username });
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="my-5 flex flex-col sm:flex-row items-center">
  <input 
    type="text" 
    bind:value={username} 
    placeholder="Twitter username"
    required
    class="p-2 mb-2 sm:mb-0 sm:mr-2 border border-gray-300 rounded flex-grow sm:flex-shrink-0"
  />
  <button type="submit" class="bg-black text-white px-4 py-2 m-1 rounded hover:bg-blue-600 transition-colors sm:flex-shrink-0">
    Analyze
  </button>
</form>