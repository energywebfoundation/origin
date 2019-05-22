import { MemoryAdapter } from './memoryAdapter';
import fs from 'fs-extra';
import beautify from 'js-beautify';

export class FileAdapter extends MemoryAdapter {
    _filePath = null;

    constructor(filePath) {
        super();

        this._filePath = filePath;
    }

    async initialize() {
        try {
            const storageFile = await fs.readFile(this._filePath, 'utf8');

            if (storageFile) {
                this._storage = JSON.parse(storageFile);
            }
        } catch (error) {

        }
    }

    async persist() {
        await fs.writeFile(this._filePath, beautify.js(JSON.stringify(this._storage)));
    }

    async set(key, value) {
        await super.set(key, value);

        await this.persist();
    }
}
