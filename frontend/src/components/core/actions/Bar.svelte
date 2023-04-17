<div
  class="flex flex-none justify-between border-b border-neutral-900 {$$props.class || ''}"
>
  <div>
    <slot name="left" />
  </div>
  <div class="flex gap-2">
    <slot />
  </div>
  <div>
    <slot name="right" />
  </div>
</div>
