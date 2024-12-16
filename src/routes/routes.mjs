import { Router } from "express";
import { create, retrieve } from "../controllers/controller.mjs";
import { newLinkValidationSchema, lookupValidationSchema, leaderboardValidationSchema } from "../utils/requestValidationSchema.mjs";
import { checkSchema } from "express-validator";
import { handleValidation } from "../middlewares/middlewares.mjs";
import { leaderboard } from "../services/leaderboard.mjs";

export const router = Router();

router.post(
    "/shorten",
    checkSchema(newLinkValidationSchema),
    handleValidation,
    create
);

router.get(
    '/redir/:shortURL', 
    checkSchema(lookupValidationSchema, ['params']),
    handleValidation,
    retrieve
);

router.get(
    '/advertisement',
    async (req, res) => {
        const { longURL } = req.query;
        const inspirobotResponse = await fetch('https://www.inspirobot.me/api?generate=true');
        const inspirobot = await inspirobotResponse.text();
        console.log(longURL, inspirobot);
        return res.send(`
            <body>
            <h1>Advertisement</h1> 
            <a href="${longURL}">${longURL}</a>
            <br>
            <img src="${inspirobot}" />
            </body>
        `);
    }
)

router.get(
    '/top/:num',
    checkSchema(leaderboardValidationSchema, ['params']),
    handleValidation,
    (req, res) => {
        const { num } = req.params;
        const top = leaderboard.getLeaderboard(num);
        return res.send(top);
    }
)

export default router;