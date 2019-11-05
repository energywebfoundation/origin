import * as fs from 'fs';

const main = async () => {
    const TEFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/dist/contracts/TradableEntityLogic.json', 'utf8')
    );

    const teBytecode = TEFile.bytecode;
    console.log('bytecode tradable-Entity');
    console.log('length: ' + teBytecode.length);
    console.log('KB: ' + teBytecode.length / 2);
    console.log('');

    const certFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/dist/contracts/CertificateLogic.json', 'utf8')
    );
    const certBytecode = certFile.bytecode;

    console.log('bytecode certLogic');
    console.log('length: ' + certBytecode.length);
    console.log('KB: ' + certBytecode.length / 2);
    console.log('');

    console.log('deployedbytecode: certLogic');
    console.log('KB: ' + certFile.deployedBytecode.length / 2);

    const certDBFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/dist/contracts/CertificateDB.json', 'utf8')
    );
    const certDBBytecode = certDBFile.bytecode;

    console.log('bytecode CertificateDB');
    console.log('length: ' + certDBBytecode.length);
    console.log('KB: ' + certDBBytecode.length / 2);
    console.log('');

    const bundleLogicFIle = JSON.parse(
        fs.readFileSync(process.cwd() + '/dist/contracts/EnergyCertificateBundleLogic.json', 'utf8')
    );
    const bundleLogicByteCode = bundleLogicFIle.bytecode;

    console.log('bytecode bundleLogic');
    console.log('length: ' + bundleLogicByteCode.length);
    console.log('KB: ' + bundleLogicByteCode.length / 2);
    console.log('');

    const bunldeDBFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/dist/contracts/EnergyCertificateBundleDB.json', 'utf8')
    );
    const bundleDBByteCode = bunldeDBFile.bytecode;

    console.log('bytecode bundleDB');
    console.log('length: ' + bundleDBByteCode.length);
    console.log('KB: ' + bundleDBByteCode.length / 2);
    console.log('');
};

main();
