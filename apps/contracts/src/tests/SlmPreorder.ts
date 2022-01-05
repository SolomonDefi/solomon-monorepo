import { ethers } from 'hardhat'
import chai from 'chai'
import {
  increaseTime,
  createEncryptedString,
  sendVote,
  stake,
  deployContracts,
  deployPreorder,
} from './testing'

const { expect } = chai

describe('SLM Preorders', function () {
  let jurors, token, storage, manager, slmFactory, preorder
  let disputeAddress
  let owner, account1, account2, account3, account4, account5
  let userId3, userId4, userId5

  let latestBlock
  let currentTime
  const encryptionKey =
    '0xa07401392a302964432a10a884f08df4c301b6bd5980df91b107afd2a8cc1eac'
  const fakeEncryptionKey =
    '0xb09801392a302964432a10a884f08df4c301b6bd5980df91b107afd2a8cc1abc'

  before(async () => {
    ;[owner, account1, account2, account3, account4, account5] = await ethers.getSigners()

    // Set up current time variable
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    ;[token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Allocate tokens to user accounts
    const defaultAmount = 100
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)
    await token.mint(account4.address, defaultAmount)
    await token.mint(account5.address, defaultAmount)

    // Create new preorder contract
    const disputeID = 125
    const preorderAmount = 100
    preorder = await deployPreorder(
      slmFactory,
      token,
      disputeID,
      account1,
      account2,
      preorderAmount,
    )

    // Test that buyer and merchant addresses are correct
    chai.expect(await preorder.buyer()).to.equal(account2.address)
    chai.expect(await preorder.merchant()).to.equal(account1.address)

    // Set up end time for vote and dispute address
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    const endTime = currentTime + 259200
    disputeAddress = preorder.address
    const quorum = 2
    const stakeAmount = 100

    // Have stakers submit their stakes
    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    userId3 = 3
    await stake(token, manager, account3, userId3, stakeAmount)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    chai.expect(await token.balanceOf(account4.address)).to.equal(defaultAmount)
    userId4 = 4
    await stake(token, manager, account4, userId4, stakeAmount)
    chai.expect(await token.balanceOf(account4.address)).to.equal(0)

    chai.expect(await token.balanceOf(account5.address)).to.equal(defaultAmount)
    userId5 = 5
    await stake(token, manager, account5, userId5, stakeAmount)
    chai.expect(await token.balanceOf(account5.address)).to.equal(0)

    // Reflect changes in the staker pool and start the voting process
    await jurors.setStakerPool()
    await jurors.initializeDispute(disputeAddress, quorum, endTime)
  })

  it('Test evidence uploaders', async function () {
    // Test uploading of evidence by both parties
    const buyerEvidenceURL = 'www.buyerEvidenceURL.com'
    const merchantEvidenceURL = 'www.merchantEvidenceURL.com'
    await chai
      .expect(preorder.connect(account2).buyerEvidence(buyerEvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(preorder.connect(account1).merchantEvidence(merchantEvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(preorder.connect(account1).requestRefund(buyerEvidenceURL))
      .to.be.revertedWith('Only buyer can preorder')
    await preorder.connect(account2).requestRefund(buyerEvidenceURL)
    chai.expect(await preorder.buyerEvidenceURL()).to.equal(buyerEvidenceURL)

    await chai
      .expect(preorder.connect(account2).merchantEvidence(merchantEvidenceURL))
      .to.be.revertedWith('Invalid sender')
    await preorder.connect(account1).merchantEvidence(merchantEvidenceURL)
    chai.expect(await preorder.merchantEvidenceURL()).to.equal(merchantEvidenceURL)

    // Test that URLs can be resubmitted and replaced
    const newBuyerEvidenceURL = 'www.buyerEvidenceURLv2.com'
    const newMerchantEvidenceURL = 'www.merchantEvidenceURLv2.com'
    await preorder.connect(account2).buyerEvidence(newBuyerEvidenceURL)
    chai.expect(await preorder.buyerEvidenceURL()).to.equal(newBuyerEvidenceURL)

    await preorder.connect(account1).merchantEvidence(newMerchantEvidenceURL)
    chai.expect(await preorder.merchantEvidenceURL()).to.equal(newMerchantEvidenceURL)
  })

  it('Test buyer withdrawals', async function () {
    // Set access controls for merchant, buyer, and jurors
    const roleArray = [2, 1, 3, 3, 3]
    const addressArray = [
      account2.address,
      account1.address,
      account3.address,
      account4.address,
      account5.address,
    ]

    const encryptedStringBuyer = createEncryptedString(
      'buyer',
      account2.address,
      encryptionKey,
    )
    const encryptedStringMerchant = createEncryptedString(
      'merchant',
      account1.address,
      encryptionKey,
    )
    const encryptedStringAcc3 = createEncryptedString(
      'juror',
      account3.address,
      encryptionKey,
    )
    const encryptedStringAcc4 = createEncryptedString(
      'juror',
      account4.address,
      encryptionKey,
    )
    const encryptedStringAcc5 = createEncryptedString(
      'juror',
      account5.address,
      encryptionKey,
    )
    const encryptionKeyArray = [
      encryptedStringBuyer,
      encryptedStringMerchant,
      encryptedStringAcc3,
      encryptedStringAcc4,
      encryptedStringAcc5,
    ]
    await jurors.setDisputeAccess(
      disputeAddress,
      roleArray,
      addressArray,
      encryptionKeyArray,
    )

    // Have jurors submit their votes
    let voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(0)

    await sendVote(jurors, account3, disputeAddress, encryptionKey, 1)

    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(1)

    await sendVote(jurors, account4, disputeAddress, encryptionKey, 1)
    await sendVote(jurors, account5, disputeAddress, encryptionKey, 1)

    // Count up votes and fast forward to the end of the voting process
    await jurors.voteStatus(disputeAddress)
    currentTime = await increaseTime(50, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Ensure that vote ends in favor of the buyer
    voteResult = await jurors.getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(2)

    // Ensure that the buyer can withdraw and that the balance is properly updated
    await chai
      .expect(preorder.connect(account1).merchantWithdraw(encryptionKey))
      .to.be.revertedWith('Cannot withdraw')
    await chai
      .expect(preorder.connect(account1).buyerWithdraw(encryptionKey))
      .to.be.revertedWith('Only buyer can withdraw')
    await chai
      .expect(preorder.connect(account2).buyerWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    chai.expect(await token.balanceOf(account2.address)).to.equal(100)
    await preorder.connect(account2).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account2.address)).to.equal(200)

    // Test that subsequent withdrawals will result in nothing
    await preorder.connect(account2).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account2.address)).to.equal(200)
  })

  it('Test merchant withdrawals', async function () {
    // Create new preorder contract
    const disputeID = 126
    const preorderAmount = 100
    const preorder2 = await deployPreorder(
      slmFactory,
      token,
      disputeID,
      account1,
      account2,
      preorderAmount,
    )

    // Setup end time and dispute address
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    const endTime = currentTime + 259200
    disputeAddress = preorder2.address

    // Initialize dispute to allow voting to begin
    const quorum = 2
    await jurors.initializeDispute(disputeAddress, quorum, endTime)

    // Set access controls to buyer, merchant, and jurors
    const roleArray = [2, 1, 3, 3, 3]
    const addressArray = [
      account2.address,
      account1.address,
      account3.address,
      account4.address,
      account5.address,
    ]

    const encryptedStringBuyer = createEncryptedString(
      'buyer',
      account2.address,
      encryptionKey,
    )
    const encryptedStringMerchant = createEncryptedString(
      'merchant',
      account1.address,
      encryptionKey,
    )
    const encryptedStringAcc3 = createEncryptedString(
      'juror',
      account3.address,
      encryptionKey,
    )
    const encryptedStringAcc4 = createEncryptedString(
      'juror',
      account4.address,
      encryptionKey,
    )
    const encryptedStringAcc5 = createEncryptedString(
      'juror',
      account5.address,
      encryptionKey,
    )
    const encryptionKeyArray = [
      encryptedStringBuyer,
      encryptedStringMerchant,
      encryptedStringAcc3,
      encryptedStringAcc4,
      encryptedStringAcc5,
    ]
    await jurors.setDisputeAccess(
      disputeAddress,
      roleArray,
      addressArray,
      encryptionKeyArray,
    )

    // Have juror submit their votes
    let voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(0)

    await sendVote(jurors, account3, disputeAddress, encryptionKey, 1)

    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(1)

    await sendVote(jurors, account4, disputeAddress, encryptionKey, 2)
    await sendVote(jurors, account5, disputeAddress, encryptionKey, 2)

    // Count up votes and fast forward to the end of the voting period
    await jurors.voteStatus(disputeAddress)
    currentTime = await increaseTime(50, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Ensure that project results in favor of the merchant
    voteResult = await jurors.getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    // Check that merchant can withdraw and balance is properly updated
    await chai
      .expect(preorder2.connect(account2).buyerWithdraw(encryptionKey))
      .to.be.revertedWith('Cannot withdraw')
    await chai
      .expect(preorder2.connect(account2).merchantWithdraw(encryptionKey))
      .to.be.revertedWith('Only merchant can withdraw')
    await chai
      .expect(preorder2.connect(account1).merchantWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    chai.expect(await token.balanceOf(account1.address)).to.equal(100)
    await preorder2.connect(account1).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)

    // Test that subsequent withdrawals will result in nothing
    await preorder2.connect(account1).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)
  })
})
