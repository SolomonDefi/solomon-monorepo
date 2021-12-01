import { ethers } from 'hardhat'
import chai from 'chai'

describe('SLM Escrow', function () {
  let jurors, storage, manager, escrow
  let EscrowFactory
  let owner, account1, account2

  before(async () => {
    ;[owner, account1, account2] = await ethers.getSigners()

    // Set up contract factories for deployment
    const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
    const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
    const TokenFactory = await ethers.getContractFactory('SlmToken')
    const JudgementFactory = await ethers.getContractFactory('SlmJudgement')
    EscrowFactory = await ethers.getContractFactory('SlmEscrow')

    // Deploy token contract and unlock tokens
    const initialSupply = ethers.utils.parseEther('100000000')
    const token = await TokenFactory.deploy(
      'SLMToken',
      'SLM',
      initialSupply,
      owner.address,
    )
    await token.deployed()
    await token.unlock()

    // Deploy staker storage contract
    const unstakePeriod = 1
    const minimumStake = 1
    storage = await StorageFactory.deploy(token.address, unstakePeriod, minimumStake)

    // Deploy staker manager contract
    manager = await ManagerFactory.deploy(token.address, storage.address)
    await storage.setStakerManager(manager.address)

    // Deploy juror contract
    const minJurorCount = 4
    const tiebreakerDuration = 10
    jurors = await JudgementFactory.deploy(
      manager.address,
      minJurorCount,
      tiebreakerDuration,
    )
    await manager.setJudgementContract(jurors.address)

    // Deploy escrow contract
    escrow = await EscrowFactory.deploy()
    await escrow.initializeEscrow(
      jurors.address,
      token.address,
      account1.address,
      account2.address,
    )

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
