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
exports.Category = exports.IChatClient = exports.Chat = void 0;
var chat_1 = require("@twurple/chat");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var settings_1 = require("../db/models/settings");
var common_1 = require("../messages/categories/common");
var everyone_1 = require("../messages/categories/everyone");
var moderators_1 = require("../messages/categories/moderators");
var pokemon_1 = require("../messages/categories/pokemon");
var storeable_1 = require("../messages/categories/storeable");
var Chat = /** @class */ (function () {
    function Chat() {
    }
    Chat.find = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rxjs_1.from)(Chat.clients).pipe((0, operators_1.filter)(function (c) { return c.userId.toString() === userId.toString(); })).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Chat.connect = function (user, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var client, iClient, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Chat.find(user._id)];
                    case 1:
                        if (_c.sent())
                            throw new Error("User doesn't have a connected client...");
                        return [4 /*yield*/, this.connectToUser(user)];
                    case 2:
                        client = _c.sent();
                        _b = {
                            userId: user._id.toString(),
                            channel: client.channel,
                            client: client.client
                        };
                        if (!settings) return [3 /*break*/, 3];
                        _a = settings;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, settings_1.Settings.findOne({ userId: user._id }).json];
                    case 4:
                        _a = (_c.sent());
                        _c.label = 5;
                    case 5:
                        iClient = (
                        //@ts-ignore
                        _b.settings = _a,
                            _b);
                        Chat.clients.push(iClient);
                        return [4 /*yield*/, this.bindCategories(iClient, settings)];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Chat.disconnect = function (user, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var iClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find(user._id)];
                    case 1:
                        iClient = _a.sent();
                        if (!iClient) return [3 /*break*/, 3];
                        return [4 /*yield*/, iClient.client.quit()];
                    case 2:
                        _a.sent();
                        Chat.clients.splice(Chat.clients.indexOf(iClient), 1);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Chat.connectToUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var chatClient;
            return __generator(this, function (_a) {
                chatClient = new chat_1.ChatClient({
                    authProvider: Chat.defaultUserProvider,
                    channels: [user.twitchName],
                    requestMembershipEvents: true,
                    logger: {
                        minLevel: 'info'
                    }
                });
                chatClient.connect();
                return [2 /*return*/, { channel: user.twitchName, client: chatClient }];
            });
        });
    };
    Chat.bindCategories = function (iClient, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_r) {
                if ((_c = (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.chatbot) === null || _a === void 0 ? void 0 : _a.categories) === null || _b === void 0 ? void 0 : _b.common) === null || _c === void 0 ? void 0 : _c.enabled)
                    new common_1.Common(iClient);
                if ((_f = (_e = (_d = settings === null || settings === void 0 ? void 0 : settings.chatbot) === null || _d === void 0 ? void 0 : _d.categories) === null || _e === void 0 ? void 0 : _e.everyone) === null || _f === void 0 ? void 0 : _f.enabled)
                    new everyone_1.Everyone(iClient);
                if ((_j = (_h = (_g = settings === null || settings === void 0 ? void 0 : settings.chatbot) === null || _g === void 0 ? void 0 : _g.categories) === null || _h === void 0 ? void 0 : _h.moderators) === null || _j === void 0 ? void 0 : _j.enabled)
                    new moderators_1.Moderators(iClient);
                if ((_m = (_l = (_k = settings === null || settings === void 0 ? void 0 : settings.chatbot) === null || _k === void 0 ? void 0 : _k.categories) === null || _l === void 0 ? void 0 : _l.pokemon) === null || _m === void 0 ? void 0 : _m.enabled)
                    new pokemon_1.Pokemon(iClient);
                if ((_q = (_p = (_o = settings === null || settings === void 0 ? void 0 : settings.chatbot) === null || _o === void 0 ? void 0 : _o.categories) === null || _p === void 0 ? void 0 : _p.storeable) === null || _q === void 0 ? void 0 : _q.enabled)
                    new storeable_1.Storeable(iClient);
                return [2 /*return*/];
            });
        });
    };
    Chat.toggleCategory = function (user, category, enable, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var iClient, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.find(user._id)];
                    case 1:
                        iClient = _c.sent();
                        if (!(!iClient && enable)) return [3 /*break*/, 2];
                        throw new Error("User doesn't have a connected client...");
                    case 2:
                        if (!enable) return [3 /*break*/, 3];
                        //TODO check if already connected
                        switch (category) {
                            case Category.common:
                                new common_1.Common(iClient);
                                break;
                            case Category.everyone:
                                new everyone_1.Everyone(iClient);
                                break;
                            case Category.moderators:
                                new moderators_1.Moderators(iClient);
                                break;
                            case Category.pokemon:
                                new pokemon_1.Pokemon(iClient);
                                break;
                            case Category.storeable:
                                new storeable_1.Storeable(iClient);
                                break;
                        }
                        return [3 /*break*/, 8];
                    case 3: return [4 /*yield*/, iClient.client.quit()];
                    case 4:
                        _c.sent();
                        _a = iClient;
                        return [4 /*yield*/, this.connectToUser(user)];
                    case 5:
                        _a.client = (_c.sent()).client;
                        _b = iClient;
                        return [4 /*yield*/, this.connectToUser(user)];
                    case 6:
                        _b.channel = (_c.sent()).channel;
                        return [4 /*yield*/, this.bindCategories(iClient, settings)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Chat.clients = [];
    return Chat;
}());
exports.Chat = Chat;
var IChatClient = /** @class */ (function () {
    function IChatClient() {
    }
    return IChatClient;
}());
exports.IChatClient = IChatClient;
var Category;
(function (Category) {
    Category[Category["common"] = 0] = "common";
    Category[Category["everyone"] = 1] = "everyone";
    Category[Category["moderators"] = 2] = "moderators";
    Category[Category["pokemon"] = 3] = "pokemon";
    Category[Category["storeable"] = 4] = "storeable";
})(Category = exports.Category || (exports.Category = {}));
//# sourceMappingURL=chat.js.map