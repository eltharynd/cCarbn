"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elements = exports.elementsSchema = void 0;
var mongoose_1 = require("mongoose");
var merge = require("deepmerge");
var ELEMENT_TEMPLATE = {
    name: 'An element',
    conditions: [{
            type: 'bit',
            operator: 'equals',
            compared: 1
        }],
    events: []
};
exports.elementsSchema = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    json: {
        type: Object,
        get: function (data) {
            try {
                return merge(ELEMENT_TEMPLATE, JSON.parse(data));
            }
            catch (e) {
                return merge(ELEMENT_TEMPLATE, data);
            }
        },
        set: function (data) { return JSON.stringify(data); },
        default: {}
    }
});
exports.Elements = (0, mongoose_1.model)('Elements', exports.elementsSchema);
//# sourceMappingURL=elements.js.map