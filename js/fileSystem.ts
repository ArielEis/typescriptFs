"use strict";
import {IFileSystem} from "./interfaces";
import {Folder} from "./folder";
import {AbstractFile} from "./abstractFile";
import {TextFile} from "./textFile";

export class FileSystem implements IFileSystem{

    root: Folder;
    nextId: number;

    constructor(){
        this.root = new Folder(0, 'ROOT');
        this.nextId = 1;

        let system = localStorage.getItem('file_system');
        if (system === null){
            this.root = new Folder(0, 'Root');
        } else {
            let linearArray = JSON.parse(system);
            this.root = new Folder(linearArray[0][1], linearArray[0][2]);
            if (linearArray.length > 0){
                let parent = null;
                for (let i = 1; i < linearArray.length; i++){
                    parent = this.getItem(linearArray[i][3]);
                    if (linearArray[i][0] === 'folder'){
                        this.addFolder(linearArray[i][2], parent.id);
                    } else {
                        this.addFile(linearArray[i][2], parent.id, linearArray[i][4]);
                    }
                }
            }
        }
    }

    addFolder(name: string, parentId: number): void{
        let newFolder = new Folder(this.nextId++, name);

        let targetFolder = this.getItemById(this.root, parentId);
        if (targetFolder.getType() !== 'folder') {
            throw new Error('Cannot create new folder in this location');
        }

        targetFolder.addChild(newFolder);
    }

    addFile(name: string, parentId: number, content: string): void{
        let folder = this.getItemById(this.root, parentId);
        if (!(folder instanceof Folder)){ return; }

        folder.addChild(new TextFile(this.nextId++, name, content));
    }

    renameItem(id: number, newName: string): void{
        let file = this.getItem(id);
        file.rename(newName);
    }

    deleteItem(id: number): void{
        let folder = this.getParentById(this.root, id);
        if (!(folder instanceof Folder)){ return; }

        folder.deleteChild(id);
    }

    getItem(uniqueIdentify: any): AbstractFile{
        switch (typeof uniqueIdentify){
            case 'number':
                return this.getItemById(this.root, uniqueIdentify);

            case 'string':
                return this.getItemByPath(this.root, uniqueIdentify);

            default:
                return null;
        }
    }

    getPath(id: number): string{
        let pathArray = [];
        this.buildPathOfFile(this.root, id, pathArray);

        return pathArray.join('/');
    }

    getItemById(folder: Folder, id: number){
        let isFound = false;
        let i = 0;
        let result = undefined;


        if (folder.id === id) {
            return folder;
        }

        while (!isFound && i < folder.items.length) {
            let file = folder.items[i];
            if (file.id === id) {
                isFound = true;
                return file;

            } else if (file instanceof Folder){
                result = this.getItemById(file, id);

                if (result !== undefined) {
                    return result;
                }
            }
            i++;
        }
    }

    getParentById(folder: Folder, id:number) :Folder{
        let isFound = false;
        let i = 0;
        let result = undefined;

        if (0 === id){
            return this.root;
        }

        while (!isFound && i < folder.items.length) {
            let file = folder.items[i];
            if (file.id === id) {
                isFound = true;
                return folder;

            } else if (file instanceof Folder){
                result = this.getParentById(file, id);

                if (result !== undefined) {
                    return result;
                }
            }
            i++;
        }
    }

    getTextFileById(id: number): TextFile{
        let textFile = this.getItem(id);
        if (!(textFile instanceof TextFile)) {return null;}

        return textFile;
    }

    getFolderById(id: number): Folder{
        let folder = this.getItem(id);
        if (!(folder instanceof Folder)) {return null;}

        return folder;
    }

    getFreeNewName(id: number, name: string, type: string): string{
        let currentItem = this.getItemById(this.root, id);

        if (currentItem.getType() !== 'folder'){
            throw new Error(currentItem +' is not a folder')
        }

        let count = 0;
        let isFound = false;
        let newName = name;
        if (currentItem.isNameExist(name, type)){
            while (!isFound){
                count++;
                if (!currentItem.isNameExist(name+' ('+count+')', type)) {
                    return name+' (' + count + ')';
                }
            }
        }
        return newName;
    }

    saveInLocalStorage(){
        let linearArray = [];
        this.insertSystemToArray(this.root, linearArray);
        localStorage.setItem('file_system', JSON.stringify(linearArray));
    }

    insertSystemToArray (currentItem, linearArray) {
        switch (currentItem.getType()){
            case 'folder':
                linearArray.push(['folder', currentItem.id, currentItem.name,
                    this.getParentById(this.root, currentItem.id).id]) ;

                for (let i = 0; i < currentItem.items.length; i++){
                    this.insertSystemToArray(currentItem.items[i], linearArray);
                }
                break;
            case 'file':
                linearArray.push(['file', currentItem.id, currentItem.name,
                    this.getParentById(this.root, currentItem.id).id, currentItem.content]);
                break;
        }

    };

    buildPathOfFile(currentFolder: Folder, id: number, path: string[]){
        path.push(currentFolder.name);
        let isFound = false;
        let i = 0;
        let result = undefined;
        if (currentFolder.id === id) {
            result = currentFolder;
            return result;
        } else {
            while (!isFound && i < currentFolder.items.length) {
                if (currentFolder.items[i].id === id) {
                    isFound = true;
                    path.push(currentFolder.items[i].name);
                    result = currentFolder.items[i];
                    return result;
                } else {
                    let folder = currentFolder.items[i];
                    if (folder instanceof Folder) {
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
    }

    getItemByPath(folder: Folder, pathString: string): AbstractFile{
        let file = undefined;
        let path = pathString.split('/');

        if (this.root.name.toLowerCase() !== path[0].toLowerCase()) {
            return file;
        }

        let currentItem = this.root;
        let index = 1;
        let isFound = true;
        let isRunning = true;

        while (isRunning && index < path.length) {
            isFound = false;
            console.log('searching', index, path.length);
            if (currentItem.isNameExist(path[index], 'folder') ||
                (currentItem.isNameExist(path[index], 'file') && index === path.length-1)) {
                isFound = true;
                let items = currentItem.getChildren();
                for (let i = 0; i < items.length; i++){
                    let tempFile = items[i];
                    console.log(tempFile);
                    if (tempFile.name.toLowerCase() === path[index].toLowerCase()){
                        if (tempFile instanceof Folder){
                            console.log(tempFile);
                            currentItem = tempFile;
                            break;
                        } else if (index === path.length-1){
                                return tempFile;
                        }
                    }
                }
            }
            index++;
        }

        if (isFound && file === undefined){
            file = currentItem;
        }

        if(!isFound){
            return undefined;
        }

        return file;
    }
}


export const fileSystem = new FileSystem();