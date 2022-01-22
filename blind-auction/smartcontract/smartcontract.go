package main

import (
    "log"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
    ba_smartContract, err := contractapi.NewChaincode(&blindAuction.AuctionContract{})
    if err != nil {log.Panicf("Chaincode not created: %v", err)}
    if err := ba_smartContract.Start(); err != nil {log.Panicf("Could not start chaincode: %v", err)}
}

