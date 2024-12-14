import mongoose from "mongoose";

const hitCountSchema = new mongoose.Schema({
    shortURL: {
        type: mongoose.Schema.Types.String,
        ref: 'UrlRelation'
    },
    hitCount: {
        type: mongoose.Schema.Types.Number
    }
});

hitCountSchema.index({ shortURL: 1, unique: true });

export const HitCount = mongoose.model("HitCount", hitCountSchema);