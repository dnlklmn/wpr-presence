<script lang="ts">
    import { onMount } from "svelte";
    import {
        getMitarbeiter,
        getFilialen,
        getHoursHistory,
        submitHours,
        logout,
        type Mitarbeiter,
        type Filiale,
        type HoursRecord,
    } from "./api";
    import {
        currentScreen,
        personEntries,
        error,
        toast,
        settings,
        type PersonEntry,
    } from "./stores";
    import SignatureModal from "./SignatureModal.svelte";
    import TimePickerSheet from "./TimePickerSheet.svelte";
    import { t, dayNameKeys, monthNameKeys } from "./i18n";

    let mitarbeiterList: Mitarbeiter[] = [];
    let filialenList: Filiale[] = [];
    let loading = true;
    let submitting = false;
    let searchQuery = "";
    let showPeoplePicker = false;
    let showLocationPicker = false;
    let signingEntry: PersonEntry | null = null;
    let removingEntry: PersonEntry | null = null;

    let datum = new Date().toISOString().split("T")[0];
    let fId = $settings.defaultMarketId || 1;
    let editingTime: { entry: PersonEntry; field: "from" | "to" } | null = null;
    let submittedDates: Record<string, string> = {};
    let weekPickerEl: HTMLElement;
    let entriesByDate: Record<string, PersonEntry[]> = {};

    $: selectedFiliale = filialenList.find((f) => f.f_id === fId);

    function entryKey(marketId: number, date: string): string {
        return `${marketId}:${date}`;
    }

    $: currentKey = entryKey(fId, datum);

    function generateScribble(): string {
        const w = 100;
        const h = 50;
        const points: string[] = [];
        let x = 5 + Math.random() * 10;
        let y = 20 + Math.random() * 10;
        points.push(`M${x.toFixed(1)} ${y.toFixed(1)}`);
        const steps = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < steps; i++) {
            x += 8 + Math.random() * 12;
            y = 10 + Math.random() * 30;
            const cx = x - 5 + Math.random() * 10;
            const cy = 10 + Math.random() * 30;
            points.push(
                `Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,
            );
        }
        const d = points.join(" ");
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d='${d}' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    $: isSubmitted = currentKey in submittedDates;
    $: submittedTime = submittedDates[currentKey] || "";

    function saveCurrent() {
        entriesByDate = { ...entriesByDate, [currentKey]: $personEntries };
    }

    function loadKey(key: string) {
        personEntries.set(entriesByDate[key] || []);
    }

    function selectDate(newDate: string) {
        if (newDate === datum) return;
        saveCurrent();
        datum = newDate;
        loadKey(entryKey(fId, newDate));
    }

    function selectMarket(newFId: number) {
        if (newFId === fId) return;
        saveCurrent();
        fId = newFId;
        loadKey(entryKey(newFId, datum));
    }

    // Generate week days
    $: weekDays = (() => {
        const days = [];
        const today = new Date();
        const dayNames = dayNameKeys.map((k) => $t(k));
        const monthNames = monthNameKeys.map((k) => $t(k));

        // Start from Monday of the previous week
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7);

        for (let i = 0; i < 21; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            const k = entryKey(fId, dateStr);
            const entries =
                k === currentKey ? $personEntries : entriesByDate[k] || [];
            days.push({
                name: dayNames[d.getDay()],
                label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
                date: dateStr,
                hasReport: k in submittedDates,
                hasPending: !(k in submittedDates) && entries.length > 0,
            });
        }
        return days;
    })();

    $: filteredMitarbeiter = mitarbeiterList.filter((m) => {
        const fullName = `${m.vorname} ${m.name}`.toLowerCase();
        const isMatch = fullName.includes(searchQuery.toLowerCase());
        const notSelected = !$personEntries.some(
            (e) => e.person.ma_id === m.ma_id,
        );
        return isMatch && notSelected;
    });

    $: allEntriesComplete =
        $personEntries.length > 0 &&
        $personEntries.every((e) => e.fromTime && e.toTime && e.signature);

    onMount(async () => {
        try {
            const [mitarbeiterRes, filialenRes, historyRes] = await Promise.all(
                [getMitarbeiter(), getFilialen(), getHoursHistory()],
            );

            if (mitarbeiterRes.success) {
                mitarbeiterList = mitarbeiterRes.mitarbeiter.filter(
                    (m) => m.active,
                );
            }

            if (filialenRes.success) {
                filialenList = filialenRes.filialen;
                if ($settings.defaultMarketId) {
                    fId = $settings.defaultMarketId;
                } else if (filialenList.length > 0) {
                    fId = filialenList[0].f_id;
                }
            }

            // Load historical records into entriesByDate and submittedDates
            if (historyRes.success && historyRes.records.length > 0) {
                const byKey: Record<string, PersonEntry[]> = {};
                const submitted: Record<string, string> = {};

                for (const record of historyRes.records) {
                    const employee = mitarbeiterList.find(
                        (m) => m.ma_id === record.ma_id,
                    );
                    if (!employee) continue;

                    const k = entryKey(record.f_id, record.datum);
                    if (!byKey[k]) {
                        byKey[k] = [];
                        submitted[k] = "✓";
                    }

                    // Avoid duplicates
                    if (
                        !byKey[k].some((e) => e.person.ma_id === record.ma_id)
                    ) {
                        byKey[k].push({
                            person: employee,
                            fromTime: record.schicht_start,
                            toTime: record.schicht_ende,
                            signature: record.signature || generateScribble(),
                        });
                    }
                }

                entriesByDate = byKey;
                submittedDates = submitted;

                // If current market+day has history, load it
                const ck = entryKey(fId, datum);
                if (byKey[ck]) {
                    personEntries.set(byKey[ck]);
                }
            }
        } catch (e) {
            error.set($t("loadError"));
        } finally {
            loading = false;
        }

        // Scroll selected day into view
        requestAnimationFrame(() => {
            const selected = weekPickerEl?.querySelector(".day.selected");
            if (selected) {
                selected.scrollIntoView({ inline: "center", block: "nearest" });
            }
        });
    });

    function addPerson(person: Mitarbeiter) {
        const now = new Date();
        const m = now.getMinutes();
        const roundedMin = Math.floor(m / 15) * 15;
        const hh = now.getHours().toString().padStart(2, "0");
        const mm = roundedMin.toString().padStart(2, "0");
        const entry: PersonEntry = {
            person,
            fromTime: `${hh}:${mm}`,
            toTime: "",
            signature: null,
        };
        personEntries.update((list) => [...list, entry]);
        searchQuery = "";
        showPeoplePicker = false;
    }

    function removePerson(id: number) {
        personEntries.update((list) =>
            list.filter((e) => e.person.ma_id !== id),
        );
    }

    function updateEntry(
        id: number,
        field: "fromTime" | "toTime",
        value: string,
    ) {
        personEntries.update((list) =>
            list.map((e) =>
                e.person.ma_id === id ? { ...e, [field]: value } : e,
            ),
        );
    }

    function openSignature(entry: PersonEntry) {
        signingEntry = entry;
    }

    function editTime(entry: PersonEntry, field: "from" | "to") {
        editingTime = { entry, field };
    }

    function handleTimeSubmit(e: CustomEvent<string>) {
        if (editingTime) {
            updateEntry(
                editingTime.entry.person.ma_id,
                editingTime.field === "from" ? "fromTime" : "toTime",
                e.detail,
            );
            editingTime = null;
        }
    }

    function handleTimeCancel() {
        editingTime = null;
    }

    function handleSignatureSubmit(e: CustomEvent<string>) {
        if (signingEntry) {
            personEntries.update((list) =>
                list.map((entry) =>
                    entry.person.ma_id === signingEntry!.person.ma_id
                        ? { ...entry, signature: e.detail }
                        : entry,
                ),
            );
            signingEntry = null;
        }
    }

    function handleSignatureCancel() {
        signingEntry = null;
    }

    async function handleSubmit() {
        if (!allEntriesComplete) return;

        submitting = true;
        error.set(null);

        try {
            for (const entry of $personEntries) {
                await submitHours({
                    ma_id: entry.person.ma_id,
                    f_id: fId,
                    datum,
                    schicht_start: entry.fromTime,
                    schicht_ende: entry.toTime,
                    signature: entry.signature,
                });
            }
            const now = new Date();
            const hh = now.getHours().toString().padStart(2, "0");
            const mm = now.getMinutes().toString().padStart(2, "0");
            submittedDates = { ...submittedDates, [currentKey]: `${hh}:${mm}` };
        } catch (e) {
            error.set($t("submitError"));
        } finally {
            submitting = false;
        }
    }

    function handleEdit() {
        const { [currentKey]: _, ...rest } = submittedDates;
        submittedDates = rest;
    }

    function handleLogout() {
        logout();
        currentScreen.set("login");
    }
</script>

{#if signingEntry}
    <SignatureModal
        personName="{signingEntry.person.vorname} {signingEntry.person.name}"
        on:submit={handleSignatureSubmit}
        on:cancel={handleSignatureCancel}
    />
{/if}

{#if editingTime}
    <TimePickerSheet
        label={editingTime.field === "from" ? $t("from") : $t("to")}
        value={editingTime.field === "from"
            ? editingTime.entry.fromTime || "08:00"
            : editingTime.entry.toTime || "16:00"}
        minTime={editingTime.field === "to" ? editingTime.entry.fromTime : ""}
        on:submit={handleTimeSubmit}
        on:cancel={handleTimeCancel}
    />
{/if}

{#if removingEntry}
    <div
        class="remove-overlay"
        class:visible={removingEntry}
        on:click={() => (removingEntry = null)}
    >
        <div
            class="remove-sheet"
            class:visible={removingEntry}
            on:click|stopPropagation
        >
            <span class="remove-label"
                >{removingEntry.person.vorname}
                {removingEntry.person.name}</span
            >
            <button
                class="remove-cancel-btn"
                on:click={() => (removingEntry = null)}>{$t("cancel")}</button
            >
            <button
                class="remove-btn"
                on:click={() => {
                    removePerson(removingEntry.person.ma_id);
                    removingEntry = null;
                }}>{$t("remove")}</button
            >
        </div>
    </div>
{/if}

{#if $toast}
    <div class="toast" on:click={() => toast.set(null)}>
        {$toast}
    </div>
{/if}

<div class="home">
    <div class="top">
        <header>
            <div class="header-left">
                <svg
                    class="logo"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                >
                    <path
                        d="M42.8544 13.1866L36.8768 21.0185H29.9207L28.737 26.4903H36.8255C38.526 26.4903 38.9879 27.1097 38.7643 28.0369C38.6836 28.3668 34.6008 42.6675 34.6008 42.6675H28.583L31.4673 32.5704H23.2762L20.2892 42.8507H5.45346L8.95716 37.8261H15.3452L19.8275 21.0222H12.3582L5.14561 12.7761L10.7273 8.65664V12.8824H23.3825C23.3825 12.8824 20.2928 5.1566 26.7835 5.1566C33.2742 5.1566 29.7705 12.8824 29.7705 12.8824H37.7051V8.65664L42.8581 13.1901L42.8544 13.1866ZM47.9963 44.7639V3.2325C47.9963 0 44.7639 0 44.7639 0H3.2325C2.81888e-07 0 0 3.2325 0 3.2325V44.7675C0 48 3.2325 48 3.2325 48H44.7675C48 48 48 44.7675 48 44.7675"
                        fill="var(--color-accent)"
                    />
                </svg>
                <button
                    class="location-btn"
                    on:click={() => (showLocationPicker = true)}
                >
                    <span>{selectedFiliale?.name || $t("location")}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M7.29377 12.7063C7.6844 13.0969 8.31877 13.0969 8.7094 12.7063L14.7094 6.70625C15.1 6.31563 15.1 5.68125 14.7094 5.29063C14.3188 4.9 13.6844 4.9 13.2938 5.29063L8.00002 10.5844L2.70627 5.29375C2.31565 4.90313 1.68127 4.90313 1.29065 5.29375C0.900024 5.68438 0.900024 6.31875 1.29065 6.70938L7.29065 12.7094L7.29377 12.7063Z"
                            fill="white"
                        />
                    </svg>
                </button>
            </div>
            <button
                class="icon-btn"
                on:click={() => currentScreen.set("settings")}
                aria-label="Settings"
            >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                        d="M27.2468 11.8078C27.3968 12.2157 27.2702 12.6704 26.9467 12.9611L24.9166 14.8084C24.9682 15.1975 24.9963 15.596 24.9963 15.9992C24.9963 16.4024 24.9682 16.8009 24.9166 17.1901L26.9467 19.0373C27.2702 19.328 27.3968 19.7828 27.2468 20.1907C27.0405 20.7486 26.792 21.2831 26.506 21.7988L26.2856 22.1786C25.9762 22.6943 25.6292 23.1819 25.2495 23.6413C24.9729 23.9789 24.5134 24.0914 24.1008 23.9601L21.4894 23.1303C20.8611 23.6132 20.1672 24.0164 19.4265 24.3212L18.8404 26.9982C18.7467 27.4249 18.4185 27.7625 17.9871 27.8328C17.3401 27.9406 16.6744 27.9969 15.9946 27.9969C15.3147 27.9969 14.649 27.9406 14.002 27.8328C13.5706 27.7625 13.2425 27.4249 13.1487 26.9982L12.5626 24.3212C11.8219 24.0164 11.128 23.6132 10.4997 23.1303L7.89297 23.9648C7.48039 24.0961 7.02093 23.9789 6.74431 23.646C6.36455 23.1866 6.01761 22.699 5.70817 22.1832L5.48782 21.8035C5.20182 21.2878 4.95334 20.7533 4.74705 20.1954C4.59702 19.7875 4.7236 19.3327 5.0471 19.042L7.07719 17.1948C7.02562 16.8009 6.99749 16.4024 6.99749 15.9992C6.99749 15.596 7.02562 15.1975 7.07719 14.8084L5.0471 12.9611C4.7236 12.6704 4.59702 12.2157 4.74705 11.8078C4.95334 11.2499 5.20182 10.7154 5.48782 10.1996L5.70817 9.81989C6.01761 9.30416 6.36455 8.81657 6.74431 8.3571C7.02093 8.01954 7.48039 7.90701 7.89297 8.03829L10.5044 8.86814C11.1327 8.38523 11.8266 7.98203 12.5673 7.67728L13.1534 5.0002C13.2471 4.57355 13.5753 4.23598 14.0067 4.16566C14.6537 4.05314 15.3194 3.99688 15.9992 3.99688C16.6791 3.99688 17.3448 4.05314 17.9918 4.16097C18.4232 4.2313 18.7513 4.56886 18.8451 4.99551L19.4312 7.67259C20.1719 7.97734 20.8658 8.38054 21.4941 8.86345L24.1055 8.0336C24.5181 7.90233 24.9776 8.01954 25.2542 8.35241C25.6339 8.81188 25.9809 9.29947 26.2903 9.8152L26.5107 10.195C26.7967 10.7107 27.0452 11.2452 27.2514 11.8031L27.2468 11.8078ZM15.9992 19.75C16.994 19.75 17.948 19.3548 18.6514 18.6514C19.3548 17.948 19.75 16.994 19.75 15.9992C19.75 15.0045 19.3548 14.0505 18.6514 13.3471C17.948 12.6437 16.994 12.2485 15.9992 12.2485C15.0045 12.2485 14.0505 12.6437 13.3471 13.3471C12.6437 14.0505 12.2485 15.0045 12.2485 15.9992C12.2485 16.994 12.6437 17.948 13.3471 18.6514C14.0505 19.3548 15.0045 19.75 15.9992 19.75Z"
                        fill="var(--color-text-muted)"
                    />
                </svg>
            </button>
        </header>

        <section class="week-picker" bind:this={weekPickerEl}>
            {#each weekDays as day}
                <button
                    class="day"
                    class:selected={day.date === datum}
                    class:has-report={day.hasReport}
                    on:click={() => selectDate(day.date)}
                >
                    <span class="day-name">{day.name}</span>
                    {#if day.hasPending}
                        <span class="pending-dot"></span>
                    {/if}
                    <span class="day-date">{day.label}</span>
                </button>
            {/each}
        </section>

        <section class="table-header">
            <span class="col-name">{$t("name")}</span>
            <span class="col-from">{$t("start")}</span>
            <span class="col-to">{$t("end")}</span>
            <span class="col-sign">{$t("signCol")}</span>
        </section>
    </div>
    <main>
        {#if isSubmitted}
            <div class="success-block">
                ✓ {$t("reportSubmittedAt")}
                {submittedTime}
            </div>
        {/if}

        {#if $personEntries.length > 0}
            <ul class="entry-list">
                {#each $personEntries as entry (entry.person.ma_id)}
                    <li class="entry-row">
                        <button
                            class="col-name name-btn"
                            on:click={() =>
                                !isSubmitted && (removingEntry = entry)}
                            disabled={isSubmitted}
                            >{entry.person.vorname} {entry.person.name}</button
                        >
                        <button
                            class="col-from time-btn"
                            on:click={() => editTime(entry, "from")}
                            disabled={isSubmitted}
                        >
                            {entry.fromTime || "--:--"}
                        </button>
                        {#if entry.toTime}
                            <button
                                class="col-to time-btn"
                                on:click={() => editTime(entry, "to")}
                                disabled={isSubmitted}
                            >
                                {entry.toTime}
                            </button>
                            {#if entry.signature}
                                <button
                                    class="sign-box signed"
                                    on:click={() => openSignature(entry)}
                                    disabled={isSubmitted}
                                >
                                    <img
                                        src={entry.signature}
                                        alt="Signature"
                                        class="signature-img"
                                    />
                                </button>
                            {:else}
                                <button
                                    class="sign-box ready"
                                    on:click={() => openSignature(entry)}
                                    disabled={isSubmitted}>{$t("sign")}</button
                                >
                            {/if}
                        {:else}
                            <button
                                class="end-btn"
                                on:click={() => editTime(entry, "to")}
                                disabled={isSubmitted}>{$t("end")}</button
                            >
                            <button class="sign-box" disabled
                                >{$t("sign")}</button
                            >
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="empty">{$t("noPeopleYet")}</p>
        {/if}

        {#if $error}
            <p class="error">{$error}</p>
        {/if}

        <div class="bottom-actions">
            {#if isSubmitted}
                <button class="action-btn" on:click={handleEdit}
                    >{$t("edit")}</button
                >
            {:else}
                <button
                    class="action-btn"
                    on:click={() => (showPeoplePicker = true)}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M9 2.5C9 1.94687 8.55313 1.5 8 1.5C7.44687 1.5 7 1.94687 7 2.5V7H2.5C1.94687 7 1.5 7.44687 1.5 8C1.5 8.55313 1.94687 9 2.5 9H7V13.5C7 14.0531 7.44687 14.5 8 14.5C8.55313 14.5 9 14.0531 9 13.5V9H13.5C14.0531 9 14.5 8.55313 14.5 8C14.5 7.44687 14.0531 7 13.5 7H9V2.5Z"
                            fill="white"
                        />
                    </svg>
                    {$t("addNew")}
                </button>
                <button
                    class="action-btn submit"
                    class:ready={allEntriesComplete}
                    on:click={handleSubmit}
                    disabled={submitting || !allEntriesComplete}
                >
                    {submitting ? $t("submitting") : $t("submit")}
                </button>
            {/if}
        </div>
    </main>
</div>

{#if showPeoplePicker}
    <div class="picker-overlay" on:click={() => (showPeoplePicker = false)}>
        <div class="picker" on:click|stopPropagation>
            <div class="picker-header">
                <h3>{$t("addPerson")}</h3>
                <button
                    class="close"
                    on:click={() => (showPeoplePicker = false)}>×</button
                >
            </div>

            <input
                type="text"
                class="search"
                placeholder={$t("search")}
                bind:value={searchQuery}
                autocomplete="off"
            />

            {#if loading}
                <p class="loading">{$t("loading")}</p>
            {:else if filteredMitarbeiter.length === 0}
                <p class="empty">{$t("noMatches")}</p>
            {:else}
                <ul class="picker-list">
                    {#each filteredMitarbeiter as person}
                        <li>
                            <button
                                class="person-option"
                                on:click={() => addPerson(person)}
                            >
                                {person.vorname}
                                {person.name}
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
{/if}

{#if showLocationPicker}
    <div class="picker-overlay" on:click={() => (showLocationPicker = false)}>
        <div class="picker" on:click|stopPropagation>
            <div class="picker-header">
                <h3>{$t("selectLocation")}</h3>
                <button
                    class="close"
                    on:click={() => (showLocationPicker = false)}>×</button
                >
            </div>

            <ul class="picker-list">
                {#each filialenList as filiale}
                    <li>
                        <button
                            class="person-option"
                            class:selected-location={filiale.f_id === fId}
                            on:click={() => {
                                selectMarket(filiale.f_id);
                                showLocationPicker = false;
                            }}
                        >
                            <span class="location-name">{filiale.name}</span>
                            <span class="location-address"
                                >{filiale.address}</span
                            >
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
{/if}

<style>
    .toast {
        position: fixed;
        bottom: var(--spacing-lg);
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-success);
        color: var(--color-bg);
        padding: 12px var(--spacing-lg);
        border-radius: var(--radius-sm);
        font-size: 14px;
        font-weight: 600;
        z-index: 200;
        cursor: pointer;
    }

    .home {
        height: 100vh;
        height: 100dvh;
        display: flex;
        flex-direction: column;
        background: var(--color-bg);
    }

    /* Header */
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        padding-bottom: 0;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        flex: 1;
    }

    .logo {
        flex-shrink: 0;
    }

    .location-btn {
        flex: 1;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--spacing-md);
        background: #363636;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-text);
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
    }

    .icon-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        flex-shrink: 0;
    }

    /* Week Picker */
    .week-picker {
        display: flex;
        gap: 8px;
        padding: var(--spacing-lg);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }

    .week-picker::-webkit-scrollbar {
        display: none;
    }

    .day {
        display: flex;
        flex-direction: column;
        gap: 2px;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-sm);
        background: transparent;
        border: none;
        cursor: pointer;
        position: relative;
        flex-shrink: 0;
    }

    .day.selected {
        position: sticky;
        left: -20px;
        right: -20px;
        z-index: 1;
        background: #363636;
        border-radius: var(--radius-sm);
    }

    .day-name {
        font-size: 16px;
        font-weight: 600;
        color: #afafaf;
    }

    .day-date {
        font-size: 12px;
        font-weight: 600;
        color: #afafaf;
        white-space: nowrap;
        opacity: 0.7;
    }

    .day.selected .day-name,
    .day.selected .day-date {
        color: var(--color-text);
    }

    .day.has-report .day-name,
    .day.has-report .day-date {
        color: var(--color-accent);
    }

    .day.selected.has-report {
        background: var(--color-accent);
    }

    .day.selected.has-report .day-name,
    .day.selected.has-report .day-date {
        color: var(--color-bg);
    }

    .pending-dot {
        width: 6px;
        height: 6px;
        background: var(--color-accent);
        border-radius: 50%;
        position: absolute;
        top: 10%;
        right: 5%;
        transform: translateY(-50%);
    }

    /* Table Header */
    .table-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 var(--spacing-lg) var(--spacing-sm);
    }

    .table-header span {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.5);
    }

    .col-name {
        flex: 1;
    }
    .col-from {
        width: 48px;
    }
    .col-to {
        width: 48px;
    }
    .col-sign {
        width: 48px;
    }

    /* Main Content */
    main {
        flex: 1;
        background: var(--color-bg-secondary);
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        overflow-y: auto;
        min-height: 0;
    }

    .success-block {
        background: var(--color-bg);
        color: var(--color-accent);
        padding: 12px var(--spacing-md);
        border-radius: var(--radius-sm);
        font-size: 14px;
        font-weight: 600;
    }

    .entry-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .entry-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .name-btn {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: none;
        border: none;
        font-family: inherit;
        text-align: left;
        padding: 0;
        cursor: pointer;
    }

    .name-btn:disabled {
        cursor: default;
    }

    .time-btn {
        width: 48px;
        background: transparent;
        border: none;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text);
        cursor: pointer;
        padding: 0;
        text-align: left;
    }

    .sign-box {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #363636;
        border: none;
        border-radius: var(--radius-sm);
        color: #707070;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
    }

    .sign-box:disabled {
        cursor: not-allowed;
    }

    .end-btn {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-accent);
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-bg-secondary);
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        flex-shrink: 0;
    }

    .sign-box.ready {
        background: var(--color-accent);
        color: var(--color-bg-secondary);
    }

    .sign-box.signed {
        background: transparent;
        padding: 0;
    }

    .signature-img {
        width: 48px;
        height: 48px;
        object-fit: contain;
    }

    /* Bottom Actions */
    .bottom-actions {
        display: flex;
        gap: var(--spacing-lg);
        margin-top: auto;
        position: sticky;
        bottom: 0;
        padding-top: var(--spacing-xs);
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: var(--color-bg-secondary);
    }

    .action-btn {
        flex: 1;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        background: #363636;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-text);
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }

    .action-btn.submit {
        color: #707070;
    }

    .action-btn.submit.ready {
        background: var(--color-accent);
        color: var(--color-bg-secondary);
    }

    .action-btn:disabled {
        cursor: not-allowed;
    }

    .empty,
    .loading {
        color: var(--color-text-muted);
        font-size: 14px;
        text-align: center;
        padding: var(--spacing-lg);
    }

    .error {
        color: var(--color-error);
        font-size: 14px;
    }

    /* People Picker Modal */
    .picker-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: flex-end;
        z-index: 100;
    }

    .picker {
        background: var(--color-bg);
        width: 100%;
        max-height: 70vh;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
    }

    .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
    }

    .picker-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-size: 24px;
        cursor: pointer;
        line-height: 1;
    }

    .search {
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
        margin-bottom: var(--spacing-md);
    }

    .search:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: -2px;
    }

    .picker-list {
        list-style: none;
        padding: 0;
        margin: 0;
        overflow-y: auto;
        flex: 1;
    }

    .person-option {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        padding: 0 var(--spacing-md);
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

    .person-option:hover {
        background: var(--color-bg-secondary);
    }

    .person-option.selected-location {
        background: var(--color-bg-secondary);
        border-left: 2px solid var(--color-accent);
    }

    .person-option:has(.location-name) {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        height: auto;
        padding: 12px var(--spacing-md);
        gap: 2px;
    }

    .location-name {
        font-weight: 600;
    }

    .location-address {
        font-size: 12px;
        color: var(--color-text-muted);
    }

    /* Remove Sheet */
    .remove-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0);
        display: flex;
        align-items: flex-end;
        z-index: 100;
        transition: background 0.3s ease;
    }

    .remove-overlay.visible {
        background: rgba(0, 0, 0, 0.7);
    }

    .remove-sheet {
        width: 100%;
        background: #363636;
        border-radius: 4px 4px 0 0;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transform: translateY(100%);
        transition: transform 0.3s ease;
    }

    .remove-sheet.visible {
        transform: translateY(0);
    }

    .remove-label {
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        padding: 0 6px;
    }

    .remove-cancel-btn {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-secondary);
        border: none;
        border-radius: 4px;
        color: var(--color-text);
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }

    .remove-btn {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-error);
        border: none;
        border-radius: 4px;
        color: #ffffff;
        font-family: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
    }
</style>
