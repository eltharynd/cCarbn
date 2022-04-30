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
exports.Listeners = exports.IApiClient = exports.Twitch = exports.DEV_ENDPOINT = void 0;
var api_1 = require("@twurple/api");
var eventsub_1 = require("@twurple/eventsub");
var rxjs_1 = require("rxjs");
var fs = require("fs");
var operators_1 = require("rxjs/operators");
var auth_1 = require("@twurple/auth");
var mongo_1 = require("../db/mongo");
var tokens_1 = require("../db/models/tokens");
var user_1 = require("../db/models/user");
var index_1 = require("../index");
var ban_1 = require("../socket/events/ban");
var cheer_1 = require("../socket/events/cheer");
var follow_1 = require("../socket/events/follow");
var hypetrain_1 = require("../socket/events/hypetrain");
var moderator_1 = require("../socket/events/moderator");
var poll_1 = require("../socket/events/poll");
var prediction_1 = require("../socket/events/prediction");
var raid_1 = require("../socket/events/raid");
var redemption_1 = require("../socket/events/redemption");
var reward_1 = require("../socket/events/reward");
var subscriptions_1 = require("../socket/events/subscriptions");
var update_1 = require("../socket/events/update");
var online_1 = require("../socket/events/online");
exports.DEV_ENDPOINT = JSON.parse('' + fs.readFileSync('endpoint_credentials.json'));
var FORCE_REVERSE_PROXY = true;
var Twitch = /** @class */ (function () {
    function Twitch() {
    }
    Twitch.findByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rxjs_1.from)(Twitch.clients).pipe((0, operators_1.filter)(function (c) { return c.userId.toString() === userId.toString(); })).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Twitch.findByChannel = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_1.User.findOne({ twitchId: channel.id.toString() })];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, (0, rxjs_1.from)(Twitch.clients).pipe((0, operators_1.filter)(function (c) { return c.userId.toString() === user._id.toString(); })).toPromise()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Twitch.prepareClient = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        Twitch.client = new api_1.ApiClient({
                            authProvider: new auth_1.ClientCredentialsAuthProvider(mongo_1.Mongo.clientId, mongo_1.Mongo.clientSecret)
                        });
                        return [4 /*yield*/, tokens_1.ClientToken.findOne()];
                    case 1:
                        token = _c.sent();
                        return [4 /*yield*/, Twitch.client.eventSub.deleteAllSubscriptions()];
                    case 2:
                        _c.sent();
                        Twitch.listener = new eventsub_1.EventSubListener({
                            apiClient: Twitch.client,
                            adapter: FORCE_REVERSE_PROXY || ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === 'production' ?
                                new eventsub_1.ReverseProxyAdapter({
                                    hostName: exports.DEV_ENDPOINT.hostname,
                                    port: +index_1.PORT + 1,
                                    pathPrefix: 'listener'
                                }) :
                                new eventsub_1.DirectConnectionAdapter({
                                    hostName: exports.DEV_ENDPOINT.hostname,
                                    sslCert: {
                                        cert: "".concat(fs.readFileSync(exports.DEV_ENDPOINT.crt)),
                                        key: "".concat(fs.readFileSync(exports.DEV_ENDPOINT.key)),
                                    },
                                }),
                            secret: token.secret,
                        });
                        //@ts-ignore
                        return [4 /*yield*/, Twitch.listener.listen(FORCE_REVERSE_PROXY || ((_b = process === null || process === void 0 ? void 0 : process.env) === null || _b === void 0 ? void 0 : _b.NODE_ENV) === 'production' ? null : +index_1.PORT + 1)];
                    case 3:
                        //@ts-ignore
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Twitch.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!Twitch.client) return [3 /*break*/, 5];
                        if (!Twitch.clientReady) return [3 /*break*/, 2];
                        return [4 /*yield*/, Twitch.clientReady.toPromise()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        Twitch.clientReady = new rxjs_1.Subject();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.prepareClient()];
                    case 4:
                        _a.sent();
                        Twitch.clientReady.complete();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Twitch.connect = function (user, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var token, userClient, channel, subscriptions, iClient;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Twitch.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.findByUserId(user._id)];
                    case 2:
                        if (_a.sent())
                            throw new Error();
                        return [4 /*yield*/, tokens_1.UserToken.findOne({ userId: user._id })];
                    case 3:
                        token = _a.sent();
                        userClient = new api_1.ApiClient({
                            authProvider: new auth_1.RefreshingAuthProvider({
                                clientId: mongo_1.Mongo.clientId,
                                clientSecret: mongo_1.Mongo.clientSecret,
                                onRefresh: function (token) { return __awaiter(_this, void 0, void 0, function () {
                                    var userToken;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, tokens_1.UserToken.findOne({ userId: user._id })];
                                            case 1:
                                                userToken = _a.sent();
                                                userToken.accessToken = token.accessToken;
                                                userToken.refreshToken = token.refreshToken;
                                                userToken.expiresIn = token.expiresIn;
                                                userToken.obtainmentTimestamp = Date.now();
                                                return [4 /*yield*/, userToken.save()];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }
                            }, token.toJSON())
                        });
                        return [4 /*yield*/, Twitch.client.users.getUserByName(user.twitchName)];
                    case 4:
                        channel = _a.sent();
                        if (!channel)
                            return [2 /*return*/, console.error("Channel not found for user: ".concat(user._id, " when trying to connect twitch API."))];
                        return [4 /*yield*/, Twitch.bindListeners(channel, settings)];
                    case 5:
                        subscriptions = _a.sent();
                        iClient = Object.assign(new IApiClient(), {
                            userId: user._id,
                            user: channel,
                            client: Twitch.client,
                            userClient: userClient,
                            listener: Twitch.listener,
                            subscriptions: subscriptions
                        });
                        Twitch.clients.push(iClient);
                        return [2 /*return*/];
                }
            });
        });
    };
    Twitch.disconnect = function (user, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var iClient, _i, _a, sub;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.findByUserId(user._id)];
                    case 1:
                        iClient = _b.sent();
                        if (iClient === null || iClient === void 0 ? void 0 : iClient.subscriptions) {
                            for (_i = 0, _a = iClient.subscriptions; _i < _a.length; _i++) {
                                sub = _a[_i];
                                sub.subscription.stop();
                            }
                            iClient.subscriptions = null;
                            Twitch.clients.splice(Twitch.clients.indexOf(iClient), 1);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Twitch.bindListeners = function (channel, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
        return __awaiter(this, void 0, void 0, function () {
            var subscriptions, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72;
            var _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101;
            return __generator(this, function (_102) {
                switch (_102.label) {
                    case 0:
                        subscriptions = [];
                        if (!((_c = (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.api) === null || _a === void 0 ? void 0 : _a.listeners) === null || _b === void 0 ? void 0 : _b.ban) === null || _c === void 0 ? void 0 : _c.enabled)) return [3 /*break*/, 3];
                        _16 = (_15 = subscriptions).push;
                        _73 = { listener: Listeners.ban };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelBanEvents(channel.id, ban_1.BanHandler.banEvent)];
                    case 1:
                        _16.apply(_15, [(_73.subscription = _102.sent(), _73)]);
                        _18 = (_17 = subscriptions).push;
                        _74 = { listener: Listeners.ban };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelUnbanEvents(channel.id, ban_1.BanHandler.unbanEvent)];
                    case 2:
                        _18.apply(_17, [(_74.subscription = _102.sent(), _74)]);
                        _102.label = 3;
                    case 3:
                        if (!((_f = (_e = (_d = settings === null || settings === void 0 ? void 0 : settings.api) === null || _d === void 0 ? void 0 : _d.listeners) === null || _e === void 0 ? void 0 : _e.cheer) === null || _f === void 0 ? void 0 : _f.enabled)) return [3 /*break*/, 5];
                        _20 = (_19 = subscriptions).push;
                        _75 = { listener: Listeners.cheer };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelCheerEvents(channel.id, cheer_1.CheerHandler.cheerEvent)];
                    case 4:
                        _20.apply(_19, [(_75.subscription = _102.sent(), _75)]);
                        _102.label = 5;
                    case 5:
                        if (!((_j = (_h = (_g = settings === null || settings === void 0 ? void 0 : settings.api) === null || _g === void 0 ? void 0 : _g.listeners) === null || _h === void 0 ? void 0 : _h.follow) === null || _j === void 0 ? void 0 : _j.enabled)) return [3 /*break*/, 7];
                        _22 = (_21 = subscriptions).push;
                        _76 = { listener: Listeners.follow };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelFollowEvents(channel.id, follow_1.FollowHandler.followEvent)];
                    case 6:
                        _22.apply(_21, [(_76.subscription = _102.sent(), _76)]);
                        _102.label = 7;
                    case 7:
                        if (!((_m = (_l = (_k = settings === null || settings === void 0 ? void 0 : settings.api) === null || _k === void 0 ? void 0 : _k.listeners) === null || _l === void 0 ? void 0 : _l.hypetrain) === null || _m === void 0 ? void 0 : _m.enabled)) return [3 /*break*/, 11];
                        _24 = (_23 = subscriptions).push;
                        _77 = { listener: Listeners.hypetrain };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, hypetrain_1.HypetrainHandler.hypeTrainBegin)];
                    case 8:
                        _24.apply(_23, [(_77.subscription = _102.sent(), _77)]);
                        _26 = (_25 = subscriptions).push;
                        _78 = { listener: Listeners.hypetrain };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, hypetrain_1.HypetrainHandler.hypeTrainProgress)];
                    case 9:
                        _26.apply(_25, [(_78.subscription = _102.sent(), _78)]);
                        _28 = (_27 = subscriptions).push;
                        _79 = { listener: Listeners.hypetrain };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, hypetrain_1.HypetrainHandler.hypeTrainEnd)];
                    case 10:
                        _28.apply(_27, [(_79.subscription = _102.sent(), _79)]);
                        _102.label = 11;
                    case 11:
                        if (!((_q = (_p = (_o = settings === null || settings === void 0 ? void 0 : settings.api) === null || _o === void 0 ? void 0 : _o.listeners) === null || _p === void 0 ? void 0 : _p.moderator) === null || _q === void 0 ? void 0 : _q.enabled)) return [3 /*break*/, 14];
                        _30 = (_29 = subscriptions).push;
                        _80 = { listener: Listeners.moderator };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelModeratorAddEvents(channel.id, moderator_1.ModeratorHandler.moderatorAddEvent)];
                    case 12:
                        _30.apply(_29, [(_80.subscription = _102.sent(), _80)]);
                        _32 = (_31 = subscriptions).push;
                        _81 = { listener: Listeners.moderator };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelModeratorRemoveEvents(channel.id, moderator_1.ModeratorHandler.moderatorRemoveEvent)];
                    case 13:
                        _32.apply(_31, [(_81.subscription = _102.sent(), _81)]);
                        _102.label = 14;
                    case 14:
                        if (!((_t = (_s = (_r = settings === null || settings === void 0 ? void 0 : settings.api) === null || _r === void 0 ? void 0 : _r.listeners) === null || _s === void 0 ? void 0 : _s.poll) === null || _t === void 0 ? void 0 : _t.enabled)) return [3 /*break*/, 18];
                        _34 = (_33 = subscriptions).push;
                        _82 = { listener: Listeners.poll };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelPollBeginEvents(channel.id, poll_1.PollHandler.pollBeginEvent)];
                    case 15:
                        _34.apply(_33, [(_82.subscription = _102.sent(), _82)]);
                        _36 = (_35 = subscriptions).push;
                        _83 = { listener: Listeners.poll };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelPollProgressEvents(channel.id, poll_1.PollHandler.pollProgressEvent)];
                    case 16:
                        _36.apply(_35, [(_83.subscription = _102.sent(), _83)]);
                        _38 = (_37 = subscriptions).push;
                        _84 = { listener: Listeners.poll };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelPollEndEvents(channel.id, poll_1.PollHandler.pollEndEvent)];
                    case 17:
                        _38.apply(_37, [(_84.subscription = _102.sent(), _84)]);
                        _102.label = 18;
                    case 18:
                        if (!((_w = (_v = (_u = settings === null || settings === void 0 ? void 0 : settings.api) === null || _u === void 0 ? void 0 : _u.listeners) === null || _v === void 0 ? void 0 : _v.prediction) === null || _w === void 0 ? void 0 : _w.enabled)) return [3 /*break*/, 22];
                        _40 = (_39 = subscriptions).push;
                        _85 = { listener: Listeners.prediction };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelPredictionBeginEvents(channel.id, prediction_1.PredictionHandler.predictionBeginEvent)];
                    case 19:
                        _40.apply(_39, [(_85.subscription = _102.sent(), _85)]);
                        //subscriptions.push({listener: Listeners.prediction, subscription: await Twitch.listener.subscribeToChannelPredictionProgressEvents(channel.id, PredictionHandler.predictionProgressEvent)})    
                        _42 = (_41 = subscriptions).push;
                        _86 = { listener: Listeners.prediction };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelPredictionLockEvents(channel.id, prediction_1.PredictionHandler.predictionLockEvent)];
                    case 20:
                        //subscriptions.push({listener: Listeners.prediction, subscription: await Twitch.listener.subscribeToChannelPredictionProgressEvents(channel.id, PredictionHandler.predictionProgressEvent)})    
                        _42.apply(_41, [(_86.subscription = _102.sent(), _86)]);
                        _44 = (_43 = subscriptions).push;
                        _87 = { listener: Listeners.prediction };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelPredictionEndEvents(channel.id, prediction_1.PredictionHandler.predictionEndEvent)];
                    case 21:
                        _44.apply(_43, [(_87.subscription = _102.sent(), _87)]);
                        _102.label = 22;
                    case 22:
                        if (!((_z = (_y = (_x = settings === null || settings === void 0 ? void 0 : settings.api) === null || _x === void 0 ? void 0 : _x.listeners) === null || _y === void 0 ? void 0 : _y.raid) === null || _z === void 0 ? void 0 : _z.enabled)) return [3 /*break*/, 25];
                        _46 = (_45 = subscriptions).push;
                        _88 = { listener: Listeners.prediction };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRaidEventsFrom(channel.id, raid_1.RaidHandler.raidFromEvent)];
                    case 23:
                        _46.apply(_45, [(_88.subscription = _102.sent(), _88)]);
                        _48 = (_47 = subscriptions).push;
                        _89 = { listener: Listeners.prediction };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRaidEventsTo(channel.id, raid_1.RaidHandler.raidToEvent)];
                    case 24:
                        _48.apply(_47, [(_89.subscription = _102.sent(), _89)]);
                        _102.label = 25;
                    case 25:
                        if (!((_2 = (_1 = (_0 = settings === null || settings === void 0 ? void 0 : settings.api) === null || _0 === void 0 ? void 0 : _0.listeners) === null || _1 === void 0 ? void 0 : _1.redemption) === null || _2 === void 0 ? void 0 : _2.enabled)) return [3 /*break*/, 28];
                        _50 = (_49 = subscriptions).push;
                        _90 = { listener: Listeners.redemption };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRedemptionAddEvents(channel.id, redemption_1.RedemptionHandler.redemptionAddEvent)];
                    case 26:
                        _50.apply(_49, [(_90.subscription = _102.sent(), _90)]);
                        _52 = (_51 = subscriptions).push;
                        _91 = { listener: Listeners.redemption };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRedemptionUpdateEvents(channel.id, redemption_1.RedemptionHandler.redemptionUpdateEvent)];
                    case 27:
                        _52.apply(_51, [(_91.subscription = _102.sent(), _91)]);
                        _102.label = 28;
                    case 28:
                        if (!((_5 = (_4 = (_3 = settings === null || settings === void 0 ? void 0 : settings.api) === null || _3 === void 0 ? void 0 : _3.listeners) === null || _4 === void 0 ? void 0 : _4.reward) === null || _5 === void 0 ? void 0 : _5.enabled)) return [3 /*break*/, 32];
                        _54 = (_53 = subscriptions).push;
                        _92 = { listener: Listeners.reward };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRewardAddEvents(channel.id, reward_1.RewardHandler.rewardAddEvent)];
                    case 29:
                        _54.apply(_53, [(_92.subscription = _102.sent(), _92)]);
                        _56 = (_55 = subscriptions).push;
                        _93 = { listener: Listeners.reward };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRewardRemoveEvents(channel.id, reward_1.RewardHandler.rewardRemoveEvent)];
                    case 30:
                        _56.apply(_55, [(_93.subscription = _102.sent(), _93)]);
                        _58 = (_57 = subscriptions).push;
                        _94 = { listener: Listeners.reward };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRewardUpdateEvents(channel.id, reward_1.RewardHandler.rewardUpdateEvent)];
                    case 31:
                        _58.apply(_57, [(_94.subscription = _102.sent(), _94)]);
                        _102.label = 32;
                    case 32:
                        if (!((_8 = (_7 = (_6 = settings === null || settings === void 0 ? void 0 : settings.api) === null || _6 === void 0 ? void 0 : _6.listeners) === null || _7 === void 0 ? void 0 : _7.subscription) === null || _8 === void 0 ? void 0 : _8.enabled)) return [3 /*break*/, 37];
                        _60 = (_59 = subscriptions).push;
                        _95 = { listener: Listeners.subscription };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelSubscriptionEvents(channel.id, subscriptions_1.SubscriptionHandler.subscriptionEvent)];
                    case 33:
                        _60.apply(_59, [(_95.subscription = _102.sent(), _95)]);
                        _62 = (_61 = subscriptions).push;
                        _96 = { listener: Listeners.subscription };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelSubscriptionEndEvents(channel.id, subscriptions_1.SubscriptionHandler.subscriptionEndEvent)];
                    case 34:
                        _62.apply(_61, [(_96.subscription = _102.sent(), _96)]);
                        _64 = (_63 = subscriptions).push;
                        _97 = { listener: Listeners.subscription };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelSubscriptionGiftEvents(channel.id, subscriptions_1.SubscriptionHandler.subscriptionGiftEvent)];
                    case 35:
                        _64.apply(_63, [(_97.subscription = _102.sent(), _97)]);
                        _66 = (_65 = subscriptions).push;
                        _98 = { listener: Listeners.subscription };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelSubscriptionMessageEvents(channel.id, subscriptions_1.SubscriptionHandler.subscriptionMessageEvent)];
                    case 36:
                        _66.apply(_65, [(_98.subscription = _102.sent(), _98)]);
                        _102.label = 37;
                    case 37:
                        if (!((_11 = (_10 = (_9 = settings === null || settings === void 0 ? void 0 : settings.api) === null || _9 === void 0 ? void 0 : _9.listeners) === null || _10 === void 0 ? void 0 : _10.update) === null || _11 === void 0 ? void 0 : _11.enabled)) return [3 /*break*/, 39];
                        _68 = (_67 = subscriptions).push;
                        _99 = { listener: Listeners.update };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelUpdateEvents(channel.id, update_1.UpdateHandler.updateEvent)];
                    case 38:
                        _68.apply(_67, [(_99.subscription = _102.sent(), _99)]);
                        _102.label = 39;
                    case 39:
                        if (!((_14 = (_13 = (_12 = settings === null || settings === void 0 ? void 0 : settings.api) === null || _12 === void 0 ? void 0 : _12.listeners) === null || _13 === void 0 ? void 0 : _13.live) === null || _14 === void 0 ? void 0 : _14.enabled)) return [3 /*break*/, 42];
                        _70 = (_69 = subscriptions).push;
                        _100 = { listener: Listeners.online };
                        return [4 /*yield*/, Twitch.listener.subscribeToStreamOnlineEvents(channel.id, online_1.OnlineHandler.onlineEvent)];
                    case 40:
                        _70.apply(_69, [(_100.subscription = _102.sent(), _100)]);
                        _72 = (_71 = subscriptions).push;
                        _101 = { listener: Listeners.online };
                        return [4 /*yield*/, Twitch.listener.subscribeToStreamOfflineEvents(channel.id, online_1.OnlineHandler.offlineEvent)];
                    case 41:
                        _72.apply(_71, [(_101.subscription = _102.sent(), _101)]);
                        _102.label = 42;
                    case 42: return [2 /*return*/, subscriptions];
                }
            });
        });
    };
    Twitch.toggleListener = function (channel, listener, enable, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var iClient, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, toRemove, _i, toRemove_1, sub;
            var _m, _o, _p, _q, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0: return [4 /*yield*/, this.findByChannel(channel)];
                    case 1:
                        iClient = _s.sent();
                        if (!(!iClient && enable)) return [3 /*break*/, 2];
                        throw new Error("User doesn't have a connected client...");
                    case 2:
                        if (!(enable && (iClient === null || iClient === void 0 ? void 0 : iClient.subscriptions))) return [3 /*break*/, 12];
                        _a = listener;
                        switch (_a) {
                            case Listeners.redemption: return [3 /*break*/, 3];
                            case Listeners.cheer: return [3 /*break*/, 5];
                            case Listeners.hypetrain: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 11];
                    case 3:
                        _c = (_b = iClient.subscriptions).push;
                        _m = { listener: Listeners.redemption };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelRedemptionAddEvents(channel.id, redemption_1.RedemptionHandler.redemptionAddEvent)];
                    case 4:
                        _c.apply(_b, [(_m.subscription = _s.sent(), _m)]);
                        return [3 /*break*/, 11];
                    case 5:
                        _e = (_d = iClient.subscriptions).push;
                        _o = { listener: Listeners.cheer };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelCheerEvents(channel.id, cheer_1.CheerHandler.cheerEvent)];
                    case 6:
                        _e.apply(_d, [(_o.subscription = _s.sent(), _o)]);
                        return [3 /*break*/, 11];
                    case 7:
                        _g = (_f = iClient.subscriptions).push;
                        _p = { listener: Listeners.hypetrain };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, hypetrain_1.HypetrainHandler.hypeTrainBegin)];
                    case 8:
                        _g.apply(_f, [(_p.subscription = _s.sent(), _p)]);
                        _j = (_h = iClient.subscriptions).push;
                        _q = { listener: Listeners.hypetrain };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, hypetrain_1.HypetrainHandler.hypeTrainProgress)];
                    case 9:
                        _j.apply(_h, [(_q.subscription = _s.sent(), _q)]);
                        _l = (_k = iClient.subscriptions).push;
                        _r = { listener: Listeners.hypetrain };
                        return [4 /*yield*/, Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, hypetrain_1.HypetrainHandler.hypeTrainEnd)];
                    case 10:
                        _l.apply(_k, [(_r.subscription = _s.sent(), _r)]);
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 17];
                    case 12: return [4 /*yield*/, (0, rxjs_1.from)(iClient.subscriptions).pipe((0, operators_1.filter)(function (s) { return s.listener === listener; }), (0, operators_1.toArray)()).toPromise()];
                    case 13:
                        toRemove = _s.sent();
                        _i = 0, toRemove_1 = toRemove;
                        _s.label = 14;
                    case 14:
                        if (!(_i < toRemove_1.length)) return [3 /*break*/, 17];
                        sub = toRemove_1[_i];
                        return [4 /*yield*/, sub.subscription.stop()
                            //@ts-ignore
                        ];
                    case 15:
                        _s.sent();
                        //@ts-ignore
                        iClient.subscriptions.splice(iClient.subscriptions.indexOf(sub), 1);
                        _s.label = 16;
                    case 16:
                        _i++;
                        return [3 /*break*/, 14];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    Twitch.clients = [];
    return Twitch;
}());
exports.Twitch = Twitch;
var IApiClient = /** @class */ (function () {
    function IApiClient() {
        var _this = this;
        this.searchChannel = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = rxjs_1.from;
                        return [4 /*yield*/, this.client.search.searchChannels(name)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, [(_b.sent()).data])
                            .pipe((0, operators_1.filter)(function (channel) { return channel.name === name; }), (0, operators_1.take)(1))
                            .toPromise()];
                    case 2: 
                    //@ts-ignore
                    return [2 /*return*/, _b.sent()];
                }
            });
        }); };
        this.getStream = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.streams.getStreamByUserId(userId)];
                    case 1: 
                    //@ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        }); };
    }
    return IApiClient;
}());
exports.IApiClient = IApiClient;
var Listeners;
(function (Listeners) {
    Listeners[Listeners["ban"] = 0] = "ban";
    Listeners[Listeners["cheer"] = 1] = "cheer";
    Listeners[Listeners["follow"] = 2] = "follow";
    Listeners[Listeners["hypetrain"] = 3] = "hypetrain";
    Listeners[Listeners["moderator"] = 4] = "moderator";
    Listeners[Listeners["poll"] = 5] = "poll";
    Listeners[Listeners["prediction"] = 6] = "prediction";
    Listeners[Listeners["raid"] = 7] = "raid";
    Listeners[Listeners["redemption"] = 8] = "redemption";
    Listeners[Listeners["reward"] = 9] = "reward";
    Listeners[Listeners["subscription"] = 10] = "subscription";
    Listeners[Listeners["update"] = 11] = "update";
    Listeners[Listeners["online"] = 12] = "online";
})(Listeners = exports.Listeners || (exports.Listeners = {}));
//# sourceMappingURL=twitch.js.map