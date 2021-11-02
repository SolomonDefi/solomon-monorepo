ARG SOLOMON_BASE

# SOLOMON CONTRACTS DEV APP IMAGE (? GB)
# ------------------------------------------------------------------------------------
FROM $SOLOMON_BASE as dev

COPY apps/contracts ./apps/contracts

COPY package.json ./
RUN node ./tools/scripts/workspace-subset.js contracts subset.config.js workspace.json workspace.json
RUN node ./tools/scripts/package-subset.js contracts subset.config.js package.json package.json
RUN pnpm install

ENV NODE_ENV=development

# Install libusb or Node will complain about missing I/O capability and crash
RUN \
  apt-get update \
  && apt-get install -y \
    libusb-1.0-0-dev \
    libudev-dev

CMD ["pnpm", "nx", "hardhat", "node"]


