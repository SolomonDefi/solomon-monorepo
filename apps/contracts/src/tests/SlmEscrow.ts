import { ethers } from 'hardhat'
import chai from 'chai'
import { deployContracts, deployEscrow } from './testing'

describe('SLM Escrow', function () {
  let escrow
  let owner, account1, account2

  before(async () => {
    ;[owner, account1, account2] = await ethers.getSigners()

    const [token, manager, storage, jurors, slmFactory] = await deployContracts()

    const disputeID = 125
    const escrowAmount = 100
    escrow = await deployEscrow(slmFactory, token, disputeID, account1, account2, escrowAmount)

    // Test that party addresses are correct
    chai.expect(await escrow.party1()).to.equal(account1.address)
    chai.expect(await escrow.party2()).to.equal(account2.address)
  })

  it('Test evidence uploaders', async function () {
    // Test uploading of evidence by both parties
    const party1EvidenceURL = 'www.buyerEvidenceURL.com'
    const party2EvidenceURL = 'www.merchantEvidenceURL.com'
    await chai
      .expect(escrow.connect(account1).party1Evidence(party1EvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(escrow.connect(account2).party2Evidence(party2EvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await escrow.connect(account1).initiateDispute(party1EvidenceURL)
    await chai
      .expect(escrow.connect(account1).initiateDispute(party1EvidenceURL))
      .to.be.revertedWith('Dispute has already been initiated')
    await chai
      .expect(escrow.connect(account1).party1Evidence(party1EvidenceURL))
      .to.be.revertedWith('Evidence already provided')
    await chai
      .expect(escrow.connect(account2).initiateDispute(party2EvidenceURL))
      .to.be.revertedWith('Dispute has already been initiated')
    chai.expect(await escrow.party1EvidenceURL()).to.equal(party1EvidenceURL)

    await escrow.connect(account2).party2Evidence(party2EvidenceURL)
    await chai
      .expect(escrow.connect(account2).party2Evidence(party2EvidenceURL))
      .to.be.revertedWith('Evidence already provided')
    chai.expect(await escrow.party2EvidenceURL()).to.equal(party2EvidenceURL)
  })
})
