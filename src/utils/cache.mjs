import { LRUCache } from "lru-cache";
import { HitCount } from "../mongoose/schemas/hitCount.mjs";

const cacheOptions = {
    max: 1024,

    ttl: 1000 * 60 * 60,

    noDisposeOnSet: true,

    dispose: async (value, key) => {
        console.log("Disposing cache item");
        console.log("key", key);
        console.log("value", value);

        const {longURL, ...data} = value;

        const updateHitCount = await HitCount.findOneAndUpdate({ shortURL: key }, data);

        console.log(updateHitCount);
    },

    allowStale: false,
}

export const cache = new LRUCache(cacheOptions);