<script lang="ts">
  export let palette: Array<string> = [];
  export let size: number = 0;
  export let height: number = 0;
  export let showCodes: boolean = false;

  function getContrastColor(hexcolor: string) {
    // Convert hex to RGB
    let r = parseInt(hexcolor.slice(1, 3), 16);
    let g = parseInt(hexcolor.slice(3, 5), 16);
    let b = parseInt(hexcolor.slice(5, 7), 16);
    
    // Calculate luminance
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
</script>

<div class="flex justify-center m-5 w-[{size}px]">
  {#each palette as color}
    <div 
      class="flex-1 flex flex-col items-center justify-end transition-transform duration-300 hover:scale-x-110 hover:z-10 group first:rounded-l-2xl last:rounded-r-2xl relative"
      style="background-color: {color}; width: {size/palette.length}px; height: {height}px;"
    >
      {#if showCodes}
        <span class="absolute bottom-full mb-1 text-xs px-1 py-0.5 rounded" style="background-color: {color}; color: {getContrastColor(color)};">
          {color}
        </span>
      {/if}
      <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-90 translate-y-8 text-xs" style="color: {getContrastColor(color)};">
        {color}
      </span>
    </div>
  {/each}
</div>
