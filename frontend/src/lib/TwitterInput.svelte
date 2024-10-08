<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let username: string = '';
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', { username });
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input 
    type="text" 
    bind:value={username} 
    placeholder="Enter Twitter username"
    required
  />
  <button type="submit">Analyze</button>
</form>

<style>
  form {
    margin: 20px 0;
  }
  input {
    padding: 5px;
    margin-right: 10px;
  }
</style>