require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const abis = require('./abis');
const { mainnet: addresses } = require('./addresses');
//const { testnet: addresses } = require('./addresses');

const wsProvider = new Web3.providers.WebsocketProvider(process.env.WSS_URL);
HDWalletProvider.prototype.on = wsProvider.on.bind(wsProvider);

let provider = new HDWalletProvider({
  mnemonic: {
    phrase: process.env.MNEMONIC,
  },
  providerOrUrl: wsProvider,
});

const web3 = new Web3(provider);

getAccounts = async () => {
  let accounts = await web3.eth.getAccounts();
  //console.log(accounts);
  return accounts;
};

const amountIn = web3.utils.toBN(web3.utils.toWei('100'));

//const Flashloan = require('./build/contracts/Flashloan.json');

const DIRECTION = {
  BAKERY_TO_PANCAKE: 0,
  PANCAKE_TO_BAKERY: 1,
};
const PancakeSwap = new web3.eth.Contract(
  abis.pancakeSwap.router,
  addresses.pancakeSwap.router
);

const BakerySwap = new web3.eth.Contract(
  abis.bakerySwap.router,
  addresses.bakerySwap.router
);

const repayAmount = amountIn - amountIn * 0.997 + amountIn;

const tokens = Object.keys(addresses.tokens).map((key) => [
  key,
  addresses.tokens[key],
]);

const init = async () => {
  const accounts = await getAccounts();
  const admin = accounts[0];
  //console.log(admin);
  const networkId = await web3.eth.net.getId();
  //console.log(tokens);
  //console.log(tokens[0][1]);

  /* const flashloan = new web3.eth.Contract(
    Flashloan.abi,
    Flashloan.networks[networkId].address
  ); */

  web3.eth
    .subscribe('newBlockHeaders')
    .on('data', async (block) => {
      console.log(`New block received. Block # ${block.number}`);
      //console.log(tokens.length);
      try {
        await scan();
      } catch (error) {
        console.log(error);
      }

      /*
      if (BTP.gt(amountIn)) {
        const gasPrice = await web3.eth.getGasPrice();
        //200000 is picked arbitrarily, have to be replaced by actual tx cost in next lectures, with Web3 estimateGas()
        /* const txCost = flashloan.methods
          .startArbitrage(
            addresses.tokens.DAI,
            addresses.tokens.WBNB,
            amountInDai,
            0,
            DIRECTION.BAKERY_TO_PANCAKE,
            repayAmount.toString()
          )
          .estimateGas(
            {
              from: admin,
              gasPrice: gasPrice,
            },
            function (error, estimatedGas) {}
          );
        const txCost = 200000 * parseInt(gasPrice);
        const profit = amountsOut2[1].sub(amountIn).sub(txCost);

        if (profit > 0) {
          console.log('Arb opportunity found Bakery -> Pancake!');
          console.log(
            `Expected profit: ${web3.utils.fromWei(profit.toString)} Dai`
          );

          /* let tx = flashloan.methods.startArbitrage(
            addresses.tokens.DAI,
            addresses.tokens.WBNB,
            amountInDai,
            0,
            DIRECTION.BAKERY_TO_PANCAKE,
            repayAmount.toString()
          );

          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: flashloan.options.address,
            data,
            gas: gas,
            gasPrice: gasPrice,
          };

          const receipt = await web3.eth.sendTransaction(txData);
          console.log(`Transaction hash: ${receipt.transactionHash}`);
        }
      }

      if (PTB.gt(amountIn)) {
        const gasPrice = await web3.eth.getGasPrice();
        //200000 is picked arbitrarily, have to be replaced by actual tx cost in next lectures, with Web3 estimateGas()
        const txCost = 200000 * parseInt(gasPrice);
        const profit = amountsOut4[1].sub(amountIn).sub(txCost);

        if (profit > 0) {
          console.log('Arb opportunity found Pancake -> Bakery!');
          console.log(
            `Expected profit: ${web3.utils.fromWei(profit.toString())} Dai`
          );

          /* let tx = flashloan.methods.startArbitrage(
            addresses.tokens.DAI,
            addresses.tokens.WBNB,
            amountInDai,
            0,
            DIRECTION.PANCAKE_TO_BAKERY,
            repayAmount.toString()
          );

          const data = tx.encodeABI();
          const txData = {
            from: admin,
            to: flashloan.options.address,
            data,
            gas: gas,
            gasPrice: gasPrice,
          };
          const receipt = await web3.eth.sendTransaction(txData);
          console.log(`Transaction hash: ${receipt.transactionHash}`);
        }
      }*/
    })
    .on('error', (error) => {
      console.log(error);
    });
};
init();

const scan = async () => {
  try {
    for (let i = 1; i < tokens.length; i++) {
      const amountsOut1 = await PancakeSwap.methods
        .getAmountsOut(amountIn, [addresses.tokens.WBNB, tokens[i][1]])
        .call();
      const amountsOut2 = await BakerySwap.methods
        .getAmountsOut(amountsOut1[1], [tokens[i][1], addresses.tokens.WBNB])
        .call();
      const amountsOut3 = await BakerySwap.methods
        .getAmountsOut(amountIn, [addresses.tokens.WBNB, tokens[i][1]])
        .call(); // dai to Wbnb bakeryswap
      const amountsOut4 = await PancakeSwap.methods
        .getAmountsOut(amountsOut3[1], [tokens[i][1], addresses.tokens.WBNB])
        .call(); // Wbnb to dai pancakeswap

      /* console.log(
        `PancakeSwap -> BakerySwap ${
          tokens[i][0]
        }. WBNB input / output: ${web3.utils.fromWei(
          amountIn.toString()
        )} / ${web3.utils.fromWei(amountsOut2[1].toString())}`
      );
      console.log(
        `BakerySwap -> PancakeSwap ${
          tokens[i][0]
        }. WBNB input / output: ${web3.utils.fromWei(
          amountIn.toString()
        )} / ${web3.utils.fromWei(amountsOut4[1].toString())}`
      ); */

      const BTP = web3.utils.toBN(amountsOut2[1]);
      const PTB = web3.utils.toBN(amountsOut4[1]);

      if (BTP.gt(amountIn)) {
        console.log(
          `PancakeSwap -> BakerySwap ${
            tokens[i][0]
          }. WBNB input / output: ${web3.utils.fromWei(
            amountIn.toString()
          )} / ${web3.utils.fromWei(amountsOut2[1].toString())}`
        );
        console.log(
          `BakerySwap -> PancakeSwap ${
            tokens[i][0]
          }. WBNB input / output: ${web3.utils.fromWei(
            amountIn.toString()
          )} / ${web3.utils.fromWei(amountsOut4[1].toString())}`
        );
      }

      if (PTB.gt(amountIn)) {
        console.log(
          `PancakeSwap -> BakerySwap ${
            tokens[i][0]
          }. WBNB input / output: ${web3.utils.fromWei(
            amountIn.toString()
          )} / ${web3.utils.fromWei(amountsOut2[1].toString())}`
        );
        console.log(
          `BakerySwap -> PancakeSwap ${
            tokens[i][0]
          }. WBNB input / output: ${web3.utils.fromWei(
            amountIn.toString()
          )} / ${web3.utils.fromWei(amountsOut4[1].toString())}`
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};
