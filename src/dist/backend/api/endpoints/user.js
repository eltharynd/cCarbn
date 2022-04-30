"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var user_1 = require("../../db/models/user");
var settings_1 = require("../../db/models/settings");
var chat_1 = require("../../twitch/chat");
var twitch_1 = require("../../twitch/twitch");
var express_1 = require("../express");
var auth_1 = require("./auth");
var mongo_1 = require("../../db/mongo");
var merge = require("deepmerge");
var toJSON_1 = require("../../socket/events/util/toJSON");
var rxjs_1 = require("rxjs");
var User = /** @class */ (function () {
    function User() {
    }
    User.attach = function () {
        var _this = this;
        express_1.Api.endpoints.delete('/api/user/:userId', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(req.params.userId.length > 10)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, user_1.deleteUser)(req.params.userId)];
                    case 1:
                        _a.sent();
                        res.send({});
                        return [3 /*break*/, 3];
                    case 2:
                        res.status(404).send({});
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/picture', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found, helixUser, helixUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(req.params.userId.length > 10)) return [3 /*break*/, 4];
                        return [4 /*yield*/, user_1.User.findById(mongo_1.Mongo.ObjectId(req.params.userId))];
                    case 1:
                        found = _a.sent();
                        if (!found) return [3 /*break*/, 3];
                        return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(found.twitchId)];
                    case 2:
                        helixUser = _a.sent();
                        if (helixUser) {
                            res.send(helixUser.profilePictureUrl);
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(req.params.userId)];
                    case 5:
                        helixUser = _a.sent();
                        if (helixUser) {
                            res.send(helixUser.profilePictureUrl);
                            return [2 /*return*/];
                        }
                        _a.label = 6;
                    case 6:
                        res.status(404).send({});
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/uploads', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var uploads;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongo_1.Mongo.Upload.find({ 'metadata.userId': mongo_1.Mongo.ObjectId(req.params.userId) })];
                    case 1:
                        uploads = _a.sent();
                        return [4 /*yield*/, (0, rxjs_1.from)(uploads).pipe((0, rxjs_1.map)(function (u) {
                                return {
                                    _id: u._id.toString(),
                                    filename: u.filename,
                                    contentType: u.contentType
                                };
                            }), (0, rxjs_1.toArray)()).toPromise()];
                    case 2:
                        uploads = _a.sent();
                        res.send(uploads);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/settings', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.params.userId })];
                    case 1:
                        found = _a.sent();
                        if (!!found) return [3 /*break*/, 3];
                        found = new settings_1.Settings({ userId: req.params.userId });
                        return [4 /*yield*/, found.save()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        res.send(found.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.post('/api/user/:userId/settings', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.params.userId })];
                    case 1:
                        found = _a.sent();
                        if (!!found) return [3 /*break*/, 3];
                        found = new settings_1.Settings({ userId: req.params.userId, json: req.body });
                        return [4 /*yield*/, found.save()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, found.overwrite({ userId: req.params.userId, json: Object.assign(found.json, req.body) })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, found.save()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        res.send(found.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/settings/api/:action', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var settings, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.params.userId })];
                    case 1:
                        settings = _a.sent();
                        json = settings.json;
                        if (!(req.params.action === 'enable')) return [3 /*break*/, 3];
                        json.api.enabled = true;
                        return [4 /*yield*/, twitch_1.Twitch.connect(req.headers.authorization, json)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        json.api.enabled = false;
                        return [4 /*yield*/, twitch_1.Twitch.disconnect(req.headers.authorization, json)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        settings.json = json;
                        return [4 /*yield*/, settings.save()];
                    case 6:
                        _a.sent();
                        res.send(settings.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.post('/api/user/:userId/settings/api/listener/:listener/enable', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var settings, json, listener, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.headers.authorization._id })];
                    case 1:
                        settings = _c.sent();
                        json = settings.json;
                        listener = req.params.listener;
                        json.api.listeners[listener] = merge(json.api.listeners[listener], { enabled: true });
                        settings.json = json;
                        _b = (_a = twitch_1.Twitch).toggleListener;
                        return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(req.headers.authorization.twitchId)];
                    case 2: 
                    //@ts-ignore
                    return [4 /*yield*/, _b.apply(_a, [_c.sent(), twitch_1.Listeners[listener], true, json])];
                    case 3:
                        //@ts-ignore
                        _c.sent();
                        return [4 /*yield*/, settings.save()];
                    case 4:
                        _c.sent();
                        res.send(settings.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.delete('/api/user/:userId/settings/api/listener/:listener/disable', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var settings, json, listener, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.headers.authorization._id })];
                    case 1:
                        settings = _c.sent();
                        json = settings.json;
                        listener = req.params.listener;
                        json.api.listeners[listener] = merge(json.api.listeners[listener], { enabled: false });
                        settings.json = json;
                        _b = (_a = twitch_1.Twitch).toggleListener;
                        return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(req.headers.authorization.twitchId)];
                    case 2: 
                    //@ts-ignore
                    return [4 /*yield*/, _b.apply(_a, [_c.sent(), twitch_1.Listeners[listener], false, json])];
                    case 3:
                        //@ts-ignore
                        _c.sent();
                        return [4 /*yield*/, settings.save()];
                    case 4:
                        _c.sent();
                        res.send(settings.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/settings/api/listener/:listener', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found, listener;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.params.userId })];
                    case 1:
                        found = _a.sent();
                        if (!!found) return [3 /*break*/, 3];
                        found = new settings_1.Settings({ userId: req.params.userId });
                        return [4 /*yield*/, found.save()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        listener = req.params.listener;
                        res.send(found.json.api.listeners[listener]);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.post('/api/user/:userId/settings/api/listener/:listener', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var found, listener, buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.params.userId })];
                    case 1:
                        found = _a.sent();
                        if (!found || !req.body) {
                            res.status(400).send();
                            return [2 /*return*/];
                        }
                        listener = req.params.listener;
                        buffer = {
                            api: {
                                listeners: {}
                            }
                        };
                        buffer.api.listeners[listener] = req.body;
                        found.json = merge(found.json, buffer);
                        return [4 /*yield*/, found.save()];
                    case 2:
                        _a.sent();
                        res.send(found.json.api.listeners[listener]);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/settings/chatbot/:action', auth_1.authMiddleware, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var settings, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.params.userId })];
                    case 1:
                        settings = _a.sent();
                        json = settings.json;
                        if (!(req.params.action === 'enable')) return [3 /*break*/, 3];
                        json.chatbot.enabled = true;
                        return [4 /*yield*/, chat_1.Chat.connect(req.headers.authorization, json)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        json.chatbot.enabled = false;
                        return [4 /*yield*/, chat_1.Chat.disconnect(req.headers.authorization, json)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        settings.json = json;
                        return [4 /*yield*/, settings.save()];
                    case 6:
                        _a.sent();
                        res.send(settings.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.post('/api/user/:userId/settings/chatbot/category/:category/enable', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var settings, json, category;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.headers.authorization._id })];
                    case 1:
                        settings = _a.sent();
                        json = settings.json;
                        category = req.params.category;
                        json.chatbot.categories[category] = merge(json.chatbot.categories[category], { enabled: true });
                        settings.json = json;
                        return [4 /*yield*/, chat_1.Chat.toggleCategory(req.headers.authorization, chat_1.Category[category], true, json)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, settings.save()];
                    case 3:
                        _a.sent();
                        res.send(settings.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.delete('/api/user/:userId/settings/chatbot/category/:category/disable', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var settings, json, category;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, settings_1.Settings.findOne({ userId: req.headers.authorization._id })];
                    case 1:
                        settings = _a.sent();
                        json = settings.json;
                        category = req.params.category;
                        json.chatbot.categories[category] = merge(json.chatbot.categories[category], { enabled: false });
                        settings.json = json;
                        return [4 /*yield*/, chat_1.Chat.toggleCategory(req.headers.authorization, chat_1.Category[category], false, json)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, settings.save()];
                    case 3:
                        _a.sent();
                        res.send(settings.json);
                        return [2 /*return*/];
                }
            });
        }); });
        express_1.Api.endpoints.get('/api/user/:userId/redemptions', auth_1.authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var user, rewards;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, twitch_1.Twitch.findByUserId(req.params.userId)];
                    case 1:
                        user = _a.sent();
                        if (!user || !user.userClient)
                            return [2 /*return*/, res.status(405).send("Your twitch API doesn't seem to be enabled")];
                        return [4 /*yield*/, user.userClient.channelPoints.getCustomRewards(user.user.id)];
                    case 2:
                        rewards = _a.sent();
                        return [4 /*yield*/, (0, rxjs_1.from)(rewards).pipe((0, rxjs_1.map)(function (r) {
                                var buffer = (0, toJSON_1.toJSON)(r);
                                return {
                                    id: buffer.id,
                                    title: buffer.title
                                };
                            }), (0, rxjs_1.toArray)()).toPromise()];
                    case 3:
                        rewards = _a.sent();
                        res.send(rewards);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return User;
}());
exports.User = User;
//# sourceMappingURL=user.js.map