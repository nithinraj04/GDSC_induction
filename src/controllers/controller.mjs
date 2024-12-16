import { matchedData } from "express-validator";
import { HitCount } from "../mongoose/schemas/hitCount.mjs";
import { UrlRelation } from "../mongoose/schemas/urlRelation.mjs";
import { cache } from "../utils/cache.mjs";
import shortid from "shortid";
import 'dotenv/config';

const handleRequest = (req, res, ...data) => {
    let [ shortURL, longURL, hitCount, dailyLimitCounter, nextReset ] = data;
    if(nextReset <= Date.now()){
        nextReset = Date.now() + 1000 * 60 * 60 * 24;
        dailyLimitCounter = process.env.DAILY_LIMIT;
    }

    hitCount += 1;
    dailyLimitCounter = Math.max(0, dailyLimitCounter - 1);
    
    cache.set(shortURL, {
        longURL,
        hitCount,
        dailyLimitCounter,
        nextReset
    });

    if(dailyLimitCounter <= 0){
        return res.send({ msg: "Sorry, this link has reached maximum daily limit. Pls try again later." });
    }

    if(hitCount % 10 === 0){
        return res.redirect(`/advertisement?longURL=${encodeURIComponent(longURL)}`);
    }
    return res.redirect(longURL);
}

export const create = async (req, res) => {
    const { longURL } = matchedData(req);
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

export const retrieve = async (req, res) => {
    const { shortURL } = matchedData(req);
    console.log(shortURL);

    if(cache.has(shortURL)){
        let data = cache.get(shortURL);
        console.log("Cache hit");
        console.log(data);
        return handleRequest(req, res, shortURL, data.longURL, data.hitCount, data.dailyLimitCounter, data.nextReset);
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