"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.filterParameters = exports.MAX_CHAT_MESSAGE_LENGTH = void 0;
exports.MAX_CHAT_MESSAGE_LENGTH = 500;
var filterParameters = function (message) {
    var parameters = message.split(' ');
    parameters.shift();
    return parameters;
};
exports.filterParameters = filterParameters;
var Message = /** @class */ (function () {
    function Message(iClient) {
        var _this = this;
        this.cooldowns = {};
        this._init = function () {
            var keys = [];
            for (var _i = 0, _a = Object.keys(_this); _i < _a.length; _i++) {
                var key = _a[_i];
                if (typeof _this[key] === 'function' && !key.startsWith('_'))
                    keys.push(key);
            }
            _this.client.onMessage(function (channel, user, message, msg) {
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    _this[key](channel, user, message, msg);
                }
            });
        };
        this._timeout = function (timeInSeconds, identifier) {
            var caller = identifier
                ? identifier
                : new Error().stack
                    .split('\n')[2]
                    .replace(/^.*\.\_this\./, '')
                    .replace(/ \(.*\)$/, '');
            if (timeInSeconds && Date.now() - _this.cooldowns[caller] < timeInSeconds * 1000) {
                return true;
            }
            else {
                _this.cooldowns[caller] = Date.now();
                return false;
            }
        };
        this._replace = function (message, user) {
            return message.replace(/\@user/, "@".concat(user));
        };
        this.iClient = iClient;
        this.client = iClient.client;
        this.settings = iClient.settings.chatbot.categories;
    }
    return Message;
}());
exports.Message = Message;
//# sourceMappingURL=message.js.map