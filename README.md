

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

app-name            | Description
------------------- | ---------------
blockchain-mailer   | Watches Solomon contracts and emails relevant parties when events occur

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
## Contribute

### Commit message
The commit message format is: `<scope> [<project>]: <short-summary> #<issue-number>`

* `scope`: Follow the [gitmoji](https://gitmoji.dev/) rule 
* `project`: One of `web`, `api`, `blockchain`, `docs` and `root`
* `short-summary`: Short summary about this commit
* `issue-number`: The related issue number

Every part of them are required, will be checked before commit by [husky](https://github.com/typicode/husky). 
You can check the validator [here](/tools/scripts/checkCommitMsg.ts).
