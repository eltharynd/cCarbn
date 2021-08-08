"use strict";
exports.__esModule = true;
exports.Settings = exports.settingsSchema = void 0;
var mongoose_1 = require("mongoose");
var SETTINGS_TEMPLATE = {
    api: {
        enabled: false,
        listeners: {
            ban: false,
            cheer: false,
            follow: false,
            hypetrain: false,
            moderator: false,
            poll: false,
            prediction: false,
            raid: false,
            redemption: false,
            reward: false,
            subscription: false,
            update: false,
            //EventSubExtensionBitsTransactionCreateEvent ???
            online: false
            //EventSubUserUpdateEvent
        }
    },
    chatbot: {
        enabled: false,
        categories: {
            common: false,
            everyone: false,
            moderators: false,
            storeable: false
        }
    }
};
exports.settingsSchema = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    json: {
        type: Object,
        get: function (data) {
            try {
                return JSON.parse(JSON.stringify(Object.assign(SETTINGS_TEMPLATE, JSON.parse(data))));
            }
            catch (e) {
                return data;
            }
        },
        set: function (data) { return JSON.stringify(data); },
        "default": {}
    }
});
exports.Settings = mongoose_1.model('Settings', exports.settingsSchema);
