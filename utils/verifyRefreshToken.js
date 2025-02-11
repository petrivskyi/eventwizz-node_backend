const UserToken = require("../models/UserToken.js");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.js");
const User = require("../models/User.js");

const { TokenExpiredError } = jwt;

const verifyRefreshToken = (refreshToken) => {
    const privateKey = authConfig.refreshTokenSecret;

    return new Promise((resolve, reject) => {
        UserToken.findOne({ token: refreshToken })
        .then((userToken) => {
            if (!userToken)
                return reject({ error: true, message: "Invalid refresh token!" });

            jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
                if (err) {
                    console.log(err);

                    if (err instanceof TokenExpiredError) {
                        return reject({ message: "Refresh Token was expired!" });
                    }
                    
                    return reject({ error: true, message: "Invalid refresh token!" });
                }
                
                User.findOne({ _id: userToken.userId })
                .then((user) => {
                    resolve({
                        tokenDetails: {
                            id: user._id,
                            name : user.username,
                            balance: user.balance
                        },
                        error: false,
                        message: "Valid refresh token",
                    });
                })
                .catch((err) => {
                    return reject({ error: true, message: err.message });
                });
            });
        })
        .catch((err) => {
            return reject({ error: true, message: err.message });
        });
    });
};

module.exports = verifyRefreshToken;