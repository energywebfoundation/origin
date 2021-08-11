<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Issuer API</h2>
  <br>
</h1>

## About

API for accessing Issuer module (which communicates with blockchain). It exposes controllers, commands and events.

## Development

| Description | Command          |
| ----------- | ---------------- |
| Start       | `yarn start:dev` |
| Cleanup     | `yarn drop`      |

## Configuration

Variables that need to be configured

| Variable   | Description                                        | Need to be available in migration |
| ---------- | -------------------------------------------------- | --------------------------------- |
| WEB3       | Blockchain address                                 | YES                               |
| DEPLOY_KEY | Private key of blockchain issuer (manager account) | YES                               |

Despite this: standard TypeORM config: `DATABASE_URL` OR `DB_HOST` + `DB_PORT` + `DB_USERNAME` + `DB_PASSWORD` + `DB_DATABASE`
