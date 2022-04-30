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
exports.deleteUser = exports.User = exports.userSchema = void 0;
var mongoose_1 = require("mongoose");
var mongo_1 = require("../mongo");
var settings_1 = require("./settings");
var command_1 = require("./command");
var tokens_1 = require("./tokens");
exports.userSchema = new mongoose_1.Schema({
    token: String,
    admin: Boolean,
    twitchId: String,
    twitchLoginName: String,
    twitchDisplayName: String,
    twitchPic: String,
    created: {
        type: Date,
        default: Date.now()
    }
});
exports.User = (0, mongoose_1.model)('User', exports.userSchema);
var deleteUser = function (userMongoId) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, userTokem, clientToken, settings, commands, files, _i, userTokem_1, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = userMongoId.toString();
                return [4 /*yield*/, exports.User.findOne({ _id: userId })];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, tokens_1.UserToken.deleteMany({ userId: userId })];
            case 2:
                userTokem = _a.sent();
                return [4 /*yield*/, tokens_1.ClientToken.deleteMany({ userId: userId })];
            case 3:
                clientToken = _a.sent();
                return [4 /*yield*/, settings_1.Settings.deleteMany({ userId: userId })];
            case 4:
                settings = _a.sent();
                return [4 /*yield*/, command_1.Command.deleteMany({ userId: userId })];
            case 5:
                commands = _a.sent();
                return [4 /*yield*/, mongo_1.Mongo.Upload.find({ metadata: { userId: mongo_1.Mongo.ObjectId(userId) } })];
            case 6:
                files = _a.sent();
                _i = 0, userTokem_1 = userTokem;
                _a.label = 7;
            case 7:
                if (!(_i < userTokem_1.length)) return [3 /*break*/, 10];
                i = userTokem_1[_i];
                return [4 /*yield*/, mongo_1.Mongo.Upload.unlink({ _id: i._id }, function (error, unlink) { })];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 7];
            case 10: return [4 /*yield*/, exports.User.deleteOne({ _id: userId })];
            case 11:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.js.map