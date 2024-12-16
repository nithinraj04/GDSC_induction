import { Router } from "express";
import { create, retrieve } from "../controllers/controller.mjs";
import { newLinkValidationSchema, lookupValidationSchema } from "../utils/requestValidationSchema.mjs";
import { checkSchema } from "express-validator";
import { handleValidation } from "../middlewares/middlewares.mjs";

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
    (req, res) => {
        const { longURL } = req.query;
        console.log(longURL);
        return res.send({ msg: "Advertisement", longURL });
    }
)

export default router;