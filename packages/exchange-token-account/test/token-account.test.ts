import { assert } from 'chai';

const TokenAccount = artifacts.require('TokenAccount');
const TestToken = artifacts.require('TestToken');

contract('MetaCoin', ([deployer, wallet]: string[]) => {
    it('should deploy the wallet', async () => {
        const { transactionHash } = await TokenAccount.new(wallet);
        const { gasUsed } = await web3.eth.getTransactionReceipt(transactionHash);

        console.log(`Proxy wallet creation gasUsed: ${gasUsed}`);
    });
    it('should transfer to the wallet', async () => {
        const token = await TestToken.new();

        await token.create(1000, '', deployer);

        const proxyAccount = await TokenAccount.new(wallet);

        const transferRes = await token.safeTransferFrom(
            deployer,
            proxyAccount.address,
            1,
            100,
            '0x0'
        );

        console.log(`Transfer gasUsed: ${transferRes.receipt.gasUsed}`);

        const walletBalance = await token.balanceOf(wallet, 1);

        assert.equal(100, walletBalance);
    });

    it('should transfer batch to the wallet', async () => {
        const token = await TestToken.new();

        await token.create(1000, '', deployer);
        await token.create(1000, '', deployer);

        const proxyAccount = await TokenAccount.new(wallet);

        const transferRes = await token.safeBatchTransferFrom(
            deployer,
            proxyAccount.address,
            [1, 2],
            [100, 200],
            '0x0'
        );

        console.log(`Transfer gasUsed: ${transferRes.receipt.gasUsed}`);

        const [id1Balance, id2Balance] = await token.balanceOfBatch([wallet, wallet], [1, 2]);

        assert.equal(100, id1Balance);
        assert.equal(200, id2Balance);
    });
});
