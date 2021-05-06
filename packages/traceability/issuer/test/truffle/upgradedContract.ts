import fs from 'fs';

const issuerContract = fs.readFileSync('./contracts/Issuer.sol', 'utf8');

// Fixes an issue where attaching multiple files to FormData doesn't work
const upgradedIssuerContract = issuerContract
    .replace(`contract Issuer is `, `contract IssuerUpgradeTest is `)
    .replace(`return "v0.1";`, `return "v0.2";`);

fs.writeFileSync('./contracts/IssuerUpgradeTest.sol', upgradedIssuerContract);
