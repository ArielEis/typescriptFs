"use strict";
import {IHistory} from "./interfaces";

class History implements IHistory{
    locationStorage: number[];
    pointer: number;
    maxSize: number;

    constructor(){
        this.locationStorage = [];
        this.pointer = 0;
        this.maxSize = 50;
    }

    goBack(): number{
        this.pointer--;
        return this.locationStorage[this.pointer];
    }

    goForward(): number{
        this.pointer++;
        return this.locationStorage[this.pointer];
    }

    addToHistory(id: number): void{
        if (this.locationStorage[this.pointer] !== id){
            if (this.pointer < (this.locationStorage.length-1)){
                this.locationStorage.splice(this.pointer+1);
            }

            if (this.locationStorage.length >  this.maxSize) {
                this.locationStorage.shift();
                this.pointer =  this.maxSize-1;
            }
            this.locationStorage.push(id);
            this.pointer++;
        }
    }

    setLength(length: number){
        this.locationStorage.length = length;
    }

    getLength(): number{
        return this.locationStorage.length;
    }

    getPointer(): number{
        return this.pointer;
    }

    getHistory(index: number): number{
        return this.locationStorage[index];
    }

    removeItemAtIndex(index: number): void{
        this.locationStorage.splice(index, 1);
    }

    getMaxSize(): number{
        return this.maxSize;
    }

}

export const historyLog = new History();