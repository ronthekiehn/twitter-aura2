<script lang="ts">
  export let palette: Array<string> = [];
</script>

<div class="flex justify-center my-5 w-[300px]">
  {#each palette as color}
    <div 
      class="h-20 flex-1 flex items-end justify-center transition-transform duration-300 hover:scale-x-110 hover:z-10 group first:rounded-l-2xl last:rounded-r-2xl"
      style="background-color: {color}; width: {300/palette.length}px"
    >
      <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-90 translate-y-8">
        {color}
      </span>
    </div>
  {/each}
</div>