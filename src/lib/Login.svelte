<script lang="ts">
    import { login } from "./api";
    import { currentScreen, error } from "./stores";

    let username = "";
    let password = "";
    let loading = false;

    async function handleLogin() {
        if (!username || !password) {
            error.set("Please enter username and password");
            return;
        }

        loading = true;
        error.set(null);

        try {
            const res = await login(username, password);
            if (res.success) {
                currentScreen.set("home");
            } else {
                error.set("Invalid username or password");
            }
        } catch (e) {
            error.set("Connection error");
        } finally {
            loading = false;
        }
    }
</script>

<div class="login">
    <div class="logo">
        <svg
            width="41"
            height="41"
            viewBox="0 0 41 41"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M36.6048 11.2635L31.4989 17.9533H25.5573L24.5462 22.6271H31.4551C32.9076 22.6271 33.3021 23.1562 33.1111 23.9482C33.0423 24.23 29.5549 36.4451 29.5549 36.4451H24.4147L26.8783 27.8206H19.8817L17.3303 36.6017H4.65816L7.6509 32.3098H13.1073L16.9359 17.9565H10.556L4.3952 10.9129L9.16293 7.39421V11.0037H19.9725C19.9725 11.0037 17.3334 4.40459 22.8776 4.40459C28.4217 4.40459 25.4289 11.0037 25.4289 11.0037H32.2065V7.39421L36.6079 11.2666L36.6048 11.2635ZM40.9968 38.2358V2.76109C40.9968 0 38.2358 0 38.2358 0H2.76109C2.40779e-07 0 0 2.76109 0 2.76109V38.2389C0 41 2.76109 41 2.76109 41H38.2389C41 41 41 38.2389 41 38.2389"
                fill="var(--color-accent)"
            />
        </svg>
        <span class="brand">WPR Presence</span>
    </div>

    <form on:submit|preventDefault={handleLogin}>
        <h1>Login</h1>

        <input
            type="text"
            bind:value={username}
            placeholder="Username"
            disabled={loading}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
        />

        <input
            type="password"
            bind:value={password}
            placeholder="Password"
            disabled={loading}
        />

        {#if $error}
            <p class="error">{$error}</p>
        {/if}

        <button class="link" type="button">Forgot password?</button>

        <button
            type="submit"
            class="submit"
            disabled={!username || !password || loading}
        >
            {loading ? "Logging in..." : "Login"}
        </button>
    </form>

    <div class="spacer"></div>
</div>

<style>
    .login {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        min-height: 100dvh;
        padding: var(--spacing-lg);
        gap: 10px;
        background: var(--color-bg);
    }

    .logo {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
    }

    .brand {
        color: var(--color-accent);
        font-size: 20px;
        font-weight: 600;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    input {
        width: 100%;
        height: 48px;
        padding: 0 var(--spacing-md);
        background: var(--color-bg-secondary);
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-text);
        font-family: inherit;
        font-size: 16px;
        font-weight: 500;
    }

    input:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }

    input::placeholder {
        color: var(--color-text-muted);
    }

    input:disabled {
        opacity: 0.6;
    }

    .link {
        background: none;
        border: none;
        padding: 0;
        color: var(--color-accent);
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
    }

    .submit {
        width: 100%;
        height: 48px;
        background: var(--color-accent);
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-bg);
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }

    .submit:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .spacer {
        flex: 1;
    }

    .error {
        margin: -12px 0 0;
        color: var(--color-error);
        font-size: 14px;
    }
</style>
