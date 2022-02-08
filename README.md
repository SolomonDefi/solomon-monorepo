# Solomon Monorepo

This monorepo contains all the main apps and libraries used in the Solomon payments ecosystem. It relies on [Nx](https://nx.dev) for generating, running, building, and testing.

We recommend [PNPM](https://pnpm.io/) over NPM for package management. In the following sections, we also make use of an `pnpx` alias, which can be added to your shell profile.

```bash
npm install -g pnpm
alias pnx="pnpm run nx --"
pnpm install
```

## Getting started

Follow these instructions to set up your local development environment. Only MacOs instructions are provided, but a similar process can be followed on other systems (replace Brew with local package manager).

**Global Dependencies**

1. **[Docker](https://www.docker.com/products/docker-desktop)** - containerization Kubernetes cluster on your desktop.
   - :exclamation: **After install:** Enable local Kubernetes cluster in preferences per [these instructions](https://docs.docker.com/desktop/kubernetes/#enable-kubernetes).
     It will take a few minutes to provision the cluster for the first time.
2. **[Homebrew](https://brew.sh/)** - package manager for macOS.
3. **[NodeJs (LTS)](https://nodejs.org/docs/latest-v14.x/api/index.html) and NPM** -
   Follow [NVM Wiki](https://github.com/SolomonDefi/solomon-monorepo/wiki/NVM) to install
   and select the correct Node/NPM versions
4. **[Helm](https://helm.sh/)** - The package manager for Kubernetes.

   ```sh
   $ brew install helm
   ```

5. **[Skaffold](https://skaffold.dev/)** - build/deploy tool for local Kubernetes development.

   ```sh
   $ brew install skaffold
   ```

**Generate `util-contract`**

The `libs/shared/util-contract` is generated from `apps/contracts` with following command:

```shell
pnpm run contract:generate-type
```

**Start local dev environment**

> :warning: On Mac M1 devices, you must set the following environment variable, or the docker multi-stage build will fail

```
export DOCKER_DEFAULT_PLATFORM=linux/arm64
```

```sh
$ pnpm install
$ pnpm run skaffold
```

- It may take up to 10 minutes for skaffold to run for the first time. The subsequent runs
  should be much faster because artifacts are cached
- The skaffold run is usually finished when it a) settles (i.e. no more stuff is
  written to the terminal log) and b) you are able to verify responses from the
  apps in the next step.

**Run individual Dockerfiles**

It's possible to run apps individually, which can be useful if you're verifying package changes or debugging docker syntax:

Build the base image:

```
docker build --progress=plain -t solomon_base:test -f tools/docker/base/Dockerfile .
```

Build app images

```bash
docker build --progress=plain --no-cache -t blockchain-watcher:dev --build-arg SOLOMON_BASE=solomon_base:test -f apps/blockchain-watcher/Dockerfile --target=dev .

docker build --progress=plain --no-cache -t api-evidence:dev --build-arg SOLOMON_BASE=solomon_base:test -f apps/api-evidence/Dockerfile --target=dev .

docker build --progress=plain --no-cache -t api-dispute:dev --build-arg SOLOMON_BASE=solomon_base:test -f apps/api-dispute/Dockerfile --target=dev .

docker build --progress=plain --no-cache -t web-evidence:dev --build-arg SOLOMON_BASE=solomon_base:test -f apps/web-evidence/Dockerfile --target=dev .

docker build --progress=plain --no-cache -t db-api -f apps/db-api/Dockerfile .
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

### Generate scripts

- `blockchain-watcher:generate-mail-template`: Generate mail html templates for watcher.
- `blockchain-watcher:generate-event-interface`: Generate api events TypeScript interface for watcher. Should call `api-dispute:generate-event-schema` first.
- `contract:generate-type`: Generate contracts type definitions.
- `api-dispute:generate-event-schema`: Generate JSON schema from `api-dispute`.

### Commit hooks

- `commit-msg`: Check the commit msg, the naming rule as follows.
- `pre-push`:
  - Format code with `nx format:write --base=main --head=HEAD` (use prettier)
  - Check the branch name, the naming rule as follows.

### Branch name

The branch name format is: `<issue-number>_<short-summary>`(`^[0-9]+_[a-z0-9-]+$`). For example: `17_some-fix`, `132_improve-core-performance`.

- `issue-number`: Numeral only.
- `short-summary`: Short summary about the branch. Numeral, lowercase character and `_` are acceptable. Uppercase would cause CI error, so lowercase only.

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

### Troubleshooting

- Error `**.sh: not found` when running skaffold in Windows.
  - Make sure the EOL os `*.sh` files is `LF`, not `CRLF`, you can change it in your IDE. [SO ref here](https://stackoverflow.com/questions/40487747/trying-to-build-a-docker-container-start-sh-not-found).
