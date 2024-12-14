import { LRUCache } from "lru-cache";

const cacheOptions = {
    max: 10,

    noDisposeOnSet: true,

    dispose: (value, key) => {
        console.log("Disposing cache item");
        console.log("key", key);
        console.log("value", value);
    },

    allowStale: false,
}

export const cache = new LRUCache(cacheOptions);