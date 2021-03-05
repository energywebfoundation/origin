import {
    ILoggedInUser,
    UserStatus,
    ValidateDeviceOwnershipQuery
} from '@energyweb/origin-backend-core';
import { CqrsModule, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { OriginDevice, DeviceRegistryService, NewDeviceDTO, UnableToVerifyOwnershipError } from '.';
import { ExternalDeviceAlreadyUsedError, SmartMeterAlreadyUsedError } from './errors';

@QueryHandler(ValidateDeviceOwnershipQuery)
export class StubValidateDeviceOwnershipQueryHandler
    implements IQueryHandler<ValidateDeviceOwnershipQuery> {
    public async execute({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ownerId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        externalRegistryId
    }: ValidateDeviceOwnershipQuery): Promise<boolean> {
        return true;
    }
}

describe('The DeviceRegistryService', () => {
    let deviceRegistryService: DeviceRegistryService;

    const loggedInUser = ({
        id: 1,
        organization: { id: '1000' },
        status: UserStatus.Active,
        ownerId: '1000'
    } as unknown) as ILoggedInUser;

    const newDevice = new NewDeviceDTO({ externalRegistryId: 'EXT-1' });

    const init = async (providers: any[]) => {
        const module = await Test.createTestingModule({
            imports: [CqrsModule],
            providers: [DeviceRegistryService, ...providers]
        }).compile();

        await module.init();

        deviceRegistryService = await module.get(DeviceRegistryService);
    };

    const getValidateOwnerShipQueryHandler = (isValid: boolean) => {
        const queryHandler = sinon.stubConstructor(StubValidateDeviceOwnershipQueryHandler);
        queryHandler.execute.returns(Promise.resolve(isValid));

        return queryHandler;
    };

    const getRepository = (queryBuilder: SelectQueryBuilder<OriginDevice>) => {
        const repository = sinon.stubInterface<Repository<OriginDevice>>();
        repository.createQueryBuilder.returns(queryBuilder);

        return repository;
    };

    describe('when registering new device', async () => {
        it('should throw an error if device is not owned by requestor', async () => {
            const queryBuilder = sinon.stubInterface<SelectQueryBuilder<OriginDevice>>();
            queryBuilder.where.returnsThis();
            queryBuilder.getCount.onFirstCall().resolves(0);
            queryBuilder.getCount.onSecondCall().resolves(0);

            const repository = getRepository(queryBuilder);
            const queryHandler = getValidateOwnerShipQueryHandler(false);

            await init([
                { provide: StubValidateDeviceOwnershipQueryHandler, useValue: queryHandler },
                { provide: getRepositoryToken(OriginDevice), useValue: repository }
            ]);

            try {
                await deviceRegistryService.register(loggedInUser, newDevice);
            } catch (error) {
                expect(error).to.satisfies(
                    (s: unknown) => s !== null && s instanceof UnableToVerifyOwnershipError
                );
            }
        });

        it('should throw an error if device is with given id is already registered', async () => {
            const queryBuilder = sinon.stubInterface<SelectQueryBuilder<OriginDevice>>();
            queryBuilder.where.returnsThis();
            queryBuilder.getCount.onFirstCall().resolves(1);
            queryBuilder.getCount.onSecondCall().resolves(0);

            const repository = getRepository(queryBuilder);
            const queryHandler = getValidateOwnerShipQueryHandler(true);

            await init([
                { provide: StubValidateDeviceOwnershipQueryHandler, useValue: queryHandler },
                { provide: getRepositoryToken(OriginDevice), useValue: repository }
            ]);

            try {
                await deviceRegistryService.register(loggedInUser, newDevice);
            } catch (error) {
                expect(error).to.satisfies(
                    (s: unknown) => s !== null && s instanceof ExternalDeviceAlreadyUsedError
                );
            }
        });

        it('should throw an error if smart meter is with given id is already registered', async () => {
            const queryBuilder = sinon.stubInterface<SelectQueryBuilder<OriginDevice>>();
            queryBuilder.where.returnsThis();
            queryBuilder.getCount.onFirstCall().resolves(0);
            queryBuilder.getCount.onSecondCall().resolves(1);

            const repository = getRepository(queryBuilder);
            const queryHandler = getValidateOwnerShipQueryHandler(true);

            await init([
                { provide: StubValidateDeviceOwnershipQueryHandler, useValue: queryHandler },
                { provide: getRepositoryToken(OriginDevice), useValue: repository }
            ]);

            try {
                await deviceRegistryService.register(loggedInUser, newDevice);
            } catch (error) {
                expect(error).to.satisfies(
                    (s: unknown) => s !== null && s instanceof SmartMeterAlreadyUsedError
                );
            }
        });
    });
});
