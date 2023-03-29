<script lang="ts">
  type Variant = "normal" | "pseudomono" | "mono" | "gradient";

  export let dim: boolean = false;
  export let variant: Variant = "normal";
  export let as: keyof HTMLElementTagNameMap = "p";
</script>

<svelte:element
  this={as}
  class:opacity-50={dim}
  class:font-mono={variant === "mono"}
  class:font-sans={variant === "normal"}
  class:from-white={variant === "gradient"}
  class:bg-clip-text={variant === "gradient"}
  class:text-transparent={variant === "gradient"}
  class:to-neutral-light={variant === "gradient"}
  class:bg-gradient-to-b={variant === "gradient"}
  class:font-pseudoMono={variant === "pseudomono"}
  class:italic={["mono", "pseudomono"].includes(variant)}
  class:font-light={["mono", "pseudomono"].includes(variant)}
  {...$$restProps}
>
  <slot />
</svelte:element>
