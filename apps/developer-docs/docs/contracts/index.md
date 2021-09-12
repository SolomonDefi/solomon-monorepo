# Solomon Decom Contracts

All Solomon smart contracts are contained in the monorepo: https://github.com/solomondefi/solomon-monorepo

### Solomon Contract Factory

TODO -- updated after monorepo migration

- Package name: `@solomondefi/contract-factory`
- Source: https://github.com/solomondefi/slm-contracts/blob/main/contracts/SlmFactory.sol
- Contracts:
  - `SlmFactory.sol`

A contract factory for producing chargeback, preorder, and escrow contracts with low gas cost. Depends on `SlmChargeback`, `SlmPreorder`,
`SlmEscrow`, and `SlmJudgement`.

### Solomon Contract Library

Library contracts with helper methods for chargeback, preorder, and escrow related functionality.

- Package name: `@solomondefi/contract-library`
- Source: https://github.com/solomondefi/slm-contracts/tree/main/library
- Contracts:
  - `SlmPurchaseUtil.sol`
    - Utility functions common to purchase contracts
  - `SlmJudgement.sol`
    - Mediates purchase disputes
  - `SlmStaking.sol`
    - Provides a mechanism for staking SLM, and distributes purchase fees to stakers

### Solomon Chargeback

Purchase/Chargeback contract that provides buyer protection for traditional ecommerce purchases.

- Package name: `@solomondefi/contract-chargebacks`
- Source: https://github.com/solomondefi/slm-contracts/blob/main/contracts/SlmChargeback.sol
- Contracts:
  - `SlmChargebacks.sol`
    - Chargeback functionality for ecommerce purchases

### Solomon Preorder

Preorder contract that can also be used for crowdfunding.

- Package name: `@solomondefi/contract-preorder`
- Source: https://github.com/solomondefi/slm-contracts/blob/main/contracts/SlmPreorder.sol
- Contracts:
  - `SlmPreorder.sol`
    - Preorder functionality for ecommerce, crowdfunding, etc

### Solomon Escrow

Escrow contract for large transactions with strict requirements.

- Package name: `@solomondefi/contract-escrow`
- Source: https://github.com/solomondefi/slm-contracts/blob/main/contracts/SlmEscrow.sol
- Contracts:
  - `SlmEscrow.sol`
    - Escrow functionality for personal and B2B transactions

## Contribution

SLM purchase contracts are written in Solidity. We use [Hardhat](https://hardhat.org/) for development, and future packages will be pushed
to NPM. For now, contracts are included by adding a git tag to dependencies, and importing directly from `node_modules/`

**Install** (we recommend [pnpm](https://pnpm.js.org/) if you work with many node projects):

```
npm install
```

**Compile**

```
npx hardhat compile
```

**Test**

```
npx hardhat test
```

TODO -- Include specific contribution guidelines
