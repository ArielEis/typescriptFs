"use strict";
var AbstractFile = (function () {
    function AbstractFile(id, name) {
        this.id = id;
        this.name = name;
    }
    AbstractFile.prototype.getId = function () {
        return this.id;
    };
    AbstractFile.prototype.rename = function (newName) {
        this.name = newName;
    };
    AbstractFile.prototype.getType = function () {
        return '';
    };
    return AbstractFile;
}());
exports.AbstractFile = AbstractFile;
//# sourceMappingURL=abstractFile.js.map