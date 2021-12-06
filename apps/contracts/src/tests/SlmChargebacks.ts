import { ethers } from 'hardhat'
import chai from 'chai'
import { deployContracts, deployChargeback } from './testing'

describe('SLM Chargebacks', function () {
  let chargeback
  let owner, account1, account2

  before(async () => {
    ;[owner, account1, account2] = await ethers.getSigners()

    const [token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Create new chargeback contract
    const disputeID = 125
    const chargebackAmount = 100
    chargeback = await deployChargeback(
      slmFactory,
      token,
      disputeID,
      account1,
      account2,
      chargebackAmount,
    )

    // Test that buyer and merchant addresses are correct
    chai.expect(await chargeback.buyer()).to.equal(account2.address)
    chai.expect(await chargeback.merchant()).to.equal(account1.address)
  })

  it('Test evidence uploaders', async function () {
    // Test uploading of evidence by both parties
    const buyerEvidenceURL = 'www.buyerEvidenceURL.com'
    const merchantEvidenceURL = 'www.merchantEvidenceURL.com'
    await chai
      .expect(chargeback.connect(account2).buyerEvidence(buyerEvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(chargeback.connect(account1).merchantEvidence(merchantEvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(chargeback.connect(account1).requestChargeback(buyerEvidenceURL))
      .to.be.revertedWith('Only buyer can chargeback')
    await chargeback.connect(account2).requestChargeback(buyerEvidenceURL)
    chai.expect(await chargeback.buyerEvidenceURL()).to.equal(buyerEvidenceURL)

    await chai
      .expect(chargeback.connect(account2).merchantEvidence(merchantEvidenceURL))
      .to.be.revertedWith('Invalid sender')
    await chargeback.connect(account1).merchantEvidence(merchantEvidenceURL)
    chai.expect(await chargeback.merchantEvidenceURL()).to.equal(merchantEvidenceURL)

    // Test that URLs can be resubmitted and replaced
    const newBuyerEvidenceURL = 'www.buyerEvidenceURLv2.com'
    const newMerchantEvidenceURL = 'www.merchantEvidenceURLv2.com'
    await chargeback.connect(account2).buyerEvidence(newBuyerEvidenceURL)
    chai.expect(await chargeback.buyerEvidenceURL()).to.equal(newBuyerEvidenceURL)

    await chargeback.connect(account1).merchantEvidence(newMerchantEvidenceURL)
    chai.expect(await chargeback.merchantEvidenceURL()).to.equal(newMerchantEvidenceURL)
  })
})
