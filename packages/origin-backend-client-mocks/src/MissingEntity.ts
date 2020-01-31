export class MissingEntity extends Error {
    public response = { status: 404 };
}
