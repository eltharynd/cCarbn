"use strict";
exports.__esModule = true;
exports.ClientToken = exports.clientTokenSchema = exports.UserToken = exports.userTokenSchema = void 0;
var mongoose_1 = require("mongoose");
var uuid = require("uuid");
exports.userTokenSchema = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    accessToken: String,
    refreshToken: String,
    expiresIn: Number,
    obtainmentTimestamp: {
        type: Date,
        "default": Date.now()
    },
    secret: {
        type: String,
        "default": uuid.v4()
    }
});
exports.UserToken = mongoose_1.model('UserToken', exports.userTokenSchema);
exports.clientTokenSchema = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    clientId: String,
    clientSecret: String
});
exports.ClientToken = mongoose_1.model('DefaultClientToken', exports.clientTokenSchema);
