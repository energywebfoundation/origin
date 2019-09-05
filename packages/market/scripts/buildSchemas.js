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
    const options = {
        encoding: "UTF-8"
    };

    if (directory) {
        options.cwd = directory;
    }

    try {
        const { stdout, stderr } = await exec(command, options);

        return { stdout, stderr };
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

async function generateSchemaIfNew(command, location) {
    let { stdout: newSchema } = await executeCommand(command, ROOT_DIRECTORY);

    const absoluteSchemaLocation = `${ROOT_DIRECTORY}${location}`;

    const newSchemaAsJSON = JSON.parse(newSchema.toString().trim());

    let writeNewSchema = true;

    if (await fs.pathExists(absoluteSchemaLocation)) {
        const oldSchema = await fs.readJSON(absoluteSchemaLocation);

        writeNewSchema = JSON.stringify(oldSchema) !== JSON.stringify(newSchemaAsJSON);
    }

    if (writeNewSchema) {
        console.log(`Creating new schema because it changed: ${absoluteSchemaLocation}`);
        await fs.writeJSON(absoluteSchemaLocation, newSchemaAsJSON);
    }
}

async function run() {
    console.log('MARKET: Building schemas');

    await fs.ensureDir(`${ROOT_DIRECTORY}/schemas`);

    await generateSchemaIfNew(
        'yarn --silent build-schema:AgreementPropertiesOffChain',
        '/schemas/AgreementOffChainProperties.schema.json'
    );

    await generateSchemaIfNew(
        'yarn --silent build-schema:MatcherPropertiesOffChain',
        '/schemas/MatcherOffChainProperties.schema.json'
    );

    await generateSchemaIfNew(
        'yarn --silent build-schema:DemandPropertiesOffChain',
        '/schemas/DemandOffChainProperties.schema.json'
    );

    await generateSchemaIfNew(
        'yarn --silent build-schema:SupplyPropertiesOffChain',
        '/schemas/SupplyOffchainProperties.schema.json'
    );

    console.log('MARKET: Building schemas done');
}

run();
