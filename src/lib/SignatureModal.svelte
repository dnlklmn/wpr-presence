<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { t } from "./i18n";

    export let personName: string = "";

    const dispatch = createEventDispatcher<{ submit: string; cancel: void }>();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let isDrawing = false;
    let hasDrawn = false;

    onMount(() => {
        ctx = canvas.getContext("2d")!;
        setupCanvas();
        window.addEventListener("resize", setupCanvas);
        return () => window.removeEventListener("resize", setupCanvas);
    });

    function setupCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }

    function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
        const rect = canvas.getBoundingClientRect();
        if ("touches" in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function startDrawing(e: MouseEvent | TouchEvent) {
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(e: MouseEvent | TouchEvent) {
        if (!isDrawing) return;
        e.preventDefault();
        hasDrawn = true;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
    }

    function submit() {
        const dataUrl = canvas.toDataURL("image/png");
        dispatch("submit", dataUrl);
    }

    function cancel() {
        dispatch("cancel");
    }
</script>

<div class="modal-overlay">
    <div class="modal">
        <div class="header">
            <h2>{$t("signTitle")}</h2>
            <p class="subtitle">{personName}</p>
        </div>

        <div class="canvas-container">
            <canvas
                bind:this={canvas}
                on:mousedown={startDrawing}
                on:mousemove={draw}
                on:mouseup={stopDrawing}
                on:mouseleave={stopDrawing}
                on:touchstart={startDrawing}
                on:touchmove={draw}
                on:touchend={stopDrawing}
            />
            {#if !hasDrawn}
                <p class="hint">{$t("drawHint")}</p>
            {/if}
        </div>

        <div class="actions">
            <button class="secondary" on:click={clear}>{$t("clear")}</button>
            <button class="secondary" on:click={cancel}>{$t("cancel")}</button>
            <button class="primary" on:click={submit} disabled={!hasDrawn}
                >{$t("submit")}</button
            >
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        z-index: 100;
    }

    .modal {
        background: var(--color-bg);
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 400px;
        padding: var(--spacing-lg);
    }

    .header {
        text-align: center;
        margin-bottom: var(--spacing-md);
    }

    h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .subtitle {
        margin: var(--spacing-xs) 0 0;
        color: var(--color-text-secondary);
        font-size: 14px;
    }

    .canvas-container {
        position: relative;
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    canvas {
        display: block;
        width: 100%;
        height: 200px;
        touch-action: none;
    }

    .hint {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-muted);
        font-size: 14px;
        pointer-events: none;
        margin: 0;
    }

    .actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }

    button {
        flex: 1;
        height: 48px;
        border: none;
        border-radius: var(--radius-sm);
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }

    .secondary {
        background: var(--color-bg-secondary);
        color: var(--color-text);
    }

    .secondary:hover {
        background: rgba(255, 255, 255, 0.15);
    }

    .primary {
        background: var(--color-accent);
        color: var(--color-bg);
    }

    .primary:hover:not(:disabled) {
        opacity: 0.9;
    }

    .primary:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>
