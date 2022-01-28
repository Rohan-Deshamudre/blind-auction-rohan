# blind-auction-rohan

The blind auctions smart contract uses hyperledger fabric to create an e-auctions system which has hidden bids submitted by bidders to be revealed at the end of the auction. The smart contract in fabric is written in Go whereas the application code is written in JS. Every auction allows for something to be sold by a seller in an organisation that is part of the trsuted auctions blockchain network. Other peers in this network and in the created channel, within the same organisation as well as other organisations can then act as bidders and submit a bid to try and buy the item that is being sold. This prototype also uses Intel SGX trusted hardware to execute chaincode that contains private data.
In order to run the prototype for this, multiple installations need to be completed first.

## Installations
1. Install Hyperledger fabric: (http://hyperledger-fabric.readthedocs.io/en/release-2.2/)
2. Install fabric samples: (https://github.com/hyperledger/fabric-samples)
3. Install fabric-private chaincode: (https://github.com/hyperledger/fabric-private-chaincode)
4. Install Intel SGX SDK and SSL: (https://github.com/intel/linux-sgx)

## Creation of network
A network needs to be created according to your prefereneces using: (https://github.com/hyperledger/fabric/blob/main/docs/source/deployment_guide_overview.rst). For demonstration purposes, the test network offered in Fabric samples can be used which consists of two organisations and allows for the addition of multiple peers. 

## Running the demo
The first step is to clone this repository into the go folder created while downloading hyperledger. Once this is done, you need to open the folder which contains your network and run the following command from there to deploy the chaincode on to the network. In case you are using the test network from fabric samples, this would be:
```
cd fabric-samples/test-network
```
The following command then deploys the network using certificate authorities:
```
./network.sh up createChannel -ca
```
The next step is deploying the contract onto the network:
```
./network.sh deployCC -ccn blind-auction -ccp ../blind-auction/chaincode/ -ccl go -ccep "OR('Org1MSP.peer','Org2MSP.peer')"
```
Once this is done, move back into the code folder of the blind-auction and install dependencies:
```
cd fabric-samples/blind-auction/application
```
```
npm install
```



