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

<div class="flex justify-center m-2 md:m-4 w-[{size}px]">
  {#each palette as color}
    <div 
      class="flex-1 flex flex-col justify-center transition-transform duration-300 hover:scale-x-125 hover:z-10 group first:rounded-l-xl last:rounded-r-xl relative"
      style="background-color: {color}; width: {size/palette.length}px; height: {height}px;"
    >
      {#if showCodes}
      
        {#each color.replace(/\s+/g, '').split('').slice(1) as char}
          <span class="text-xs leading-3 font-bold transform group-hover:scale-x-[0.8]" style="color: {getContrastColor(color)};">{char}</span>
        {/each}

      {:else}
        {#if size === 100}
          <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-[0.8] translate-y-8 text-xs">{color}</span>
        {:else}
          {#each color.replace(/\s+/g, '').split('').slice(1) as char}
            <span class="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-[0.8] text-xs leading-3" style="color: {getContrastColor(color)};">
              {char}
            </span>
          {/each}
        {/if}
      {/if}
    </div>
  {/each}
</div>
