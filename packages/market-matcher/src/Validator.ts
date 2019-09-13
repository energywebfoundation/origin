export class Validator<T> {
    private _reasons: T[] = [];

    public validate(statement: boolean, reason: T) {
        if (!statement) {
            this._reasons.push(reason);
        }

        return this;
    }

    public result() {
        return { result: this._reasons.length === 0, reason: this._reasons };
    }
}
