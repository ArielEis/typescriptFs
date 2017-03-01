"use strict";
import {AbstractFile} from "./abstractFile";
import {ITextFile} from "./interfaces";

export class TextFile extends AbstractFile implements ITextFile{

    content: string;

    constructor(id: number, name:string, content: string){
        super(id, name);
        this.content = content;
    }


    getContent(): string{
        return this.content;
    }
    setContent(newContent: string): void{
        this.content = newContent;
    }

    getType(): string{
        return 'file';
    }
}