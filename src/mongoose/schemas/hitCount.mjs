import mongoose from "mongoose";
import 'dotenv/config'

const hitCountSchema = new mongoose.Schema({
    shortURL: {
        type: mongoose.Schema.Types.String,
        ref: 'UrlRelation'
    },
    hitCount: {
        type: mongoose.Schema.Types.Number,
        default: 0
    },
    dailyLimitCounter: {
        type: mongoose.Schema.Types.Number,
        default: process.env.DAILY_LIMIT
    },
    nextReset: {
        type: mongoose.Schema.Types.Date,
        default: () => Date.now() + 24 * 60 * 60 * 1000
    }
});

hitCountSchema.index({ shortURL: 1 }, { unique: true });

export const HitCount = mongoose.model("HitCount", hitCountSchema);