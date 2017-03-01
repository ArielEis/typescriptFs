"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var abstractFile_1 = require("./abstractFile");
var Folder = (function (_super) {
    __extends(Folder, _super);
    function Folder(id, name) {
        _super.call(this, id, name);
        this.items = [];
    }
    Folder.prototype.getChildren = function () {
        return this.items;
    };
    Folder.prototype.addChild = function (item) {
        if (!(item instanceof abstractFile_1.AbstractFile)) {
            return;
        }
        this.items.push(item);
    };
    Folder.prototype.findChild = function (id) {
        var index = this.getIndexOfChildById(id);
        if (index < 0) {
            return null;
        }
        return this.items[index];
    };
    Folder.prototype.deleteChild = function (id) {
        var index = this.getIndexOfChildById(id);
        if (index < 0) {
            return;
        }
        this.items.splice(index, 1);
    };
    Folder.prototype.getType = function () {
        return 'folder';
    };
    Folder.prototype.getIndexOfChildById = function (id) {
        var itemsToRunOfThem = this.items.length;
        while (itemsToRunOfThem--) {
            var currentItem = this.items[itemsToRunOfThem];
            if (currentItem.id === id) {
                return itemsToRunOfThem;
            }
        }
        return -1;
    };
    Folder.prototype.isNameExist = function (name, type) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].name.toLowerCase() === name.toLowerCase()) {
                if (this.items[i].getType() === type) {
                    return true;
                }
            }
        }
        return false;
    };
    return Folder;
}(abstractFile_1.AbstractFile));
exports.Folder = Folder;
//# sourceMappingURL=folder.js.map