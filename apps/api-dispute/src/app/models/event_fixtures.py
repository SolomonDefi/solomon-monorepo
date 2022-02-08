VALID_ETH_ADDRESS = '0xd3cda913deb6f67967b99d67acdfa1712c293601'
VALID_CHECKSUM_ADDRESS = '0xCf5F514A66c2326d45D80B3FEACfA7502fbcd1E1'

DISPUTE_PREORDER_CREATED_VALID = {
    "id": '8fe2dca7f6f948f1b73990d5c6ca177e',
    "type": "dispute.preorder.created",
    "party1": VALID_CHECKSUM_ADDRESS,
    "party2": VALID_ETH_ADDRESS,
    "contract": VALID_ETH_ADDRESS,
    "judgeContract": VALID_ETH_ADDRESS,
}
DISPUTE_PREORDER_CREATED_VALID_SIGNATURE = (
    'jruqYvOWrEQlA2hLfAWb6Xt3MH//IY/PkEpMd32oZAQ='
)

DISPUTE_PREORDER_CREATED_INVALID = {
    "id": '8fe2dca7f6f948f1b73990d5c6ca177e',
    "type": "dispute.preorder.created",
    "party1": VALID_ETH_ADDRESS,
    "party2": 'incorrect_address',
    "contract": VALID_ETH_ADDRESS,
    "judgeContract": VALID_ETH_ADDRESS,
}

DISPUTE_PREORDER_COMPLETED_VALID = {
    "id": 'a43252f2604d4c83bec39a1c2413446c',
    "type": "dispute.preorder.completed",
    "party1": VALID_ETH_ADDRESS,
    "party2": VALID_ETH_ADDRESS,
    "contract": VALID_ETH_ADDRESS,
    "judgeContract": VALID_ETH_ADDRESS,
    "awardedTo": VALID_ETH_ADDRESS,
}
DISPUTE_PREORDER_COMPLETED_VALID_SIGNATURE = (
    'qsN1llsou7NOaESEPqIEAQHmFFiJMZXTcU+C2spe6e8='
)

EVIDENCE_PREORDER_SUBMITTED_VALID = {
    "id": '71d777774f0e49e7b9994da089db2ec5',
    "type": "evidence.preorder.submitted",
    "party1": VALID_ETH_ADDRESS,
    "party2": VALID_ETH_ADDRESS,
    "contract": VALID_ETH_ADDRESS,
    "judgeContract": VALID_ETH_ADDRESS,
    "evidenceUrl": VALID_ETH_ADDRESS,
    "submitter": VALID_ETH_ADDRESS,
}
EVIDENCE_PREORDER_SUBMITTED_VALID_SIGNATURE = (
    'AGc4tX34h7CB2FQp0p5DhB4A8i4TSL/AZQ4ehLeShsk='
)

PAYMENT_PREORDER_CREATED_VALID = {
    "id": 'efa23e9b6afb4d6390524d2ba5fd888b',
    "type": "payment.preorder.created",
    "party1": VALID_ETH_ADDRESS,
    "party2": VALID_ETH_ADDRESS,
    "contract": VALID_ETH_ADDRESS,
    "judgeContract": VALID_ETH_ADDRESS,
    "token": VALID_ETH_ADDRESS,
    "discount": 40,
    "ethPaid": "1000000",
}
PAYMENT_PREORDER_CREATED_VALID_SIGNATURE = (
    'Ad3UqCyB0DxzLqu56vbhXXeyumSzL3xl3TsdWgIdmJ4='
)
