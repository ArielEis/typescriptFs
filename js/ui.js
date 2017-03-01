"use strict";
var fileSystem_1 = require("./fileSystem");
var history_1 = require("./history");
var $ = require('jquery');
var folder_1 = require("./folder");
/* Start of local variables */
var page = $('#page');
var content = $('#content');
var browser = $('#browser');
var contentMenu = $('#content_menu');
var promptTemplate = $('#template_prompt');
var alertTemplate = $('#template_alert');
var openFileWindow = $('#open_file_window');
var address = $('#address_line');
var backwardButton = $('#go_back');
var forwardButton = $('#go_forward');
var newFileMenu = contentMenu.find('#new_file_menu');
var contentMenuTitle = contentMenu.find('#menu_title');
var contentTemplate = content.find('.template');
var browserTemplate = browser.find('.template li');
var currentLocationId = -1;
var targetId = -1;
/* end of local variables */
var UI = (function () {
    function UI() {
        this.fileSystem = fileSystem_1.fileSystem;
        this.thisContext = this;
    }
    /* Start of - Initialize functions */
    UI.prototype.initializeTopBar = function () {
        var context = this.thisContext;
        address.val('');
        backwardButton.attr('disabled', 1);
        forwardButton.attr('disabled', 1);
        address.on('keyup', function (e) {
            if (e.keyCode == 13) {
                var item = fileSystem_1.fileSystem.getItem(address.val());
                if (item !== undefined) {
                    switch (item.getType()) {
                        case 'folder':
                            context.openDirectory(item, false);
                            break;
                        case 'file':
                            targetId = item.id;
                            context.showFileContent();
                            targetId = -1;
                            break;
                    }
                }
                else {
                    context.createAlertMessage('address location isn\'t exist');
                    context.updateAddressLine();
                }
            }
        });
        context.initialNavigateButtons();
    };
    UI.prototype.initialNavigateButtons = function () {
        this.initializeBackwardButton();
        this.initializeForwardButton();
    };
    UI.prototype.initializeBackwardButton = function () {
        var context = this.thisContext;
        backwardButton.click(function () {
            if (history_1.historyLog.getPointer() > 0) {
                var backToDirectory = undefined;
                while (backToDirectory === undefined && history_1.historyLog.getPointer() > 0) {
                    var destId = history_1.historyLog.goBack();
                    backToDirectory = fileSystem_1.fileSystem.getItem(destId);
                }
                if (history_1.historyLog.getPointer() === 0) {
                    context.handleNavigationButtonsEnable();
                    context.closeDirectory(fileSystem_1.fileSystem.getItem(history_1.historyLog.getHistory(1)));
                }
                else {
                    context.handleNavigationButtonsEnable();
                    context.openDirectory(backToDirectory, true);
                }
            }
        });
    };
    UI.prototype.initializeForwardButton = function () {
        var context = this.thisContext;
        forwardButton.click(function () {
            if (history_1.historyLog.getPointer() < history_1.historyLog.getMaxSize() && history_1.historyLog.getPointer() < (history_1.historyLog.getLength() - 1)) {
                var goToDirectory = undefined;
                var destId = history_1.historyLog.goForward();
                while (goToDirectory === undefined && history_1.historyLog.getPointer() > 0) {
                    goToDirectory = fileSystem_1.fileSystem.getItem(destId);
                    if (goToDirectory === undefined) {
                        history_1.historyLog.removeItemAtIndex(history_1.historyLog.getPointer());
                    }
                }
                context.handleNavigationButtonsEnable();
                context.openDirectory(goToDirectory, true);
            }
        });
    };
    UI.prototype.initializeBrowser = function () {
        browser.empty();
        var newNode = browserTemplate.clone();
        newNode.find('.arrow').remove();
        var folder = newNode.find('.folder');
        folder.attr('id', 'folder_0');
        folder.attr('index', 0);
        folder.attr('state', 'close');
        this.addListenerClickToFolderIconOnBrowser(folder, this.thisContext);
        var aTag = newNode.find('a');
        aTag.text(fileSystem_1.fileSystem.getItem(0).name);
        aTag.attr('class', 'a_ul');
        aTag.attr('index', 0);
        aTag.attr('state', 'close');
        this.addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag, this.thisContext);
        browser.append(newNode);
        browser.contextmenu(function () {
            return false;
        });
        var context = this.thisContext;
        browser.mousedown(function (event) {
            if (event.button !== 2) {
                context.closeObject([contentMenu, newFileMenu], 200);
            }
        });
    };
    UI.prototype.initializeContent = function () {
        var context = this.thisContext;
        content.empty();
        content.css({ 'background-color': '#666' });
        content.contextmenu(function () {
            return false;
        });
        content.mousedown(function (event) {
            if (currentLocationId > -1) {
                context.setRightClickContextMenu(event);
            }
        });
    };
    UI.prototype.initialContextMenuOptions = function () {
        this.addListenerClickToDeleteFile(this.thisContext);
        this.addListenerClickToRenameFile(this.thisContext);
        this.addListenerClickToNewFile(this.thisContext);
        this.addListenerClickToQuitContentMenu(this.thisContext);
        this.addListenerClickToCreateNewDirectory(this.thisContext);
        this.addListenerClickToCreateNewFile(this.thisContext);
    };
    /* End of - Initialize functions */
    /* Function for browser window */
    UI.prototype.openDirectoryOnBrowser = function (directory) {
        var folderIcon = browser.find('#folder_' + directory.id);
        folderIcon.attr('src', 'pics/open_directory.png');
        folderIcon.attr('state', 'open');
        var allDirectories = [];
        var allFiles = [];
        this.seperateFilesInsideDirectory(directory, allDirectories, allFiles);
        allDirectories = this.mergeSort(allDirectories, 'fileName');
        for (var i = 0; i < allDirectories.length; i++) {
            this.drawDirectoryOnBrowser(allDirectories[i].name, allDirectories[i].id, directory.id);
        }
    };
    UI.prototype.closeDirectoryOnBrowser = function (directory) {
        var folderIcon = browser.find('#folder_' + directory.id);
        folderIcon.attr('src', 'pics/close_directory.png');
        folderIcon.attr('state', 'close');
        for (var i = 0; i < directory.items.length; i++) {
            this.removeDirectoryFromBrowser(directory.items[i].id);
        }
    };
    UI.prototype.removeDirectoryFromBrowser = function (id) {
        browser.find('#ul_' + id).remove();
    };
    UI.prototype.drawDirectoryOnBrowser = function (name, id, parentId) {
        var newNode = browserTemplate.clone();
        var folder = newNode.find('.folder');
        folder.attr('id', 'folder_' + id);
        folder.attr('index', id);
        folder.attr('state', 'close');
        this.addListenerClickToFolderIconOnBrowser(folder, this.thisContext);
        var aTag = newNode.find('a');
        aTag.text(name);
        newNode.find('ul').attr('id', 'ul_' + id);
        aTag.attr('id', 'a_' + id);
        aTag.attr('index', id);
        aTag.attr('state', 'close');
        this.addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag, this.thisContext);
        browser.find('#ul_' + parentId).append(newNode);
    };
    /* Function for content window */
    UI.prototype.openDirectory = function (directory, isHistoryRequest) {
        content.css({ 'background-color': 'snow' });
        content.empty();
        currentLocationId = directory.id;
        var allDirectories = [];
        var allFiles = [];
        this.seperateFilesInsideDirectory(directory, allDirectories, allFiles);
        allDirectories = this.mergeSort(allDirectories, 'fileName');
        allFiles = this.mergeSort(allFiles, 'fileName');
        for (var i = 0; i < allDirectories.length; i++) {
            this.drawDirectoryOnContent(allDirectories[i].name, allDirectories[i].id);
        }
        for (var i = 0; i < allFiles.length; i++) {
            this.drawFileOnContent(allFiles[i].name, allFiles[i].id, allFiles[i].getType());
        }
        this.updateAddressLine();
        if (!isHistoryRequest) {
            history_1.historyLog.setLength(history_1.historyLog.getPointer() + 1);
            history_1.historyLog.addToHistory(currentLocationId);
            this.handleNavigationButtonsEnable();
        }
    };
    UI.prototype.closeDirectory = function (directory) {
        var folder = this.fileSystem.getParentById(this.fileSystem.root, directory.id);
        if (folder instanceof folder_1.Folder) {
            currentLocationId = folder.id;
        }
        else {
            currentLocationId = -1;
        }
        content.empty();
        content.css({ 'background-color': '#666' });
        address.val('');
    };
    UI.prototype.showFileContent = function () {
        var context = this.thisContext;
        var window = openFileWindow.clone();
        var file = fileSystem_1.fileSystem.getTextFileById(targetId);
        window.find('.file_title').text(file.name + ".txt");
        var input = window.find('#file_content_text');
        input.text(file.getContent());
        window.find('#file_quit').click(function () {
            context.closeObject([window], 200);
        });
        window.find('#cancel_file').click(function () {
            context.closeObject([window], 200);
        });
        window.find('#save_file').click(function () {
            file.setContent(input.val());
            context.saveSystem();
            context.closeObject([window], 200);
        });
        page.append(window);
        context.openObject([window], 200);
    };
    UI.prototype.drawDirectoryOnContent = function (name, id) {
        var context = this.thisContext;
        var newFolder = contentTemplate.clone();
        var folderIcon = newFolder.find(".icon");
        this.setUpFileContent(newFolder, folderIcon, name, id, 'directory');
        folderIcon.dblclick(function () {
            targetId = parseInt($(this).attr('index'));
            var targetDirectory = fileSystem_1.fileSystem.getItem(id);
            context.openDirectory(targetDirectory, false);
        });
        content.append(newFolder);
    };
    UI.prototype.drawFileOnContent = function (name, id, type) {
        var context = this.thisContext;
        var newFile = contentTemplate.clone();
        var folderIcon = newFile.find(".icon");
        this.setUpFileContent(newFile, folderIcon, name, id, type);
        folderIcon.dblclick(function () {
            targetId = parseInt($(this).attr('index'));
            context.showFileContent();
        });
        content.append(newFile);
    };
    UI.prototype.removeItemFromContent = function () {
        content.find('#file_' + targetId).remove();
    };
    UI.prototype.setUpFileContent = function (file, icon, name, id, type) {
        file.attr('id', 'file_' + id);
        file.find(".file_name").text(name);
        icon.attr('index', id);
        switch (type) {
            case 'file':
                icon.attr('src', 'pics/txt.png');
                icon.css({ 'width': '60%' });
                break;
        }
        icon.mousedown(function (event) {
            if (event.button === 2) {
                targetId = parseInt($(this).attr('index'));
            }
        });
    };
    /* Function for top bar */
    UI.prototype.updateAddressLine = function () {
        if (currentLocationId >= 0) {
            address.val(fileSystem_1.fileSystem.getPath(currentLocationId));
        }
        else {
            address.val('');
        }
    };
    UI.prototype.handleNavigationButtonsEnable = function () {
        var pointer = history_1.historyLog.getPointer();
        if (pointer <= 0) {
            this.disableButton(backwardButton);
        }
        else {
            this.enableButton(backwardButton);
        }
        if (pointer > -1 && pointer < history_1.historyLog.getLength() - 1) {
            this.enableButton(forwardButton);
        }
        else {
            this.disableButton(forwardButton);
        }
    };
    UI.prototype.disableButton = function (button) {
        button.attr('disabled', true);
        button.attr('class', 'disabled_button');
    };
    UI.prototype.enableButton = function (button) {
        button.attr('disabled', false);
        button.attr('class', 'enabled_button');
    };
    /* Function influence on file system */
    UI.prototype.createNewDirectory = function (name) {
        this.checkTargetFromBrowserOrFromContent();
        fileSystem_1.fileSystem.addFolder(name, targetId);
        if (browser.find('#folder_' + targetId).attr('state') === 'open') {
            this.drawDirectoryOnBrowser(name, (fileSystem_1.fileSystem.nextId - 1), targetId);
        }
        else {
            this.openDirectoryOnBrowser(fileSystem_1.fileSystem.getItem(targetId));
        }
        if (targetId === currentLocationId) {
            this.drawDirectoryOnContent(name, (fileSystem_1.fileSystem.nextId - 1));
        }
        this.saveSystem();
    };
    UI.prototype.createNewFile = function (name, type) {
        this.checkTargetFromBrowserOrFromContent();
        fileSystem_1.fileSystem.addFile(name, targetId, 'Empty-file');
        if (targetId === currentLocationId) {
            this.drawFileOnContent(name, (fileSystem_1.fileSystem.nextId - 1), type);
        }
        this.saveSystem();
    };
    UI.prototype.deleteItem = function () {
        this.checkTargetFromBrowserOrFromContent();
        this.setConfirmDeletePrompt();
    };
    UI.prototype.deleteItemExecute = function () {
        if (fileSystem_1.fileSystem.getItem(targetId).getType() === 'folder') {
            this.removeDirectoryFromBrowser(targetId);
        }
        if (targetId === currentLocationId) {
            this.removeItemFromContent();
        }
        fileSystem_1.fileSystem.deleteItem(targetId);
        content.find('#file_' + targetId).remove();
        this.saveSystem();
    };
    UI.prototype.renameItem = function (targetFile, name) {
        fileSystem_1.fileSystem.renameItem(targetFile.id, name);
        browser.find('#a_' + targetFile.id).text(name);
        content.find('#file_' + targetFile.id).find(".file_name").text(name);
        this.updateAddressLine();
        this.saveSystem();
    };
    /* Context menu */
    UI.prototype.setRightClickContextMenu = function (event) {
        var context = this.thisContext;
        if (event.button === 2) {
            context.checkTargetFromBrowserOrFromContent();
            var title = this.setMaxLengthOfTitle15Characters(fileSystem_1.fileSystem.getItem(targetId).name);
            contentMenuTitle.text(title);
            contentMenu.css('left', event.pageX + 5);
            contentMenu.css('top', event.pageY + 5);
            context.openObject([contentMenu], 200);
        }
        else {
            context.closeObject([contentMenu, newFileMenu], 200);
            targetId = -1;
        }
    };
    /*  Listeners:    */
    UI.prototype.addListenerClickToATagForOpenOrCloseDirectoryInBrowser = function (aTag, context) {
        aTag.click(function () {
            var index = parseInt($(this).attr('index'));
            var directory = fileSystem_1.fileSystem.getItem(index);
            if ($(this).attr('state') === 'open') {
                $(this).attr('state', 'close');
                context.closeDirectory(directory);
            }
            else {
                $(this).attr('state', 'open');
                context.openDirectory(directory, false);
            }
        });
        aTag.mousedown(function (event) {
            targetId = parseInt($(this).attr('index'));
            context.setRightClickContextMenu(event);
        });
    };
    UI.prototype.addListenerClickToDeleteFile = function (context) {
        var deleteFile = contentMenu.find('#delete_file');
        deleteFile.click(function () {
            context.closeObject([contentMenu], 200);
            context.deleteItem();
        });
        deleteFile.hover(function () {
            context.closeObject([newFileMenu], 200);
        });
    };
    UI.prototype.addListenerClickToRenameFile = function (context) {
        var renameFile = contentMenu.find('#rename_file');
        renameFile.click(function () {
            context.closeObject([contentMenu], 200);
            context.setRenamePrompt();
        });
        renameFile.hover(function () {
            context.closeObject([newFileMenu], 200);
        });
    };
    UI.prototype.addListenerClickToNewFile = function (context) {
        contentMenu.find('#new_file').hover(function (event) {
            if (newFileMenu.css('display') === 'none') {
                newFileMenu.css('left', event.pageX + 40);
                newFileMenu.css('top', event.pageY - 15);
                context.openObject([newFileMenu], 200);
            }
        });
    };
    UI.prototype.addListenerClickToCreateNewDirectory = function (context) {
        newFileMenu.find('#new_directory').click(function () {
            context.closeObject([newFileMenu, contentMenu], 200);
            context.createPromptNewDirectory();
        });
    };
    UI.prototype.addListenerClickToCreateNewFile = function (context) {
        newFileMenu.find('#new_txt_file').click(function () {
            context.closeObject([newFileMenu, contentMenu], 200);
            context.createPromptNewTextFile();
        });
    };
    UI.prototype.addListenerClickToQuitContentMenu = function (context) {
        var quitMenu = contentMenu.find('.quit_menu');
        quitMenu.click(function () {
            context.closeObject([newFileMenu, contentMenu], 200);
            targetId = -1;
        });
        quitMenu.hover(function () {
            context.closeObject([newFileMenu], 200);
        });
    };
    UI.prototype.addListenerClickToFolderIconOnBrowser = function (icon, context) {
        icon.click(function () {
            var currentDirectory = fileSystem_1.fileSystem.getItem(parseInt($(this).attr('index')));
            if ($(this).attr('state') === 'close') {
                context.openDirectoryOnBrowser(currentDirectory);
            }
            else {
                context.closeDirectoryOnBrowser(currentDirectory);
            }
        });
    };
    /* Validations   */
    UI.prototype.validateName = function (name, message, type, isTargetNeededToBeCheck) {
        this.checkTargetFromBrowserOrFromContent();
        if (name === '') {
            message.push('Name must to contain characters');
            return false;
        }
        if (name.includes('.') || name.includes('/')) {
            message.push('Name cannot contain special characters');
            return false;
        }
        var currentDirectory = fileSystem_1.fileSystem.getFolderById(targetId);
        if (currentDirectory.isNameExist(name, type)) {
            message.push('Name is already exist');
            return false;
        }
        if (isTargetNeededToBeCheck && targetId < 0) {
            message.push('Root directory cannot be changed');
            return false;
        }
        return true;
    };
    UI.prototype.validateDelete = function (message) {
        if (targetId <= 0) {
            message.push('This item cannot be deleted!');
            return false;
        }
        return true;
    };
    UI.prototype.isDirectory = function () {
        var file = fileSystem_1.fileSystem.getItem(targetId);
        if (file.getType() === 'folder') {
            return true;
        }
        return false;
    };
    /* Prompts:  */
    UI.prototype.createPromptNewDirectory = function () {
        var context = this.thisContext;
        var item = fileSystem_1.fileSystem.getItem(targetId);
        var newPrompt = promptTemplate.clone();
        var confirm = newPrompt.find('.prompt_confirm');
        var input = newPrompt.find('.prompt_text');
        this.checkTargetFromBrowserOrFromContent();
        try {
            this.setUpNewPrompt(newPrompt, 'New directory name:', fileSystem_1.fileSystem.getFreeNewName(targetId, 'new folder', 'folder'), 'Create', input, confirm);
            confirm.click(function () {
                if (context.isDirectory()) {
                    var message = [];
                    if (context.validateName(input.val(), message, 'directory', false)) {
                        context.closeObject([newPrompt], 1);
                        context.createNewDirectory(input.val());
                    }
                    else {
                        context.createAlertMessage(message.pop());
                    }
                }
            });
        }
        catch (e) {
            console.log(e.toString());
            context.createAlertMessage('You cannot create new directory in file');
        }
    };
    UI.prototype.createPromptNewTextFile = function () {
        var context = this.thisContext;
        var newPrompt = promptTemplate.clone();
        var confirm = newPrompt.find('.prompt_confirm');
        var input = newPrompt.find('.prompt_text');
        this.checkTargetFromBrowserOrFromContent();
        try {
            this.setUpNewPrompt(newPrompt, 'New txt file name:', fileSystem_1.fileSystem.getFreeNewName(targetId, 'new file', 'file'), 'Create', input, confirm);
            confirm.click(function () {
                if (context.isDirectory()) {
                    var message = [];
                    if (context.validateName(input.val(), message, 'txt', false)) {
                        context.closeObject([newPrompt], 1);
                        context.createNewFile(input.val(), 'file');
                    }
                    else {
                        context.createAlertMessage(message.pop());
                    }
                }
            });
        }
        catch (e) {
            this.createAlertMessage('You cannot create new file in file');
        }
    };
    UI.prototype.setConfirmDeletePrompt = function () {
        var context = this.thisContext;
        var newPrompt = promptTemplate.clone();
        var confirm = newPrompt.find('.prompt_confirm');
        var input = newPrompt.find('.prompt_text');
        this.setUpNewPrompt(newPrompt, 'Delete:', '', 'Confirm', input, confirm);
        input.remove();
        newPrompt.find('.prompt_content').text('Are you sure?');
        confirm.click(function () {
            var message = [];
            if (context.validateDelete(message)) {
                context.closeObject([newPrompt], 1);
                context.deleteItemExecute();
            }
            else {
                context.closeObject([newPrompt], 1);
                context.createAlertMessage(message.pop());
            }
        });
    };
    UI.prototype.setRenamePrompt = function () {
        var context = this.thisContext;
        var newPrompt = promptTemplate.clone();
        var confirm = newPrompt.find('.prompt_confirm');
        var input = newPrompt.find('.prompt_text');
        this.checkTargetFromBrowserOrFromContent();
        var targetFile = fileSystem_1.fileSystem.getItem(targetId);
        this.setUpNewPrompt(newPrompt, 'Rename file:', targetFile.name, 'Rename', input, confirm);
        confirm.click(function () {
            var message = [];
            try {
                targetId = fileSystem_1.fileSystem.getParentById(context.fileSystem.root, targetFile.id).id;
                if (context.validateName(input.val(), message, targetFile.getType(), true)) {
                    targetId = targetFile.id;
                    context.closeObject([newPrompt], 1);
                    context.renameItem(targetFile, input.val());
                }
                else {
                    context.createAlertMessage(message.pop());
                }
            }
            catch (e) {
                console.log(e.toString());
                context.createAlertMessage('Cannot rename root folder');
            }
        });
    };
    UI.prototype.setUpNewPrompt = function (prompt, title, text, confirm_text, input, confirm) {
        var context = this.thisContext;
        prompt.find('.prompt_title').text(title);
        input.val(text);
        confirm.attr('value', confirm_text);
        prompt.find('.prompt_quit').click(function () {
            context.closeObject([prompt], 200);
            prompt.remove();
        });
        prompt.find('.prompt_cancel').click(function () {
            context.closeObject([prompt], 200);
            prompt.remove();
        });
        page.append(prompt);
        context.openObject([prompt], 200);
    };
    /* Alert:  */
    UI.prototype.createAlertMessage = function (message) {
        var context = this.thisContext;
        var newAlert = alertTemplate.clone();
        newAlert.find('.alert_text').text(message);
        newAlert.find('.alert_confirm').click(function () {
            context.closeObject([newAlert], 200);
            newAlert.remove();
        });
        content.append(newAlert);
        context.openObject([newAlert], 200);
    };
    /* General functions */
    UI.prototype.closeObject = function (objects, timer) {
        for (var i = 0; i < objects.length; i++) {
            objects[i].fadeOut(timer);
        }
    };
    UI.prototype.openObject = function (objects, timer) {
        for (var i = 0; i < objects.length; i++) {
            objects[i].fadeIn(timer);
        }
    };
    UI.prototype.checkTargetFromBrowserOrFromContent = function () {
        if (targetId < 0) {
            targetId = currentLocationId;
        }
    };
    UI.prototype.setMaxLengthOfTitle15Characters = function (string) {
        if (string.length < 15) {
            return string;
        }
        var newString = '';
        for (var i = 0; i < 15; i++) {
            newString += string[i];
        }
        return newString;
    };
    UI.prototype.saveSystem = function () {
        fileSystem_1.fileSystem.saveInLocalStorage();
        targetId = -1;
    };
    UI.prototype.seperateFilesInsideDirectory = function (directory, directories, files) {
        for (var i = 0; i < directory.items.length; i++) {
            if (directory.items[i].getType() === 'folder') {
                directories.push(directory.items[i]);
            }
            else {
                files.push(directory.items[i]);
            }
        }
    };
    UI.prototype.mergeSort = function (array, type) {
        if (array.length < 2) {
            return array;
        }
        var middle = Math.floor(array.length / 2);
        var left = array.slice(0, middle);
        var right = array.slice(middle);
        switch (type) {
            case 'fileName':
                return this.mergeName(this.mergeSort(left, 'fileName'), this.mergeSort(right, 'fileName'));
            case 'id':
                return this.mergeId(this.mergeSort(left, 'id'), this.mergeSort(right, 'id'));
        }
    };
    UI.prototype.mergeName = function (left, right) {
        var result = [];
        var indexLeft = 0;
        var indexRight = 0;
        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft].name.toLowerCase() < right[indexRight].name.toLowerCase()) {
                result.push(left[indexLeft++]);
            }
            else if (left[indexLeft].name.toLowerCase() === right[indexRight].name.toLowerCase()) {
                if ((left[indexLeft].getType() < right[indexRight].getType())) {
                    result.push(left[indexLeft++]);
                }
                else {
                    result.push(right[indexRight++]);
                }
            }
            else {
                result.push(right[indexRight++]);
            }
        }
        return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
    };
    UI.prototype.mergeId = function (left, right) {
        var result = [];
        var indexLeft = 0;
        var indexRight = 0;
        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft].id < right[indexRight].id) {
                result.push(left[indexLeft++]);
            }
            else {
                result.push(right[indexRight++]);
            }
        }
        return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
    };
    return UI;
}());
exports.UserInterface = new UI();
//# sourceMappingURL=ui.js.map