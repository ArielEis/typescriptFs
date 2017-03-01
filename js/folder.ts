"use strict";
import {AbstractFile} from "./abstractFile";
import {IFolder} from "./interfaces";

export class Folder extends AbstractFile implements IFolder{

    items: AbstractFile[];

    constructor(id: number, name: string){
        super(id, name);
        this.items = [];
    }

    getChildren(): AbstractFile[]{
        return this.items;
    }

    addChild(item: AbstractFile): void{
        if (!(item instanceof AbstractFile)) { return; }
        this.items.push(item);
    }

    findChild(id: number): AbstractFile{
        let index = this.getIndexOfChildById(id);

        if (index < 0){ return null; }

        return this.items[index];
    }

    deleteChild(id: number): void{
        let index = this.getIndexOfChildById(id);

        if (index < 0){ return; }

        this.items.splice(index, 1);
    }

    getType(): string{
        return 'folder';
    }

    getIndexOfChildById(id: number): number{
        let itemsToRunOfThem = this.items.length;

        while(itemsToRunOfThem--){
            let currentItem = this.items[itemsToRunOfThem];

            if(currentItem.id === id){
                return itemsToRunOfThem;
            }
        }
        return -1;
    }

    isNameExist(name: string, type: string): boolean{
        for (let i = 0; i < this.items.length; i++){
            if (this.items[i].name.toLowerCase() === name.toLowerCase()){
                if (this.items[i].getType() === type){
                    return true;
                }
            }

        }
        return false;
    }
}