import BN from 'bn.js';
import program from 'commander';
import Web3 from 'web3';

import CONFIG from '../config/config.json';

const web3 = new Web3(CONFIG.config.WEB3_URL);

program.option('-f, --fundingAccount <string>', 'funding account private key');
program.option('-v, --value <ewt>', 'value of the funding tx (default: 1EWT)', '1');

program.parse(process.argv);

let hasCorrectPrivateKey = true;

try {
    web3.eth.accounts.privateKeyToAccount(program.fundingAccount);
} catch (e) {
    hasCorrectPrivateKey = false;
}

if (!hasCorrectPrivateKey) {
    console.error(`${program.fundingAccount} is incorrect private key`);
    process.exit(1);
}

const processAssets = async (assets: any[]) => {
    const fundingAccount = web3.eth.accounts.privateKeyToAccount(program.fundingAccount);
    const value = web3.utils.toWei(program.value);
    const fundingAccountBalance = await web3.eth.getBalance(fundingAccount.address);
    const required = new BN(value).mul(new BN(assets.length));

    if (required.gt(new BN(fundingAccountBalance.toString()))) {
        console.log(required.gt(fundingAccountBalance));
        console.error(
            `Not enough funds on funding account. Required ${required} has ${fundingAccountBalance}`
        );
        process.exit(1);
    }

    console.log(`Using ${fundingAccount.address} as funding account`);

    for (const asset of assets) {
        console.log('---');
        console.log(`Processing asset with id ${asset.id}`);

        const to = web3.eth.accounts.privateKeyToAccount(asset.smartMeterPrivateKey).address;

        const signedTx = await fundingAccount.signTransaction({
            to,
            gas: 21000,
            gasPrice: '1',
            value
        });

        const fundingTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(
            `Funding ${value} (${program.value}ewt) from ${fundingAccount.address} to ${to} has been broadcasted ${fundingTx.transactionHash}`
        );
    }
};

(async () => {
    console.log('----- Starting funding process for assets in config file -----');

    const { assets } = CONFIG;

    console.log(`Found ${assets.length} assets in CONFIG`);

    await processAssets(assets);
})();
