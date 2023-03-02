<script lang="ts">
  type $$Props = {
    main?: string;
    sub?: string;
  };

  export let main: $$Props["main"] = "";
  export let sub: $$Props["sub"] = "";
</script>

<header>
  <h2>
    <small>{sub}</small>
    <strong>{main}</strong>
  </h2>
</header>
