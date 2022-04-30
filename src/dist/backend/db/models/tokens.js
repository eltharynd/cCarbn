"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        default: Date.now()
    },
    secret: {
        type: String,
        default: uuid.v4()
    },
});
exports.UserToken = (0, mongoose_1.model)('UserToken', exports.userTokenSchema);
exports.clientTokenSchema = new mongoose_1.Schema({
    clientId: String,
    clientSecret: String,
    secret: {
        type: String,
        default: uuid.v4()
    },
});
exports.ClientToken = (0, mongoose_1.model)('ClientToken', exports.clientTokenSchema);
//# sourceMappingURL=tokens.js.map