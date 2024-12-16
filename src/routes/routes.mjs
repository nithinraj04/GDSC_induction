import { UrlRelation } from "../mongoose/schemas/urlRelation.mjs";
import { HitCount } from "../mongoose/schemas/hitCount.mjs";
import { Router } from "express";
import { cache } from "../utils/cache.mjs";
import shortid from "shortid";
import 'dotenv/config'

const router = Router();

const handleRequest = (req, res, shortURL, longURL, hitCount, dailyLimitCounter, nextReset) => {
    if(nextReset <= Date.now()){
        nextReset = Date.now() + 1000*30*30*24;
        dailyLimitCounter = process.env.DAILY_LIMIT;
    }

    if(dailyLimitCounter <= 0){
        return res.send({ msg: "Sorry, this link has reached maximum daily limit. Pls try again later." });
    }

    hitCount += 1;
    dailyLimitCounter -= 1;

    cache.set(shortURL, {
        longURL,
        hitCount,
        dailyLimitCounter,
        nextReset
    });

    if(hitCount % 10 === 0){
        return res.redirect(`/advertisement?longURL=${encodeURIComponent(longURL)}`);
    }

    return res.redirect(longURL);
}

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
            shortURL
        });

        const savedURL = await urlRelation.save();
        const savedHitCount = await hitCount.save();

        if(!savedURL || !savedHitCount) {
            return res.status(500).send({ error: "Error saving URL" });
        }

        cache.set(shortURL, {
            longURL,
            hitCount: savedHitCount.hitCount,
            dailyLimitCounter: savedHitCount.dailyLimitCounter,
            nextReset: savedHitCount.nextReset
        });

        console.log(cache.get(shortURL));

        res.send(urlRelation);
    }
);

router.get(
    '/redir/:shortURL',
    async (req, res) => {
        const { shortURL } = req.params;

        if(cache.has(shortURL)){
            let { longURL, hitCount, dailyLimitCounter, nextReset } = cache.get(shortURL);
            console.log("Cache hit");
            return handleRequest(req, res, shortURL, longURL, hitCount, dailyLimitCounter, nextReset);
        }
        
        console.log("Cache miss");

        const findLongURL = await UrlRelation.findOne({ shortURL });
        
        if(!findLongURL) {
            return res.status(404).send({ error: "URL not found" });
        }
        
        const findHitCount = await HitCount.findOne({ shortURL });
        
        const { longURL } = findLongURL;
        let { hitCount, dailyLimitCounter, nextReset } = findHitCount;

        return handleRequest(req, res, shortURL, longURL, hitCount, dailyLimitCounter, nextReset);
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