"use strict";
exports.__esModule = true;
exports.Administrator = exports.User = exports.userSchema = void 0;
var mongoose_1 = require("mongoose");
var uuid = require("uuid");
exports.userSchema = new mongoose_1.Schema({
    token: {
        type: String,
        "default": "" + uuid.v4()
    },
    twitchId: String,
    twitchName: String,
    created: {
        type: Date,
        "default": Date.now()
    }
});
exports.User = mongoose_1.model('User', exports.userSchema);
exports.Administrator = mongoose_1.model('Administrator', exports.userSchema);
