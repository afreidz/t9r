<div
  class="sticky left-0 z-20 mb-3 flex flex-none justify-between border-b border-neutral-900 px-3"
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
