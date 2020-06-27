// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@jest/globals';
import BN from 'bn.js';

import { BundleItem } from './bundle-item.entity';
import { Bundle } from './bundle.entity';

describe('Bundle canSplit', () => {
    const MWh = 10 ** 6;

    it('should allow split with full volume', () => {
        const bundle = new Bundle({
            items: [
                {
                    startVolume: new BN(50 * MWh),
                    currentVolume: new BN(50 * MWh)
                } as BundleItem,
                {
                    startVolume: new BN(50 * MWh),
                    currentVolume: new BN(50 * MWh)
                } as BundleItem
            ]
        });

        expect(bundle.canSplit(new BN(100 * MWh), new BN(MWh))).toBeTruthy();
        expect(bundle.canSplit(new BN(60 * MWh), new BN(MWh))).toBeTruthy();
        expect(bundle.canSplit(new BN(50 * MWh), new BN(MWh))).toBeTruthy();
        expect(bundle.canSplit(new BN(5 * MWh), new BN(MWh))).toBeFalsy();
        expect(bundle.canSplit(new BN(8 * MWh), new BN(MWh))).toBeTruthy();
    });

    it('should not allow split when split results in decimal volumes', () => {
        const bundle = new Bundle({
            items: [
                {
                    startVolume: new BN(30 * MWh),
                    currentVolume: new BN(30 * MWh)
                } as BundleItem,
                {
                    startVolume: new BN(30 * MWh),
                    currentVolume: new BN(30 * MWh)
                } as BundleItem
            ]
        });

        expect(bundle.canSplit(new BN(55 * MWh), new BN(MWh))).toBeFalsy();
    });

    it('should not allow split when split when requested volume is lower than energyPerUnit * amount of items', () => {
        const bundle = new Bundle({
            items: [
                {
                    startVolume: new BN(30 * MWh),
                    currentVolume: new BN(30 * MWh)
                } as BundleItem,
                {
                    startVolume: new BN(30 * MWh),
                    currentVolume: new BN(30 * MWh)
                } as BundleItem
            ]
        });

        expect(bundle.canSplit(new BN(1 * MWh), new BN(MWh))).toBeFalsy();
    });

    it('should return possible splits for the bundle', () => {
        const bundle = new Bundle({
            items: [
                {
                    startVolume: new BN(10 * MWh),
                    currentVolume: new BN(10 * MWh)
                } as BundleItem,
                {
                    startVolume: new BN(10 * MWh),
                    currentVolume: new BN(10 * MWh)
                } as BundleItem
            ]
        });

        const splits = bundle.possibleSplits(new BN(MWh));

        const expectedSplits = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((i) => new BN(i * MWh));

        const areMatching = splits.every(
            (split, i) =>
                split.volume.eq(expectedSplits[i]) &&
                split.items.reduce((item, s) => s.volume.add(item), new BN(0)).eq(expectedSplits[i])
        );

        expect(splits).toHaveLength(expectedSplits.length);
        expect(areMatching).toBeTruthy();
    });

    it('should return possible splits for the bundle', () => {
        const bundle = new Bundle({
            items: [
                {
                    startVolume: new BN(45 * MWh),
                    currentVolume: new BN(45 * MWh)
                } as BundleItem,
                {
                    startVolume: new BN(100 * MWh),
                    currentVolume: new BN(100 * MWh)
                } as BundleItem
            ]
        });

        const splits = bundle.possibleSplits(new BN(MWh));

        const expectedSplits = [29, 2 * 29, 3 * 29, 4 * 29, 5 * 29].map((i) => new BN(i * MWh));

        const areMatching = splits.every(
            (split, i) =>
                split.volume.eq(expectedSplits[i]) &&
                split.items.reduce((item, s) => s.volume.add(item), new BN(0)).eq(expectedSplits[i])
        );

        expect(splits).toHaveLength(expectedSplits.length);
        expect(areMatching).toBeTruthy();
    });
});
