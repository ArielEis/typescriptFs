"use strict";
var folder_1 = require("./folder");
var textFile_1 = require("./textFile");
var FileSystem = (function () {
    function FileSystem() {
        this.root = new folder_1.Folder(0, 'ROOT');
        this.nextId = 1;
        var system = localStorage.getItem('file_system');
        if (system === null) {
            this.root = new folder_1.Folder(0, 'Root');
        }
        else {
            var linearArray = JSON.parse(system);
            this.root = new folder_1.Folder(linearArray[0][1], linearArray[0][2]);
            if (linearArray.length > 0) {
                var parent_1 = null;
                for (var i = 1; i < linearArray.length; i++) {
                    parent_1 = this.getItem(linearArray[i][3]);
                    if (linearArray[i][0] === 'folder') {
                        this.addFolder(linearArray[i][2], parent_1.id);
                    }
                    else {
                        this.addFile(linearArray[i][2], parent_1.id, linearArray[i][4]);
                    }
                }
            }
        }
    }
    FileSystem.prototype.addFolder = function (name, parentId) {
        var newFolder = new folder_1.Folder(this.nextId++, name);
        var targetFolder = this.getItemById(this.root, parentId);
        if (targetFolder.getType() !== 'folder') {
            throw new Error('Cannot create new folder in this location');
        }
        targetFolder.addChild(newFolder);
    };
    FileSystem.prototype.addFile = function (name, parentId, content) {
        var folder = this.getItemById(this.root, parentId);
        if (!(folder instanceof folder_1.Folder)) {
            return;
        }
        folder.addChild(new textFile_1.TextFile(this.nextId++, name, content));
    };
    FileSystem.prototype.renameItem = function (id, newName) {
        var file = this.getItem(id);
        file.rename(newName);
    };
    FileSystem.prototype.deleteItem = function (id) {
        var folder = this.getParentById(this.root, id);
        if (!(folder instanceof folder_1.Folder)) {
            return;
        }
        folder.deleteChild(id);
    };
    FileSystem.prototype.getItem = function (uniqueIdentify) {
        switch (typeof uniqueIdentify) {
            case 'number':
                return this.getItemById(this.root, uniqueIdentify);
            case 'string':
                return this.getItemByPath(this.root, uniqueIdentify);
            default:
                return null;
        }
    };
    FileSystem.prototype.getPath = function (id) {
        var pathArray = [];
        this.buildPathOfFile(this.root, id, pathArray);
        return pathArray.join('/');
    };
    FileSystem.prototype.getItemById = function (folder, id) {
        var isFound = false;
        var i = 0;
        var result = undefined;
        if (folder.id === id) {
            return folder;
        }
        while (!isFound && i < folder.items.length) {
            var file = folder.items[i];
            if (file.id === id) {
                isFound = true;
                return file;
            }
            else if (file instanceof folder_1.Folder) {
                result = this.getItemById(file, id);
                if (result !== undefined) {
                    return result;
                }
            }
            i++;
        }
    };
    FileSystem.prototype.getParentById = function (folder, id) {
        var isFound = false;
        var i = 0;
        var result = undefined;
        if (0 === id) {
            return this.root;
        }
        while (!isFound && i < folder.items.length) {
            var file = folder.items[i];
            if (file.id === id) {
                isFound = true;
                return folder;
            }
            else if (file instanceof folder_1.Folder) {
                result = this.getParentById(file, id);
                if (result !== undefined) {
                    return result;
                }
            }
            i++;
        }
    };
    FileSystem.prototype.getTextFileById = function (id) {
        var textFile = this.getItem(id);
        if (!(textFile instanceof textFile_1.TextFile)) {
            return null;
        }
        return textFile;
    };
    FileSystem.prototype.getFolderById = function (id) {
        var folder = this.getItem(id);
        if (!(folder instanceof folder_1.Folder)) {
            return null;
        }
        return folder;
    };
    FileSystem.prototype.getFreeNewName = function (id, name, type) {
        var currentItem = this.getItemById(this.root, id);
        if (currentItem.getType() !== 'folder') {
            throw new Error(currentItem + ' is not a folder');
        }
        var count = 0;
        var isFound = false;
        var newName = name;
        if (currentItem.isNameExist(name, type)) {
            while (!isFound) {
                count++;
                if (!currentItem.isNameExist(name + ' (' + count + ')', type)) {
                    return name + ' (' + count + ')';
                }
            }
        }
        return newName;
    };
    FileSystem.prototype.saveInLocalStorage = function () {
        var linearArray = [];
        this.insertSystemToArray(this.root, linearArray);
        localStorage.setItem('file_system', JSON.stringify(linearArray));
    };
    FileSystem.prototype.insertSystemToArray = function (currentItem, linearArray) {
        switch (currentItem.getType()) {
            case 'folder':
                linearArray.push(['folder', currentItem.id, currentItem.name,
                    this.getParentById(this.root, currentItem.id).id]);
                for (var i = 0; i < currentItem.items.length; i++) {
                    this.insertSystemToArray(currentItem.items[i], linearArray);
                }
                break;
            case 'file':
                linearArray.push(['file', currentItem.id, currentItem.name,
                    this.getParentById(this.root, currentItem.id).id, currentItem.content]);
                break;
        }
    };
    ;
    FileSystem.prototype.buildPathOfFile = function (currentFolder, id, path) {
        path.push(currentFolder.name);
        var isFound = false;
        var i = 0;
        var result = undefined;
        if (currentFolder.id === id) {
            result = currentFolder;
            return result;
        }
        else {
            while (!isFound && i < currentFolder.items.length) {
                if (currentFolder.items[i].id === id) {
                    isFound = true;
                    path.push(currentFolder.items[i].name);
                    result = currentFolder.items[i];
                    return result;
                }
                else {
                    var folder = currentFolder.items[i];
                    if (folder instanceof folder_1.Folder) {
                        result = this.buildPathOfFile(folder, id, path);
                        if (result !== undefined) {
                            return result;
                        }
                    }
                }
                i++;
            }
        }
        path.pop();
    };
    FileSystem.prototype.getItemByPath = function (folder, pathString) {
        var file = undefined;
        var path = pathString.split('/');
        if (this.root.name.toLowerCase() !== path[0].toLowerCase()) {
            return file;
        }
        var currentItem = this.root;
        var index = 1;
        var isFound = true;
        var isRunning = true;
        while (isRunning && index < path.length) {
            isFound = false;
            console.log('searching', index, path.length);
            if (currentItem.isNameExist(path[index], 'folder') ||
                (currentItem.isNameExist(path[index], 'file') && index === path.length - 1)) {
                isFound = true;
                var items = currentItem.getChildren();
                for (var i = 0; i < items.length; i++) {
                    var tempFile = items[i];
                    console.log(tempFile);
                    if (tempFile.name.toLowerCase() === path[index].toLowerCase()) {
                        if (tempFile instanceof folder_1.Folder) {
                            console.log(tempFile);
                            currentItem = tempFile;
                            break;
                        }
                        else if (index === path.length - 1) {
                            return tempFile;
                        }
                    }
                }
            }
            index++;
        }
        if (isFound && file === undefined) {
            file = currentItem;
        }
        if (!isFound) {
            return undefined;
        }
        return file;
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;
exports.fileSystem = new FileSystem();
//# sourceMappingURL=fileSystem.js.map