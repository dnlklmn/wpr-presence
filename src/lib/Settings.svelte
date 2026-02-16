<script lang="ts">
  import { currentScreen } from './stores';
  import { logout } from './api';

  function handleBack() {
    currentScreen.set('home');
  }

  function handleLogout() {
    logout();
    currentScreen.set('login');
  }
</script>

<div class="settings">
  <header>
    <button class="back" on:click={handleBack}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5m7-7-7 7 7 7"/>
      </svg>
    </button>
    <h1>Settings</h1>
    <div class="spacer"></div>
  </header>

  <main>
    <section class="section">
      <h2>Account</h2>
      <div class="card">
        <button class="menu-item danger" on:click={handleLogout}>
          <span>Logout</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </section>

    <section class="section">
      <h2>About</h2>
      <div class="card">
        <div class="info-item">
          <span class="label">Version</span>
          <span class="value">1.0.0</span>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  .settings {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-bg-secondary);
    gap: var(--spacing-sm);
  }

  .back {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .back:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }

  header h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-accent);
    flex: 1;
  }

  .spacer {
    width: 40px;
  }

  main {
    flex: 1;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  h2 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0 var(--spacing-md);
    background: transparent;
    border: none;
    color: var(--color-text);
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .menu-item.danger {
    color: var(--color-error);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    padding: 0 var(--spacing-md);
  }

  .label {
    font-size: 16px;
    font-weight: 500;
  }

  .value {
    color: var(--color-text-muted);
    font-size: 14px;
  }
</style>
