<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let username: string = '';
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', { username });
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="my-4 flex flex-col sm:flex-row items-center space-x-2">
  <div class="flex items-center w-full sm:w-auto">
    <span class="p-2 border border-r-0 border-gray-300 rounded-l bg-gray-100">@</span>
    <input 
      type="text" 
      bind:value={username} 
      placeholder="Twitter username"
      required
      class="p-2 border border-l-0 border-gray-300 rounded-r flex-grow sm:flex-shrink-0"
    />
  </div>
  <button type="submit" class="bg-black text-white p-2 rounded hover:bg-blue-600 transition-colors mt-2 sm:mt-0">
    Analyze
  </button>
</form>