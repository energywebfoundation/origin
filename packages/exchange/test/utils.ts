import { ContractTransaction, Contract, ethers } from 'ethers';
import { Contracts } from '@energyweb/issuer';

const registryInterface = new ethers.utils.Interface(Contracts.IssuerJSON.abi);

const web3 = 'http://localhost:8580';

export const issueToken = async (
    issuer: Contract,
    address: string,
    amount: string,
    generationFrom: number,
    generationTo: number
) => {
    const deviceId = 'QWERTY123';

    const data = await issuer.encodeData(generationFrom, generationTo, deviceId);

    const requestReceipt = await ((await issuer.requestCertificationFor(
        data,
        address,
        false
    )) as ContractTransaction).wait();

    const {
        values: { _id: requestId }
    } = registryInterface.parseLog(requestReceipt.logs[0]);

    const validityData = registryInterface.functions.isRequestValid.encode([requestId.toString()]);

    const approvalReceipt = await ((await issuer.approveCertificationRequest(
        requestId,
        amount,
        validityData
    )) as ContractTransaction).wait();

    const { args } = approvalReceipt.events.find((e) => e.event === 'CertificationRequestApproved');

    return args[2].toString();
};

export const depositToken = async (
    registry: Contract,
    sender: ethers.Wallet,
    to: string,
    amount: string,
    id: number
) => {
    const registryWithUserAsSigner = registry.connect(sender);

    await registryWithUserAsSigner.functions.safeTransferFrom(
        sender.address,
        to,
        id,
        amount,
        '0x0'
    );
};

export const provider = new ethers.providers.JsonRpcProvider(web3);
