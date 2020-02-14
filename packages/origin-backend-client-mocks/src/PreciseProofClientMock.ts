import { IPreciseProofClient, IPreciseProof } from '@energyweb/origin-backend-client';

import { MissingEntity } from './MissingEntity';

export class PreciseProofClientMock implements IPreciseProofClient {
    private storage = new Map<string, any>();

    private clone(input: any): any {
        return JSON.parse(JSON.stringify(input));
    }

    public async get<T>(url: string): Promise<IPreciseProof<T>> {
        const result = this.storage.get(url.toLocaleLowerCase());

        if (!result) {
            throw new MissingEntity('Entity does not exist');
        }

        return this.clone(result) as IPreciseProof<T>;
    }

    public async delete(url: string): Promise<boolean> {
        return this.storage.delete(url.toLocaleLowerCase());
    }

    public async insert<T>(url: string, PreciseProof: IPreciseProof<T>): Promise<boolean> {
        this.storage.set(url.toLocaleLowerCase(), this.clone(PreciseProof));

        return true;
    }
}
