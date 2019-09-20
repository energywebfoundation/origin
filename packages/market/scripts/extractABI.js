#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');

function relativePath(pathToAdd) {
    return path.join(__dirname, pathToAdd);
}

function getRootDirectory() {
    const PATHS_TO_TEST = [relativePath('../')];

    for (const testPath of PATHS_TO_TEST) {
        if (fs.existsSync(testPath)) {
            return testPath;
        }
    }

    throw `Can't find contracts directory`;
}

const ROOT_DIRECTORY = getRootDirectory();

const ARTIFACTS_DIRECTORY = `${ROOT_DIRECTORY}/build/contracts`;

async function extractABI(name) {
    const location = `${ARTIFACTS_DIRECTORY}/${name}`;

    const fullArtifactFile = await fs.readJSON(location);

    const lightweightArtifacts = {
        abi: fullArtifactFile.abi,
        networks: fullArtifactFile.networks
    };

    let writeNewSchema = true;

    if (await fs.pathExists(location)) {
        const oldFile = await fs.readJSON(location);

        writeNewSchema = JSON.stringify(oldFile) !== JSON.stringify(lightweightArtifacts);
    }

    if (writeNewSchema) {
        await fs.writeJSON(`${ARTIFACTS_DIRECTORY}/lightweight/${name}`, lightweightArtifacts);
    }
}

async function run() {
    console.log('MARKET: Generate lightweight artifacts');

    await fs.ensureDir(ARTIFACTS_DIRECTORY);
    await fs.ensureDir(`${ARTIFACTS_DIRECTORY}/lightweight`);

    const files = await fs.readdir(ARTIFACTS_DIRECTORY);

    for (const filename of files) {
        if (!filename.endsWith('.json')) {
            continue;
        }

        await extractABI(filename);
    }

    console.log('MARKET: Generating lightweight artifacts done');
}

run();
