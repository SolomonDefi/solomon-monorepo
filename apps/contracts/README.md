#

Generated via [`nx-hardhat`](https://github.com/samatechtw/nx-hardhat)

## Usage

[Hardhat](https://hardhat.org/) is used for contract development and deploy.

**Compile contracts** (see [Environment](#environment))

```bash
$ pnpx nx build contracts
```

**Run tests**

```bash
$ pnpx nx test contracts

# With coverage (TODO -- not implemented yet)
$ pnpx nx test-coverage contracts
```

**Lint**

```bash
# Tests and config files (JS/TS)
$ pnpx nx lint contracts

# Contracts
$ pnpx nx lint-solidity contracts
```

**Hardhat local blockchain node**

```bash
$ pnpx nx dev contracts
```

**Deploy**

```bash
# To local node
$ pnpx nx deploy contracts

# To Ropsten testnet (needs "ROPSTEN_X" env vars)
$ pnpx nx deploy --network testnet contracts
```

**Misc**

```sh
# Clear cache and delete all artifacts
$ pnpx nx clean contracts
```

## Environment

The repo comes with and example config in `.env.dist`. These represent the defaults; to modify them copy the file to `.env` and edit.

| Name              | Default | Description                                                             |
| ----------------- | ------- | ----------------------------------------------------------------------- |
| HARDHAT_LOGGING   | 1       | Logger switch                                                           |
| WALLET_MNEMONIC   | -       | Custom wallet mnemonic for local dev (for Metamask testing convenience) |
| ETHERSCAN_API_KEY | -       | API key for etherscan. Used for deployed contract verification.         |
| ROPSTEN_RPC_URL   | -       | RPC URL for ropsten testnet deploy                                      |
| ROPSTEN_MNEMONIC  | -       | Wallet mnemonic for ropsten deploy                                      |
| TEST_REPORT_GAS   | 1       | Report gas usage after test                                             |
