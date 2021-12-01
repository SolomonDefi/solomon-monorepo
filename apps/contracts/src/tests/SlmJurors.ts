import { ethers } from 'hardhat'
import chai from 'chai'
import { increaseTime, deployContracts, deployChargeback, deployEscrow } from './testing'

describe('SLM Jurors', function () {
  let jurors, token, storage, manager, slmFactory, chargeback, escrow
  let disputeAddress
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
    ;[token, manager, storage, jurors, slmFactory] = await deployContracts()

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
    const chargebackAmount = 100
    chargeback = await deployChargeback(
      slmFactory,
      token,
      disputeID,
      account9,
      account8,
      chargebackAmount,
    )
    await token.mint(chargeback.address, defaultAmount)

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
    await token.mint(escrow.address, defaultAmount)
  })

  it('Checks selection and storage of jurors', async function () {
    const defaultAmount = 100
    const stakeAmount = 100
    const endTime = Math.round(new Date().getTime() / 1000) + 259200
    disputeAddress = escrow.address

    // Have stakers submit their stakes
    await token.connect(account2).increaseAllowance(manager.address, stakeAmount)
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)
    userId2 = 2
    await manager.connect(account2).stake(userId2, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(0)

    await token.connect(account1).increaseAllowance(manager.address, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(100)
    userId1 = 1
    await manager.connect(account1).stake(userId1, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(0)

    // Check that dispute cannot be initialized until there are at least 7 stakers
    const quorum = 1
    await jurors.setStakerPool()
    await chai
      .expect(jurors.initializeDispute(disputeAddress, quorum, endTime))
      .to.be.revertedWith('Not enough stakers')

    await token.connect(account3).increaseAllowance(manager.address, 200)
    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    userId3 = 3
    await manager.connect(account3).stake(userId3, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    await token.connect(account4).increaseAllowance(manager.address, 200)
    chai.expect(await token.balanceOf(account4.address)).to.equal(defaultAmount)
    userId4 = 4
    await manager.connect(account4).stake(userId4, 100)
    chai.expect(await token.balanceOf(account4.address)).to.equal(0)

    await token.connect(account5).increaseAllowance(manager.address, 200)
    chai.expect(await token.balanceOf(account5.address)).to.equal(defaultAmount)
    userId5 = 5
    await manager.connect(account5).stake(userId5, 100)
    chai.expect(await token.balanceOf(account5.address)).to.equal(0)

    await token.connect(account6).increaseAllowance(manager.address, 200)
    chai.expect(await token.balanceOf(account6.address)).to.equal(defaultAmount)
    userId6 = 6
    await manager.connect(account6).stake(userId6, 100)
    chai.expect(await token.balanceOf(account6.address)).to.equal(0)

    await token.connect(account7).increaseAllowance(manager.address, 200)
    chai.expect(await token.balanceOf(account7.address)).to.equal(defaultAmount)
    userId7 = 7
    await manager.connect(account7).stake(userId7, 100)
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
    // Set access controls for merchant, buyer, and jurors
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

    // Have jurors submit their votes
    let encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account1.address, fakeEncryptionKey, 1],
    )
    await jurors.connect(account1).vote(disputeAddress, encryptedVote)

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

    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account7.address, fakeEncryptionKey, 1],
    )
    await jurors.connect(account7).vote(disputeAddress, encryptedVote)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account7.address, encryptionKey, 2],
    )
    await jurors.connect(account7).vote(disputeAddress, encryptedVote)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(3)

    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account7.address, encryptionKey, 1],
    )
    await jurors.connect(account7).vote(disputeAddress, encryptedVote)
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    // Fast forward 2 day and make sure that voting is still open
    currentTime = await increaseTime(2, currentTime)
    await ethers.provider.send('evm_mine', [])

    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account2.address, encryptionKey, 1],
    )
    await jurors.connect(account2).vote(disputeAddress, encryptedVote)

    // Ensure that votes cannot be submitted after the voting end date has passed
    currentTime = await increaseTime(1, currentTime)
    await ethers.provider.send('evm_mine', [])

    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account3.address, encryptionKey, 2],
    )
    await chai
      .expect(jurors.connect(account3).vote(disputeAddress, encryptedVote))
      .to.be.revertedWith('Voting has ended')

    // Check that anyone can access the results of the vote after voting has ended
    await jurors.voteStatus(disputeAddress)
    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)

    // Check that the result is in favor of the buyer
    chai.expect(voteResult).to.equal(2)

    // Confirm that only parties involved in the escrow dispute can withdraw funds
    await chai
      .expect(escrow.connect(account1).withdrawFunds(encryptionKey))
      .to.be.revertedWith('Only parties can withdraw')

    // Loser of the escrow dispute can call the withdraw function, however funds are transferred to the winner
    chai.expect(await token.balanceOf(account9.address)).to.equal(200)
    chai.expect(await token.balanceOf(account8.address)).to.equal(200)
    await escrow.connect(account9).withdrawFunds(encryptionKey)
    chai.expect(await token.balanceOf(account9.address)).to.equal(300)

    // The winner can call the withdraw function afterwards, but nothing will happen
    chai.expect(await token.balanceOf(account8.address)).to.equal(200)
    await escrow.connect(account8).withdrawFunds(encryptionKey)
    chai.expect(await token.balanceOf(account8.address)).to.equal(200)
  })

  it('Checks tie breaker timeout default behavior', async function () {
    disputeAddress = chargeback.address

    const endTime = currentTime + 259200
    await jurors.setMinJurorCount(3)
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    // Set access controls for merchant, buyer, and jurors
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

    // Select jurors from list of stakers
    const jurorList = await jurors.getJurors(disputeAddress)
    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)

    // Have jurors submit their votes
    let encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account1.address, encryptionKey, 1],
    )
    await jurors.connect(account1).vote(disputeAddress, encryptedVote)
    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account2.address, encryptionKey, 2],
    )
    await jurors.connect(account2).vote(disputeAddress, encryptedVote)

    // Fast forward to the end of the vote and confirm that the result is a tie
    currentTime = await increaseTime(4, currentTime)
    await ethers.provider.send('evm_mine', [])
    await jurors.voteStatus(disputeAddress)
    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    // Fast forward to the end of the tie breaker process and ensure that the result is in favor of the buyer no matter what tie breaker vote was made after
    await jurors.setAdminRights(account4.address)
    currentTime = await increaseTime(1, currentTime)
    await ethers.provider.send('evm_mine', [])
    await jurors.connect(account4).tieBreaker(disputeAddress, false)

    // Check that the vote result is in favor of the buyer
    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)
    chai.expect(voteResult).to.equal(2)

    // Check that only the buyer can withdraw and that balance changes are properly reflected
    await chai
      .expect(chargeback.connect(account9).merchantWithdraw(encryptionKey))
      .to.be.revertedWith('Cannot withdraw')
    await chai
      .expect(chargeback.connect(account9).buyerWithdraw(encryptionKey))
      .to.be.revertedWith('Only buyer can withdraw')
    await chai
      .expect(chargeback.connect(account8).buyerWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')

    chai.expect(await token.balanceOf(account8.address)).to.equal(200)
    await chargeback.connect(account8).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account8.address)).to.equal(300)

    // Test that subsequent withdrawals will result in nothing
    await chargeback.connect(account8).buyerWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account8.address)).to.equal(300)
  })

  it('Checks normal tiebreaker situations', async function () {
    // Deploy a new chargeback contract
    let disputeID = 127
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
    await token.mint(chargeback2.address, 100)

    // Set a new tiebreaker duration
    await jurors.setTieBreakerDuration(10)

    // Initialize dispute parameters
    const endTime = currentTime + 259200
    await jurors.initializeDispute(disputeAddress, 1, endTime)

    // Set up access controls for merchant, buyer, and jurors
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

    // Have jurors submit their votes
    let encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account1.address, encryptionKey, 1],
    )
    await jurors.connect(account1).vote(disputeAddress, encryptedVote)
    encryptedVote = ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [account2.address, encryptionKey, 2],
    )
    await jurors.connect(account2).vote(disputeAddress, encryptedVote)

    // Fast forward to the end of the voting process
    currentTime = await increaseTime(3, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Ensure that the result was a tie
    await jurors.voteStatus(disputeAddress)
    let voteResult = await jurors
      .connect(account8)
      .getVoteResults(disputeAddress, encryptionKey)
    chai.expect(voteResult).to.equal(4)

    // Have an admin break the tie and fast forward to the end of the tie breaker process
    await jurors.setAdminRights(account4.address)
    await jurors.connect(account4).tieBreaker(disputeAddress, false)
    currentTime = await increaseTime(12, currentTime)
    await ethers.provider.send('evm_mine', [])

    // Ensure that the vote result was in favor of the merchant
    voteResult = await jurors.getVoteResults(disputeAddress, fakeEncryptionKey)
    chai.expect(voteResult).to.equal(3)

    // Ensure that only the merchant can withdraw and that balance changes are properly reflected
    await chai
      .expect(chargeback2.connect(account8).buyerWithdraw(encryptionKey))
      .to.be.revertedWith('Cannot withdraw')
    await chai
      .expect(chargeback2.connect(account8).merchantWithdraw(encryptionKey))
      .to.be.revertedWith('Only merchant can withdraw')
    await chai
      .expect(chargeback2.connect(account9).merchantWithdraw(fakeEncryptionKey))
      .to.be.revertedWith('Unauthorized access')
    chai.expect(await token.balanceOf(account9.address)).to.equal(300)
    await chargeback2.connect(account9).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account9.address)).to.equal(400)

    // Test that subsequent withdrawals will result in nothing
    await chargeback2.connect(account9).merchantWithdraw(encryptionKey)
    chai.expect(await token.balanceOf(account9.address)).to.equal(400)

    // Check outstanding votes and vote history for users
    chai.expect(await manager.getOutstandingVotes(account1.address)).to.equal(0)
    chai
      .expect(await manager.getDisputeVoteCount(account1.address, disputeAddress))
      .to.equal(0)
    chai.expect(await manager.getVoteHistoryCount(account1.address)).to.equal(3)

    chai.expect(await manager.getOutstandingVotes(account3.address)).to.equal(3)
    chai
      .expect(await manager.getDisputeVoteCount(account3.address, disputeAddress))
      .to.equal(1)
    chai.expect(await manager.getVoteHistoryCount(account3.address)).to.equal(0)
  })
})
