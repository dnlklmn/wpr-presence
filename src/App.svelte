<script lang="ts">
  import { currentScreen } from './lib/stores';
  import Splash from './lib/Splash.svelte';
  import Login from './lib/Login.svelte';
  import Home from './lib/Home.svelte';
  import Settings from './lib/Settings.svelte';
</script>

{#if $currentScreen === 'splash'}
  <Splash />
{:else if $currentScreen === 'login'}
  <Login />
{:else if $currentScreen === 'home'}
  <Home />
{:else if $currentScreen === 'settings'}
  <Settings />
{/if}
