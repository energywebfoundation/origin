import { MemoryAdapter } from './memoryAdapter';
import fs from 'fs-extra';

export class FileAdapter extends MemoryAdapter {
    public _filePath: string = null;

    constructor(filePath: string) {
        super();

        this._filePath = filePath;
    }

    async initialize() {
        try {
            const storageFile = await fs.readFile(this._filePath, 'utf8');

            if (storageFile) {
                this._storage = JSON.parse(storageFile);
            }
        } catch (error) {}
    }

    async persist() {
        await fs.writeFile(this._filePath, JSON.stringify(this._storage));
    }

    async set(key: string, value:string) {
        await super.set(key, value);

        await this.persist();
    }
}
