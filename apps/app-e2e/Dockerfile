FROM ubuntu:18.04 as base

# Use bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install geth
RUN apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:ethereum/ethereum -y
RUN apt-get install ethereum -y
RUN geth version

# Install Node.js & truffle
RUN apt install curl -y
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN node -v

# Install truffle
RUN npm install truffle -g
RUN truffle version

#------------------------------------
FROM base as dev

# Setup workspace
COPY ./ /usr/src/app-e2e
WORKDIR /usr/src/app-e2e

# Compile contract
RUN truffle compile

# Create local nodes and accounts
RUN geth --datadir ./net42 init ./src/genesis.json
RUN geth --datadir ./net42 account new --password ./geth_password

# Run node and deploy contract
CMD geth --datadir ./net42 --networkid 42 --http --http.addr "0.0.0.0" --http.port "8485" --http.corsdomain "*" --graphql

RUN truffle deploy

EXPOSE 8485
