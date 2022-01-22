package blindAuction

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (ac *AuctionContract) getAuction(ctx contractapi.TransactionContextInterface, auctionName string) (*BlindAuction, error) {
	
	blindAuctionJSON, err := ctx.GetStub().GetState(auctionName)
	if err != nil { return nil, fmt.Errorf("could not get auction %v: %v", auctionName, err) }
	if blindAuctionJSON == nil {return nil, fmt.Errorf("auction does not exist") }

	var blindAuction *BlindAuction
	err = json.Unmarshal(blindAuctionJSON, &blindAuction)
	if err != nil { return nil, err }

	return blindAuction, nil
}


func hasHigherBid(ctx contractapi.TransactionContextInterface, currentPrice int, revealedBids map[string]RevealedBid, hiddenBids map[string]HiddenBid) error {

	bidderId, err := shim.GetMSPID()
	if err != nil { return fmt.Errorf("could not get bidderId: %v", err)}

	var error error
	error = nil

	for key, hiddenbid := range hiddenBids {
		if _, bidRevealed := revealedBids[key]; bidRevealed {
			//do nothing
		} else {

			bidderOrgs := hiddenbid.Organisation

			if hiddenbid.Organisation == bidderId {
				hiddenBidJSON, err := ctx.GetStub.GetPrivateData(bidderOrgs, key)
				if err != nil {return fmt.Errorf("cant get bid %v: %v", key, err)}
				if hiddenBidJSON == nil {return fmt.Errorf("bid %v does not exist", key)}

				var revealedBid *RevealedBid
				err = json.Unmarshal(hiddenBidJSON, &revealedBid)
				if err != nil {return err}
				if revealedBid.Price > currentPrice {"There is a higher price: %v", err}
			} else {
				bidHash, err := ctx.GetStub().GetPrivateDataHash(bidderOrgs, key)
				if err != nil {return fmt.Errorf("Could not get bidhash: %v", err)}
				if bidHash == nil {return fmt.Errorf("No bidhash found: %s", key)}
			}
		}
	}
	return error
}