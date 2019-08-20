import program from 'commander';
import Web3 from 'web3';

import CONFIG from '../config/config.json';

const web3 = new Web3(CONFIG.config.WEB3_URL);
const one = web3.utils.toWei('1');

program.option('-f, --fundingAccount <string>', 'funding account private key');

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

const processAssets = async assets => {
    const fundingAccount = web3.eth.accounts.privateKeyToAccount(program.fundingAccount);

    console.log(`Using ${fundingAccount.address} as funding account`);

    for (const asset of assets) {
        console.log('---');
        console.log(`Processing asset with id ${asset.id}`);

        const to = web3.eth.accounts.privateKeyToAccount(asset.smartMeterPrivateKey).address;

        const signedTx = await fundingAccount.signTransaction({
            to,
            gas: 21000,
            value: one
        });

        const fundingTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(
            `Funding tx from ${fundingAccount.address} to ${to} has been broadcasted ${fundingTx.transactionHash}`
        );
    }
};

(async () => {
    console.log('----- Starting funding process for assets in config file -----');

    const { assets } = CONFIG;

    console.log(`Found ${assets.length} assets in CONFIG`);

    await processAssets(assets);
})();
