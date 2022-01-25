<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../../docs/images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Issuer API

## Description

The Issuer API is a [NestJS](https://nestjs.com/) package that provides restful endpoints for handling Certificate operations (certificate request, issuance, transfer, claiming, revoking).

It is is a component of [Energy Web Origin's](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/) Traceability SDK.

## Documentation

-   [Issuer API](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/packages/issuer-api/)
-   [Traceability SDK](https://energy-web-foundation-origin.readthedocs-hosted.com/en/latest/traceability/)

## Contributing Guidelines

See [contributing.md](../../../contributing.md)

# Energy Web Decentralized Operating System

EW-Origin is a component of the Energy Web Decentralized Operating System (EW-DOS).

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

-   To learn about more about the EW-DOS tech stack, see our [documentation](https://app.gitbook.com/@energy-web-foundation/s/energy-web/)

For a deep-dive into the motivation and methodology behind our technical solutions, read our White Papers:

-   [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
-   [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

-   [Twitter](https://twitter.com/energywebx)
-   [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
-   [Telegram](https://t.me/energyweb)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Notes

If you decide to use CertificationRequest, then you should also include `ScheduleModule.forRoot()` in your application, to run synchronization task.

## Signer configuration

IssuerApi module by default encrypts supplied platform operator private key using database storage,
and `OPERATOR_ENCRYPTION_KEY` environment variable as encryption key for the storage.

If you want to use another signer, make sure to create `SignerAdapter` provider,
that implements `SignerAdapter` abstract class. This provider can be registered anywhere:

```ts
import { SignerAdapter } from '@energyweb/issuer-api`;

class MyCustomSigner implements SignerAdapter {
  // ...
}

const signerAdapter = {
  provide: SignerAdapter,
  useClass: MyCustomSigner,
};

@Module({
  providers: [signerAdapter],
  imports: [IssuerApi.register()]
})
```

For migration instructions see changelog.
