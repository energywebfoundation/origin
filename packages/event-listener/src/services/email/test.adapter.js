"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestEmailAdapter {
    async send(from, email) {
        console.log(`Sent test email from ${from}`);
        console.log(email);
        return true;
    }
}
exports.TestEmailAdapter = TestEmailAdapter;
//# sourceMappingURL=test.adapter.js.map