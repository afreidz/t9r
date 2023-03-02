<script lang="ts">
  type $$Props = {
    main?: string;
    sub?: string;
    as?: keyof HTMLElementTagNameMap;
  };

  export let main: $$Props["main"] = "";
  export let sub: $$Props["sub"] = "";
  export let as: $$Props["as"] = "h2";
</script>

<header class="flex h-20 items-center border-b border-neutral-900 pb-6">
  <svelte:element this={as} class="flex-1">
    <small class="block text-text-light/50">{sub}</small>
    <strong class="block text-3xl">{main}</strong>
  </svelte:element>
  <slot />
</header>
