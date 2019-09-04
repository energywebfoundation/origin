#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs-extra');

function relativePath(pathToAdd) {
    return path.join(__dirname, pathToAdd);
}

function getRootDirectory() {
    const PATHS_TO_TEST = [relativePath('../')];

    for (const path of PATHS_TO_TEST) {
        if (fs.existsSync(path)) {
            return path;
        }
    }

    throw `Can't find contracts directory`;
}

const ROOT_DIRECTORY = getRootDirectory();

async function executeCommand(command, directory) {
    const options = {};

    if (directory) {
        options.cwd = directory;
    }

    try {
        const { stdout, stderr } = await exec(command, options);

        console.log(stdout);
        console.error(stderr);
    } catch (error) {
        if (error && error.stdout) {
            console.error(error.stdout);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

async function run() {
    console.log('EW-ASSET-REGISTRY-LIB: Building...');

    await executeCommand('yarn clean', ROOT_DIRECTORY);
    await executeCommand('yarn compile', ROOT_DIRECTORY);
    await executeCommand('yarn build-ts', ROOT_DIRECTORY);

    if (!(await fs.pathExists(`${ROOT_DIRECTORY}/dist/js/src`))) {
        await fs.move(`${ROOT_DIRECTORY}/dist/js`, `${ROOT_DIRECTORY}/dist/js-temp`);
        await fs.ensureDir(`${ROOT_DIRECTORY}/dist/js`);
        await fs.move(`${ROOT_DIRECTORY}/dist/js-temp`, `${ROOT_DIRECTORY}/dist/js/src`);
    }

    if (!(await fs.pathExists(`${ROOT_DIRECTORY}/dist/js/schemas`))) {
        await fs.move(`${ROOT_DIRECTORY}/schemas`, `${ROOT_DIRECTORY}/dist/js/schemas`);
    }

    if (!(await fs.pathExists(`${ROOT_DIRECTORY}/dist/js/build`))) {
        await fs.move(`${ROOT_DIRECTORY}/build`, `${ROOT_DIRECTORY}/dist/js/build`);
    }

    console.log('EW-ASSET-REGISTRY-LIB: Done.');
}

run();
