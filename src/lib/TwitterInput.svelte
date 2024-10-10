<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let username: string = '';
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', { username });
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="my-5">
  <input 
    type="text" 
    bind:value={username} 
    placeholder="Enter Twitter username"
    required
    class="p-2 mr-2 border border-gray-300 rounded"
  />
  <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
    Analyze
  </button>
</form>