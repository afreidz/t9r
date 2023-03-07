<script lang="ts">
  import { colors } from "@/lib/theme";
  export let id = "colors";
</script>

<datalist {id}>
  {#each colors as color}
    <option value={color} />
  {/each}
</datalist>
