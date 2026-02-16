<script lang="ts">
  import { onMount } from 'svelte';
  import { currentScreen } from './stores';
  import { isLoggedIn } from './api';

  onMount(() => {
    setTimeout(() => {
      if (isLoggedIn()) {
        currentScreen.set('home');
      } else {
        currentScreen.set('login');
      }
    }, 1500);
  });
</script>

<div class="splash">
  <div class="logo">
    <svg width="64" height="64" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M36.2459 11.1531L31.1901 17.7773H25.3067L24.3055 22.4053H31.1467C32.585 22.4053 32.9756 22.9292 32.7865 23.7134C32.7183 23.9924 29.2651 36.0878 29.2651 36.0878H24.1753L26.6148 27.5478H19.6868L17.1604 36.2428H4.61249L7.57589 31.993H12.9788L16.7699 17.7804H10.4525L4.35211 10.8059L9.07309 7.32171V10.8958H19.7767C19.7767 10.8958 17.1635 4.36141 22.6533 4.36141C28.143 4.36141 25.1796 10.8958 25.1796 10.8958H31.8907V7.32171L36.249 11.1561L36.2459 11.1531ZM40.5949 37.8609V2.73402C40.5949 0 37.8609 0 37.8609 0H2.73402C2.38419e-07 0 0 2.73402 0 2.73402V37.864C0 40.598 2.73402 40.598 2.73402 40.598H37.864C40.598 40.598 40.598 37.864 40.598 37.864" fill="var(--color-accent)"/>
    </svg>
    <h1>WPR Presence</h1>
  </div>
  <div class="loader"></div>
</div>

<style>
  .splash {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
    gap: var(--spacing-xl);
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--color-accent);
  }

  .loader {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-bg-secondary);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
