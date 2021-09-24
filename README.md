# Solomon Monorepo

This monorepo contains all the main apps and libraries used in the Solomon payments ecosystem. It relies on [Nx](https://nx.dev) for generating, running, building, and testing.

We recommend [PNPM](https://pnpm.io/) over NPM for package management. In the following sections, we also make use of an `pnpx` alias, which can be added to your shell profile.

```bash
npm install -g pnpm
alias pnx="pnpm run nx --"
pnpm install
```

## Apps

The following table outlines all the apps available. Each app is located in `apps/<app-name>`, and `<app-name>` can be substituted in the next section to serve, build, or test specific apps.

| app-name           | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| blockchain-watcher | Watches Solomon contracts and emails relevant parties when events occur |

### App Commands

**Serve (local development)**

```bash
pnpx nx serve <app-name>
```

**Build**

```bash
pnpx nx build <app-name>
```

**Test**

```bash
pnpx nx test <app-name>
```

## Apps

### Solomon Evidence Uploader

- Frontend: `apps/web-evidence`
- Backend: `apps/api-evidence`
  - [Setup instructions](./apps/api-evidence)

The purpose of the uploader is to provide a simple interface for uploading evidence links to the blockchain during escrow disputes. Links must exist for the duration of the dispute (generally a maximum of 2 months). There are several methods for uploading evidence, and it is straightforward to add more.

1. User provides their own link
2. User provides files and the `backend` uploads to an S3-compatible data store
3. (TBD) Pin on an IPFS node for the duration of a dispute

Currently, only Metamask is supported as a wallet provider for posting the link to the blockchain, but WalletConnect and other methods may be added in the future.

A hosted frontend and backend will be provided by Solomon, based on this repository.

## Contribute

### Commit message

The commit message format is: `<scope> [<project>]: <short-summary> #<issue-number>`

- `scope`: Follow the [gitmoji](https://gitmoji.dev/) rule
- `project`: One of `web`, `api`, `blockchain`, `docs` and `root`
- `short-summary`: Short summary about this commit
- `issue-number`: The related issue number

All commit message header sections are required, and enforced by [husky](https://github.com/typicode/husky).
You can check the validator [here](/tools/scripts/checkCommitMsg.ts).

The following are `gitmoji` recommendations for the `scope`. These are not currently enforced, but may be in the future.

- Release/tag - :bookmark: `:bookmark:`
- Feature - :sparkles: `:sparkles:`
- Docs - :books: `:books:`
- Bugfix - :bug: `:bug:`
- Testing - :white_check_mark: `:white_check_mark:`
- Lint/format - :art: `:art:`
- Refactor - :hammer: `:hammer:`
- Code/file removal - :fire: `:fire:`
- CI/CD - :green_heart: `:green_heart:`
- Deps - :lock: `:lock:`
- Breaking changes - :boom: `:boom:`
- Config - :wrench: `:wrench:`
