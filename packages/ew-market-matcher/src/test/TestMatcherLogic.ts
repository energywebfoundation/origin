import { assert } from 'chai';
import { mock, instance, when, spy, reset } from 'ts-mockito';

import { Configuration, Currency } from 'ew-utils-general-lib';
import { Certificate } from 'ew-origin-lib';
import { Demand, Agreement, Supply } from 'ew-market-lib';

import {
    findMatchingDemandsForCertificate,
    findMatchingCertificatesForDemand,
    findMatchingAgreementsForCertificate,
    findMatchingSuppliesForDemand
} from '../matcher/MatcherLogic';

describe('Test Matcher Logic', async () => {
    const mockedConfiguration: Configuration.Entity = mock(Configuration.Entity);
    const conf: Configuration.Entity = instance(mockedConfiguration);

    describe('findMatchingDemandsForCertificate', async () => {
        it('matches only when demand matches certificate', async () => {
            const testCertificate = {
                powerInW: 1e6,
                offChainSettlementOptions: {
                    price: 150,
                    currency: Currency.EUR
                },
                acceptedToken: '0x0000000000000000000000000000000000000000'
            };

            const testDemands = [
                // All checks should fail
                {
                    targetWhPerPeriod: 1.5e6,
                    maxPricePerMwh: 100,
                    currency: Currency.USD
                },
                // Wh check should fail
                {
                    targetWhPerPeriod: 1e5,
                    maxPricePerMwh: 100,
                    currency: Currency.EUR
                },
                // Price check should fail
                {
                    targetWhPerPeriod: 1.5e6,
                    maxPricePerMwh: 200,
                    currency: Currency.EUR
                },
                // Currency check should fail
                {
                    targetWhPerPeriod: 1e5,
                    maxPricePerMwh: 200,
                    currency: Currency.USD
                },
                // All checks should pass
                {
                    targetWhPerPeriod: 1e5,
                    maxPricePerMwh: 200,
                    currency: Currency.EUR
                }
            ];

            const numShouldMatch = 1;

            const mockedCertificate: Certificate.Entity = mock(Certificate.Entity);
            when(mockedCertificate.powerInW).thenReturn(testCertificate.powerInW);
            when(mockedCertificate.offChainSettlementOptions).thenReturn(
                testCertificate.offChainSettlementOptions
            );
            when(mockedCertificate.acceptedToken).thenReturn(testCertificate.acceptedToken);

            const certificate: Certificate.Entity = instance(mockedCertificate);
            const demandsToTest = [];

            for (const demand of testDemands) {
                const mockedDemand: Demand.Entity = mock(Demand.Entity);
                when(mockedDemand.offChainProperties).thenReturn(demand);
                const demandInstance: Demand.Entity = instance(mockedDemand);
                demandsToTest.push(demandInstance);
            }

            const matchedDemands = await findMatchingDemandsForCertificate(
                certificate,
                conf,
                demandsToTest
            );
            assert.lengthOf(matchedDemands, numShouldMatch);
        });
    });

    describe('findMatchingCertificatesForDemand', async () => {
        it('matches only when certificate matches demand', async () => {
            const testDemand = {
                targetWhPerPeriod: 1e6,
                maxPricePerMwh: 150,
                currency: Currency.EUR
            };

            const testCertificates = [
                // All checks should fail
                {
                    powerInW: 1e6,
                    offChainSettlementOptions: {
                        price: 200,
                        currency: Currency.EUR
                    },
                    acceptedToken: '0x0000000000000000000000000000000000000000',
                    forSale: true
                },
                // Wh check should fail
                {
                    powerInW: 1.1e6,
                    offChainSettlementOptions: {
                        price: 200,
                        currency: Currency.EUR
                    },
                    acceptedToken: '0x0000000000000000000000000000000000000000',
                    forSale: true
                },
                // Price check should fail
                {
                    powerInW: 0.9e6,
                    offChainSettlementOptions: {
                        price: 100,
                        currency: Currency.EUR
                    },
                    acceptedToken: '0x0000000000000000000000000000000000000000',
                    forSale: true
                },
                // Currency check should fail
                {
                    powerInW: 1.1e6,
                    offChainSettlementOptions: {
                        price: 100,
                        currency: Currency.USD
                    },
                    acceptedToken: '0x0000000000000000000000000000000000000000',
                    forSale: true
                },
                // For sale check should fail
                {
                    powerInW: 1.1e6,
                    offChainSettlementOptions: {
                        price: 100,
                        currency: Currency.EUR
                    },
                    acceptedToken: '0x0000000000000000000000000000000000000000',
                    forSale: false
                },
                // All checks should pass
                {
                    powerInW: 1.1e6,
                    offChainSettlementOptions: {
                        price: 100,
                        currency: Currency.EUR
                    },
                    acceptedToken: '0x0000000000000000000000000000000000000000',
                    forSale: true
                }
            ];

            const numShouldMatch = 1;

            const mockedDemand: Demand.Entity = mock(Demand.Entity);
            when(mockedDemand.offChainProperties).thenReturn(testDemand);

            const demand: Demand.Entity = instance(mockedDemand);
            const certificatesToTest = [];

            for (const certificate of testCertificates) {
                const mockedCertificate: Certificate.Entity = mock(Certificate.Entity);
                when(mockedCertificate.powerInW).thenReturn(certificate.powerInW);
                when(mockedCertificate.offChainSettlementOptions).thenReturn(
                    certificate.offChainSettlementOptions
                );
                when(mockedCertificate.acceptedToken).thenReturn(certificate.acceptedToken);
                when(mockedCertificate.forSale).thenReturn(certificate.forSale);

                const certificateInstance: Certificate.Entity = instance(mockedCertificate);
                certificatesToTest.push(certificateInstance);
            }

            const matchedCertificates = await findMatchingCertificatesForDemand(
                demand,
                conf,
                certificatesToTest
            );
            assert.lengthOf(matchedCertificates, numShouldMatch);
        });
    });

    describe('findMatchingSuppliesForDemand', async () => {
        it('matches only when supply matches demand', async () => {
            const testDemand = {
                targetWhPerPeriod: 1e6,
                maxPricePerMwh: 150
            };

            const testSupplies = [
                // Both checks should fail
                {
                    availableWh: 0.9e6,
                    price: 200
                },
                // Wh check should fail
                {
                    availableWh: 1.1e6,
                    price: 200
                },
                // Price check should fail
                {
                    availableWh: 0.9e6,
                    price: 100
                },
                // Both checks should pass
                {
                    availableWh: 1.1e6,
                    price: 100
                }
            ];

            const numShouldMatch = 1;

            const mockedDemand: Demand.Entity = mock(Demand.Entity);
            when(mockedDemand.offChainProperties).thenReturn(testDemand);

            const demand: Demand.Entity = instance(mockedDemand);
            const suppliesToTest = [];

            for (const supply of testSupplies) {
                const mockedSupply: Supply.Entity = mock(Supply.Entity);
                when(mockedSupply.offChainProperties).thenReturn(supply);

                const supplyInstance: Supply.Entity = instance(mockedSupply);
                suppliesToTest.push(supplyInstance);
            }

            const matchedSupplies = await findMatchingSuppliesForDemand(
                demand,
                conf,
                suppliesToTest
            );
            assert.lengthOf(matchedSupplies, numShouldMatch);
        });
    });

    // TO-DO Finish mocking this test
    describe('findMatchingAgreementsForCertificate', async () => {
        xit('matches when certificate assetId equals agreement supply assetId', async () => {
            const testCertificate = {
                assetId: 0
            };

            const testAgreements = [{ supplyId: 1 }, { supplyId: 2 }, { supplyId: 3 }];

            const expectedMatches = 1;

            const mockedCertificate: Certificate.Entity = mock(Certificate.Entity);
            when(mockedCertificate.assetId).thenReturn(testCertificate.assetId);

            const certificate: Certificate.Entity = instance(mockedCertificate);
            const agreementsToTest = [];

            for (const agreement of testAgreements) {
                const mockedAgreement: Agreement.Entity = mock(Agreement.Entity);
                when(mockedAgreement.supplyId).thenReturn(agreement.supplyId);

                const agreementInstance: Agreement.Entity = instance(mockedAgreement);
                agreementsToTest.push(agreementInstance);
            }

            const matchedAgreements = await findMatchingAgreementsForCertificate(
                certificate,
                conf,
                agreementsToTest
            );
            assert.lengthOf(matchedAgreements, expectedMatches);
        });
    });
});
