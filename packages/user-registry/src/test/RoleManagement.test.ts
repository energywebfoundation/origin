import { assert } from 'chai';
import 'mocha';
import { Role, buildRights } from '../wrappedContracts/RoleManagement';

describe('buildRights', () => {
    it('correctly builds rights', async () => {
        const TEST_SETS = [
            [[], 0],
            [[Role.UserAdmin], 1],
            [[Role.UserAdmin, Role.DeviceAdmin], 3],
            [[Role.DeviceManager], 4],
            [[Role.Trader], 8],
            [[Role.UserAdmin, Role.DeviceAdmin, Role.DeviceManager], 7],
            [[Role.DeviceManager, Role.Trader], 12],
            [[Role.UserAdmin, Role.DeviceAdmin, Role.DeviceManager, Role.Trader], 15],
            [[Role.Matcher], 16],
            [[Role.Trader, Role.Matcher], 24],
            [[Role.UserAdmin, Role.DeviceAdmin, Role.DeviceManager, Role.Trader, Role.Matcher], 31],
            [[Role.Issuer], 32],
            [[Role.Listener], 64]
        ];

        TEST_SETS.forEach(([roles, expectedRights]) => {
            assert.equal(buildRights(roles as Role[]), expectedRights);
        });
    });
});
