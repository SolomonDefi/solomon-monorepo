import { ethers } from 'hardhat'
import chai from 'chai'
import { solidity } from 'ethereum-waffle'
chai.use(solidity)
import { deployContracts, deployEscrow } from './testing'

describe('SLM Escrow', function () {
  // Set up global variables
  let escrow
  let owner, account1, account2

  before(async () => {
    ;[owner, account1, account2] = await ethers.getSigners()

    const [token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Deploy an escrow dispute contract
    const disputeID = 125
    const escrowAmount = 100
    escrow = await deployEscrow(
      slmFactory,
      token,
      disputeID,
      account1,
      account2,
      escrowAmount,
    )

    // Test that party addresses are correct
    chai.expect(await escrow.party1()).to.equal(account1.address)
    chai.expect(await escrow.party2()).to.equal(account2.address)
  })

  it('Test evidence uploaders', async function () {
    // Test uploading of evidence by both parties
    const party1EvidenceURL = 'www.buyerEvidenceURL.com'
    const party2EvidenceURL = 'www.merchantEvidenceURL.com'

    // Check that evidence cannot be submitted before dispute is initiated
    await chai
      .expect(escrow.connect(account1).party1Evidence(party1EvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(escrow.connect(account2).party2Evidence(party2EvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')

    // Check that dispute cannot be initiated more than once
    await escrow.connect(account1).initiateDispute(party1EvidenceURL)
    await chai
      .expect(escrow.connect(account1).initiateDispute(party1EvidenceURL))
      .to.be.revertedWith('Dispute has already been initiated')
    await chai
      .expect(escrow.connect(account2).initiateDispute(party2EvidenceURL))
      .to.be.revertedWith('Dispute has already been initiated')

    // Check that party1 evidence is updated correctly
    chai.expect(await escrow.party1EvidenceURL()).to.equal(party1EvidenceURL)

    // Check that only party2 can submit party2evidence
    await chai
      .expect(escrow.connect(account1).party2Evidence(party2EvidenceURL))
      .to.be.revertedWith('Invalid sender')
    await escrow.connect(account2).party2Evidence(party2EvidenceURL)
    chai.expect(await escrow.party2EvidenceURL()).to.equal(party2EvidenceURL)

    // Test that URLs can be resubmitted and replaced
    const newParty1EvidenceURL = 'www.p1EvidenceURLv2.com'
    const newParty2EvidenceURL = 'www.p2EvidenceURLv2.com'
    await escrow.connect(account2).party2Evidence(newParty2EvidenceURL)
    chai.expect(await escrow.party2EvidenceURL()).to.equal(newParty2EvidenceURL)

    // Ensure that only party1 can submit party1evidence
    await chai
      .expect(escrow.connect(account2).party1Evidence(party1EvidenceURL))
      .to.be.revertedWith('Invalid sender')
    await escrow.connect(account1).party1Evidence(newParty1EvidenceURL)
    chai.expect(await escrow.party1EvidenceURL()).to.equal(newParty1EvidenceURL)
  })
})
