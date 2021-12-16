import { ethers } from 'hardhat'
import chai from 'chai'
import { increaseTime, deployContracts } from './testing'

describe('SLM Staker Manager', function () {
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

    await token.connect(account1).increaseAllowance(manager.address, stakeAmount)
    userId1 = 1
    await manager.connect(account1).stake(userId1, stakeAmount)
    chai.expect(await manager.getStake(account1.address)).to.equal(stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(100)

    // Check that user address to user ID mapping is correct
    const userId = await manager.getUserId(account1.address)
    chai.expect(userId).to.equal(userId1)
    const address = await manager.getUserAddress(userId)
    chai.expect(account1.address).to.equal(address)

    await token.connect(account2).increaseAllowance(manager.address, stakeAmount)
    userId2 = 2
    await manager.connect(account2).stake(userId2, stakeAmount)
    chai.expect(await manager.getStake(account2.address)).to.equal(stakeAmount)
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)

    chai.expect(await token.balanceOf(storage.address)).to.equal(200)

    let stakerPool = await manager.getStakerPool()

    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId1))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool.length).to.equal(2)

    // Test unstaking and retrieval of unstake data & balance changes
    await manager.connect(account1).unstake()
    chai.expect(await manager.getUnstakedAmount(account1.address, 0)).to.equal(100)
    chai.expect(await manager.getUnstakeCount(account1.address)).to.equal(1)

    // Check that the stakerPool array has been adjusted after the unstake
    stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(1)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))

    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp
    let timeFlag = false
    if (
      Math.abs((await manager.getUnstakedTime(account1.address, 0)) - currentTime) <= 10
    ) {
      timeFlag = true
    }
    chai.expect(timeFlag).to.equal(true)
    chai.expect(await manager.getUnstakedSLM(account1.address)).to.equal(100)

    chai.expect(await manager.getStake(account1.address)).to.equal(0)
    chai.expect(await token.balanceOf(account1.address)).to.equal(200)

    chai.expect(await manager.getStake(account2.address)).to.equal(stakeAmount)
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)

    chai.expect(await token.balanceOf(storage.address)).to.equal(100)
  })

  it('Handles rewards', async () => {
    // Add more stakers
    await token.connect(account1).increaseAllowance(manager.address, 100)
    userId1 = 1
    await manager.connect(account1).stake(userId1, 100)

    await token.connect(account2).increaseAllowance(manager.address, 100)
    userId2 = 2
    await manager.connect(account2).stake(userId2, 100)

    // Test reward mechanism with two reward announcements
    const rewardPercent1 = 20
    await manager.announceReward(rewardPercent1)
    const rewardPercent2 = 30
    await manager.announceReward(rewardPercent2)

    const storageBalance = await token.balanceOf(storage.address)
    const totalStaked = await storage.totalStaked()

    // Check that balance changes are correctly reflected - only latest reward will be able to be withdrawn if there are missed rewards
    chai.expect(await manager.getRewardPercentHistory(0)).to.equal(rewardPercent1)
    chai
      .expect(await manager.getRewardAmountHistory(0))
      .to.equal((rewardPercent1 * storageBalance) / 100)

    let account1Balance = await token.balanceOf(account1.address)
    await manager.connect(account1).withdrawRewards()
    const acc1Stake = 100
    const account1Rewards = ethers.BigNumber.from(
      (acc1Stake * rewardPercent2 * storageBalance) / (totalStaked * 100),
    )

    let expectedBalance = account1Balance.add(account1Rewards)
    chai.expect(await token.balanceOf(account1.address)).to.equal(expectedBalance)

    // Check that subsequent withdrawals have to wait until minimum withdrawal wait period is over
    await chai.expect(manager.connect(account1).withdrawRewards()).to.be.revertedWith('Cannot withdraw yet')

    const account2Balance = await token.balanceOf(account2.address)
    await manager.connect(account2).withdrawRewards()
    const acc2Stake = 200
    const account2Rewards = ethers.BigNumber.from(
      (acc2Stake * rewardPercent2 * storageBalance) / (totalStaked * 100),
    )
    expectedBalance = account2Balance.add(account2Rewards)
    chai.expect(await token.balanceOf(account2.address)).to.equal(expectedBalance)

    // Test retrieval of total unstaked SLM for Account 1
    await manager.connect(account1).unstake()
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

    account1Balance = await token.balanceOf(account1.address)
    await manager.connect(account1).withdrawRewards()
    chai.expect(await token.balanceOf(account1.address)).to.equal(account1Balance)
  })

  it('Check updates on staker pool after unstaking', async () => {
    // Add more stakers
    await token.connect(account1).increaseAllowance(manager.address, 100)
    userId1 = 1
    await manager.connect(account1).stake(userId1, 100)

    await token.connect(account3).increaseAllowance(manager.address, 100)
    userId3 = 3
    await manager.connect(account3).stake(userId3, 100)

    await token.connect(account4).increaseAllowance(manager.address, 100)
    userId4 = 4
    await manager.connect(account4).stake(userId4, 100)

    await token.connect(account5).increaseAllowance(manager.address, 100)
    userId5 = 5
    await manager.connect(account5).stake(userId5, 100)

    // Check staker pool ordering
    let stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(5)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId1))
    chai.expect(stakerPool[2]).to.equal(ethers.BigNumber.from(userId3))
    chai.expect(stakerPool[3]).to.equal(ethers.BigNumber.from(userId4))
    chai.expect(stakerPool[4]).to.equal(ethers.BigNumber.from(userId5))

    // Unstake last member of staker pool
    await manager.connect(account5).unstake()

    // Check that the stakerPool array has been adjusted after the unstake
    stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(4)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId1))
    chai.expect(stakerPool[2]).to.equal(ethers.BigNumber.from(userId3))
    chai.expect(stakerPool[3]).to.equal(ethers.BigNumber.from(userId4))

    // Unstake a member in the middle of the staker pool
    await manager.connect(account1).unstake()

    // Check that the stakerPool array has been adjusted after the unstake
    stakerPool = await manager.getStakerPool()
    chai.expect(stakerPool.length).to.equal(3)
    chai.expect(stakerPool[0]).to.equal(ethers.BigNumber.from(userId2))
    chai.expect(stakerPool[1]).to.equal(ethers.BigNumber.from(userId4))
    chai.expect(stakerPool[2]).to.equal(ethers.BigNumber.from(userId3))
  })
})
