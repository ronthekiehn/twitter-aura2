<script lang="ts">
  export let palette: Array<string> = [];
</script>

<div class="palette">
  {#each palette as color}
    <div class="color-box" style="background-color: {color}; width: {300/palette.length}px">
      <span>{color}</span>
    </div>
  {/each}
</div>

<style>
  .palette {
    display: flex;
    width: 300;
    justify-content: center;
    margin: 20px 0;

  }
  .color-box {
    height: 75px;
    display: flex;
    flex: 1;
    flex-basis: 1px;
    flex-grow: 1;
    align-items: flex-end;
    justify-content: center;
    transition: transform 0.3s;
  }
  .color-box:first-child {
    border-radius: 10px 0 0 10px;
  }
  .color-box:last-child {
    border-radius: 0 10px 10px 0;
  }
  .color-box:hover {
    transform: scaleX(1.2);
    z-index: 1;
  }
  .color-box span {
    transform: scaleX(0.9) translateY(30px);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .color-box:hover span {
    opacity: 1;
  }
</style>