import { deploy } from '@energyweb/utils-general';
import Web3 from 'web3';

import {
    CertificateDBJSON,
    CertificateLogicJSON,
    EnergyCertificateBundleDBJSON,
    EnergyCertificateBundleLogicJSON,
    OriginContractLookupJSON
} from '../../contracts';
import { OriginContractLookup } from '../wrappedContracts/OriginContractLookup';

export async function migrateCertificateRegistryContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;

        const originContractLookupAddress = (await deploy(web3, OriginContractLookupJSON.bytecode, {
            privateKey: privateKeyDeployment
        })).contractAddress;

        const test = web3.eth.abi
            .encodeParameters(
                ['address', 'address'],
                [assetContractLookupAddress, originContractLookupAddress]
            )
            .substr(2);

        const certificateLogicAddress = (await deploy(
            web3,
            CertificateLogicJSON.bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [assetContractLookupAddress, originContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const certificateDBAddress = (await deploy(
            web3,
            CertificateDBJSON.bytecode +
                web3.eth.abi.encodeParameter('address', certificateLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const originContractLookup: OriginContractLookup = new OriginContractLookup(
            web3,
            originContractLookupAddress
        );

        await originContractLookup.init(
            assetContractLookupAddress,
            certificateLogicAddress,
            certificateDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;
        resultMapping.OriginContractLookup = originContractLookupAddress;
        resultMapping.CertificateLogic = certificateLogicAddress;
        resultMapping.CertificateDB = certificateDBAddress;

        resolve(resultMapping);
    });
}

export async function migrateEnergyBundleContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;

        const originContractLookupAddress = (await deploy(web3, OriginContractLookupJSON.bytecode, {
            privateKey: privateKeyDeployment
        })).contractAddress;

        const energyCertificateBundleLogicAddress = (await deploy(
            web3,
            EnergyCertificateBundleLogicJSON.bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [assetContractLookupAddress, originContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const energyCertificateBundleDBAddress = (await deploy(
            web3,
            EnergyCertificateBundleDBJSON.bytecode +
                web3.eth.abi
                    .encodeParameter('address', energyCertificateBundleLogicAddress)
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const originContractLookup: OriginContractLookup = new OriginContractLookup(
            web3,
            originContractLookupAddress
        );

        await originContractLookup.init(
            assetContractLookupAddress,
            energyCertificateBundleLogicAddress,
            energyCertificateBundleDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;
        resultMapping.OriginContractLookup = originContractLookupAddress;
        resultMapping.EnergyCertificateBundleLogic = energyCertificateBundleLogicAddress;
        resultMapping.EnergyCertificateBundleDB = energyCertificateBundleDBAddress;

        resolve(resultMapping);
    });
}
