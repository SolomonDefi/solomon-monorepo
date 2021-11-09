/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, BigNumberish, Contract, ContractFactory, Overrides } from 'ethers'
import { Provider, TransactionRequest } from '@ethersproject/providers'
import type { SlmToken, SlmTokenInterface } from '../SlmToken'

const _abi = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'initialSupply',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'canTrade',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lockExceptions',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'locked',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'tradeAllowed',
        type: 'bool',
      },
    ],
    name: 'setTradeException',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unlock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const _bytecode =
  '0x60806040526001600660016101000a81548160ff0219169083151502179055503480156200002c57600080fd5b5060405162002986380380620029868339818101604052810190620000529190620005e3565b8383336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160049080519060200190620000ac929190620002f6565b508060059080519060200190620000c5929190620002f6565b506012600660006101000a81548160ff021916908360ff16021790555050506001600760003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506200014e81836200015860201b60201c565b5050505062000835565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620001cb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620001c290620006f4565b60405180910390fd5b620001df60008383620002f160201b60201c565b80600354620001ef919062000745565b60038190555080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205462000242919062000745565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620002e59190620007b3565b60405180910390a35050565b505050565b8280546200030490620007ff565b90600052602060002090601f01602090048101928262000328576000855562000374565b82601f106200034357805160ff191683800117855562000374565b8280016001018555821562000374579182015b828111156200037357825182559160200191906001019062000356565b5b50905062000383919062000387565b5090565b5b80821115620003a257600081600090555060010162000388565b5090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200040f82620003c4565b810181811067ffffffffffffffff82111715620004315762000430620003d5565b5b80604052505050565b600062000446620003a6565b905062000454828262000404565b919050565b600067ffffffffffffffff821115620004775762000476620003d5565b5b6200048282620003c4565b9050602081019050919050565b60005b83811015620004af57808201518184015260208101905062000492565b83811115620004bf576000848401525b50505050565b6000620004dc620004d68462000459565b6200043a565b905082815260208101848484011115620004fb57620004fa620003bf565b5b620005088482856200048f565b509392505050565b600082601f830112620005285762000527620003ba565b5b81516200053a848260208601620004c5565b91505092915050565b6000819050919050565b620005588162000543565b81146200056457600080fd5b50565b60008151905062000578816200054d565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620005ab826200057e565b9050919050565b620005bd816200059e565b8114620005c957600080fd5b50565b600081519050620005dd81620005b2565b92915050565b600080600080608085870312156200060057620005ff620003b0565b5b600085015167ffffffffffffffff811115620006215762000620620003b5565b5b6200062f8782880162000510565b945050602085015167ffffffffffffffff811115620006535762000652620003b5565b5b620006618782880162000510565b9350506040620006748782880162000567565b92505060606200068787828801620005cc565b91505092959194509250565b600082825260208201905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b6000620006dc601f8362000693565b9150620006e982620006a4565b602082019050919050565b600060208201905081810360008301526200070f81620006cd565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000620007528262000543565b91506200075f8362000543565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111562000797576200079662000716565b5b828201905092915050565b620007ad8162000543565b82525050565b6000602082019050620007ca6000830184620007a2565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200081857607f821691505b602082108114156200082f576200082e620007d0565b5b50919050565b61214180620008456000396000f3fe608060405234801561001057600080fd5b50600436106101375760003560e01c806370a08231116100b8578063a9059cbb1161007c578063a9059cbb14610362578063bccb440814610392578063cf309012146103ae578063dd62ed3e146103cc578063f2fde38b146103fc578063f83d08ba1461041857610137565b806370a08231146102be57806379cc6790146102ee57806395d89b411461030a578063a457c2d714610328578063a69df4b51461035857610137565b8063313ce567116100ff578063313ce56714610208578063395093511461022657806340c10f191461025657806342966c6814610272578063559f05dc1461028e57610137565b806306fdde031461013c578063095ea7b31461015a57806318160ddd1461018a5780631f11b177146101a857806323b872dd146101d8575b600080fd5b610144610422565b60405161015191906117ea565b60405180910390f35b610174600480360381019061016f91906118a5565b6104b4565b6040516101819190611900565b60405180910390f35b610192610510565b60405161019f919061192a565b60405180910390f35b6101c260048036038101906101bd9190611945565b61051a565b6040516101cf9190611900565b60405180910390f35b6101f260048036038101906101ed9190611972565b61053a565b6040516101ff9190611900565b60405180910390f35b610210610598565b60405161021d91906119e1565b60405180910390f35b610240600480360381019061023b91906118a5565b6105af565b60405161024d9190611900565b60405180910390f35b610270600480360381019061026b91906118a5565b61060b565b005b61028c600480360381019061028791906119fc565b6106a7565b005b6102a860048036038101906102a39190611945565b6106b4565b6040516102b59190611900565b60405180910390f35b6102d860048036038101906102d39190611945565b610722565b6040516102e5919061192a565b60405180910390f35b610308600480360381019061030391906118a5565b61076b565b005b61031261079e565b60405161031f91906117ea565b60405180910390f35b610342600480360381019061033d91906118a5565b610830565b60405161034f9190611900565b60405180910390f35b61036061088c565b005b61037c600480360381019061037791906118a5565b610937565b6040516103899190611900565b60405180910390f35b6103ac60048036038101906103a79190611a55565b610993565b005b6103b6610aec565b6040516103c39190611900565b60405180910390f35b6103e660048036038101906103e19190611a95565b610aff565b6040516103f3919061192a565b60405180910390f35b61041660048036038101906104119190611945565b610b86565b005b610420610d41565b005b60606004805461043190611b04565b80601f016020809104026020016040519081016040528092919081815260200182805461045d90611b04565b80156104aa5780601f1061047f576101008083540402835291602001916104aa565b820191906000526020600020905b81548152906001019060200180831161048d57829003601f168201915b5050505050905090565b60006104bf336106b4565b6104fe576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104f590611b82565b60405180910390fd5b6105088383610dec565b905092915050565b6000600354905090565b60076020528060005260406000206000915054906101000a900460ff1681565b6000610545336106b4565b610584576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057b90611b82565b60405180910390fd5b61058f848484610e03565b90509392505050565b6000600660009054906101000a900460ff16905090565b60006105ba336106b4565b6105f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f090611b82565b60405180910390fd5b6106038383610ead565b905092915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610699576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161069090611bee565b60405180910390fd5b6106a38282610f4b565b5050565b6106b133826110d3565b50565b6000600660019054906101000a900460ff16158061071b5750600760008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b9050919050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6000816107788433610aff565b6107829190611c3d565b905061078f83338361125b565b61079983836110d3565b505050565b6060600580546107ad90611b04565b80601f01602080910402602001604051908101604052809291908181526020018280546107d990611b04565b80156108265780601f106107fb57610100808354040283529160200191610826565b820191906000526020600020905b81548152906001019060200180831161080957829003601f168201915b5050505050905090565b600061083b336106b4565b61087a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161087190611b82565b60405180910390fd5b6108848383611426565b905092915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461091a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161091190611bee565b60405180910390fd5b6000600660016101000a81548160ff021916908315150217905550565b6000610942336106b4565b610981576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161097890611b82565b60405180910390fd5b61098b83836114c4565b905092915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610a21576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a1890611bee565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610a91576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a8890611cbd565b60405180910390fd5b80600760008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600660019054906101000a900460ff1681565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610c14576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c0b90611bee565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610c84576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7b90611d4f565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610dcf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dc690611bee565b60405180910390fd5b6001600660016101000a81548160ff021916908315150217905550565b6000610df933848461125b565b6001905092915050565b6000610e108484846114db565b610ea2843384600260008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610e9d9190611c3d565b61125b565b600190509392505050565b6000610f41338484600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610f3c9190611d6f565b61125b565b6001905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610fbb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fb290611e11565b60405180910390fd5b610fc76000838361174c565b80600354610fd59190611d6f565b60038190555080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546110269190611d6f565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516110c7919061192a565b60405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611143576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161113a90611ea3565b60405180910390fd5b61114f8260008361174c565b80600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461119a9190611c3d565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550806003546111eb9190611c3d565b600381905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161124f919061192a565b60405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156112cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112c290611f35565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561133b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161133290611fc7565b60405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92583604051611419919061192a565b60405180910390a3505050565b60006114ba338484600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546114b59190611c3d565b61125b565b6001905092915050565b60006114d13384846114db565b6001905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561154b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161154290612059565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156115bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115b2906120eb565b60405180910390fd5b6115c683838361174c565b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116119190611c3d565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461169f9190611d6f565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161173f919061192a565b60405180910390a3505050565b505050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561178b578082015181840152602081019050611770565b8381111561179a576000848401525b50505050565b6000601f19601f8301169050919050565b60006117bc82611751565b6117c6818561175c565b93506117d681856020860161176d565b6117df816117a0565b840191505092915050565b6000602082019050818103600083015261180481846117b1565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061183c82611811565b9050919050565b61184c81611831565b811461185757600080fd5b50565b60008135905061186981611843565b92915050565b6000819050919050565b6118828161186f565b811461188d57600080fd5b50565b60008135905061189f81611879565b92915050565b600080604083850312156118bc576118bb61180c565b5b60006118ca8582860161185a565b92505060206118db85828601611890565b9150509250929050565b60008115159050919050565b6118fa816118e5565b82525050565b600060208201905061191560008301846118f1565b92915050565b6119248161186f565b82525050565b600060208201905061193f600083018461191b565b92915050565b60006020828403121561195b5761195a61180c565b5b60006119698482850161185a565b91505092915050565b60008060006060848603121561198b5761198a61180c565b5b60006119998682870161185a565b93505060206119aa8682870161185a565b92505060406119bb86828701611890565b9150509250925092565b600060ff82169050919050565b6119db816119c5565b82525050565b60006020820190506119f660008301846119d2565b92915050565b600060208284031215611a1257611a1161180c565b5b6000611a2084828501611890565b91505092915050565b611a32816118e5565b8114611a3d57600080fd5b50565b600081359050611a4f81611a29565b92915050565b60008060408385031215611a6c57611a6b61180c565b5b6000611a7a8582860161185a565b9250506020611a8b85828601611a40565b9150509250929050565b60008060408385031215611aac57611aab61180c565b5b6000611aba8582860161185a565b9250506020611acb8582860161185a565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680611b1c57607f821691505b60208210811415611b3057611b2f611ad5565b5b50919050565b7f4c6f636b61626c65546f6b656e3a204c6f636b65640000000000000000000000600082015250565b6000611b6c60158361175c565b9150611b7782611b36565b602082019050919050565b60006020820190508181036000830152611b9b81611b5f565b9050919050565b7f4f6e6c79206f776e657220697320616c6c6f77656420746f2063616c6c000000600082015250565b6000611bd8601d8361175c565b9150611be382611ba2565b602082019050919050565b60006020820190508181036000830152611c0781611bcb565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611c488261186f565b9150611c538361186f565b925082821015611c6657611c65611c0e565b5b828203905092915050565b7f4c6f636b61626c65546f6b656e3a20496e76616c696420616464726573730000600082015250565b6000611ca7601e8361175c565b9150611cb282611c71565b602082019050919050565b60006020820190508181036000830152611cd681611c9a565b9050919050565b7f446f6e27742061737369676e206f776e65727368697020746f206e756c6c206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000611d3960268361175c565b9150611d4482611cdd565b604082019050919050565b60006020820190508181036000830152611d6881611d2c565b9050919050565b6000611d7a8261186f565b9150611d858361186f565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611dba57611db9611c0e565b5b828201905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b6000611dfb601f8361175c565b9150611e0682611dc5565b602082019050919050565b60006020820190508181036000830152611e2a81611dee565b9050919050565b7f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360008201527f7300000000000000000000000000000000000000000000000000000000000000602082015250565b6000611e8d60218361175c565b9150611e9882611e31565b604082019050919050565b60006020820190508181036000830152611ebc81611e80565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b6000611f1f60248361175c565b9150611f2a82611ec3565b604082019050919050565b60006020820190508181036000830152611f4e81611f12565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b6000611fb160228361175c565b9150611fbc82611f55565b604082019050919050565b60006020820190508181036000830152611fe081611fa4565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b600061204360258361175c565b915061204e82611fe7565b604082019050919050565b6000602082019050818103600083015261207281612036565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b60006120d560238361175c565b91506120e082612079565b604082019050919050565b60006020820190508181036000830152612104816120c8565b905091905056fea2646970667358221220c7cf8520a4c3046ebcb41426b1ffc284c2742f8ff4aa5e1b678c0741160df72e64736f6c63430008090033'

export class SlmToken__factory extends ContractFactory {
  constructor(...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0])
    } else {
      super(...args)
    }
  }

  deploy(
    name: string,
    symbol: string,
    initialSupply: BigNumberish,
    owner: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<SlmToken> {
    return super.deploy(
      name,
      symbol,
      initialSupply,
      owner,
      overrides || {},
    ) as Promise<SlmToken>
  }
  getDeployTransaction(
    name: string,
    symbol: string,
    initialSupply: BigNumberish,
    owner: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(name, symbol, initialSupply, owner, overrides || {})
  }
  attach(address: string): SlmToken {
    return super.attach(address) as SlmToken
  }
  connect(signer: Signer): SlmToken__factory {
    return super.connect(signer) as SlmToken__factory
  }
  static readonly bytecode = _bytecode
  static readonly abi = _abi
  static createInterface(): SlmTokenInterface {
    return new utils.Interface(_abi) as SlmTokenInterface
  }
  static connect(address: string, signerOrProvider: Signer | Provider): SlmToken {
    return new Contract(address, _abi, signerOrProvider) as SlmToken
  }
}