ARG SOLOMON_BASE

# CONTRACTS: DEV IMAGE (? MB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY package.json ./
RUN node ./tools/scripts/package-subset.js contracts subset.config.js package.json package.json
RUN pnpm install

COPY libs/shared ./libs/shared
COPY apps/contracts /usr/src/apps/contracts

CMD cd /usr/src/apps/contracts \
 && pnpx hardhat node

EXPOSE 8485

