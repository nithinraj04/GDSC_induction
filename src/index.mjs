import express from "express";
import mongoose from "mongoose";
import router from "./routes/routes.mjs";
import { cache } from "./utils/cache.mjs";
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI)
              .then(() => console.log("Connected to MongoDB"))
              .catch(err => console.error(err));

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send({ msg: "Hello user!" });
})

app.use(router);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})