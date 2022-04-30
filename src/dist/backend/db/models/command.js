"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.commandSchema = void 0;
var mongoose_1 = require("mongoose");
exports.commandSchema = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    command: String,
    params: Array,
    answer: String,
    mods: Boolean,
    source: String,
});
exports.Command = (0, mongoose_1.model)('Command', exports.commandSchema);
//# sourceMappingURL=command.js.map