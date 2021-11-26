FROM ubuntu:18.04 as base

# Install geth
RUN apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:ethereum/ethereum -y
RUN apt-get install ethereum -y
RUN geth version

#------------------------------------
FROM base as dev

# Create local nodes
COPY ./ /usr/src/app-e2e
WORKDIR /usr/src/app-e2e
RUN geth --datadir ./net42 init ./src/genesis.json
CMD geth --datadir ./net42 --networkid 42 --http --http.addr "0.0.0.0" --http.port "8485" --http.corsdomain "*" --graphql

EXPOSE 8485
