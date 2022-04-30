"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.settingsSchema = void 0;
var mongoose_1 = require("mongoose");
var merge = require("deepmerge");
var SETTINGS_TEMPLATE = {
    api: {
        enabled: false,
        listeners: {
            ban: {
                enabled: false
            },
            cheer: {
                enabled: false
            },
            follow: {
                enabled: false
            },
            hypetrain: {
                enabled: false,
                viewport: {
                    width: 1280,
                    height: 720,
                    background: false,
                    dark: false
                },
                infoText: {
                    enabled: true,
                    messages: {
                        sub: '@user JUST SUBSCRIBED!! WHAT A LEGEND!',
                        gift: '@user JUST GIFTED $x SUBS!! WHAT A LEGEND!',
                        cheer: '@user JUST CHEERED $x BITS!! WHAT A LEGEND!'
                    },
                    delay: 500,
                    position: 'bottom',
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    fontStroke: '#d6d6d6',
                    fontStrokeWidth: '.1rem',
                    color: '#4a4444',
                    margin: '2rem'
                },
                train: {
                    enabled: true,
                    reverseDirection: false,
                    maxRows: 2,
                    reverseWrap: false,
                    start: {
                        x: 25,
                        y: 25
                    },
                    locomotive: {
                        pictures: {
                            background: null,
                            foreground: null
                        },
                        size: {
                            width: 128,
                            height: 128,
                        },
                        scale: .8,
                        pictureBounds: { top: 0, left: 64, width: 64, height: 64, scale: .75 }
                    },
                    carriage: {
                        pictures: {
                            background: null,
                            foreground: null
                        },
                        size: {
                            width: 128,
                            height: 128,
                        },
                        scale: .8,
                        pictureBounds: { top: 32, left: 32, width: 64, height: 64, scale: .75 }
                    }
                },
                audio: {
                    enabled: true,
                    volume: 1,
                    fadingLength: 30,
                    fadeOnCompletion: true,
                    tracks: {
                        '1': null,
                        '2': null,
                        '3': null,
                        '4': null,
                        '5': null
                    }
                }
            },
            moderator: {
                enabled: false
            },
            poll: {
                enabled: false
            },
            prediction: {
                enabled: false
            },
            raid: {
                enabled: false
            },
            redemption: {
                enabled: false
            },
            reward: {
                enabled: false
            },
            subscription: {
                enabled: false
            },
            update: {
                enabled: false
            },
            //EventSubExtensionBitsTransactionCreateEvent ???
            online: {
                enabled: false
            }
            //EventSubUserUpdateEvent
        }
    },
    chatbot: {
        enabled: false,
        categories: {
            common: {
                enabled: false
            },
            everyone: {
                enabled: false,
                timeout: {
                    enabled: true,
                    command: 'poof',
                    streamer: {
                        reply: true,
                        message: "/me @user Sure! Like I'm gonna timeout the streamer..."
                    },
                    self: {
                        reply: true,
                        message: "/me @user Sure! Like I'm gonna timeout myself..."
                    },
                    mod: {
                        reply: true,
                        message: "/me @user You're a mod ffs... What'd you expect?"
                    }
                }
            },
            pokemon: {
                enabled: false
            },
            moderators: {
                enabled: false
            },
            storeable: {
                enabled: false
            }
        }
    }
};
exports.settingsSchema = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    json: {
        type: Object,
        get: function (data) {
            try {
                return merge(SETTINGS_TEMPLATE, JSON.parse(data));
            }
            catch (e) {
                return merge(SETTINGS_TEMPLATE, data);
            }
        },
        set: function (data) { return JSON.stringify(data); },
        default: {}
    }
});
exports.Settings = (0, mongoose_1.model)('Settings', exports.settingsSchema);
//# sourceMappingURL=settings.js.map