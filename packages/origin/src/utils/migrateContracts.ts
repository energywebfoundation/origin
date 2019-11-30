import { deploy } from '@energyweb/utils-general';
import Web3 from 'web3';

import { CertificateLogic } from '../wrappedContracts/CertificateLogic';
import CertificateLogicJSON from '../../build/contracts/CertificateLogic.json';

export async function migrateCertificateRegistryContracts(
    web3: Web3,
    deviceLogicAddress: string,
    deployKey: string
): Promise<CertificateLogic> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;

    const certificateLogicAddress = (await deploy(web3, CertificateLogicJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const certificateLogic = new CertificateLogic(web3, certificateLogicAddress);
    await certificateLogic.initialize(deviceLogicAddress, {
        privateKey: privateKeyDeployment
    });

    return certificateLogic;
}
