import {AbstractFile} from "./abstractFile";

declare interface IFile{
    rename(newName: string): void;
    getId(): number;
    getType(): string;
}

declare  interface ITextFile{
    setContent(newContent: string): void;
    getContent(): string;
    getType(): string;
}

declare interface IFolder{
    addChild(item: AbstractFile): void;
    findChild(id: number): AbstractFile;
    getChildren(): AbstractFile[];
    deleteChild(id: number): void;
    getType(): string;
}

declare interface IFileSystem{
    addFolder(name: string, parentId: number): void;
    addFile(name: string, parentId: number, content: string): void;
    renameItem(id: number, newName: string): void;
    deleteItem(id: number): void;
    getItem(uniqueIdentify: any): AbstractFile;
    getPath(id: number): string;
}

declare interface IHistory{
    goBack(): number;
    goForward(): number;
    addToHistory(id: number): void;
}
