"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mandrill_1 = __importDefault(require("mandrill-api/mandrill"));
class MandrillEmailAdapter {
    constructor(apiKey) {
        this.mandrill = new mandrill_1.default.Mandrill(apiKey);
    }
    async send(from, email) {
        const { to, subject, html } = email;
        const toFormatted = to.map(toAddress => {
            return {
                email: toAddress,
                name: toAddress,
                type: 'to'
            };
        });
        const message = {
            html,
            subject,
            from_email: from,
            from_name: 'Energy Web Origin',
            to: toFormatted
        };
        const result = await this.mandrill.messages.send({ message, async: true });
        return result === 'sent';
    }
}
exports.MandrillEmailAdapter = MandrillEmailAdapter;
//# sourceMappingURL=mandrill.adapter.js.map