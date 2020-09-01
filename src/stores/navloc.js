import { writable } from 'svelte/store';

export let location = writable(
    {
        '#top':false,
        '#about':false,
        '#work':false,
        '#projects':false,
        '#contact':false,
    }
);