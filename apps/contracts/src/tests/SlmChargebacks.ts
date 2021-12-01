import { ethers } from 'hardhat'
import chai from 'chai'

describe('SLM Chargebacks', function () {
  let jurors, token, storage, manager, chargeback
  let ChargebackFactory
  let owner, account1, account2

  before(async () => {
    ;[owner, account1, account2] = await ethers.getSigners()

    // Set up contract factories for deployment
    const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
    const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
    const TokenFactory = await ethers.getContractFactory('SlmToken')
    const JudgementFactory = await ethers.getContractFactory('SlmJudgement')
    ChargebackFactory = await ethers.getContractFactory('SlmChargeback')

    // Deploy token contract and unlock tokens
    const initialSupply = ethers.utils.parseEther('100000000')
    token = await TokenFactory.deploy('SLMToken', 'SLM', initialSupply, owner.address)
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
    const minJurorCount = 3
    const tiebreakerDuration = 10
    jurors = await JudgementFactory.deploy(
      manager.address,
      minJurorCount,
      tiebreakerDuration,
    )
    await manager.setJudgementContract(jurors.address)

    // Deploy chargeback contract
    chargeback = await ChargebackFactory.deploy()
    await chargeback.initializeChargeback(
      jurors.address,
      token.address,
      account1.address,
      account2.address,
      0,
    )

    // Test that buyer and merchant addresses are correct
    chai.expect(await chargeback.buyer()).to.equal(account2.address)
    chai.expect(await chargeback.merchant()).to.equal(account1.address)
  })

  it('Test evidence uploaders', async function () {
    // Test uploading of evidence by both parties
    const buyerEvidenceURL = 'www.buyerEvidenceURL.com'
    await chai
      .expect(chargeback.connect(account1).requestChargeback(buyerEvidenceURL))
      .to.be.revertedWith('Only buyer can chargeback')
    await chargeback.connect(account2).requestChargeback(buyerEvidenceURL)
    await chai
      .expect(chargeback.connect(account2).requestChargeback(buyerEvidenceURL))
      .to.be.revertedWith('Evidence already provided')
    chai.expect(await chargeback.buyerEvidenceURL()).to.equal(buyerEvidenceURL)

    const merchantEvidenceURL = 'www.merchantEvidenceURL.com'
    await chai
      .expect(chargeback.connect(account2).merchantEvidence(merchantEvidenceURL))
      .to.be.revertedWith('Invalid sender')
    await chargeback.connect(account1).merchantEvidence(merchantEvidenceURL)
    await chai
      .expect(chargeback.connect(account1).merchantEvidence(buyerEvidenceURL))
      .to.be.revertedWith('Evidence already provided')
    chai.expect(await chargeback.merchantEvidenceURL()).to.equal(merchantEvidenceURL)
  })
})
