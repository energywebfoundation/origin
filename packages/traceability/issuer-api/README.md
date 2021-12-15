<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">Issuer API</h2>
  <br>
</h1>

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
