import { Contracts, CertificateUtils } from '@energyweb/issuer';
import { Contract, ContractTransaction, ethers } from 'ethers';
import polly from 'polly-js';
import { AccountService } from '../src/pods/account/account.service';

const registryInterface = new ethers.utils.Interface(Contracts.IssuerJSON.abi);

export const issueToken = async (
    issuer: Contract,
    address: string,
    amount: string,
    generationFrom: number,
    generationTo: number,
    deviceId = 'QWERTY123'
) => {
    const data = await CertificateUtils.encodeData({
        generationStartTime: generationFrom,
        generationEndTime: generationTo,
        deviceId,
        metadata: ''
    });

    const requestReceipt = await (
        (await issuer.requestCertificationFor(data, address)) as ContractTransaction
    ).wait();

    const [log] = requestReceipt.logs;

    const { name } = registryInterface.parseLog(log);
    const { _id: requestId } = registryInterface.decodeEventLog(name, log.data, log.topics);

    const approvalReceipt = await (
        (await issuer.approveCertificationRequest(requestId, amount)) as ContractTransaction
    ).wait();

    const { args } = approvalReceipt.events.find(
        (e: any) => e.event === 'CertificationRequestApproved'
    );

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

    return registryWithUserAsSigner.safeTransferFrom(sender.address, to, id, amount, '0x00');
};

export const MWh = 10 ** 6;

export const createDepositAddress = async (
    accountService: AccountService,
    userId: string
): Promise<string> => {
    const account = await accountService.getAccount(userId);

    if (account) {
        return account.address;
    }

    await accountService.create(userId);
    const { address } = await polly()
        .waitAndRetry(5)
        .executeForPromise(async () => {
            const a = await accountService.getAccount(userId);
            if (!a) {
                throw new Error('No account');
            }
            return a;
        });

    return address;
};
