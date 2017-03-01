"use strict";
import {FileSystem, fileSystem} from "./fileSystem";
import {historyLog} from "./history";
import * as $ from 'jquery';
import {Folder} from "./folder";

/* Start of local variables */
const page = $('#page');
const content = $('#content');
const browser = $('#browser');
const contentMenu =  $('#content_menu');
const promptTemplate = $('#template_prompt');
const alertTemplate = $('#template_alert');
const openFileWindow = $('#open_file_window');
const address = $('#address_line');
const backwardButton = $('#go_back');
const forwardButton = $('#go_forward');
const newFileMenu = contentMenu.find('#new_file_menu');
const contentMenuTitle = contentMenu.find('#menu_title');
const contentTemplate = content.find('.template');
const browserTemplate = browser.find('.template li');
let currentLocationId = -1;
let targetId = -1;
/* end of local variables */

class UI{
    fileSystem: FileSystem;
    thisContext: UI;

    constructor(){
        this.fileSystem = fileSystem;
        this.thisContext = this;
    }

    /* Start of - Initialize functions */

    initializeTopBar(){
        let context = this.thisContext;
        address.val('');
        backwardButton.attr('disabled', 1);
        forwardButton.attr('disabled', 1);
        address.on('keyup', function (e) {
            if (e.keyCode == 13) {
                let item = fileSystem.getItem(address.val());
                if (item !== undefined) {
                    switch (item.getType()){
                        case 'folder':
                            context.openDirectory(item, false);
                            break;
                        case 'file':
                            targetId = item.id;
                            context.showFileContent();
                            targetId = -1;
                            break;

                    }

                } else {
                    context.createAlertMessage('address location isn\'t exist');
                    context.updateAddressLine();
                }
            }
        });
        context.initialNavigateButtons();
    }

    initialNavigateButtons(){
        this.initializeBackwardButton();
        this.initializeForwardButton();
    }

    initializeBackwardButton(){
        let context = this.thisContext;
        backwardButton.click(function () {
            if (historyLog.getPointer() > 0){
                let backToDirectory = undefined;
                while (backToDirectory === undefined && historyLog.getPointer() > 0){
                    let destId = historyLog.goBack();
                    backToDirectory = fileSystem.getItem(destId);
                }
                if (historyLog.getPointer() === 0){
                    context.handleNavigationButtonsEnable();
                    context.closeDirectory(fileSystem.getItem(historyLog.getHistory(1)));
                } else {
                    context.handleNavigationButtonsEnable();
                    context.openDirectory(backToDirectory, true);
                }
            }
        });
    }

    initializeForwardButton(){
        let context = this.thisContext;
        forwardButton.click(function () {
            if (historyLog.getPointer() < historyLog.getMaxSize() && historyLog.getPointer() < (historyLog.getLength()-1)) {
                let goToDirectory = undefined;
                let destId = historyLog.goForward();
                while (goToDirectory === undefined && historyLog.getPointer() > 0){
                    goToDirectory = fileSystem.getItem(destId);
                    if (goToDirectory === undefined){
                        historyLog.removeItemAtIndex(historyLog.getPointer());
                    }
                }
                context.handleNavigationButtonsEnable();
                context.openDirectory(goToDirectory, true);
            }
        });
    }

    initializeBrowser(){
        browser.empty();
        let newNode = browserTemplate.clone();
        newNode.find('.arrow').remove();
        let folder = newNode.find('.folder');
        folder.attr('id', 'folder_0');
        folder.attr('index', 0);
        folder.attr('state', 'close');
        this.addListenerClickToFolderIconOnBrowser(folder, this.thisContext);
        let aTag = newNode.find('a');
        aTag.text(fileSystem.getItem(0).name);
        aTag.attr('class', 'a_ul');
        aTag.attr('index', 0);
        aTag.attr('state', 'close');
        this.addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag, this.thisContext);
        browser.append(newNode);
        browser.contextmenu(function () {
            return false;
        });

        let context = this.thisContext;
        browser.mousedown(function (event) {
            if (event.button !== 2){
                context.closeObject([contentMenu, newFileMenu], 200);
            }
        });
    }

    initializeContent(){
        let context = this.thisContext;
        content.empty();
        content.css({'background-color':'#666'});
        content.contextmenu(function () {
            return false;
        });

        content.mousedown(function (event) {
            if (currentLocationId > -1){
                context.setRightClickContextMenu(event);
            }
        });
    }

    initialContextMenuOptions(){
        this.addListenerClickToDeleteFile(this.thisContext);
        this.addListenerClickToRenameFile(this.thisContext);
        this.addListenerClickToNewFile(this.thisContext);
        this.addListenerClickToQuitContentMenu(this.thisContext);
        this.addListenerClickToCreateNewDirectory(this.thisContext);
        this.addListenerClickToCreateNewFile(this.thisContext);
    }


    /* End of - Initialize functions */


    /* Function for browser window */

    openDirectoryOnBrowser(directory){
        let folderIcon =  browser.find('#folder_'+directory.id);
        folderIcon.attr('src', 'pics/open_directory.png');
        folderIcon.attr('state', 'open');
        let allDirectories = [];
        let allFiles = [];
        this.seperateFilesInsideDirectory(directory, allDirectories, allFiles);
        allDirectories = this.mergeSort(allDirectories, 'fileName');
        for (let i = 0; i < allDirectories.length; i++){
            this.drawDirectoryOnBrowser(allDirectories[i].name, allDirectories[i].id, directory.id);
        }
    }

    closeDirectoryOnBrowser(directory){
        let folderIcon =  browser.find('#folder_'+directory.id);
        folderIcon.attr('src', 'pics/close_directory.png');
        folderIcon.attr('state', 'close');
        for (let i = 0; i < directory.items.length; i++){
            this.removeDirectoryFromBrowser(directory.items[i].id);
        }
    }

    removeDirectoryFromBrowser(id) {
        browser.find('#ul_' + id).remove();
    }

    drawDirectoryOnBrowser(name, id, parentId){
        let newNode = browserTemplate.clone();
        let folder = newNode.find('.folder');
        folder.attr('id', 'folder_'+id);
        folder.attr('index', id);
        folder.attr('state', 'close');
        this.addListenerClickToFolderIconOnBrowser(folder, this.thisContext);
        let aTag = newNode.find('a');
        aTag.text(name);
        newNode.find('ul').attr('id', 'ul_'+id);
        aTag.attr('id', 'a_' + id);
        aTag.attr('index', id);
        aTag.attr('state', 'close');
        this.addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag, this.thisContext);
        browser.find('#ul_' + parentId).append(newNode);
    }

    /* Function for content window */

    openDirectory(directory, isHistoryRequest){
        content.css({'background-color':'snow'});
        content.empty();
        currentLocationId = directory.id;
        let allDirectories = [];
        let allFiles = [];
        this.seperateFilesInsideDirectory(directory, allDirectories, allFiles);
        allDirectories = this.mergeSort(allDirectories, 'fileName');
        allFiles = this.mergeSort(allFiles, 'fileName');
        for (let i=0; i<allDirectories.length; i++){
            this.drawDirectoryOnContent(allDirectories[i].name, allDirectories[i].id);
        }
        for (let i = 0; i < allFiles.length; i++) {
            this.drawFileOnContent(allFiles[i].name, allFiles[i].id, allFiles[i].getType());
        }
        this.updateAddressLine();
        if (!isHistoryRequest){
            historyLog.setLength(historyLog.getPointer()+1);
            historyLog.addToHistory(currentLocationId);
            this.handleNavigationButtonsEnable();
        }
    }

    closeDirectory(directory){
        let folder = this.fileSystem.getParentById(this.fileSystem.root, directory.id);
        if (folder instanceof Folder){
            currentLocationId = folder.id;
        } else {
            currentLocationId = -1;
        }
        content.empty();
        content.css({'background-color':'#666'});
        address.val('');
    }

    showFileContent() {
        let context = this.thisContext;
        let window = openFileWindow.clone();
        let file = fileSystem.getTextFileById(targetId);
        window.find('.file_title').text(file.name+".txt");
        let input = window.find('#file_content_text');
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
    }

    drawDirectoryOnContent(name, id){
        let context = this.thisContext;
        let newFolder = contentTemplate.clone();
        let folderIcon = newFolder.find(".icon");
        this.setUpFileContent(newFolder, folderIcon, name, id ,'directory');
        folderIcon.dblclick(function () {
            targetId = parseInt($(this).attr('index'));
            let targetDirectory = fileSystem.getItem(id);
            context.openDirectory(targetDirectory, false);
        });
        content.append(newFolder);
    }

    drawFileOnContent(name, id, type){
        let context = this.thisContext;
        let newFile = contentTemplate.clone();
        let folderIcon = newFile.find(".icon");
        this.setUpFileContent(newFile, folderIcon, name, id ,type);
        folderIcon.dblclick(function () {
            targetId = parseInt($(this).attr('index'));
            context.showFileContent();
        });
        content.append(newFile);
    }

    removeItemFromContent() {
        content.find('#file_'+targetId).remove();
    }

    setUpFileContent(file, icon, name, id, type){
        file.attr('id', 'file_'+id);
        file.find(".file_name").text(name);
        icon.attr('index', id);
        switch(type){
            case 'file':
                icon.attr('src', 'pics/txt.png');
                icon.css({'width':'60%'});
                break;
        }
        icon.mousedown(function (event) {
            if (event.button === 2){
                targetId = parseInt($(this).attr('index'));
            }
        });
    }

    /* Function for top bar */

    updateAddressLine(){
        if (currentLocationId >= 0){
            address.val(fileSystem.getPath(currentLocationId));
        } else {
            address.val('');
        }
    }

    handleNavigationButtonsEnable(){
        let pointer = historyLog.getPointer();
        if (pointer <= 0){
            this.disableButton(backwardButton);
        } else {
            this.enableButton(backwardButton);
        }

        if (pointer > -1 && pointer < historyLog.getLength()-1){
            this.enableButton(forwardButton);
        } else {
            this.disableButton(forwardButton);
        }

    }

    disableButton(button){
        button.attr('disabled', true);
        button.attr('class', 'disabled_button');
    }

    enableButton(button){
        button.attr('disabled', false);
        button.attr('class', 'enabled_button');
    }

    /* Function influence on file system */

    createNewDirectory(name){
        this.checkTargetFromBrowserOrFromContent();
        fileSystem.addFolder(name, targetId);
        if (browser.find('#folder_'+targetId).attr('state') === 'open'){
            this.drawDirectoryOnBrowser(name, (fileSystem.nextId-1), targetId);
        } else {
            this.openDirectoryOnBrowser(fileSystem.getItem(targetId));
        }
        if (targetId === currentLocationId){
            this.drawDirectoryOnContent(name, (fileSystem.nextId-1));
        }
        this.saveSystem();
    }

    createNewFile(name, type){
        this.checkTargetFromBrowserOrFromContent();
        fileSystem.addFile(name, targetId ,'Empty-file');
        if (targetId === currentLocationId){
            this.drawFileOnContent(name, (fileSystem.nextId-1), type);
        }
        this.saveSystem();
    }

    deleteItem(){
        this.checkTargetFromBrowserOrFromContent();
        this.setConfirmDeletePrompt();
    }

    deleteItemExecute() {
        if (fileSystem.getItem(targetId).getType() === 'folder'){
            this.removeDirectoryFromBrowser(targetId);
        }

        if (targetId === currentLocationId){
            this.removeItemFromContent();
        }

        fileSystem.deleteItem(targetId);

        content.find('#file_'+targetId).remove();


        this.saveSystem();
    }

    renameItem(targetFile, name){
        fileSystem.renameItem(targetFile.id, name);
        browser.find('#a_'+targetFile.id).text(name);
        content.find('#file_'+targetFile.id).find(".file_name").text(name);
        this.updateAddressLine();
        this.saveSystem();
    }



    /* Context menu */

    setRightClickContextMenu(event){
        let context = this.thisContext;
        if (event.button === 2){
            context.checkTargetFromBrowserOrFromContent();
            let title = this.setMaxLengthOfTitle15Characters(fileSystem.getItem(targetId).name);
            contentMenuTitle.text(title);
            contentMenu.css('left', event.pageX+5);
            contentMenu.css('top', event.pageY+5);
            context.openObject([contentMenu], 200);
        } else {
            context.closeObject([contentMenu, newFileMenu], 200);
            targetId = -1;
        }
    }


    /*  Listeners:    */

    addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag, context) {
        aTag.click(function () {
            let index = parseInt($(this).attr('index'));
            let directory = fileSystem.getItem(index);
            if ($(this).attr('state') === 'open'){
                $(this).attr('state', 'close');
                context.closeDirectory(directory);
            } else {
                $(this).attr('state', 'open');
                context.openDirectory(directory, false);
            }
        });

        aTag.mousedown(function (event) {
            targetId = parseInt($(this).attr('index'));
            context.setRightClickContextMenu(event)
        });
    }

    addListenerClickToDeleteFile(context) {
        let deleteFile = contentMenu.find('#delete_file');
        deleteFile.click(function () {
            context.closeObject([contentMenu], 200);
            context.deleteItem();
        });
        deleteFile.hover(function () {
            context.closeObject([newFileMenu], 200);
        });
    }

    addListenerClickToRenameFile(context) {
        let renameFile = contentMenu.find('#rename_file');
        renameFile.click(function () {
            context.closeObject([contentMenu], 200);
            context.setRenamePrompt();
        });
        renameFile.hover(function () {
            context.closeObject([newFileMenu], 200);
        });
    }

    addListenerClickToNewFile(context) {
        contentMenu.find('#new_file').hover(function (event) {
            if (newFileMenu.css('display') === 'none'){
                newFileMenu.css('left', event.pageX +40);
                newFileMenu.css('top', event.pageY -15);
                context.openObject([newFileMenu], 200);
            }
        });
    }

    addListenerClickToCreateNewDirectory(context){
        newFileMenu.find('#new_directory').click(function () {
            context.closeObject([newFileMenu, contentMenu], 200);
            context.createPromptNewDirectory();
        });
    }

    addListenerClickToCreateNewFile(context){
        newFileMenu.find('#new_txt_file').click(function () {
            context.closeObject([newFileMenu, contentMenu], 200);
            context.createPromptNewTextFile();
        });
    }

    addListenerClickToQuitContentMenu(context){
        let quitMenu = contentMenu.find('.quit_menu');
        quitMenu.click(function () {
            context.closeObject([newFileMenu, contentMenu], 200);
            targetId = -1;
        });

        quitMenu.hover(function () {
            context.closeObject([newFileMenu], 200);
        });
    }

    addListenerClickToFolderIconOnBrowser(icon, context) {
        icon.click(function () {
            let currentDirectory = fileSystem.getItem(parseInt($(this).attr('index')));
            if ($(this).attr('state') === 'close'){
                context.openDirectoryOnBrowser(currentDirectory);
            } else {
                context.closeDirectoryOnBrowser(currentDirectory);
            }
        });
    }

    /* Validations   */

    validateName(name, message, type, isTargetNeededToBeCheck){
        this.checkTargetFromBrowserOrFromContent();

        if (name === ''){
            message.push('Name must to contain characters');
            return false;
        }
        if (name.includes('.') || name.includes('/')){
            message.push('Name cannot contain special characters');
            return false;
        }

        let currentDirectory = fileSystem.getFolderById(targetId);

        if (currentDirectory.isNameExist(name, type)){
            message.push('Name is already exist');
            return false;
        }

        if (isTargetNeededToBeCheck && targetId < 0){
            message.push('Root directory cannot be changed');
            return false;
        }


        return true;
    }

    validateDelete(message){
        if (targetId <= 0){
            message.push('This item cannot be deleted!');
            return false;
        }
        return true;
    }

    isDirectory() {
        let file = fileSystem.getItem(targetId);
        if (file.getType() === 'folder'){
            return true;
        }
        return false;
    }


    /* Prompts:  */

    createPromptNewDirectory(){
        let context = this.thisContext;
        let item = fileSystem.getItem(targetId);
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        this.checkTargetFromBrowserOrFromContent();
        try {
            this.setUpNewPrompt(newPrompt, 'New directory name:',
                fileSystem.getFreeNewName(targetId, 'new folder', 'folder'),
                'Create', input, confirm);
            confirm.click(function () {
                if (context.isDirectory()) {
                    let message = [];
                    if (context.validateName(input.val(), message, 'directory', false)) {
                        context.closeObject([newPrompt], 1);
                        context.createNewDirectory(input.val());
                    } else {
                        context.createAlertMessage(message.pop());
                    }
                }
            });
        } catch (e){
            console.log(e.toString());
            context.createAlertMessage('You cannot create new directory in file');
        }
    }

    createPromptNewTextFile(){
        let context = this.thisContext;
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        this.checkTargetFromBrowserOrFromContent();
        try {
            this.setUpNewPrompt(newPrompt, 'New txt file name:',
                fileSystem.getFreeNewName(targetId, 'new file', 'file'), 'Create', input, confirm);
            confirm.click(function () {
                if (context.isDirectory()) {
                    let message = [];
                    if (context.validateName(input.val(), message, 'txt', false)) {
                        context.closeObject([newPrompt], 1);
                        context.createNewFile(input.val(), 'file');
                    } else {
                        context.createAlertMessage(message.pop());
                    }
                }
            });
        } catch (e) {
            this.createAlertMessage('You cannot create new file in file');
        }
    }

    setConfirmDeletePrompt() {
        let context = this.thisContext;
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        this.setUpNewPrompt(newPrompt, 'Delete:', '',
            'Confirm', input, confirm);
        input.remove();
        newPrompt.find('.prompt_content').text('Are you sure?');
        confirm.click(function () {
            let message = [];
            if (context.validateDelete(message)){
                context.closeObject([newPrompt], 1);
                context.deleteItemExecute();
            } else {
                context.closeObject([newPrompt], 1);
                context.createAlertMessage(message.pop());
            }
        });
    }

    setRenamePrompt() {
        let context = this.thisContext;
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        this.checkTargetFromBrowserOrFromContent();
        let targetFile = fileSystem.getItem(targetId);
        this.setUpNewPrompt(newPrompt, 'Rename file:', targetFile.name,
            'Rename', input, confirm);
        confirm.click(function () {
            let message = [];
            try{
                targetId = fileSystem.getParentById(context.fileSystem.root, targetFile.id).id;
                if (context.validateName(input.val(), message, targetFile.getType(), true)){
                    targetId = targetFile.id;
                    context.closeObject([newPrompt], 1);
                    context.renameItem(targetFile, input.val());
                } else {
                    context.createAlertMessage(message.pop());
                }
            } catch (e){
                console.log(e.toString());
                context.createAlertMessage('Cannot rename root folder');
            }
        });
    }

    setUpNewPrompt(prompt, title, text, confirm_text, input, confirm){
        let context = this.thisContext;
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
    }


    /* Alert:  */

    createAlertMessage(message){
        let context = this.thisContext;
        let newAlert = alertTemplate.clone();
        newAlert.find('.alert_text').text(message);
        newAlert.find('.alert_confirm').click(function () {
            context.closeObject([newAlert], 200);
            newAlert.remove();
        });
        content.append(newAlert);
        context.openObject([newAlert], 200);
    }

    /* General functions */

    closeObject(objects, timer){
        for(let i = 0; i <objects.length; i++){
            objects[i].fadeOut(timer);
        }
    }

    openObject(objects, timer){
        for(let i = 0; i <objects.length; i++){
            objects[i].fadeIn(timer);
        }
    }

    checkTargetFromBrowserOrFromContent(){
        if (targetId < 0){
            targetId = currentLocationId;
        }
    }

    setMaxLengthOfTitle15Characters(string) {
        if (string.length < 15){
            return string;
        }
        let newString = '';
        for (let i = 0; i < 15; i++){
            newString += string[i];
        }
        return newString;
    }

    saveSystem() {
        fileSystem.saveInLocalStorage();
        targetId = -1;
    }

    seperateFilesInsideDirectory(directory, directories, files){
        for (let i = 0; i < directory.items.length; i++){
            if (directory.items[i].getType() === 'folder'){
                directories.push(directory.items[i]);
            } else {
                files.push(directory.items[i]);
            }
        }
    }

    mergeSort(array, type){
        if (array.length < 2) {
            return array;
        }

        let middle = Math.floor(array.length / 2);
        let left = array.slice(0, middle);
        let right = array.slice(middle);

        switch(type){
            case 'fileName':
                return this.mergeName(this.mergeSort(left, 'fileName'), this.mergeSort(right, 'fileName'));

            case 'id':
                return this.mergeId(this.mergeSort(left, 'id'), this.mergeSort(right, 'id'));
        }
    }

    mergeName(left, right) {
        let result = [];
        let indexLeft = 0;
        let indexRight = 0;

        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft].name.toLowerCase() < right[indexRight].name.toLowerCase()) {
                result.push(left[indexLeft++]);
            } else if (left[indexLeft].name.toLowerCase() === right[indexRight].name.toLowerCase()) {
                if ((left[indexLeft].getType() < right[indexRight].getType())) {
                    result.push(left[indexLeft++]);
                } else {
                    result.push(right[indexRight++]);
                }
            }else {
                result.push(right[indexRight++]);
            }
        }
        return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
    }

    mergeId(left, right) {
        let result = [];
        let indexLeft = 0;
        let indexRight = 0;

        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft].id < right[indexRight].id) {
                result.push(left[indexLeft++]);
            }else {
                result.push(right[indexRight++]);
            }
        }
        return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
    }

}

export const UserInterface = new UI();