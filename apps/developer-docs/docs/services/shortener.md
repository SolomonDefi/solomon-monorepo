# Link Shortener

Repository: https://github.com/solomondefi/link-shortener

The link shortener is a simple utility to generate short links, and redirect requests to the shortened URL.

It has a few extra features:

- Token authentication for creating URLs
- Preferred short codes with fallback to random generation

### Usage

Solomon hosts a link shortener for the purpose of on-chain links to purchase/escrow dispute documentation. The purpose is mainly convenience and gas efficiency, but it also simplifies other optional services built around Solomon.

The intent is not to guarantee durable links, but to handle short lived pointers to off-chain data, since a dispute will never last longer than ~1 month.

### Technology

The services is written in Python. Poetry is used for dependency management, and the redirect/API server uses Flask. SQLite3 with SQLAlchemy is used for the data store, and a cache will be added when necessary.
