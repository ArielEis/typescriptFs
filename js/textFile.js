"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstractFile_1 = require("./abstractFile");
var TextFile = (function (_super) {
    __extends(TextFile, _super);
    function TextFile(id, name, content) {
        _super.call(this, id, name);
        this.content = content;
    }
    TextFile.prototype.getContent = function () {
        return this.content;
    };
    TextFile.prototype.setContent = function (newContent) {
        this.content = newContent;
    };
    TextFile.prototype.getType = function () {
        return 'file';
    };
    return TextFile;
}(abstractFile_1.AbstractFile));
exports.TextFile = TextFile;
//# sourceMappingURL=textFile.js.map