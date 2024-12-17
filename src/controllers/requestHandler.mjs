import { cache } from "../utils/cache.mjs";
import 'dotenv/config';

export const handleRequest = (req, res, ...data) => {
    let [ shortURL, longURL, hitCount, dailyLimitCounter, nextReset ] = data;
    if(nextReset <= Date.now()){
        nextReset = Date.now() + 1000 * 60 * 60 * 24;
        dailyLimitCounter = process.env.DAILY_LIMIT;
    }

    hitCount += 1;
    dailyLimitCounter = Math.max(-1, dailyLimitCounter - 1);
    
    if(dailyLimitCounter < 0){
        return res.send({ msg: "Sorry, this link has reached maximum daily limit. Pls try again later." });
    }

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