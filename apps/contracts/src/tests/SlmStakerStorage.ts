import { ethers } from 'hardhat'
import chai from 'chai'
import { deployContracts, deployChargeback } from './testing'

describe('SLM Staker Storage', function () {
  let jurors, token, storage, manager, slmFactory, chargeback
  let owner, account1, account2, account3, account4, account5
  let userId1

  let latestBlock
  let currentTime

  before(async () => {
    ;[owner, account1, account2, account3, account4, account5] = await ethers.getSigners()

    // Set up current time variable
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp

    ;[token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Allocate tokens to user accounts
    const defaultAmount = 200
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)
    await token.mint(account4.address, defaultAmount)
    await token.mint(account5.address, defaultAmount)

    // Deploy chargeback contract
    const disputeID = 125
    const chargebackAmount = 100
    chargeback = await deployChargeback(slmFactory, token, disputeID, account1, account2, chargebackAmount)
  })

  it('Sets min stake', async () => {
    // Checks set and retrieval of minimum stake variable
    chai.expect(await storage.minStake()).to.equal(1)
    await storage.setMinStake(5)
    chai.expect(await storage.minStake()).to.equal(5)
  })

  it('Sets unstake period', async () => {
    // Checks set and retrieval of unstake period variable
    chai.expect(await storage.unstakePeriod()).to.equal(1)
    await storage.setUnstakePeriod(3)
    chai.expect(await storage.unstakePeriod()).to.equal(3)
  })

  it('Sets and gets userIDs', async () => {
    // Checks setting and retrieval of mapping between user ID and address
    const userId1 = 1
    await storage.setUserId(account1.address, userId1)

    const userId = await storage.getUserId(account1.address)
    chai.expect(userId).to.equal(userId1)

    const address = await storage.getUserAddress(userId)
    chai.expect(account1.address).to.equal(address)
  })

  it('Updates staker pool', async () => {
    // Checks update and retrieval of staker pool
    const newStakerPool = [account1.address, account3.address]
    await storage.updateStakerPool(newStakerPool)

    const retrievedStakerPool = await storage.getStakerPool(manager.address)
    chai.expect(retrievedStakerPool[0]._hex).to.equal(newStakerPool[0].toLowerCase())
    chai.expect(retrievedStakerPool[1]._hex).to.equal(newStakerPool[1].toLowerCase())
  })

  it('Stakes', async () => {
    // Checks staking of tokens
    const stakeAmount = 100

    await token.connect(account1).increaseAllowance(manager.address, stakeAmount)
    userId1 = 1
    await manager.connect(account1).stake(userId1, stakeAmount)
    chai.expect(await storage.getStake(account1.address)).to.equal(stakeAmount)

    // Test increase of stake balance and reflected balance changes
    const increase = 200
    await storage.increaseStakeAmount(account1.address, increase)
    let expectedStake = stakeAmount + increase
    chai.expect(await storage.getStake(account1.address)).to.equal(expectedStake)

    // Test multiple decreases in stake balance and reflected balance changes
    const decrease = 100
    await storage.decreaseStakeAmount(account1.address, decrease)
    expectedStake = expectedStake - decrease
    chai.expect(await storage.getStake(account1.address)).to.equal(expectedStake)
    await storage.decreaseStakeAmount(account1.address, decrease)
    expectedStake = expectedStake - decrease
    chai.expect(await storage.getStake(account1.address)).to.equal(stakeAmount)
  })

  it('Outstanding votes', async () => {
    chai.expect(await storage.getOutstandingVotes(account1.address)).to.equal(0)

    // Checks increases in outstanding vote balance
    const increase = 2
    await storage.increaseOutstandingVotes(account1.address, increase)
    let expectedOutstanding = 0 + increase
    chai
      .expect(await storage.getOutstandingVotes(account1.address))
      .to.equal(expectedOutstanding)

    // Checks decreases in outstanding vote balance
    const decrease = 1
    await storage.decreaseOutstandingVotes(account1.address, decrease)
    expectedOutstanding = expectedOutstanding - decrease
    chai
      .expect(await storage.getOutstandingVotes(account1.address))
      .to.equal(expectedOutstanding)
  })

  it('Dispute vote count', async () => {
    chai
      .expect(await storage.getDisputeVoteCount(account1.address, chargeback.address))
      .to.equal(0)

    // Checks increases in outstanding vote balance by dispute
    const increase = 2
    await storage.increaseDisputeVoteCount(account1.address, chargeback.address, increase)
    let expectedOutstanding = 0 + increase
    chai
      .expect(await storage.getDisputeVoteCount(account1.address, chargeback.address))
      .to.equal(expectedOutstanding)

    // Checks decreases in outstanding vote balance by dispute
    const decrease = 1
    await storage.decreaseDisputeVoteCount(account1.address, chargeback.address, decrease)
    expectedOutstanding = expectedOutstanding - decrease
    chai
      .expect(await storage.getDisputeVoteCount(account1.address, chargeback.address))
      .to.equal(expectedOutstanding)
  })

  it('Vote history', async () => {
    chai.expect(await storage.getVoteHistoryCount(account1.address)).to.equal(0)

    // Checks increases in vote history count
    const increase = 2
    await storage.increaseVoteHistoryCount(account1.address, increase)
    let expectedHistory = 0 + increase
    chai
      .expect(await storage.getVoteHistoryCount(account1.address))
      .to.equal(expectedHistory)

    // Checks decreases in vote history count
    const decrease = 1
    await storage.decreaseVoteHistoryCount(account1.address, decrease)
    expectedHistory = expectedHistory - decrease
    chai
      .expect(await storage.getVoteHistoryCount(account1.address))
      .to.equal(expectedHistory)
  })

  it('Unstaked info', async () => {
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    const unstakeAmount = 100
    const unstakeIndex = 0

    // Add new unstake info entry
    await storage.pushUnstakedInfo(account1.address, unstakeAmount, currentTime)
    chai
      .expect(await storage.getUnstakedAmount(account1.address, unstakeIndex))
      .to.equal(unstakeAmount)
    chai
      .expect(await storage.getUnstakedTime(account1.address, unstakeIndex))
      .to.equal(currentTime)
    chai
      .expect(await storage.getUnstakeCount(account1.address))
      .to.equal(unstakeIndex + 1)

    // Update an existing unstake info entry
    const newUnstakeAmount = 200
    const newTime = 100000000
    await storage.updateUnstakedInfo(account1.address, 0, newUnstakeAmount, newTime)
    chai
      .expect(await storage.getUnstakedAmount(account1.address, unstakeIndex))
      .to.equal(newUnstakeAmount)
    chai
      .expect(await storage.getUnstakedTime(account1.address, unstakeIndex))
      .to.equal(newTime)
    chai
      .expect(await storage.getUnstakeCount(account1.address))
      .to.equal(unstakeIndex + 1)

    // Remove a non-existent unstake entry
    await chai
      .expect(storage.deleteUnstakedInfo(account1.address, 1))
      .to.be.revertedWith(
        'reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)',
      )
    // Remove an exiting unstake entry
    await storage.deleteUnstakedInfo(account1.address, 0)
    chai
      .expect(await storage.getUnstakedAmount(account1.address, unstakeIndex))
      .to.equal(0)
    chai.expect(await storage.getUnstakedTime(account1.address, unstakeIndex)).to.equal(0)
    chai
      .expect(await storage.getUnstakeCount(account1.address))
      .to.equal(unstakeIndex + 1)

    // Check total unstaked SLM balance
    await storage.pushUnstakedInfo(account1.address, unstakeAmount, currentTime)
    await storage.pushUnstakedInfo(account1.address, newUnstakeAmount, currentTime)
    chai
      .expect(await storage.getUnstakedSLM(account1.address))
      .to.equal(unstakeAmount + newUnstakeAmount)
  })

  it('Vote End Time', async () => {
    // Test setting and retrieval of vote end times
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    chai.expect(await storage.getVoteEndTime(chargeback.address)).to.equal(0)

    await storage.setVoteEndTime(chargeback.address, currentTime)
    chai.expect(await storage.getVoteEndTime(chargeback.address)).to.equal(currentTime)
  })

  it('Sending funds', async () => {
    // Test sending of funds from staker storage contract
    chai.expect(await token.balanceOf(chargeback.address)).to.equal(0)
    chai.expect(await token.balanceOf(account1.address)).to.equal(100)

    await token.mint(chargeback.address, 300)
    chai.expect(await token.balanceOf(chargeback.address)).to.equal(300)

    await storage.sendFunds(account1.address, 100)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)
  })

  it('Announces rewards', async () => {
    // Check retrieval of information related to reward announcements
    let rewardPercent = 20
    let rewardAmount = 200 * (rewardPercent / 100)
    let index = 1
    await storage.announceReward(rewardPercent, rewardAmount)

    chai.expect(await storage.getRewardPercentHistory(0)).to.equal(rewardPercent)
    chai.expect(await storage.getRewardPercentHistoryLength()).to.equal(index)

    rewardPercent = 20
    rewardAmount = (200 - rewardAmount) * (rewardPercent / 100)
    index++
    await storage.announceReward(rewardPercent, rewardAmount)

    chai.expect(await storage.getRewardAmountHistory(1)).to.equal(rewardAmount)
    chai.expect(await storage.getRewardAmountHistoryLength()).to.equal(index)
  })

  it('Sets last reward index and withdrawal times', async () => {
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    let index = 2

    // Check latest reward index that user has withdrawn
    await storage.setLastRewardIndex(account1.address, index)
    chai.expect(await storage.getLastRewardIndex(account1.address)).to.equal(index)

    // Checks time of latest time of reward withdrawal
    await storage.setLastWithdrawalTime(account1.address, currentTime)
    chai
      .expect(await storage.getLastWithdrawalTime(account1.address))
      .to.equal(currentTime)
  })
})
