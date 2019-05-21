// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

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
