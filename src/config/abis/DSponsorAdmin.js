const abi = [
  {
    inputs: [
      { internalType: "contract IDSponsorNFTFactory", name: "_nftFactory", type: "address" },
      { internalType: "address", name: "forwarder", type: "address" },
      { internalType: "address", name: "initialOwner", type: "address" },
      { internalType: "contract UniV3SwapRouter", name: "_swapRouter", type: "address" },
      { internalType: "address payable", name: "_recipient", type: "address" },
      { internalType: "uint96", name: "_bps", type: "uint96" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AddressInsufficientBalance",
    type: "error"
  },
  { inputs: [], name: "CannotRemoveSelfAsAdmin", type: "error" },
  { inputs: [], name: "CannotSendValueFromSender", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "offerId", type: "uint256" }],
    name: "DisabledOffer",
    type: "error"
  },
  {
    inputs: [{ internalType: "string", name: "key", type: "string" }],
    name: "EmptyString",
    type: "error"
  },
  { inputs: [], name: "ExternalCallError", type: "error" },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "InsufficientAllowance", type: "error" },
  { inputs: [], name: "InsufficientFunds", type: "error" },
  { inputs: [], name: "InvalidAdData", type: "error" },
  { inputs: [], name: "InvalidArrayLength", type: "error" },
  { inputs: [], name: "InvalidBps", type: "error" },
  { inputs: [], name: "MathOverflowedMulDiv", type: "error" },
  { inputs: [], name: "NoAdDataSubmitted", type: "error" },
  { inputs: [], name: "NoAdParametersProvided", type: "error" },
  { inputs: [], name: "NoAdminsProvided", type: "error" },
  { inputs: [], name: "OfferDoesNotExist", type: "error" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "adParameter", type: "string" },
      { internalType: "uint256", name: "proposalId", type: "uint256" }
    ],
    name: "ProposalNotSubmittedBySponsor",
    type: "error"
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "string", name: "adParameter", type: "string" }
    ],
    name: "UnallowedAdParameter",
    type: "error"
  },
  {
    inputs: [
      { internalType: "address", name: "msgSender", type: "address" },
      { internalType: "uint256", name: "offerId", type: "uint256" }
    ],
    name: "UnallowedAdminOperation",
    type: "error"
  },
  {
    inputs: [
      { internalType: "address", name: "msgSender", type: "address" },
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "UnallowedSponsorOperation",
    type: "error"
  },
  {
    inputs: [
      { internalType: "address", name: "msgSender", type: "address" },
      { internalType: "uint256", name: "offerId", type: "uint256" }
    ],
    name: "UnallowedValidatorOperation",
    type: "error"
  },
  { inputs: [], name: "ZeroAddress", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "origin", type: "address" },
      { indexed: true, internalType: "address", name: "currency", type: "address" },
      { indexed: false, internalType: "uint256", name: "feeAmount", type: "uint256" },
      { indexed: false, internalType: "address", name: "enabler", type: "address" },
      { indexed: false, internalType: "address", name: "spender", type: "address" },
      {
        indexed: false,
        internalType: "string",
        name: "additionalInformation",
        type: "string"
      }
    ],
    name: "CallWithProtocolFee",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint96", name: "bps", type: "uint96" }
    ],
    name: "FeeUpdate",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "proposalId", type: "uint256" },
      { indexed: false, internalType: "string", name: "adParameter", type: "string" },
      { indexed: false, internalType: "string", name: "data", type: "string" }
    ],
    name: "UpdateAdProposal",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "proposalId", type: "uint256" },
      { indexed: false, internalType: "string", name: "adParameter", type: "string" },
      { indexed: false, internalType: "bool", name: "validated", type: "bool" },
      { indexed: false, internalType: "string", name: "reason", type: "string" }
    ],
    name: "UpdateAdValidation",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "bool", name: "disable", type: "bool" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "offerMetadata", type: "string" },
      {
        indexed: true,
        internalType: "contract IERC721",
        name: "nftContract",
        type: "address"
      },
      { indexed: false, internalType: "address", name: "msgSender", type: "address" }
    ],
    name: "UpdateOffer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "bytes32", name: "adParameterHash", type: "bytes32" },
      { indexed: true, internalType: "bool", name: "enable", type: "bool" },
      { indexed: false, internalType: "string", name: "adParameter", type: "string" }
    ],
    name: "UpdateOfferAdParameter",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "address", name: "admin", type: "address" },
      { indexed: true, internalType: "bool", name: "enable", type: "bool" }
    ],
    name: "UpdateOfferAdmin",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "offerId", type: "uint256" },
      { indexed: true, internalType: "address", name: "validator", type: "address" },
      { indexed: true, internalType: "bool", name: "enable", type: "bool" }
    ],
    name: "UpdateOfferValidator",
    type: "event"
  },
  {
    inputs: [],
    name: "MAX_BPS",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "string", name: "baseURI", type: "string" },
          { internalType: "string", name: "contractURI", type: "string" },
          { internalType: "address", name: "minter", type: "address" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
          { internalType: "address", name: "forwarder", type: "address" },
          { internalType: "address", name: "initialOwner", type: "address" },
          { internalType: "uint96", name: "royaltyBps", type: "uint96" },
          { internalType: "address[]", name: "currencies", type: "address[]" },
          { internalType: "uint256[]", name: "prices", type: "uint256[]" },
          { internalType: "uint256[]", name: "allowedTokenIds", type: "uint256[]" }
        ],
        internalType: "struct IDSponsorNFTBase.InitParams",
        name: "nftParams",
        type: "tuple"
      },
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "offerMetadata", type: "string" },
          {
            components: [
              { internalType: "address[]", name: "admins", type: "address[]" },
              { internalType: "address[]", name: "validators", type: "address[]" },
              { internalType: "string[]", name: "adParameters", type: "string[]" }
            ],
            internalType: "struct IDSponsorAgreements.OfferOptions",
            name: "options",
            type: "tuple"
          }
        ],
        internalType: "struct IDSponsorAgreements.OfferInitParams",
        name: "offerParams",
        type: "tuple"
      }
    ],
    name: "createDSponsorNFTAndOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "contract IERC721", name: "nftContract", type: "address" },
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "offerMetadata", type: "string" },
          {
            components: [
              { internalType: "address[]", name: "admins", type: "address[]" },
              { internalType: "address[]", name: "validators", type: "address[]" },
              { internalType: "string[]", name: "adParameters", type: "string[]" }
            ],
            internalType: "struct IDSponsorAgreements.OfferOptions",
            name: "options",
            type: "tuple"
          }
        ],
        internalType: "struct IDSponsorAgreements.OfferInitParams",
        name: "offerParams",
        type: "tuple"
      }
    ],
    name: "createOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "feeBps",
    outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "feeRecipient",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "baseAmount", type: "uint256" }],
    name: "getFeeAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "offerId", type: "uint256" }],
    name: "getOfferContract",
    outputs: [{ internalType: "contract IERC721", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "adParameter", type: "string" }
    ],
    name: "getOfferProposals",
    outputs: [
      { internalType: "uint256", name: "lastSubmitted", type: "uint256" },
      { internalType: "uint256", name: "lastValidated", type: "uint256" },
      { internalType: "uint256", name: "lastRejected", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "string", name: "adParameter", type: "string" }
    ],
    name: "isAllowedAdParameter",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "address", name: "admin", type: "address" }
    ],
    name: "isOfferAdmin",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "offerId", type: "uint256" }],
    name: "isOfferDisabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "address", name: "validator", type: "address" }
    ],
    name: "isOfferValidator",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "forwarder", type: "address" }],
    name: "isTrustedForwarder",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "address", name: "currency", type: "address" },
          { internalType: "string", name: "tokenData", type: "string" },
          { internalType: "uint256", name: "offerId", type: "uint256" },
          { internalType: "string[]", name: "adParameters", type: "string[]" },
          { internalType: "string[]", name: "adDatas", type: "string[]" },
          { internalType: "string", name: "referralAdditionalInformation", type: "string" }
        ],
        internalType: "struct DSponsorAdmin.MintAndSubmitAdParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "mintAndSubmit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "nftFactory",
    outputs: [{ internalType: "contract IDSponsorNFTFactory", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "proposalId", type: "uint256" },
      { internalType: "string", name: "adParameter", type: "string" },
      { internalType: "bool", name: "validated", type: "bool" },
      { internalType: "string", name: "reason", type: "string" }
    ],
    name: "reviewAdProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "offerId", type: "uint256" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "uint256", name: "proposalId", type: "uint256" },
          { internalType: "string", name: "adParameter", type: "string" },
          { internalType: "bool", name: "validated", type: "bool" },
          { internalType: "string", name: "reason", type: "string" }
        ],
        internalType: "struct IDSponsorAgreements.ReviewAdProposal[]",
        name: "reviews",
        type: "tuple[]"
      }
    ],
    name: "reviewAdProposals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "forwarder", type: "address" }],
    name: "setTrustedForwarder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "adParameter", type: "string" },
      { internalType: "string", name: "data", type: "string" }
    ],
    name: "submitAdProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256[]", name: "offerIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "tokenIds", type: "uint256[]" },
      { internalType: "string[]", name: "adParameters", type: "string[]" },
      { internalType: "string[]", name: "data", type: "string[]" }
    ],
    name: "submitAdProposals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "swapRouter",
    outputs: [{ internalType: "contract UniV3SwapRouter", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "trustedForwarder",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "offerId", type: "uint256" },
      { internalType: "bool", name: "disable", type: "bool" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "offerMetadata", type: "string" },
      {
        components: [
          { internalType: "address[]", name: "admins", type: "address[]" },
          { internalType: "address[]", name: "validators", type: "address[]" },
          { internalType: "string[]", name: "adParameters", type: "string[]" }
        ],
        internalType: "struct IDSponsorAgreements.OfferOptions",
        name: "addOptions",
        type: "tuple"
      },
      {
        components: [
          { internalType: "address[]", name: "admins", type: "address[]" },
          { internalType: "address[]", name: "validators", type: "address[]" },
          { internalType: "string[]", name: "adParameters", type: "string[]" }
        ],
        internalType: "struct IDSponsorAgreements.OfferOptions",
        name: "removeOptions",
        type: "tuple"
      }
    ],
    name: "updateOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address payable", name: "_recipient", type: "address" },
      { internalType: "uint96", name: "_bps", type: "uint96" }
    ],
    name: "updateProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { stateMutability: "payable", type: "receive" }
];
export default abi;
