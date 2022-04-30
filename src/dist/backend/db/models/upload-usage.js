"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadUsage = exports.uploadUsage = void 0;
var mongoose_1 = require("mongoose");
exports.uploadUsage = new mongoose_1.Schema({
    fileId: mongoose_1.Schema.Types.ObjectId,
    usages: Number
});
exports.UploadUsage = (0, mongoose_1.model)('UploadUsage', exports.uploadUsage);
//# sourceMappingURL=upload-usage.js.map