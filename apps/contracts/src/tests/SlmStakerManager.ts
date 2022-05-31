import { ethers } from 'hardhat'
import chai from 'chai'
import { solidity } from 'ethereum-waffle'
chai.use(solidity)
import { stake, unstake, increaseTime, deployContracts } from './testing'

describe('SLM Staker Manager', function () {
  // Set global variables
  let jurors, token, storage, manager, slmFactory
  let owner, account1, account2, account3, account4, account5
  let userId1, userId2, userId3, userId4, userId5

  let latestBlock
  let currentTime

  before(async () => {
    ;[owner, account1, account2, account3, account4, account5] = await ethers.getSigners()
    ;[token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Set minimum time (1 day) user has to wait between reward withdrawals
    storage.setMinWithdrawalWaitTime(86400)

    // Allocate tokens to user accounts
    const defaultAmount = 200
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)
    await token.mint(account4.address, defaultAmount)
    await token.mint(account5.address, defaultAmount)
  })

  it('Staking and unstaking', async () => {
    // Have users stake their tokens
    const stakeAmount = 100

    // Check that the stake has been reflected in both the stakeManager and user wallet balances
    userId1 = 1
    await chai
      .expect(stake(token, manager, account1, userId1, 300))
      .to.be.revertedWith('Insufficient balance')

    await stake(token, manager, account1, userId1, stakeAmount)
    chai.expect(await manager.getStake(account1.address)).to.equal(stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(100)

    // Check that user address to user ID mapping is correct
    const userId = await manager.getUserId(account1.address)
    chai.expect(userId).to.equal(userId1)
    const address = await manager.getUserAddress(userId)
    chai.expect(account1.address).to.equal(address)

    // Check that the stake has been reflected in both the stakeManager and user wallet balances
    userId2 = 2
    await stake(token, manager, account2, userId2, stakeAmount)
    chai.expect(await manager.getStake(account2.address)).to.equal(stakeAmount)
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)

    // Check that the stakes have been stored in the stakeStorage contract
    chai.expect(await token.balanceOf(storage.address)).to.equal(200)

    // Check that the stakerPool has been updated
    let stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId1))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool.length).to.equal(2)

    // Test unstaking and retrieval of unstake data & balance changes
    await unstake(manager, account1)

    chai.expect(await manager.getUnstakedAmount(account1.address, 0)).to.equal(100)
    chai.expect(await manager.getUnstakeCount(account1.address)).to.equal(1)

    // Check that the stakerPool array has been adjusted after the unstake
    stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(1)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))

    // Ensure the unstake time has been recorded
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    let timeFlag = false
    if (
      Math.abs((await manager.getUnstakedTime(account1.address, 0)) - currentTime) <= 10
    ) {
      timeFlag = true
    }
    chai.expect(timeFlag).to.equal(true)

    // Check that the unstaked amount is correct
    chai.expect(await manager.getUnstakedSLM(account1.address)).to.equal(100)

    // Check that the user stake has been updated in both the stakerManager and user wallet balances
    chai.expect(await manager.getStake(account1.address)).to.equal(0)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)

    // Ensure that account2's stake remains unchanged
    chai.expect(await manager.getStake(account2.address)).to.equal(stakeAmount)
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)

    // Ensure the stakerStorage contract reflectes the change in stake balance
    chai.expect(await token.balanceOf(storage.address)).to.equal(100)
  })

  it('Handles rewards', async () => {
    // Add more stakes
    const stakeAmount = 100
    userId1 = 1
    await stake(token, manager, account1, userId1, stakeAmount)
    userId2 = 2
    await stake(token, manager, account2, userId2, stakeAmount)

    // Test reward mechanism with two reward announcements
    const rewardPercent1 = 20
    await manager.announceReward(rewardPercent1)
    const rewardPercent2 = 30
    await manager.announceReward(rewardPercent2)

    // Get initial balances for stakerStorage contract and stakes
    const storageBalance = await token.balanceOf(storage.address)
    const totalStaked = await storage.totalStaked()

    // Check that balance changes are correctly reflected - only latest reward will be able to be withdrawn if there are missed rewards
    chai.expect(await manager.getRewardPercentHistory(0)).to.equal(rewardPercent1)
    chai
      .expect(await manager.getRewardAmountHistory(0))
      .to.equal((rewardPercent1 * storageBalance) / 100)

    // Check that balance is updated correctly when reward is withdrawn
    let account1Balance = await token.balanceOf(account1.address)
    await manager.connect(account1).withdrawRewards()
    const acc1Stake = 100
    const account1Rewards = ethers.BigNumber.from(
      (acc1Stake * rewardPercent2 * storageBalance) / (totalStaked * 100),
    )
    let expectedBalance = account1Balance.add(account1Rewards)
    chai.expect(await token.balanceOf(account1.address)).to.equal(expectedBalance)

    // Check that subsequent withdrawals have to wait until minimum withdrawal wait period is over
    await chai
      .expect(manager.connect(account1).withdrawRewards())
      .to.be.revertedWith('Cannot withdraw yet')

    // Check that account 2 balance is reflected properly after withdrawal
    const account2Balance = await token.balanceOf(account2.address)
    await manager.connect(account2).withdrawRewards()
    const acc2Stake = 200
    const account2Rewards = ethers.BigNumber.from(
      (acc2Stake * rewardPercent2 * storageBalance) / (totalStaked * 100),
    )
    expectedBalance = account2Balance.add(account2Rewards)
    chai.expect(await token.balanceOf(account2.address)).to.equal(expectedBalance)

    // Test retrieval of total unstaked SLM for Account 1
    await unstake(manager, account1)
    chai.expect(await manager.getUnstakedAmount(account1.address, 0)).to.equal(100)
    chai.expect(await manager.getUnstakeCount(account1.address)).to.equal(2)

    // Test retrieval of unstake information
    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    let timeFlag = false
    if (
      Math.abs((await manager.getUnstakedTime(account1.address, 0)) - currentTime) <= 10
    ) {
      timeFlag = true
    }
    chai.expect(timeFlag).to.equal(true)
    chai.expect(await manager.getUnstakedSLM(account1.address)).to.equal(200)

    // Check to ensure that withdrawals after the minimum wait period during the same reward interval does not reward extra interest
    currentTime = await increaseTime(1, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Balance should not change for account 1 after withdrawal
    account1Balance = await token.balanceOf(account1.address)
    await manager.connect(account1).withdrawRewards()
    chai.expect(await token.balanceOf(account1.address)).to.equal(account1Balance)
  })

  it('Check updates on staker pool after unstaking', async () => {
    // Add more stakers
    const stakeAmount = 100
    userId1 = 1
    await stake(token, manager, account1, userId1, stakeAmount)

    userId3 = 3
    await stake(token, manager, account3, userId3, stakeAmount)

    userId4 = 4
    await stake(token, manager, account4, userId4, stakeAmount)

    userId5 = 5
    await stake(token, manager, account5, userId5, stakeAmount)

    // Check staker pool ordering
    let stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(5)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId1))
    chai.expect(stakerPool[2]).to.equal(ethers.BigNumber.from(userId3))
    chai.expect(stakerPool[3]).to.equal(ethers.BigNumber.from(userId4))
    chai.expect(stakerPool[4]).to.equal(ethers.BigNumber.from(userId5))

    // Unstake last member of staker pool
    await unstake(manager, account5)

    // Check that the stakerPool array has been adjusted after the unstake
    stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(4)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId1))
    chai.expect(stakerPool[2]).to.equal(ethers.BigNumber.from(userId3))
    chai.expect(stakerPool[3]).to.equal(ethers.BigNumber.from(userId4))

    // Unstake a member in the middle of the staker pool
    await unstake(manager, account1)

    // Check that the stakerPool array has been adjusted after the unstake
    stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(3)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId4))
    chai.expect(stakerPool[2]).to.equal(ethers.BigNumber.from(userId3))
  })
})
