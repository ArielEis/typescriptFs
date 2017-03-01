"use strict";
import {IFile} from "./interfaces";

export abstract class AbstractFile implements IFile{

    id: number;
    name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }

    getId(): number{
        return this.id;
    }

    rename(newName: string): void{
        this.name = newName;
    }

    getType(): string{
        return '';
    }
}