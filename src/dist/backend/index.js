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
exports.channelID = exports.MONGO = exports.PORT = void 0;
var fs = require("fs");
var mongo_1 = require("./db/mongo");
var express_1 = require("./api/express");
var socket_1 = require("./socket/socket");
var user_1 = require("./db/models/user");
var chat_1 = require("./twitch/chat");
var auth_1 = require("@twurple/auth");
var settings_1 = require("./db/models/settings");
var twitch_1 = require("./twitch/twitch");
var tokens_1 = require("./db/models/tokens");
var Mongoose = require("mongoose");
//@ts-ignore
exports.PORT = process.env.PORT || 3000;
exports.MONGO = JSON.parse('' + fs.readFileSync('mongo_credentials.json'));
var startApp = function () { return __awaiter(void 0, void 0, void 0, function () {
    var admin, defaultUserToken, settings, _i, settings_2, s, user, ss, e_1, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.info('CONNECTING TO DATABASE...');
                return [4 /*yield*/, mongo_1.Mongo.connect()];
            case 1:
                _a.sent();
                console.info('CONNECTING TO TWITCH...');
                return [4 /*yield*/, twitch_1.Twitch.init()];
            case 2:
                _a.sent();
                return [4 /*yield*/, user_1.User.findOne({ admin: true })];
            case 3:
                admin = _a.sent();
                return [4 /*yield*/, tokens_1.UserToken.findOne({ userId: admin._id })];
            case 4:
                defaultUserToken = _a.sent();
                chat_1.Chat.defaultUserProvider = new auth_1.RefreshingAuthProvider({
                    clientId: mongo_1.Mongo.clientId,
                    clientSecret: mongo_1.Mongo.clientSecret,
                    onRefresh: function (token) { return __awaiter(void 0, void 0, void 0, function () {
                        var defaultUserToken;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tokens_1.UserToken.findOne({ userId: admin._id })];
                                case 1:
                                    defaultUserToken = _a.sent();
                                    defaultUserToken.accessToken = token.accessToken;
                                    defaultUserToken.refreshToken = token.refreshToken;
                                    defaultUserToken.expiresIn = token.expiresIn;
                                    defaultUserToken.obtainmentTimestamp = Date.now();
                                    return [4 /*yield*/, defaultUserToken.save()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); },
                }, defaultUserToken.toJSON());
                console.info('STARTING WEB SERVER...');
                new express_1.Api();
                new socket_1.Socket();
                console.info('SERVER INITIALIZED. ACTIVATING USER SERVICES...');
                return [4 /*yield*/, settings_1.Settings.find()];
            case 5:
                settings = _a.sent();
                _i = 0, settings_2 = settings;
                _a.label = 6;
            case 6:
                if (!(_i < settings_2.length)) return [3 /*break*/, 21];
                s = settings_2[_i];
                return [4 /*yield*/, user_1.User.findOne({ _id: s.userId })];
            case 7:
                user = _a.sent();
                if (!!user) return [3 /*break*/, 9];
                return [4 /*yield*/, settings_1.Settings.deleteOne({ _id: s._id })];
            case 8:
                _a.sent();
                return [3 /*break*/, 20];
            case 9:
                ss = s.json;
                if (!ss.api.enabled) return [3 /*break*/, 15];
                _a.label = 10;
            case 10:
                _a.trys.push([10, 12, , 15]);
                return [4 /*yield*/, twitch_1.Twitch.connect(user.toJSON(), ss)];
            case 11:
                _a.sent();
                return [3 /*break*/, 15];
            case 12:
                e_1 = _a.sent();
                if (!(e_1._statusCode === 403)) return [3 /*break*/, 14];
                console.error('User appears to have manually removed permissions, deleting...', user);
                return [4 /*yield*/, (0, user_1.deleteUser)(s.userId)];
            case 13:
                _a.sent();
                return [3 /*break*/, 20];
            case 14: return [3 /*break*/, 15];
            case 15:
                if (!ss.chatbot.enabled) return [3 /*break*/, 20];
                _a.label = 16;
            case 16:
                _a.trys.push([16, 18, , 20]);
                return [4 /*yield*/, chat_1.Chat.connect(user.toJSON(), ss)];
            case 17:
                _a.sent();
                return [3 /*break*/, 20];
            case 18:
                e_2 = _a.sent();
                console.error('User appears to have manually removed permissions, deleting...', user);
                return [4 /*yield*/, (0, user_1.deleteUser)(s.userId)];
            case 19:
                _a.sent();
                return [3 /*break*/, 20];
            case 20:
                _i++;
                return [3 /*break*/, 6];
            case 21:
                console.info('SERVER STARTED SUCCESSFULLY...');
                return [2 /*return*/];
        }
    });
}); };
startApp();
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, iClient, _b, _c, sub, e_3, e_4, e_5;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.info('SAFELY QUITTING APPLICATION...');
                _i = 0, _a = twitch_1.Twitch.clients;
                _d.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                iClient = _a[_i];
                if (!iClient.subscriptions) return [3 /*break*/, 7];
                _b = 0, _c = iClient.subscriptions;
                _d.label = 2;
            case 2:
                if (!(_b < _c.length)) return [3 /*break*/, 7];
                sub = _c[_b];
                _d.label = 3;
            case 3:
                _d.trys.push([3, 5, , 6]);
                return [4 /*yield*/, sub.subscription.stop()];
            case 4:
                _d.sent();
                return [3 /*break*/, 6];
            case 5:
                e_3 = _d.sent();
                console.error(e_3);
                return [3 /*break*/, 6];
            case 6:
                _b++;
                return [3 /*break*/, 2];
            case 7:
                _i++;
                return [3 /*break*/, 1];
            case 8:
                _d.trys.push([8, 10, , 11]);
                return [4 /*yield*/, twitch_1.Twitch.listener.unlisten()];
            case 9:
                _d.sent();
                return [3 /*break*/, 11];
            case 10:
                e_4 = _d.sent();
                console.error(e_4);
                return [3 /*break*/, 11];
            case 11:
                _d.trys.push([11, 13, , 14]);
                return [4 /*yield*/, Mongoose.disconnect()];
            case 12:
                _d.sent();
                return [3 /*break*/, 14];
            case 13:
                e_5 = _d.sent();
                console.error(e_5);
                return [3 /*break*/, 14];
            case 14:
                console.info('SAFELY CLOSED APPLICATION...');
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=index.js.map