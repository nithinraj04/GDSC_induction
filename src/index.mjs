import express from "express";
import shortid from "shortid";
import { LRUCache } from "lru-cache";

const app = express();

app.use(express.json());

const cacheOptions = {
    max: 10,

    dispose: (key, value) => {
        console.log("Disposing cache item", key, value);
    },

    allowStale: false,
}

const cache = new LRUCache(cacheOptions);

app.get('/:id', (req, res) => {
    res.send({ msg: "Hello user!" });

    const id = shortid.generate({ length: 12 });

    console.log(req.params.id);

    if(!cache.has(req.params.id)) {
        cache.set(req.params.id, id);
    }
    else{
        const val = cache.get(req.params.id);
        console.log(val);
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})