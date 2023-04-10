<script lang="ts">
  import { colors } from "@/lib/theme";

  type $$Props = {
    id?: string;
  };

  let { id = "colors" }: $$Props = $$props;
  export { id };
</script>

<datalist {id}>
  <option value="" />
  {#each colors as color}
    <option value={color} />
  {/each}
</datalist>
