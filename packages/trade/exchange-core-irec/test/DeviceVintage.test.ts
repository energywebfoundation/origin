import { assert } from 'chai';

import { DeviceVintage, Operator } from '../src';

describe('DeviceVintage tests', () => {
    it('should match equal with default operator', () => {
        const vintageA = new DeviceVintage(2010);
        const vintageB = new DeviceVintage(2010);

        assert.isTrue(vintageA.matches(vintageB));
    });

    it('should not match when not equal with default operator', () => {
        const vintageA = new DeviceVintage(2011);
        const vintageB = new DeviceVintage(2010);

        assert.isFalse(vintageA.matches(vintageB));
    });

    it('should match when A is younger than B and B is defined as GreaterThanOrEqualTo', () => {
        const vintageA = new DeviceVintage(2010);
        const vintageB = new DeviceVintage(2008, Operator.GreaterThanOrEqualsTo);

        assert.isTrue(vintageA.matches(vintageB));
    });

    it('should not match when A is younger than B and B is defined as LessThanOrEqualTo', () => {
        const vintageA = new DeviceVintage(2010);
        const vintageB = new DeviceVintage(2008, Operator.LessThanOrEqualsTo);

        assert.isFalse(vintageA.matches(vintageB));
    });

    it('should match when A is older than B and B is defined as LessThanOrEqualTo', () => {
        const vintageA = new DeviceVintage(2010);
        const vintageB = new DeviceVintage(2015, Operator.LessThanOrEqualsTo);

        assert.isTrue(vintageA.matches(vintageB));
    });
});
