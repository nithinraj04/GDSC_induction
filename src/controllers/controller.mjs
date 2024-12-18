import { matchedData } from "express-validator";
import { HitCount } from "../mongoose/schemas/hitCount.mjs";
import { UrlRelation } from "../mongoose/schemas/urlRelation.mjs";
import { cache } from "../utils/cache.mjs";
import shortid from "shortid";
import 'dotenv/config';
import { handleRequest } from "./requestHandler.mjs";
import { leaderboard } from "../services/leaderboard.mjs";

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

    if(cache.has(shortURL)){
        let data = cache.get(shortURL);
        console.log("Cache hit");
        leaderboard.update(shortURL, data.longURL, data.hitCount);
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

    console.log(hitCount);

    return handleRequest(req, res, shortURL, longURL, hitCount, dailyLimitCounter, nextReset);
}