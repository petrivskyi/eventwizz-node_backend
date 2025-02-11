const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserToken.js");
const authConfig = require("../config/auth.js");

const generateTokens = async (data) => {
    try {
        console.log("qqq")
        const payload = { 
            id: data.id,
            name: data.name, 
            time : new Date().getTime(),
        };

        const accessToken = jwt.sign(
            payload,
            authConfig.accessTokenSecret,
            { expiresIn: authConfig.jwtExpiration }
        );
        
        const refreshToken = jwt.sign(
            payload,
            authConfig.refreshTokenSecret,
            { expiresIn: authConfig.jwtRefreshExpiration }
        );

        const userToken = await UserToken.findOne({ userId: data.id });
        if (userToken) await userToken.deleteOne();

        await new UserToken({ 
            userId: data.id, 
            token: refreshToken 
        }).save();
        
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = generateTokens;