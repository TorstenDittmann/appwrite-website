<script lang="ts" module>
    export const stickerPack = [Sites, Flutter, DevKeys, Formats, Tokens];
</script>

<script lang="ts">
    import { funnel } from 'remeda';

    import DevKeys from '../../(assets)/stickers/devkeys.webp';
    import Sites from '../../(assets)/stickers/sites.webp';
    import Flutter from '../../(assets)/stickers/flutter.webp';
    import Formats from '../../(assets)/stickers/formats.webp';
    import Tokens from '../../(assets)/stickers/tokens.webp';
    import Window from '../../(components)/window.svelte';

    import { enhance } from '$app/forms';
    import { classNames } from '$lib/utils/classnames';
    import TicketCard from '../(components)/ticket-card.svelte';
    import { Button, Icon } from '$lib/components/ui';
    import { initDates } from '../../+page.svelte';
    import CustomizationDrawer from './(components)/customization-drawer.svelte';

    let { data } = $props();

    let form: HTMLFormElement;

    const debouncer = funnel(
        () => {
            formState.saving = true;
            form.requestSubmit();
        },
        { minQuietPeriodMs: 2500 }
    );

    let originalTicketData = $state({
        name: data.ticket?.name ?? '',
        title: data.ticket?.title ?? '',
        sticker: data.ticket?.sticker
    });

    let updatedTicketData = $derived({
        name: originalTicketData.name.split(' ')[0],
        title: originalTicketData.title,
        sticker: originalTicketData.sticker
    });

    let formState = $state({
        editing: false,
        saving: false,
        saved: false,
        drawerClosed: true
    });

    $effect(() => {
        if (formState.saved) {
            const timeout = setTimeout(() => {
                formState.saved = false;
            }, 2000);

            return () => {
                clearTimeout(timeout);
            };
        }
    });
</script>

<svelte:head>
    <title>Customize Your Ticket - Appwrite</title>
    <meta
        name="description"
        content="Join Init {initDates}. Register today and claim your ticket."
    />
</svelte:head>

<div class="mx-4">
    <Window class="container my-10">
        {#snippet link()}
            <a href="/init" class="group flex items-center gap-2 uppercase">
                <Icon
                    name="chevron-left"
                    class="transition-transform group-hover:-translate-x-0.5"
                />
                Back</a
            >
        {/snippet}
        {#snippet title()}
            <div>Init Ticket<span class="text-accent">_</span></div>
        {/snippet}

        <div class="grid grid-cols-1 p-0.5 md:grid-cols-12">
            <div class="col-span-12 flex flex-col p-4 lg:col-span-3">
                <div
                    class="border-offset flex w-full items-center justify-between border-b border-dashed pb-4"
                >
                    <h3 class="text-primary font-aeonik-pro text-label">Customize ticket</h3>
                    <div class="block lg:hidden">
                        <CustomizationDrawer
                            open={!formState.drawerClosed}
                            onOpenChange={() => (formState.drawerClosed = !formState.drawerClosed)}
                        >
                            {@render Form()}
                        </CustomizationDrawer>
                    </div>
                </div>

                <div class="hidden lg:block">
                    {@render Form()}
                </div>
            </div>
            <div
                class="bg-smooth relative flex w-full flex-col items-center justify-center gap-8 rounded-xl p-4 outline-2 [outline-offset:-2px] outline-[var(--color-offset)] outline-dashed md:col-span-12 md:flex-row lg:col-span-9"
            >
                <div class="flex flex-col items-center gap-4 uppercase">
                    <TicketCard
                        {...data.ticket!}
                        name={originalTicketData.name}
                        title={originalTicketData.title}
                        sticker={originalTicketData.sticker}
                        editing={formState.editing}
                        disableEffects
                    />
                    <span
                        class="font-aeonik-fono tracking-loose text-x-micro text-primary transition-opacity peer-hover:opacity-0"
                        >Front</span
                    >
                </div>
                <div class="flex flex-col items-center gap-4 uppercase">
                    <TicketCard
                        {...data.ticket!}
                        contributions={data.streamed.contributions}
                        sticker={updatedTicketData.sticker}
                        disableEffects
                        flipped
                        {stickerPack}
                    />
                    <span
                        class="font-aeonik-fono tracking-loose text-x-micro text-primary transition duration-300 peer-hover:opacity-0 peer-hover:blur-sm"
                        >Back</span
                    >
                </div>
            </div>
        </div>
    </Window>
</div>

{#snippet Form()}
    <form
        bind:this={form}
        method="POST"
        class="mt-4 flex flex-1 flex-col gap-4"
        use:enhance={async () => {
            formState.saving = true;
            return async ({ result }) => {
                if (result.type === 'success') {
                    formState.saved = true;
                    formState.saving = false;
                }
            };
        }}
    >
        <div class="flex flex-col gap-2">
            <label
                for="name"
                class="text-primary font-aeonik-fono text-x-micro tracking-loose uppercase"
                >First name</label
            >
            <input
                bind:value={originalTicketData.name}
                onfocus={() => (formState.editing = true)}
                onblur={() => (formState.editing = false)}
                oninput={() => debouncer.call()}
                type="text"
                name="name"
                class="bg-smooth border-offset w-full appearance-none rounded-lg border p-2"
                required
            />
        </div>
        <div class="flex flex-col gap-2">
            <label
                for="title"
                class="text-primary font-aeonik-fono text-x-micro tracking-loose uppercase"
                >Title</label
            >
            <input
                bind:value={originalTicketData.title}
                onchange={() => debouncer.call()}
                type="text"
                name="title"
                class="bg-smooth border-offset w-full appearance-none rounded-lg border p-2"
            />
        </div>

        <div class="flex h-full flex-1 flex-col gap-2">
            <span class="text-primary font-aeonik-fono text-x-micro tracking-loose uppercase"
                >Sticker Pack</span
            >
            <div
                class="bg-smooth border-offset grid h-full flex-1 grid-cols-3 place-items-center gap-4 overflow-y-scroll rounded-lg border p-4 lg:grid-cols-2"
            >
                <label
                    class={classNames(
                        'relative flex aspect-square w-full items-center justify-center rounded-[2px] border-black bg-black outline-2 outline-[var(--color-offset)] outline-dashed',
                        originalTicketData.sticker === null
                            ? 'outline-white'
                            : 'outline-[var(--color-offset)]'
                    )}
                >
                    <input
                        type="radio"
                        class="absolute inset-0 appearance-none border-none"
                        name="sticker"
                        value=""
                        checked={originalTicketData.sticker === null}
                        onchange={() => (originalTicketData.sticker = null)}
                        oninput={() => debouncer.call()}
                    />
                    <div
                        class="text-tertiary font-aeonik-fono tracking-loose text-micro bg-smooth flex size-[calc(100%_-_6px)] items-center justify-center rounded-[1px] p-1 uppercase"
                    >
                        None
                    </div>
                </label>

                {#each stickerPack as s, i}
                    <label
                        class={classNames(
                            'relative flex aspect-square w-full items-center justify-center rounded-sm bg-black outline-2 [outline-offset:-1px] transition outline-dashed',
                            originalTicketData.sticker === i
                                ? 'outline-white'
                                : 'outline-[var(--color-offset)]'
                        )}
                    >
                        <input
                            type="radio"
                            class="absolute inset-0 appearance-none border-none"
                            name="sticker"
                            value={i}
                            checked={originalTicketData.sticker === i}
                            onchange={() => (originalTicketData.sticker = i)}
                            oninput={() => debouncer.call()}
                        />
                        <div
                            class="bg-smooth flex size-[calc(100%_-_6px)] items-center justify-center rounded-[1px] p-1"
                        >
                            <img src={s} alt="Sticker" class="size-16 md:size-20" />
                        </div>
                    </label>
                {/each}
            </div>
        </div>
        <Button
            type="submit"
            class="w-full!"
            variant="secondary"
            disabled={formState.saving || formState.saved}
        >
            {#if formState.saving}
                Saving
            {:else if formState.saved}
                Saved
            {:else}
                Save
            {/if}
        </Button>
    </form>
{/snippet}
