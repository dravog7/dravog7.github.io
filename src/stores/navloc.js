import { writable } from 'svelte/store';

export let location = writable(
    {
        '#top':true,
        '#about':false,
        '#work':false,
        '#projects':false,
        '#contact':false,
    }
);