import { assert } from 'chai';
import 'mocha';
import { Role, buildRights } from '../blockchain-facade/RoleManagement';

describe('buildRights', () => {
    it('correctly builds rights', async () => {
        const TEST_SETS = [
            [[], 0],
            [[Role.UserAdmin], 1],
            [[Role.UserAdmin, Role.AssetAdmin], 3],
            [[Role.AssetManager], 4],
            [[Role.Trader], 8],
            [[Role.UserAdmin, Role.AssetAdmin, Role.AssetManager], 7],
            [[Role.AssetManager, Role.Trader], 12],
            [[Role.UserAdmin, Role.AssetAdmin, Role.AssetManager, Role.Trader], 15],
            [[Role.Matcher], 16],
            [[Role.Trader, Role.Matcher], 24],
            [[Role.UserAdmin, Role.AssetAdmin, Role.AssetManager, Role.Trader, Role.Matcher], 31],
            [[Role.Issuer], 32]
        ];

        TEST_SETS.forEach(([roles, expectedRights]) => {
            assert.equal(buildRights(roles as Role[]), expectedRights);
        });
    });
});
