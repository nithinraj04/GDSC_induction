import mongoose from "mongoose";


const urlRelationSchema = new mongoose.Schema({
    shortURL: {
        type: mongoose.Schema.Types.String
    },
    longURL: {
        type: mongoose.Schema.Types.String
    }
});

urlRelationSchema.index({ shortURL: 1, unique: true });

export const UrlRelation = mongoose.model("UrlRelation", urlRelationSchema);