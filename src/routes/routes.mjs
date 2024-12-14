import { UrlRelation } from "../mongoose/schemas/urlRelation.mjs";
import { HitCount } from "../mongoose/schemas/hitCount.mjs";
import { Router } from "express";
import { cache } from "../utils/cache.mjs";
import shortid from "shortid";

const router = Router();

router.post(
    "/shorten",
    async (req, res) => {
        const { longURL } = req.body;
        const shortURL = shortid.generate({ length: 12 });

        const urlRelation = new UrlRelation({
            shortURL,
            longURL
        });

        const hitCount = new HitCount({
            shortURL: urlRelation.shortURL
        });

        const savedURL = await urlRelation.save();
        const savedHitCount = await hitCount.save();

        if(!savedURL || !savedHitCount) {
            return res.status(500).send({ error: "Error saving URL" });
        }

        cache.set(shortURL, { longURL: longURL, hitCount: 0 });

        res.send(urlRelation);
    }
);

router.get(
    '/redir/:shortURL',
    async (req, res) => {
        const { shortURL } = req.params;

        if(cache.has(shortURL)){
            const { longURL, hitCount } = cache.get(shortURL);
            cache.set(shortURL, { longURL, hitCount: hitCount + 1 });

            if((hitCount+1) % 10 === 0){
                console.log("Redirecting to advertisement after cache hit");
                return res.redirect(`/advertisement?longURL=${encodeURIComponent(longURL)}`);
            }

            console.log("Cache hit", hitCount);
            // console.log(hitCount+1 % 10);

            return res.redirect(longURL);
        }

        const findLongURL = await UrlRelation.findOne({ shortURL });

        if(!findLongURL) {
            return res.status(404).send({ error: "URL not found" });
        }

        const findHitCount = await HitCount.findOneAndUpdate({ shortURL }, { $inc: { hitCount: 1 }, new: true });

        cache.set(shortURL, { longURL: findLongURL.longURL, hitCount: findHitCount.hitCount });

        if(findHitCount.hitCount % 10 === 0){
            return res.redirect(`/advertisement?longURL=${encodeURIComponent(findLongURL.longURL)}`);
        }

        return res.redirect(findLongURL.longURL);
    }
)

router.get(
    '/advertisement',
    (req, res) => {
        const { longURL } = req.query;
        console.log(longURL);
        return res.send({ msg: "Advertisement", longURL });
    }
)

export default router;