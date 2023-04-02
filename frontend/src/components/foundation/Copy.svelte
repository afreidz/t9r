<script lang="ts">
  type Variant = "normal" | "pseudomono" | "mono" | "gradient";

  export let dim: boolean = false;
  export let thin: boolean = false;
  export let bold: boolean = false;
  export let light: boolean = false;
  export let medium: boolean = false;
  export let semibold: boolean = false;
  export let extrabold: boolean = false;
  export let extralight: boolean = false;
  export let variant: Variant = "normal";
  export let as: keyof HTMLElementTagNameMap = "p";
</script>

<svelte:element
  this={as}
  class="font-thin font-light font-extralight font-medium font-semibold font-bold font-extrabold"
  class:font-thin={thin}
  class:font-bold={bold}
  class:opacity-50={dim}
  class:font-light={light}
  class:font-medium={medium}
  class:font-semibold={semibold}
  class:font-extrabold={extrabold}
  class:font-extralight={extralight}
  class:font-mono={variant === "mono"}
  class:font-sans={variant === "normal"}
  class:from-white={variant === "gradient"}
  class:bg-clip-text={variant === "gradient"}
  class:text-transparent={variant === "gradient"}
  class:to-neutral-light={variant === "gradient"}
  class:bg-gradient-to-b={variant === "gradient"}
  class:font-pseudoMono={variant === "pseudomono"}
  class:italic={["mono", "pseudomono"].includes(variant)}
  {...$$restProps}
>
  <slot />
</svelte:element>
