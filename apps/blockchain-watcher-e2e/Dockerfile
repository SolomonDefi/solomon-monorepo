FROM golang:alpine3.14 as base

RUN apk update
RUN apk add git gcc g++

WORKDIR /usr/src

RUN git clone https://github.com/pledgecamp/pledgecamp-mail-tester
RUN cd ./pledgecamp-mail-tester && go install && sh run.sh

EXPOSE 4020
