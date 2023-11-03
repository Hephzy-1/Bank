const { verifyToken } = require("../utils/jwt");
const logger = require("./logger");

const authUser = async (req, res, next) => {

    const token = req.cookies?.token;

    if (!token) {
        const error = new Error("Token Unavailable");
        error.statusCode = 403
        next(error);
        // return res.status(403).json({ message: "Forbidden" });
    } else {
        try {
            const decoded = await verifyToken(token);
            const { email } = decoded;
            req.user = email;

            logger.info(`Token worked`);
            next();
        } catch (error) {
            logger.warn(`Invalid Token ${error}`);
            return  res.status(403).json({ message: "INVALID TOKEN", err: error.message});
        }
    }
}

module.exports = {
    authUser
}
