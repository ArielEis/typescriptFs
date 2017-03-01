"use strict";
var History = (function () {
    function History() {
        this.locationStorage = [];
        this.pointer = 0;
        this.maxSize = 50;
    }
    History.prototype.goBack = function () {
        this.pointer--;
        return this.locationStorage[this.pointer];
    };
    History.prototype.goForward = function () {
        this.pointer++;
        return this.locationStorage[this.pointer];
    };
    History.prototype.addToHistory = function (id) {
        if (this.locationStorage[this.pointer] !== id) {
            if (this.pointer < (this.locationStorage.length - 1)) {
                this.locationStorage.splice(this.pointer + 1);
            }
            if (this.locationStorage.length > this.maxSize) {
                this.locationStorage.shift();
                this.pointer = this.maxSize - 1;
            }
            this.locationStorage.push(id);
            this.pointer++;
        }
    };
    History.prototype.setLength = function (length) {
        this.locationStorage.length = length;
    };
    History.prototype.getLength = function () {
        return this.locationStorage.length;
    };
    History.prototype.getPointer = function () {
        return this.pointer;
    };
    History.prototype.getHistory = function (index) {
        return this.locationStorage[index];
    };
    History.prototype.removeItemAtIndex = function (index) {
        this.locationStorage.splice(index, 1);
    };
    History.prototype.getMaxSize = function () {
        return this.maxSize;
    };
    return History;
}());
exports.historyLog = new History();
//# sourceMappingURL=history.js.map