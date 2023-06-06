<script context="module" lang="ts">
  export type Emoji = {
    char: string;
    icon: string;
    name: string;
  };

  let emojidata: Emoji[] | undefined = undefined;
</script>

<script lang="ts">
  export let value: string | null = null;

  async function fetchEmoji() {
    if (emojidata) return emojidata;
    const resp = await fetch("https://unpkg.com/emoji.json@14.0.0/emoji.json");
    emojidata = await resp.json();
    return emojidata as Emoji[];
  }
</script>

<aside
  class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black/5 {$$props.class ||
    ''}"
>
  {#await fetchEmoji() then emoji}
    <input
      min={2}
      max={30}
      list="emoji"
      type="search"
      placeholder="😀"
      class="h-full w-full appearance-none text-center placeholder:opacity-50"
      bind:value
    />
    <datalist id="emoji">
      {#each emoji as icon}
        <option value={icon.char}>{icon.name}</option>
      {/each}
    </datalist>
  {/await}
</aside>

<style>
  input::-webkit-calendar-picker-indicator {
    display: none !important;
  }
</style>
