import { validationResult } from "express-validator";

export const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({ 
            msg: "Bad request",
            err: errors
        });
    }

    next();
}