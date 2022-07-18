import { ethers } from 'hardhat'
import chai from 'chai'
import { solidity } from 'ethereum-waffle'

chai.use(solidity)
import {
  increaseTime,
  sendVote,
  stake,
  setAccess,
  deployContracts,
  deployChargeback,
} from './testing'

describe('SLM Chargebacks', function () {
  // Set global variables
  let chargeback, token, manager, storage, jurors, slmFactory
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
    ;[token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Allocate tokens to user accounts
    const defaultAmount = 100
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)
    await token.mint(account4.address, defaultAmount)
    await token.mint(account5.address, defaultAmount)

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

    // Check slmFactory setters
    const discount = 10
    await slmFactory.setDiscount(discount)
    chai.expect(await slmFactory.slmDiscount()).to.equal(discount)

    await slmFactory.setJudgementContract(jurors.address)
    chai.expect(await slmFactory.judge()).to.equal(jurors.address)

    await slmFactory.setTokenContract(token.address)
    chai.expect(await slmFactory.slmToken()).to.equal(token.address)

    // Test that buyer and merchant addresses are correct
    chai.expect(await chargeback.buyer()).to.equal(account2.address)
    chai.expect(await chargeback.merchant()).to.equal(account1.address)

    // Set up end time for vote and dispute address
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    const endTime = currentTime + 259200 // 3 days later
    disputeAddress = chargeback.address
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

    // Check that buyer or merchant evidence cannot be submitted before dispute is initiated
    await chai
      .expect(chargeback.connect(account2).buyerEvidence(buyerEvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')
    await chai
      .expect(chargeback.connect(account1).merchantEvidence(merchantEvidenceURL))
      .to.be.revertedWith('Please first initiate dispute')

    // Check that only buyer can request a chargeback
    await chai
      .expect(chargeback.connect(account1).requestChargeback(buyerEvidenceURL))
      .to.be.revertedWith('Only buyer can chargeback')
    await chargeback.connect(account2).requestChargeback(buyerEvidenceURL)

    // Check that buyer evidence is updated correctly
    chai.expect(await chargeback.buyerEvidenceURL()).to.equal(buyerEvidenceURL)

    // Check that only merchant can submit merchant evidence
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

  it('Test buyer withdrawals', async function () {
    // Set access controls for merchant, buyer, and jurors
    const roleArray = [2, 1, 3, 3, 3]
    const userArray = [account2, account1, account3, account4, account5]
    await setAccess(jurors, disputeAddress, roleArray, userArray, encryptionKey)

    // Have jurors submit their votes
    let voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(0)

    await sendVote(jurors, account3, disputeAddress, encryptionKey, 1)
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
      .expect(chargeback.connect(account1).merchantWithdraw(encryptionKey))
      .to.be.revertedWith('Cannot withdraw')
    await chai
      .expect(chargeback.connect(account1).buyerWithdraw(encryptionKey))
      .to.be.revertedWith('Only buyer can withdraw')
    await chai
      .expect(chargeback.connect(account2).buyerWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    chai.expect(await token.balanceOf(account2.address)).to.equal(100)
    await chargeback.connect(account2).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account2.address)).to.equal(200)

    // Test that subsequent withdrawals will result in nothing
    await chargeback.connect(account2).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account2.address)).to.equal(200)
  })

  it('Test merchant withdrawals', async function () {
    // Create new chargeback contract
    const disputeID = 126
    const chargebackAmount = 100
    const chargeback2 = await deployChargeback(
      slmFactory,
      token,
      disputeID,
      account1,
      account2,
      chargebackAmount,
    )

    // Set up constants
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    const endTime = currentTime + 259200 // 3 days later
    disputeAddress = chargeback2.address

    // Initialize dispute to allow voting to begin
    const quorum = 2
    await jurors.initializeDispute(disputeAddress, quorum, endTime)

    // Set access controls to buyer, merchant, and jurors
    const roleArray = [2, 1, 3, 3, 3]
    const userArray = [account2, account1, account3, account4, account5]
    await setAccess(jurors, disputeAddress, roleArray, userArray, encryptionKey)

    // Have juror submit their votes
    let voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(0)

    await sendVote(jurors, account3, disputeAddress, encryptionKey, 1)
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
      .expect(chargeback2.connect(account2).buyerWithdraw(encryptionKey))
      .to.be.revertedWith('Cannot withdraw')
    await chai
      .expect(chargeback2.connect(account2).merchantWithdraw(encryptionKey))
      .to.be.revertedWith('Only merchant can withdraw')
    await chai
      .expect(chargeback2.connect(account1).merchantWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    chai.expect(await token.balanceOf(account1.address)).to.equal(100)
    await chargeback2.connect(account1).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)

    // Test that subsequent withdrawals will result in nothing
    await chargeback2.connect(account1).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)
  })

  it('Test withdrawals of Ethereum', async function () {
    const disputeID = 127
    const chargebackAmount = ethers.utils.parseEther('100')

    // Create new chargeback contract
    await slmFactory.createChargeback(
      disputeID,
      account1.address,
      account2.address,
      '0x0000000000000000000000000000000000000000',
      { value: chargebackAmount },
    )

    // Get chargeback contract object
    const chargebackAddress = await slmFactory.getChargebackAddress(disputeID)
    const chargeback3 = await ethers.getContractAt('SlmChargeback', chargebackAddress)

    chai
      .expect(await ethers.provider.getBalance(chargeback3.address))
      .to.equal(chargebackAmount)

    // Set up constants
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    const endTime = currentTime + 259200 // 3 days later
    disputeAddress = chargeback3.address

    // Go through voting process and have merchant win the vote
    const quorum = 2
    await jurors.initializeDispute(disputeAddress, quorum, endTime)

    const roleArray = [2, 1, 3, 3, 3]
    const userArray = [account2, account1, account3, account4, account5]
    await setAccess(jurors, disputeAddress, roleArray, userArray, encryptionKey)

    let voteResult = await jurors
      .connect(account1)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(0)

    await sendVote(jurors, account3, disputeAddress, encryptionKey, 1)
    await sendVote(jurors, account4, disputeAddress, encryptionKey, 2)
    await sendVote(jurors, account5, disputeAddress, encryptionKey, 2)

    await jurors.voteStatus(disputeAddress)
    currentTime = await increaseTime(50, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Merchant withdrawal and check balances
    const account1EthBalance = await ethers.provider.getBalance(account1.address)

    const totalBalance = await ethers.provider.getBalance(chargeback3.address)
    const jurorFee = (Number(totalBalance) * 10 * 100) / (100000 * 100 * 100)
    const upKeepFee = (Number(totalBalance) * 10 * 100) / (100000 * 100 * 100)
    const gasFees = 96654000652288 //adjustment made for gas fees
    const transferAmount = Number(chargebackAmount) - jurorFee - upKeepFee - gasFees
    const expectedBalance = Number(account1EthBalance) + transferAmount
    await chargeback3.connect(account1).merchantWithdraw(encryptionKey)

    chai
      .expect(Number(await ethers.provider.getBalance(account1.address)))
      .to.equal(expectedBalance)
  })
})
