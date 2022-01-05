import { ethers } from 'hardhat'
import chai from 'chai'
import { solidity } from 'ethereum-waffle';
chai.use(solidity);
import {
  increaseTime,
  encryptVote,
  sendVote,
  stake,
  setAccess,
  deployContracts,
  deployChargeback,
  deployEscrow,
} from './testing'

describe('SLM Jurors', function () {
  let jurors, token, storage, manager, slmFactory, chargeback, escrow
  let disputeAddress, jurorFeePercent, upkeepFeesPercent, discount
  let ChargebackFactory, EscrowFactory
  let owner,
    account1,
    account2,
    account3,
    account4,
    account5,
    account6,
    account7,
    account8,
    account9
  let userId1, userId2, userId3, userId4, userId5, userId6, userId7

  let latestBlock
  let currentTime
  const encryptionKey =
    '0xa07401392a302964432a10a884f08df4c301b6bd5980df91b107afd2a8cc1eac'
  const fakeEncryptionKey =
    '0xb09801392a302964432a10a884f08df4c301b6bd5980df91b107afd2a8cc1abc'

  before(async () => {
    ;[
      owner,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6,
      account7,
      account8,
      account9,
    ] = await ethers.getSigners()

    // Sets up current time variable
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    jurorFeePercent = 3000
    upkeepFeesPercent = 2000
    discount = 10
    ;[token, manager, storage, jurors, slmFactory] = await deployContracts(
      100000000,
      1,
      1,
      3,
      jurorFeePercent,
      upkeepFeesPercent,
      discount,
    )

    // Allocate tokens to user accounts
    const defaultAmount = 100
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)
    await token.mint(account4.address, defaultAmount)
    await token.mint(account5.address, defaultAmount)
    await token.mint(account6.address, defaultAmount)
    await token.mint(account7.address, defaultAmount)
    await token.mint(account8.address, defaultAmount)
    await token.mint(account9.address, defaultAmount)

    // Deploy chargeback contract
    let disputeID = 125
    const chargebackAmount = 101
    chargeback = await deployChargeback(
      slmFactory,
      token,
      disputeID,
      account9,
      account8,
      chargebackAmount,
    )

    // Deploy escrow contract
    disputeID = 126
    const escrowAmount = 100
    escrow = await deployEscrow(
      slmFactory,
      token,
      disputeID,
      account9,
      account8,
      escrowAmount,
    )
  })

  it('Checks selection and storage of jurors', async function () {
    const defaultAmount = 100
    let stakeAmount = 100
    const endTime = currentTime + 259200
    disputeAddress = escrow.address

    // Have stakers submit their stakes
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)
    userId2 = 132
    await stake(token, manager, account2, userId2, stakeAmount)
    chai.expect(await token.balanceOf(account2.address)).to.equal(0)

    chai.expect(await token.balanceOf(account1.address)).to.equal(100)
    userId1 = 121
    await stake(token, manager, account1, userId1, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(0)

    // Check that dispute cannot be initialized until there are at least 7 stakers
    const quorum = 1
    await jurors.setStakerPool()
    await chai
      .expect(jurors.initializeDispute(disputeAddress, quorum, endTime))
      .to.be.revertedWith('Not enough stakers')

    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    userId3 = 303
    await stake(token, manager, account3, userId3, stakeAmount)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    chai.expect(await token.balanceOf(account4.address)).to.equal(defaultAmount)
    userId4 = 400
    await stake(token, manager, account4, userId4, stakeAmount)
    chai.expect(await token.balanceOf(account4.address)).to.equal(0)

    chai.expect(await token.balanceOf(account5.address)).to.equal(defaultAmount)
    userId5 = 501
    await stake(token, manager, account5, userId5, stakeAmount)
    chai.expect(await token.balanceOf(account5.address)).to.equal(0)

    chai.expect(await token.balanceOf(account6.address)).to.equal(defaultAmount)
    userId6 = 620
    await stake(token, manager, account6, userId6, stakeAmount)
    chai.expect(await token.balanceOf(account6.address)).to.equal(0)

    chai.expect(await token.balanceOf(account7.address)).to.equal(defaultAmount)
    userId7 = 763
    await stake(token, manager, account7, userId7, stakeAmount)
    chai.expect(await token.balanceOf(account7.address)).to.equal(0)

    // Checks that the minimum juror count must be 3
    await chai
      .expect(jurors.setMinJurorCount(2))
      .to.be.revertedWith('Invalid juror count')
    await jurors.setMinJurorCount(3)

    await jurors.setStakerPool()

    await jurors.setMinJurorCount(7)
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    // Check seleted juror list
    chai.expect(await jurors.checkJuror(disputeAddress, account2.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account1.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account3.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account4.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account5.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account6.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account7.address)).to.equal(true)
  })

  it('Checks voting', async function () {
    // Set access controls for merchant, buyer, and jurors
    const roleArray = [2, 1, 3, 3, 3]
    const userArray = [
      account8,
      account9,
      account1,
      account2,
      account7,
    ]
    await setAccess(
      jurors, 
      disputeAddress, 
      roleArray, 
      userArray, 
      encryptionKey,
    )

    // Have jurors submit their votes
    await sendVote(jurors, account1, disputeAddress, fakeEncryptionKey, 1)

    await jurors.voteStatus(disputeAddress)

    // Check that the results of active votes cannot be accessed by anyone except the buyer or merchant
    await chai
      .expect(jurors.getVoteResults(disputeAddress, encryptionKey))
      .to.be.revertedWith('Unauthorized role')
    await chai
      .expect(jurors.connect(account1).getVoteResults(disputeAddress, encryptionKey))
      .to.be.revertedWith('Unauthorized role')

    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    await sendVote(jurors, account7, disputeAddress, fakeEncryptionKey, 1)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    await sendVote(jurors, account7, disputeAddress, encryptionKey, 2)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    await sendVote(jurors, account7, disputeAddress, encryptionKey, 1)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    // Fast forward 2 day and make sure that voting is still open
    currentTime = await increaseTime(2, currentTime)
    await ethers.provider.send('evm_mine', [])

    await sendVote(jurors, account2, disputeAddress, encryptionKey, 1)

    // Ensure that votes cannot be submitted after the voting end date has passed
    currentTime = await increaseTime(1, currentTime)
    await ethers.provider.send('evm_mine', [])

    let encryptedVote = await encryptVote(account3.address, encryptionKey, 2)
    await chai
      .expect(jurors.connect(account3).vote(disputeAddress, encryptedVote))
      .to.be.revertedWith('Voting has ended')

    // Check that anyone can access the results of the vote after voting has ended
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)

    // Check that the result is in favor of the buyer
    chai.expect(voteResult).to.equal(2)

    // Check that running voteStatus cannot be run again after dispute is resolved
    await chai
      .expect(jurors.voteStatus(disputeAddress))
      .to.be.revertedWith('Dispute resolved')

    // Confirm that only parties involved in the escrow dispute can withdraw funds
    await chai
      .expect(escrow.connect(account1).withdrawFunds(encryptionKey))
      .to.be.revertedWith('Only parties can withdraw')

    // Loser of the escrow dispute can call the withdraw function, however funds are transferred to the winner
    const disputeBalance = await token.balanceOf(disputeAddress)
    const account9Balance = await token.balanceOf(account9.address)
    const storageBalance = await token.balanceOf(storage.address)
    const ownerBalance = await token.balanceOf(owner.address)
    chai.expect(account9Balance).to.equal(100)
    chai.expect(await token.balanceOf(account8.address)).to.equal(100)
    await escrow.connect(account9).withdrawFunds(encryptionKey)
    const jurorFees = Math.round((disputeBalance * jurorFeePercent) / 100000)
    const upkeepFees = Math.round((disputeBalance * upkeepFeesPercent) / 100000)
    const transferredAmount = disputeBalance - jurorFees - upkeepFees
    let expectedValue = account9Balance.add(ethers.BigNumber.from(transferredAmount))
    chai.expect(await token.balanceOf(account9.address)).to.equal(expectedValue)

    // Ensure fees were calculated correctly and distributed to the correct parties
    chai.expect(await token.balanceOf(disputeAddress)).to.equal(0)

    expectedValue = (await token.balanceOf(owner.address)).sub(ownerBalance)
    chai.expect(expectedValue).to.equal(upkeepFees)

    expectedValue = storageBalance.add(ethers.BigNumber.from(jurorFees))
    chai.expect(await token.balanceOf(storage.address)).to.equal(expectedValue)

    // The winner can call the withdraw function afterwards, but nothing will happen
    await escrow.connect(account9).withdrawFunds(encryptionKey)
    chai.expect(await token.balanceOf(account9.address)).to.equal(195)
  })

  it('Checks tie behavior', async function () {
    disputeAddress = chargeback.address

    const endTime = currentTime + 259200
    await jurors.setMinJurorCount(3)
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    // Set access controls for merchant, buyer, and jurors
    const roleArray = [2, 1, 3, 3, 3]
    const userArray = [
      account8,
      account9,
      account1,
      account2,
      account3,
    ]
    await setAccess(
      jurors, 
      disputeAddress, 
      roleArray, 
      userArray, 
      encryptionKey,
    )


    // Select jurors from list of stakers
    chai.expect(await jurors.checkJuror(disputeAddress, account2.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account1.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account3.address)).to.equal(true)

    // Have jurors submit their votes
    await sendVote(jurors, account1, disputeAddress, encryptionKey, 1)
    await sendVote(jurors, account2, disputeAddress, encryptionKey, 2)

    // Fast forward to the end of the vote and confirm that the result is a tie
    currentTime = await increaseTime(4, currentTime)
    await ethers.provider.send('evm_mine', [])
    await jurors.voteStatus(disputeAddress)
    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    await chai
      .expect(chargeback.connect(account8).buyerWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    // Buyer withdrawal
    let disputeBalance = await token.balanceOf(disputeAddress)
    const firstHalf = Math.floor(disputeBalance / 2)
    const account8Balance = await token.balanceOf(account8.address)
    let storageBalance = await token.balanceOf(storage.address)
    let ownerBalance = await token.balanceOf(owner.address)
    chai.expect(account8Balance).to.equal(100)
    chai.expect(await token.balanceOf(account9.address)).to.equal(195)

    await chargeback.connect(account8).buyerWithdraw(encryptionKey)

    let jurorFees = Math.floor(
      (firstHalf * jurorFeePercent * (100 - discount)) / (100000 * 100),
    )
    let upkeepFees = Math.floor(
      (firstHalf * upkeepFeesPercent * (100 - discount)) / (100000 * 100),
    )
    let transferredAmount = firstHalf - jurorFees - upkeepFees
    const account8BalanceAfter = account8Balance.add(
      ethers.BigNumber.from(transferredAmount),
    )

    chai.expect(await token.balanceOf(account8.address)).to.equal(account8BalanceAfter)

    // Ensure fees were calculated correctly and distributed to the correct parties
    chai.expect(await token.balanceOf(disputeAddress)).to.equal(51)

    let expectedValue = (await token.balanceOf(owner.address)).sub(ownerBalance)
    chai.expect(expectedValue).to.equal(upkeepFees)

    expectedValue = storageBalance.add(jurorFees)
    chai.expect(await token.balanceOf(storage.address)).to.equal(expectedValue)

    // Test that subsequent withdrawals will not change balance
    await chargeback.connect(account8).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account8.address)).to.equal(account8BalanceAfter)

    await chai
      .expect(chargeback.connect(account9).merchantWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    // Merchant withdrawal
    disputeBalance = await token.balanceOf(disputeAddress)
    const account9Balance = await token.balanceOf(account9.address)
    storageBalance = await token.balanceOf(storage.address)
    ownerBalance = await token.balanceOf(owner.address)
    chai.expect(account9Balance).to.equal(195)
    chai.expect(await token.balanceOf(account8.address)).to.equal(149)

    await chargeback.connect(account9).merchantWithdraw(encryptionKey)

    jurorFees = Math.floor(
      (disputeBalance * jurorFeePercent * (100 - discount)) / (100000 * 100),
    )
    upkeepFees = Math.floor(
      (disputeBalance * upkeepFeesPercent * (100 - discount)) / (100000 * 100),
    )
    transferredAmount = disputeBalance - jurorFees - upkeepFees
    const account9BalanceAfter = account9Balance.add(
      ethers.BigNumber.from(transferredAmount),
    )
    chai.expect(await token.balanceOf(account9.address)).to.equal(account9BalanceAfter)

    // Ensure fees were calculated correctly and distributed to the correct parties
    chai.expect(await token.balanceOf(disputeAddress)).to.equal(0)

    expectedValue = (await token.balanceOf(owner.address)).sub(ownerBalance)
    chai.expect(expectedValue).to.equal(upkeepFees)

    const remainingBalance = disputeBalance
      .sub(ethers.BigNumber.from(transferredAmount))
      .sub(ethers.BigNumber.from(upkeepFees))
    expectedValue = storageBalance.add(remainingBalance)
    chai.expect(await token.balanceOf(storage.address)).to.equal(expectedValue)

    // Test that subsequent withdrawals will not change balance
    await chargeback.connect(account9).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account9.address)).to.equal(account9BalanceAfter)

    // Check outstanding votes and vote history for users
    chai.expect(await manager.getOutstandingVotes(account1.address)).to.equal(0)
    chai
      .expect(await manager.getDisputeVoteCount(account1.address, disputeAddress))
      .to.equal(0)
    chai.expect(await manager.getVoteHistoryCount(account1.address)).to.equal(2)

    chai.expect(await manager.getOutstandingVotes(account3.address)).to.equal(2)
    chai
      .expect(await manager.getDisputeVoteCount(account3.address, disputeAddress))
      .to.equal(1)
    chai.expect(await manager.getVoteHistoryCount(account3.address)).to.equal(0)
  })

  it('Checks handling of voting reset', async function () {
    // Deploy chargeback contract
    let disputeID = 126
    const chargebackAmount = 100
    const chargeback2 = await deployChargeback(
      slmFactory,
      token,
      disputeID,
      account9,
      account8,
      chargebackAmount,
    )

    disputeAddress = chargeback2.address

    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    let endTime = currentTime + 259200
    await jurors.setMinJurorCount(5)
    await jurors.initializeDispute(disputeAddress, 3, endTime)

    // Set access controls for merchant, buyer, and jurors
    const roleArray = [2, 1, 3, 3, 3, 3]
    const userArray = [
      account8,
      account9,
      account1,
      account2,
      account3,
      account4,
    ]
    await setAccess(
      jurors, 
      disputeAddress, 
      roleArray, 
      userArray, 
      encryptionKey,
    )


    // Select jurors from list of stakers
    chai.expect(await jurors.checkJuror(disputeAddress, account2.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account1.address)).to.equal(true)
    chai.expect(await jurors.checkJuror(disputeAddress, account3.address)).to.equal(true)

    // Have jurors submit their votes
    await sendVote(jurors, account1, disputeAddress, encryptionKey, 1)
    await sendVote(jurors, account2, disputeAddress, encryptionKey, 2)

    // Fast forward to the end of the vote and confirm that there are not enough votes
    currentTime = await increaseTime(4, currentTime)
    await ethers.provider.send('evm_mine', [])
    await jurors.voteStatus(disputeAddress)
    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(1)

    let encryptedVote = await encryptVote(account3.address, encryptionKey, 1)
    await chai
      .expect(jurors.connect(account3).vote(disputeAddress, encryptedVote))
      .to.be.revertedWith('Voting has ended')

    // Initialize the dispute again to restart the voting process
    endTime = currentTime + 259200
    await jurors.initializeDispute(disputeAddress, 4, endTime)

    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(1)

    chai.expect(await jurors.inactiveDispute(disputeAddress)).to.equal(false)

    // Have next user fulfill the minimum vote requirement
    encryptedVote = await encryptVote(account3.address, encryptionKey, 1)
    await jurors.connect(account3).vote(disputeAddress, encryptedVote)
    await jurors.connect(account3).vote(disputeAddress, encryptedVote)

    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(1)

    await sendVote(jurors, account4, disputeAddress, encryptionKey, 1)

    // Fast forward to end of vote
    currentTime = await increaseTime(4, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Checks that voteStatus needs to be run again to update dispute status
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(1)

    // Update dispute status
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(2)

    chai.expect(await jurors.inactiveDispute(disputeAddress)).to.equal(true)

    // Buyer withdrawal
    chai.expect(await token.balanceOf(chargeback2.address)).to.equal(100)
    await chargeback2.connect(account8).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(chargeback2.address)).to.equal(0)
  })
})
