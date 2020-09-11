import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectDTO } from './connect.dto';
import { Connect } from './connect.entity';

@Injectable()
export class ConnectService {
    constructor(@InjectRepository(Connect) private readonly repository: Repository<Connect>) {}

    public async find(owner?: string): Promise<Connect[]> {
        return this.repository.find(owner ? { where: { owner } } : undefined);
    }

    public async register(owner: string, connect: ConnectDTO): Promise<string> {
        const connectToStore = new Connect({
            ...ConnectDTO.sanitize(connect),
            owner
        });

        const { id } = await this.repository.save(connectToStore);

        return id;
    }
}
