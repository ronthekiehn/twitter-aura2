<script lang="ts">
  export let palette: Array<string> = [];
  export const size: number = 250;
  export const height: number = 75;
</script>

<div class="flex justify-center m-5 w-[{size}px]">
  {#each palette as color}
    <div 
      class="h-[{height}px] flex-1 flex items-end justify-center transition-transform duration-300 hover:scale-x-110 hover:z-10 group first:rounded-l-2xl last:rounded-r-2xl"
      style="background-color: {color}; width: {size/palette.length}px"
    >
      <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-90 translate-y-8">
        {color}
      </span>
    </div>
  {/each}
</div>