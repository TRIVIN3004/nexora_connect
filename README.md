# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.



Common Examples of SMTP Host URLs:
Google Workspace / Gmail: smtp.gmail.com
Outlook / Office 365: smtp.office365.com
SendGrid: smtp.sendgrid.net
Resend (if using their SMTP relay): smtp.resend.com
Amazon SES: email-smtp.us-east-1.amazonaws.com (varies by region)


The 3 Standard SMTP Ports:
Port 587 (Recommended & Modern Standard):
Security: Uses STARTTLS encryption (the connection starts normally and immediately upgrades to secure TLS/SSL).
Usage: Almost all modern email systems (Gmail, SendGrid, Office 365) use Port 587 by default.
Port 465 (Secure SSL):
Security: Uses Implicit SSL (the connection is secure and encrypted from the very first millisecond).
Usage: Used when the mail server requires a strictly secure connection upfront.
Port 25 (Deprecated / Blocked):
Security: Unencrypted and insecure.
Usage: Mostly blocked by internet service providers (ISPs) and cloud hosting networks (like AWS or Azure) to prevent spam. You should avoid using Port 25.
# nexora_connect

resend api
