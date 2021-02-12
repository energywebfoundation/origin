export abstract class BaseClient {
    constructor(public backendUrl: string, public accessToken?: string) {
        this.setup(this.accessToken);
    }

    abstract setup(accessToken?: string);

    removeAccessToken() {
        this.setup();
    }
}
