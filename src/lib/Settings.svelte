<script lang="ts">
    import { onMount } from "svelte";
    import {
        currentScreen,
        settings,
        type Language,
        type Theme,
    } from "./stores";
    import { logout, getFilialen, type Filiale } from "./api";
    import { t } from "./i18n";

    let filialenList: Filiale[] = [];
    let showMarketPicker = false;
    let showLanguagePicker = false;
    let showThemePicker = false;

    const languages: { value: Language; label: string }[] = [
        { value: "en", label: "English" },
        { value: "de", label: "Deutsch" },
        { value: "hi", label: "हिन्दी" },
        { value: "pl", label: "Polski" },
    ];

    $: themes = [
        { value: "dark" as Theme, label: $t("dark") },
        { value: "light" as Theme, label: $t("light") },
    ];

    $: selectedMarket = filialenList.find(
        (f) => f.f_id === $settings.defaultMarketId,
    );
    $: selectedLanguage = languages.find((l) => l.value === $settings.language);
    $: selectedTheme = themes.find((th) => th.value === $settings.theme);

    onMount(async () => {
        const res = await getFilialen();
        if (res.success) {
            filialenList = res.filialen;
        }
    });

    function selectMarket(fId: number | null) {
        settings.update((s) => ({ ...s, defaultMarketId: fId }));
        showMarketPicker = false;
    }

    function selectLanguage(lang: Language) {
        settings.update((s) => ({ ...s, language: lang }));
        showLanguagePicker = false;
    }

    function selectTheme(theme: Theme) {
        settings.update((s) => ({ ...s, theme }));
        showThemePicker = false;
    }

    function handleBack() {
        currentScreen.set("home");
    }

    function handleLogout() {
        logout();
        currentScreen.set("login");
    }
</script>

<div class="settings">
    <header>
        <button class="back" on:click={handleBack}>
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M19 12H5m7-7-7 7 7 7" />
            </svg>
        </button>
        <h1>{$t("settings")}</h1>
        <div class="spacer"></div>
    </header>

    <main>
        <section class="section">
            <h2>{$t("preferences")}</h2>
            <div class="card">
                <button
                    class="menu-item"
                    on:click={() => (showMarketPicker = true)}
                >
                    <div class="menu-item-left">
                        <span>{$t("defaultMarket")}</span>
                        <span class="menu-item-value"
                            >{selectedMarket?.name || $t("notSet")}</span
                        >
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M6 4l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>

                <button
                    class="menu-item"
                    on:click={() => (showLanguagePicker = true)}
                >
                    <div class="menu-item-left">
                        <span>{$t("language")}</span>
                        <span class="menu-item-value"
                            >{selectedLanguage?.label || "English"}</span
                        >
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M6 4l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>

                <button
                    class="menu-item"
                    on:click={() => (showThemePicker = true)}
                >
                    <div class="menu-item-left">
                        <span>{$t("theme")}</span>
                        <span class="menu-item-value"
                            >{selectedTheme?.label || $t("dark")}</span
                        >
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M6 4l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </section>

        <section class="section">
            <h2>{$t("account")}</h2>
            <div class="card">
                <button class="menu-item danger" on:click={handleLogout}>
                    <span>{$t("logout")}</span>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </section>

        <section class="section">
            <h2>{$t("about")}</h2>
            <div class="card">
                <div class="info-item">
                    <span class="label">{$t("version")}</span>
                    <span class="value">1.0.0</span>
                </div>
            </div>
        </section>
    </main>
</div>

{#if showMarketPicker}
    <div class="sheet-overlay" on:click={() => (showMarketPicker = false)}>
        <div class="sheet" on:click|stopPropagation>
            <div class="sheet-header">
                <h3>{$t("defaultMarket")}</h3>
                <button
                    class="close"
                    on:click={() => (showMarketPicker = false)}>×</button
                >
            </div>
            <ul class="sheet-list">
                <li>
                    <button
                        class="sheet-option"
                        class:active={$settings.defaultMarketId === null}
                        on:click={() => selectMarket(null)}
                    >
                        <span class="option-label">{$t("none")}</span>
                    </button>
                </li>
                {#each filialenList as filiale}
                    <li>
                        <button
                            class="sheet-option"
                            class:active={filiale.f_id ===
                                $settings.defaultMarketId}
                            on:click={() => selectMarket(filiale.f_id)}
                        >
                            <span class="option-label">{filiale.name}</span>
                            <span class="option-sub">{filiale.address}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
{/if}

{#if showLanguagePicker}
    <div class="sheet-overlay" on:click={() => (showLanguagePicker = false)}>
        <div class="sheet" on:click|stopPropagation>
            <div class="sheet-header">
                <h3>{$t("language")}</h3>
                <button
                    class="close"
                    on:click={() => (showLanguagePicker = false)}>×</button
                >
            </div>
            <ul class="sheet-list">
                {#each languages as lang}
                    <li>
                        <button
                            class="sheet-option"
                            class:active={lang.value === $settings.language}
                            on:click={() => selectLanguage(lang.value)}
                        >
                            <span class="option-label">{lang.label}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
{/if}

{#if showThemePicker}
    <div class="sheet-overlay" on:click={() => (showThemePicker = false)}>
        <div class="sheet" on:click|stopPropagation>
            <div class="sheet-header">
                <h3>{$t("theme")}</h3>
                <button class="close" on:click={() => (showThemePicker = false)}
                    >×</button
                >
            </div>
            <ul class="sheet-list">
                {#each themes as theme}
                    <li>
                        <button
                            class="sheet-option"
                            class:active={theme.value === $settings.theme}
                            on:click={() => selectTheme(theme.value)}
                        >
                            <span class="option-label">{theme.label}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
{/if}

<style>
    .settings {
        height: 100vh;
        height: 100dvh;
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
        overflow-y: auto;
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
        min-height: 48px;
        padding: 10px var(--spacing-md);
        background: transparent;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--color-text-secondary);
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
    }

    .menu-item:last-child {
        border-bottom: none;
    }

    .menu-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .menu-item.danger {
        color: var(--color-error);
    }

    .menu-item-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .menu-item-left span:first-child {
        color: var(--color-text);
    }

    .menu-item-value {
        font-size: 13px;
        color: var(--color-text-muted);
        font-weight: 400;
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

    /* Bottom Sheet */
    .sheet-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: flex-end;
        z-index: 100;
    }

    .sheet {
        background: var(--color-bg);
        width: 100%;
        max-height: 70vh;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
    }

    .sheet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
    }

    .sheet-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-accent);
    }

    .close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        font-size: 24px;
        cursor: pointer;
        border-radius: var(--radius-sm);
    }

    .close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text);
    }

    .sheet-list {
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-y: auto;
    }

    .sheet-option {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 12px var(--spacing-md);
        background: transparent;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--color-text);
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
    }

    .sheet-option:hover {
        background: var(--color-bg-secondary);
    }

    .sheet-option.active {
        background: var(--color-bg-secondary);
        border-left: 2px solid var(--color-accent);
    }

    .option-label {
        font-weight: 600;
    }

    .option-sub {
        font-size: 12px;
        color: var(--color-text-muted);
        font-weight: 400;
    }
</style>
