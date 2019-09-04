"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
class NodemailerAdapter {
    async send(from, email) {
        const { to, subject, html } = email;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const info = await transporter.sendMail({
            from,
            to: to.join(', '),
            subject,
            text: html.replace(/<[^>]*>?/gm, ''),
            html
        });
        console.log(`Message sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        return true;
    }
}
exports.NodemailerAdapter = NodemailerAdapter;
//# sourceMappingURL=nodemailer.adapter.js.map