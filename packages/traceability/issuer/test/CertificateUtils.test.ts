import { expect } from 'chai';
import dotenv from 'dotenv';
import 'mocha';
import { Wallet } from 'ethers';

import { getProviderWithFallback } from '@energyweb/utils-general';

import { migrateIssuer, migrateRegistry } from '../src/migrate';
import { CertificateUtils, IBlockchainProperties } from '../src';

describe('CertificateUtils tests', () => {
    let blockchainProperties: IBlockchainProperties;

    dotenv.config({
        path: '.env.test'
    });

    const [web3Url] = process.env.WEB3.split(';');
    const provider = getProviderWithFallback(web3Url);

    const deviceOwnerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const deviceOwnerWallet = new Wallet(deviceOwnerPK, provider);

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerWallet = new Wallet(issuerPK, provider);

    it('migrates Registry and Issuer', async () => {
        const registry = await migrateRegistry(provider, issuerPK);
        const issuer = await migrateIssuer(provider, issuerPK, registry.address);

        blockchainProperties = {
            web3: provider,
            activeUser: deviceOwnerWallet,
            registry,
            issuer
        };
    });

    it('operator approval', async () => {
        const isApprovedBefore = await CertificateUtils.isApprovedForAll(
            issuerWallet.address,
            blockchainProperties
        );

        expect(isApprovedBefore).to.be.false;

        const tx = await CertificateUtils.approveOperator(
            issuerWallet.address,
            blockchainProperties
        );
        await tx.wait();

        const isApprovedLater = await CertificateUtils.isApprovedForAll(
            issuerWallet.address,
            blockchainProperties
        );

        expect(isApprovedLater).to.be.true;
    });
});
