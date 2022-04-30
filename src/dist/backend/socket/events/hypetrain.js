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
exports.HypetrainHandler = void 0;
var user_1 = require("../../db/models/user");
var twitch_1 = require("../../twitch/twitch");
var socket_1 = require("../socket");
var toJSON_1 = require("./util/toJSON");
var HypetrainHandler = /** @class */ (function () {
    function HypetrainHandler() {
    }
    var _a;
    _a = HypetrainHandler;
    HypetrainHandler.hypeTrainBegin = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var data, helixUser, _i, _b, u, helixUser, found;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    data = (0, toJSON_1.toJSON)(event);
                    data.type = 'Hype Train Begin';
                    console.log(data);
                    if (!data.last_contribution) return [3 /*break*/, 2];
                    return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(data.last_contribution.user_id)];
                case 1:
                    helixUser = _c.sent();
                    if (helixUser)
                        data.last_contribution.picture = helixUser.profilePictureUrl;
                    _c.label = 2;
                case 2:
                    if (!data.top_contributions) return [3 /*break*/, 6];
                    _i = 0, _b = data.top_contributions;
                    _c.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    u = _b[_i];
                    return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(u.user_id)];
                case 4:
                    helixUser = _c.sent();
                    if (helixUser) {
                        u.picture = helixUser.profilePictureUrl;
                    }
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, user_1.User.findOne({ twitchId: event.broadcasterId })];
                case 7:
                    found = _c.sent();
                    if (found) {
                        socket_1.Socket.io.to(found._id.toString()).emit('events', data);
                        socket_1.Socket.io.to(found._id.toString()).emit('hypetrain', data);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    HypetrainHandler.hypeTrainProgress = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var data, helixUser, _i, _b, u, helixUser, found;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    data = (0, toJSON_1.toJSON)(event);
                    data.type = 'Hype Train Progress';
                    console.log(data);
                    if (!data.last_contribution) return [3 /*break*/, 2];
                    return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(data.last_contribution.user_id)];
                case 1:
                    helixUser = _c.sent();
                    if (helixUser)
                        data.last_contribution.picture = helixUser.profilePictureUrl;
                    _c.label = 2;
                case 2:
                    if (!data.top_contributions) return [3 /*break*/, 6];
                    _i = 0, _b = data.top_contributions;
                    _c.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    u = _b[_i];
                    return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(u.user_id)];
                case 4:
                    helixUser = _c.sent();
                    if (helixUser)
                        u.picture = helixUser.profilePictureUrl;
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, user_1.User.findOne({ twitchId: event.broadcasterId })];
                case 7:
                    found = _c.sent();
                    if (found)
                        setTimeout(function () {
                            socket_1.Socket.io.to(found._id.toString()).emit('events', data);
                            socket_1.Socket.io.to(found._id.toString()).emit('hypetrain', data);
                        }, 1000);
                    return [2 /*return*/];
            }
        });
    }); };
    HypetrainHandler.hypeTrainEnd = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var data, helixUser, _i, _b, u, helixUser, found;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    data = (0, toJSON_1.toJSON)(event);
                    data.type = 'Hype Train End';
                    console.log(data);
                    if (!data.last_contribution) return [3 /*break*/, 2];
                    return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(data.last_contribution.user_id)];
                case 1:
                    helixUser = _c.sent();
                    if (helixUser)
                        data.last_contribution.picture = helixUser.profilePictureUrl;
                    _c.label = 2;
                case 2:
                    if (!data.top_contributions) return [3 /*break*/, 6];
                    _i = 0, _b = data.top_contributions;
                    _c.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    u = _b[_i];
                    return [4 /*yield*/, twitch_1.Twitch.client.users.getUserById(u.user_id)];
                case 4:
                    helixUser = _c.sent();
                    if (helixUser)
                        u.picture = helixUser.profilePictureUrl;
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, user_1.User.findOne({ twitchId: event.broadcasterId })];
                case 7:
                    found = _c.sent();
                    if (found)
                        setTimeout(function () {
                            socket_1.Socket.io.to(found._id.toString()).emit('events', data);
                            socket_1.Socket.io.to(found._id.toString()).emit('hypetrain', data);
                        }, 1000);
                    return [2 /*return*/];
            }
        });
    }); };
    return HypetrainHandler;
}());
exports.HypetrainHandler = HypetrainHandler;
//# sourceMappingURL=hypetrain.js.map