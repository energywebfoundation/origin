import fs from 'fs';

const issuerContract = fs.readFileSync('./contracts/Issuer.sol', 'utf8');

// Creates a different copy of the Issuer contract
const upgradedIssuerContract = issuerContract
    .replace(`contract Issuer is `, `contract IssuerUpgradeTest is `)
    .replace(`return "v0.1";`, `return "v0.2";`);

fs.writeFileSync('./contracts/IssuerUpgradeTest.sol', upgradedIssuerContract);
