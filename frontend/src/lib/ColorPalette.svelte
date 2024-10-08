<script lang="ts">
  export let palette: Array<string> = [];
</script>

<div class="palette">
  {#each palette as color}
    <div class="color-box" style="background-color: {color};">
      <span>{color}</span>
    </div>
  {/each}
</div>

<style>
  .palette {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }
  .color-box {
    width: 100px;
    height: 100px;
    margin: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  span {
    background-color: rgba(255, 255, 255, 0.7);
    padding: 2px 5px;
    border-radius: 3px;
  }
</style>