import {
    IrecRegistrationClient,
    Configuration
} from '@energyweb/origin-organization-irec-api-client';
import { BaseClient } from './BaseClient';

export class IRecClient extends BaseClient {
    organizationClient: IrecRegistrationClient;

    setup(accessToken?: string) {
        const config = new Configuration(
            accessToken
                ? {
                      baseOptions: {
                          headers: {
                              Authorization: `Bearer ${accessToken}`
                          }
                      },
                      accessToken
                  }
                : {}
        );

        this.organizationClient = new IrecRegistrationClient(config, this.backendUrl);
    }
}
