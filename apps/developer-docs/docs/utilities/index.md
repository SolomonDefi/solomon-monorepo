# Evidence Upload

Repository: https://github.com/solomondefi/evidence-uploader

The purpose of the uploader is to provide a simple interface for uploading evidence links to the blockchain during escrow disputes. Links must exist for the
duration of the dispute (generally a maximum of 2 months). There are several methods for uploading evidence, and it is straightforward to
add more.

1. User provides their own link
2. User provides files and the `backend` uploads to an S3-compatible data store
3. (TBD) Pin on an IPFS node for the duration of a dispute

Currently, only Metamask is supported as a wallet provider for posting the link to the blockchain, but WalletConnect and other methods may
be added in the future.

A hosted frontend and backend are provided by Solomon, a UI demo can currently be viewed at https://evidence.solomondefi.com

## Evidence Uploader Frontend

See the `frontend` folder of the evidence uploader Github repository for more technical details including setup and deploy procedures: https://github.com/solomondefi/evidence-uploader/tree/main/frontend

A Vue3 app for uploading dispute evidence links to the blockchain. Files may be provided via external link, or uploaded directly to the
hosted `backend`. Metamask is used for executing the transaction.

## Evidence Uploader Backend

See the `backend` folder of the evidence uploader Github repository for more technical details including setup and deploy procedures: https://github.com/solomondefi/evidence-uploader/tree/main/backend

A Flask (Python) app for uploading dispute evidence links to the blockchain. DigitalOcean's spaces service is used for storing data, but it
can be substituted with any S3 compatible service.

The [URL Shortener](/utilities/shortener) is used to shorten links to reduce blockchain gas fees.
