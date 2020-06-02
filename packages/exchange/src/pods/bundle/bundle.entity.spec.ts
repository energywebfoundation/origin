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
    });

    it('should allow split with partial volume', () => {
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

        expect(bundle.canSplit(new BN(50 * MWh), new BN(MWh))).toBeTruthy();
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
});
