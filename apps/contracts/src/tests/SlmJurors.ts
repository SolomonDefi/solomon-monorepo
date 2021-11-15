import { ethers } from 'hardhat'
import chai from 'chai'
import { shouldRevert, increaseTime } from './testing'

describe('SLM Jurors', function () {
  let jurors, token, storage, manager, chargeback, escrow
  let ChargebackFactory, EscrowFactory
  let disputeAddress
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
    '0xb09801392a302964432a10a884f08df4c301b6bd5980df91b107afd2a8cc1eac'

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

    latestBlock = await ethers.provider.getBlock('latest')
    currentTime = latestBlock.timestamp

    const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
    const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
    const TokenFactory = await ethers.getContractFactory('SlmToken')
    const JudgementFactory = await ethers.getContractFactory('SlmJudgement')
    ChargebackFactory = await ethers.getContractFactory('SlmChargeback')
    EscrowFactory = await ethers.getContractFactory('SlmEscrow')

    const initialSupply = ethers.utils.parseEther('100000000')
    token = await TokenFactory.deploy('SLMToken', 'SLM', initialSupply, owner.address)
    await token.deployed()
    await token.unlock()

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

    const unstakePeriod = 1
    const minimumStake = 1
    storage = await StorageFactory.deploy(token.address, unstakePeriod, minimumStake)

    manager = await ManagerFactory.deploy(token.address, storage.address)
    await storage.setStakerManager(manager.address)

    const minJurorCount = 4
    const tieBreakerDuration = 1
    jurors = await JudgementFactory.deploy(
      manager.address,
      minJurorCount,
      tieBreakerDuration,
    )
    await manager.setJudgementContract(jurors.address)

    const discount = 0
    chargeback = await ChargebackFactory.deploy()
    await chargeback.initializeChargeback(
      jurors.address,
      token.address,
      account9.address,
      account8.address,
      discount,
    )

    await token.mint(chargeback.address, defaultAmount)

    escrow = await EscrowFactory.deploy()
    await escrow.initializeEscrow(
      jurors.address,
      token.address,
      account8.address,
      account9.address,
    )

    await token.mint(escrow.address, defaultAmount)

  })

  it('Checks selection and storage of jurors', async function () {
    const defaultAmount = 100
    const stakeAmount = 100
    const endTime = Math.round(new Date().getTime() / 1000) + 259200
    disputeAddress = escrow.address

    await token.connect(account2).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(defaultAmount)
    userId2 = 2
    await manager.connect(account2).stake(userId2, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(0)

    await token.connect(account1).increaseAllowance(manager.address, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(defaultAmount)
    userId1 = 1
    await manager.connect(account1).stake(userId1, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(0)

    await jurors.setStakerPool()
    await shouldRevert(
      jurors.initializeDispute(disputeAddress, 1, endTime),
      'Not enough stakers',
      'Total stakers cannot be less than minimum juror count',
    )

    await token.connect(account3).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    userId3 = 3
    await manager.connect(account3).stake(userId3, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    await token.connect(account4).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account4.address)).to.equal(defaultAmount)
    userId4 = 4
    await manager.connect(account4).stake(userId4, 100)
    chai.expect(await token.balanceOf(account4.address)).to.equal(0)

    await token.connect(account5).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account5.address)).to.equal(defaultAmount)
    userId5 = 5
    await manager.connect(account5).stake(userId5, 100)
    chai.expect(await token.balanceOf(account5.address)).to.equal(0)

    await token.connect(account6).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account6.address)).to.equal(defaultAmount)
    userId6 = 6
    await manager.connect(account6).stake(userId6, 100)
    chai.expect(await token.balanceOf(account6.address)).to.equal(0)

    await token.connect(account7).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account7.address)).to.equal(defaultAmount)
    userId7 = 7
    await manager.connect(account7).stake(userId7, 100)
    chai.expect(await token.balanceOf(account7.address)).to.equal(0)

    await shouldRevert(
      jurors.setMinJurorCount(2),
      'Invalid juror count',
      'Minimum juror count must be greater than 3',
    )

    await jurors.setStakerPool()

    await jurors.setMinJurorCount(7)
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    const jurorList = await jurors.getJurors(disputeAddress)
    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)
    chai.expect(await jurorList[3]).to.equal(userId4)
    chai.expect(await jurorList[4]).to.equal(userId5)
    chai.expect(await jurorList[5]).to.equal(userId6)
    chai.expect(await jurorList[6]).to.equal(userId7)
  })

  it('Checks voting', async function () {

    const roleArray = [2, 1, 3, 3, 3]
    const addressArray = [
      account8.address,
      account9.address,
      account1.address,
      account2.address,
      account7.address,
    ]
    const encryptedStringBuyer = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [account8.address, encryptionKey],
    )
    const encryptedStringMerchant = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [account9.address, encryptionKey],
    )
    const encryptedStringAcc1 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account1.address, encryptionKey, 1],
    )
    const encryptedStringAcc2 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account2.address, encryptionKey, 1],
    )
    const encryptedStringAcc7 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account7.address, encryptionKey, 1],
    )
    const encryptionKeyArray = [
      encryptedStringBuyer,
      encryptedStringMerchant,
      encryptedStringAcc1,
      encryptedStringAcc2,
      encryptedStringAcc7,
    ]
    await jurors.setDisputeAccess(
      disputeAddress,
      roleArray,
      addressArray,
      encryptionKeyArray,
    )

    await jurors.connect(account1).vote(disputeAddress, fakeEncryptionKey, 1)

    await jurors.voteStatus(disputeAddress)

    await shouldRevert(
      jurors.getVoteResults(disputeAddress, encryptionKey),
      'Unauthorized role',
      'Proper encryption key and access needed during voting period',
    )

    await shouldRevert(
      jurors.connect(account1).getVoteResults(disputeAddress, encryptionKey),
      'Unauthorized role',
      'Jurors cannot see status during voting period',
    )

    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    await jurors.connect(account7).vote(disputeAddress, fakeEncryptionKey, 1)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    await jurors.connect(account7).vote(disputeAddress, encryptionKey, 2)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    await jurors.connect(account7).vote(disputeAddress, encryptionKey, 1)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    currentTime = await increaseTime(2, currentTime)
    await ethers.provider.send('evm_mine', [])

    await jurors.connect(account2).vote(disputeAddress, encryptionKey, 1)

    currentTime = await increaseTime(1, currentTime)
    await ethers.provider.send('evm_mine', [])

    await shouldRevert(
      jurors.connect(account3).vote(disputeAddress, encryptionKey, 2),
      'Voting has ended',
      'Voting cannot occur after voting period',
    )

    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)
    chai.expect(voteResult).to.equal(2)

    await escrow.connect(account8).withdrawFunds(encryptionKey)
    chai.expect(await token.balanceOf(account8.address)).to.equal(200)
  })

  it('Checks tie breaker timeout default behavior', async function () {
    disputeAddress = chargeback.address

    const endTime = currentTime + 259200
    await jurors.setMinJurorCount(3)
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    const roleArray = [2, 1, 3, 3, 3]
    const addressArray = [
      account8.address,
      account9.address,
      account1.address,
      account2.address,
      account3.address,
    ]
    const encryptedStringBuyer = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [account8.address, encryptionKey],
    )
    const encryptedStringMerchant = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [account9.address, encryptionKey],
    )
    const encryptedStringAcc1 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account1.address, encryptionKey, 1],
    )
    const encryptedStringAcc2 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account2.address, encryptionKey, 1],
    )
    const encryptedStringAcc3 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account3.address, encryptionKey, 1],
    )
    const encryptionKeyArray = [
      encryptedStringBuyer,
      encryptedStringMerchant,
      encryptedStringAcc1,
      encryptedStringAcc2,
      encryptedStringAcc3,
    ]
    await jurors.setDisputeAccess(
      disputeAddress,
      roleArray,
      addressArray,
      encryptionKeyArray,
    )

    const jurorList = await jurors.getJurors(disputeAddress)
    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)

    await jurors.connect(account1).vote(disputeAddress, encryptionKey, 1)
    await jurors.connect(account2).vote(disputeAddress, encryptionKey, 2)

    currentTime = await increaseTime(4, currentTime)
    await ethers.provider.send('evm_mine', [])
    await jurors.voteStatus(disputeAddress)
    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    // TODO - Check tiebreaker timing issue
    await jurors.setAdminRights(account4.address)
    currentTime = await increaseTime(1, currentTime)
    await ethers.provider.send('evm_mine', [])
    await jurors.connect(account4).tieBreaker(disputeAddress, false)

    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)
    chai.expect(voteResult).to.equal(2)

    await chargeback.connect(account8).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account8.address)).to.equal(300)
  })

  it('Checks normal tiebreaker situations', async function () {
    const chargeback2 = await ChargebackFactory.deploy()
    await chargeback2.initializeChargeback(
      jurors.address,
      token.address,
      account9.address,
      account8.address,
      0,
    )
    disputeAddress = chargeback2.address
    await token.mint(chargeback2.address, 100)

    await jurors.setTieBreakerDuration(10)

    const endTime = currentTime + 259200
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    const roleArray = [2, 1, 3, 3, 3]
    const addressArray = [
      account8.address,
      account9.address,
      account1.address,
      account2.address,
      account3.address,
    ]
    const encryptedStringBuyer = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [account8.address, encryptionKey],
    )
    const encryptedStringMerchant = ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [account9.address, encryptionKey],
    )
    const encryptedStringAcc1 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account1.address, encryptionKey, 1],
    )
    const encryptedStringAcc2 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account2.address, encryptionKey, 1],
    )
    const encryptedStringAcc3 = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account3.address, encryptionKey, 1],
    )
    const encryptionKeyArray = [
      encryptedStringBuyer,
      encryptedStringMerchant,
      encryptedStringAcc1,
      encryptedStringAcc2,
      encryptedStringAcc3,
    ]
    await jurors.setDisputeAccess(
      disputeAddress,
      roleArray,
      addressArray,
      encryptionKeyArray,
    )

    const jurorList = await jurors.getJurors(disputeAddress)
    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)

    await jurors.connect(account1).vote(disputeAddress, encryptionKey, 1)
    await jurors.connect(account2).vote(disputeAddress, encryptionKey, 2)

    currentTime = await increaseTime(3, currentTime)
    await ethers.provider.send('evm_mine', [])

    await jurors.voteStatus(disputeAddress)
    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    await jurors.setAdminRights(account4.address)
    await jurors.connect(account4).tieBreaker(disputeAddress, false)
    currentTime = await increaseTime(12, currentTime)
    await ethers.provider.send('evm_mine', [])

    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)
    chai.expect(voteResult).to.equal(3)

    await chargeback2.connect(account9).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account9.address)).to.equal(200)
  })
})
