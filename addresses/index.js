const pancakeSwapMainnet = require('./pancakeSwap-mainnet.json');
const bakerySwapMainnet = require('./bakerySwap-mainnet.json');
const tokensMainnet = require('./tokens-mainnet.json');
const pancakeSwapTestnet = require('./pancakeSwap-testnet.json');
const bakerySwapTestnet = require('./bakerySwap-testnet.json');
const tokensTestnet = require('./tokens-testnet.json');
module.exports = {
  mainnet: {
    pancakeSwap: pancakeSwapMainnet,
    bakerySwap: bakerySwapMainnet,
    tokens: tokensMainnet,
  },
  testnet: {
    pancakeSwap: pancakeSwapTestnet,
    bakerySwap: bakerySwapTestnet,
    tokens: tokensTestnet,
  },
};
