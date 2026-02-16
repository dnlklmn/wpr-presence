<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    export let label: string = "From";
    export let value: string = "08:00";

    const dispatch = createEventDispatcher<{
        submit: string;
        cancel: void;
    }>();

    let hours = parseInt(value.split(":")[0]) || 8;
    let rawMinutes = parseInt(value.split(":")[1]) || 0;
    // Snap to nearest 15-min interval
    let minutes = Math.round(rawMinutes / 15) * 15;
    if (minutes === 60) minutes = 45;

    let hourEl: HTMLDivElement;
    let minEl: HTMLDivElement;
    let visible = false;

    const ITEM_HEIGHT = 44;
    const REPEAT_COUNT = 100;
    const MID_CYCLE = Math.floor(REPEAT_COUNT / 2);

    const hourBase = Array.from({ length: 24 }, (_, i) => i);
    const minBase = [0, 15, 30, 45];

    // Build repeated arrays
    const hourItems: number[] = [];
    for (let c = 0; c < REPEAT_COUNT; c++) {
        for (const v of hourBase) hourItems.push(v);
    }
    const minItems: number[] = [];
    for (let c = 0; c < REPEAT_COUNT; c++) {
        for (const v of minBase) minItems.push(v);
    }

    function padTwo(n: number): string {
        return n.toString().padStart(2, "0");
    }

    function getCenter(baseLen: number, valueIndex: number): number {
        return (MID_CYCLE * baseLen + valueIndex) * ITEM_HEIGHT;
    }

    function recenterIfNeeded(el: HTMLDivElement, baseLen: number) {
        const totalHeight = REPEAT_COUNT * baseLen * ITEM_HEIGHT;
        const lowerBound = totalHeight * 0.2;
        const upperBound = totalHeight * 0.8;
        if (el.scrollTop < lowerBound || el.scrollTop > upperBound) {
            const index = Math.round(el.scrollTop / ITEM_HEIGHT);
            const valueIndex = ((index % baseLen) + baseLen) % baseLen;
            el.scrollTop = getCenter(baseLen, valueIndex);
        }
    }

    function onHourScroll() {
        const index = Math.round(hourEl.scrollTop / ITEM_HEIGHT);
        hours = ((index % hourBase.length) + hourBase.length) % hourBase.length;
        recenterIfNeeded(hourEl, hourBase.length);
    }

    function onMinScroll() {
        const index = Math.round(minEl.scrollTop / ITEM_HEIGHT);
        const baseIndex =
            ((index % minBase.length) + minBase.length) % minBase.length;
        minutes = minBase[baseIndex];
        recenterIfNeeded(minEl, minBase.length);
    }

    function submit() {
        dispatch("submit", `${padTwo(hours)}:${padTwo(minutes)}`);
    }

    function cancel() {
        dispatch("cancel");
    }

    onMount(() => {
        // Position in the middle of the repeated set
        hourEl.scrollTop = getCenter(hourBase.length, hours);
        const minIndex = minBase.indexOf(minutes);
        minEl.scrollTop = getCenter(
            minBase.length,
            minIndex >= 0 ? minIndex : 0,
        );
        // Trigger slide-in
        requestAnimationFrame(() => {
            visible = true;
        });
    });
</script>

<div class="overlay" on:click={cancel} class:visible>
    <div class="sheet" on:click|stopPropagation class:visible>
        <span class="label">{label}</span>

        <div class="wheels">
            <div class="wheel-wrapper">
                <div class="wheel" bind:this={hourEl} on:scroll={onHourScroll}>
                    <div class="wheel-spacer"></div>
                    {#each hourItems as h}
                        <div class="wheel-item" class:selected={h === hours}>
                            {padTwo(h)}
                        </div>
                    {/each}
                    <div class="wheel-spacer"></div>
                </div>
                <div class="wheel-label">Hr</div>
            </div>

            <div class="wheel-wrapper">
                <div class="wheel" bind:this={minEl} on:scroll={onMinScroll}>
                    <div class="wheel-spacer"></div>
                    {#each minItems as m}
                        <div class="wheel-item" class:selected={m === minutes}>
                            {padTwo(m)}
                        </div>
                    {/each}
                    <div class="wheel-spacer"></div>
                </div>
                <div class="wheel-label">Min</div>
            </div>
        </div>

        <button class="submit-btn" on:click={submit}>Submit</button>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0);
        display: flex;
        align-items: flex-end;
        z-index: 100;
        transition: background 0.3s ease;
    }

    .overlay.visible {
        background: rgba(0, 0, 0, 0.7);
    }

    .sheet {
        width: 100%;
        background: #363636;
        border-radius: 4px 4px 0 0;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        transform: translateY(100%);
        transition: transform 0.3s ease;
    }

    .sheet.visible {
        transform: translateY(0);
    }

    .label {
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
    }

    .wheels {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 10px;
    }

    .wheel-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .wheel {
        width: 100%;
        height: 88px;
        background: var(--color-bg-secondary);
        border-radius: 4px;
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }

    .wheel::-webkit-scrollbar {
        display: none;
    }

    .wheel-spacer {
        height: 22px;
        flex-shrink: 0;
    }

    .wheel-item {
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        font-size: 44px;
        font-weight: 600;
        color: #919191;
        scroll-snap-align: center;
        flex-shrink: 0;
    }

    .wheel-item.selected {
        color: #ffffff;
    }

    .wheel-label {
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        text-align: center;
    }

    .submit-btn {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-accent);
        border: none;
        border-radius: 4px;
        color: var(--color-bg-secondary);
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }
</style>
