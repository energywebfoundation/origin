# Running all the components with docker compose

There are 4 docker compose files provided to run origin stack:

-   based on the latest **stable** versions of NPM packages:
    -   Vanilla Origin version with a **custom Device Registry** (`origin.release.yml`)
    -   **I-REC compliant** Origin version (`origin.release.irec.yml`)
-   based on the latest **canary** versions of NPM packages:
    -   Vanilla Origin version with a **custom Device Registry** (`origin.local.yml`)
    -   **I-REC compliant** Origin version (`origin.local.irec.yml`)

All compose files require docker images to be built locally.

## Building docker images locally

<div class="admonition attention">
  <p class="first admonition-title">Attention</p>
  <p class="last">
    Make sure you completed <a href="../getting-started">Getting started</a> in order to install and build Origin monorepo.
  </p>
</div>

-   Check out the latest code from the [Origin repository](https://github.com/energywebfoundation/origin)
-   Execute the following commands from the code folder to build the codebase:
    ```shell
    rush update
    rush build #in case of errors it is necessary to execute rush rebuild
    ```
-   Build docker images
    -   For the latest stable release:
    ```shell
    yarn build:containers:release
    ```
    -   For the latest canary version:
    ```shell
    yarn build:containers:canary
    ```

## Start chosen stack

To start chosen stack, for example **I-REC compliant** Origin, execute the following:

```shell
docker-compose -f origin.release.irec.yml up -d
```

`-d` option detaches your terminal from docker compose logs, to see them, execute:

```shell
docker-compose -f origin.release.irec.yml logs -f
```

## Stopping the stack

to stop the stack without loosing data, execute

```
docker-compose -f origin.release.irec.yml down
```

by adding `-v` option you will also delete all volumes linked to this stack and loose all data

## Possible collisions

If you experiment and run multiple stacks, you can use `-p <stack name>` option to name your stacks. Docker compose
prefixes service names with it. Otherwise folder name is used as a name of a stack.
