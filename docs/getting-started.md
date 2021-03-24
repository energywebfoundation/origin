# Getting started

Before you can start Origin development you need to go through basic installation and building process.

1. Make sure you are using [Node 14.x.x](https://nodejs.org/en/download/)
2. Install `yarn` package manager using `npm i -g yarn`
3. Origin requires PostgreSQL database installed and configured
4. Clone Origin repository branch <a href="https://github.com/energywebfoundation/origin">master</a>
5. Copy `.env.example` to `.env` (default values are for now)
6. Install packages using `yarn` command
7. Build using `yarn build` command

<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
    We recommend using Docker for all external services, databases etc, please follow (requires <a href="https://www.postgresql.org/docs/13/app-psql.html">psql</a> command line tool installed):
```bash
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE origin"
```
  </p>
</div>