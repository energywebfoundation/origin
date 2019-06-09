import { assert } from 'chai';
import { mock, instance, when, spy } from 'ts-mockito';

import { Configuration } from 'ew-utils-general-lib';
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
    const conf: mockedConfiguration = instance(mockedConfiguration);

    describe('findMatchingDemandsForCertificate', async () => {
        it('matches only when certificate power higher or equal than demand', async () => {
            const mockedCertificate: Certificate.Entity = mock(Certificate.Entity);
            when(mockedCertificate.powerInW).thenReturn(10);

            const mockedDemand: Demand.Entity = mock(Demand.Entity);
            when(mockedDemand.offChainProperties).thenReturn({
                targetWhPerPeriod: 8
            }).thenReturn({
                targetWhPerPeriod: 9
            }).thenReturn({
                targetWhPerPeriod: 10
            }).thenReturn({
                targetWhPerPeriod: 11
            });

            const certificate: mockedCertificate = instance(mockedCertificate);
            const demands = [];

            for (let i = 0; i < 4; i++) {
                const demand: mockedDemand = instance(mockedDemand);
                demands.push(demand);
            }

            const matchedDemands = await findMatchingDemandsForCertificate(certificate, conf, demands);
            assert.lengthOf(matchedDemands, 3);
        });
    });

    describe('findMatchingCertificatesForDemand', async () => {
        it('matches only when certificate power higher or equal than demand', async () => {
            const mockedDemand: Demand.Entity = mock(Demand.Entity);
            when(mockedDemand.offChainProperties).thenReturn({
                targetWhPerPeriod: 10
            });

            const mockedCertificate: Certificate.Entity = mock(Certificate.Entity);
            when(mockedCertificate.powerInW).thenReturn(9).thenReturn(10).thenReturn(11).thenReturn(12);

            const demand: mockedDemand = instance(mockedDemand);
            const certificates = [];
            
            for (let i = 0; i < 4; i++) {
                const certificate: mockedCertificate = instance(mockedCertificate);
                certificates.push(certificate);
            }

            const matchedCertificates = await findMatchingCertificatesForDemand(demand, conf, certificates);
            assert.lengthOf(matchedCertificates, 3);
        });
    });

    describe('findMatchingSuppliesForDemand', async () => {
        it('matches only when supply power higher or equal than demand', async () => {
            const mockedDemand: Demand.Entity = mock(Demand.Entity);
            when(mockedDemand.offChainProperties).thenReturn({
                targetWhPerPeriod: 10
            });

            const mockedSupply: Supply.Entity = mock(Supply.Entity);
            when(mockedSupply.offChainProperties).thenReturn({
                availableWh: 9
            }).thenReturn({
                availableWh: 10
            }).thenReturn({
                availableWh: 11
            }).thenReturn({
                availableWh: 12
            });

            const demand: mockedDemand = instance(mockedDemand);
            const supplies = [];
            
            for (let i = 0; i < 4; i++) {
                const supply: mockedSupply = instance(mockedSupply);
                supplies.push(supply);
            }

            const matchedSupplies = await findMatchingSuppliesForDemand(demand, conf, supplies);
            assert.lengthOf(matchedSupplies, 3);
        });
    });

    // TO-DO Finish mocking this test

    // describe('findMatchingAgreementsForCertificate', async () => {
    //     it('matches when certificate assetId equals agreement supply assetId', async () => {
    //         const mockedCertificate: Certificate.Entity = mock(Certificate.Entity);
    //         when(mockedCertificate.assetId).thenReturn(0);

    //         const mockedAgreement: Agreement.Entity = mock(Agreement.Entity);
    //         when(mockedAgreement.supplyId).thenReturn(1).thenReturn(2).thenReturn(3);
            
    //         const certificate: mockedCertificate = instance(mockedCertificate);
    //         const agreements = [];

    //         for (let i = 0; i < 3; i++) {
    //             const agreement: mockedAgreement = instance(mockedAgreement);
    //             agreements.push(agreement);
    //         }

    //         console.log({
    //             certAssetId: certificate.assetId,
    //             agreementsAssetIds: agreements.map(agreement => agreement.supplyId)
    //         })

    //         const matchedAgreements = await findMatchingAgreementsForCertificate(certificate, conf, agreements);
    //         assert.lengthOf(matchedAgreements, 1);
    //     });
    // });

});