package blindAuction

import (
    "github.com/hyperledger/fabric-contract-api-go/contractapi"

    "fmt"
	"encoding/json"
  	"log"
)

type AuctionContract struct {
    contractapi.Contract
}

//Structure of the Blind Auction
type BlindAuction struct {
    EventType           string                  `json:"eventType"`
    SellingItem         string                  `json:"sellingItem"`
    Seller              string                  `json:"seller"`
    Price               int                     `json:"price"`
    Organisations       []string                `json:"organisations"`
    HiddenBids          map[string]HiddenBid    `json:"hiddenBids"`
    RevealedBids        map[string]RevealedBids `json:"revealedBid"`
    WinningBidder       string                  `json:"winningBidder"`
    AuctionState	    string                  `json:"auctionState"`
}

type HiddenBid struct {
    Organisation    string      `json:"organisation"`
    BidHash         string      `json:"bidHash"`
}

type RevealedBid struct {
    EventType       string      `json:"eventType"`
    Price           int         `json:"price"`
    Organisation    string      `json:"organisation"`
    Bidder   		string      `json:"bidder"`
}

func (ac *AuctionContract) initAuction(ctx contractapi.TransactionContextInterface, sellingItem string, auctionName string) error {

    sellerId,err := ac.getSubmitter(ctx) 
    if err != nil { return fmt.Errorf("could not get sellerId %v", err) }

    sellerOrgId,err := ctx.GetClientIdentity().GetMSPID()
    if err != nil { return fmt.Errorf("could not get sellerOrgId %v", err) }

    blindAuction := BlindAuction {
        EventType:      "blind-auction",
        SellingItem:    sellingItem,
        Seller:         sellerId,
        Price:          0,
        Organisations:  []string{sellerOrgId},
        HiddenBids:     make(map[string]HiddenBid),
        RevealedBids:   make(map[string]RevealedBid),
        WinningBidder:  "",
        AuctionState:  	"open",
    }

    blindAuctionJSON, err := json.Marshal(blindAuction)
    if err != nil { return err }
    
	err = ctx.GetStub().PutState(auctionName, blindAuctionJSON)
	if err != nil { return fmt.Errorf("could not put the blind-auction into data: %v", err) }

	err = setOrgValidation(ctx, auctionName, sellerOrgId)
	if err != nil { return fmt.Errorf("could not set endorsement for organisation: %v", err) }

	return nil
}

func (ac *AuctionContract) closeAuction(ctx contractapi.TransactionContextInterface, auctionName string) error {
	
	blindAuction, err := ac.getAuction(ctx, auctionName)
	if err != nil { return fmt.Errorf("could not get auction %v", err) }

	sellerId, err := ac.getSubmitter(ctx)
	if err != nil { return fmt.Errorf("could not get sellerId %v", err) }

	Seller := blindAuction.Seller
	if Seller != sellerId { return fmt.Errorf("only the seller can close the auction %v", err) }

	AuctionState := blindAuction.AuctionState
	if AuctionState != "open" { return fmt.Errorf("the auction is not open") }
	
	blindAuction.AuctionState = string("closed")
	auctionClosedJSON, _ := json.Marshal(blindAuction)

	err = ctx.GetStub().PutState(auctionName, auctionClosedJSON)
	if err != nil { return fmt.Errorf("auction couldn't be closed: %v", err) }

	return nil	
}

func (ac *AuctionContract) endAuction(ctx contractapi.TransactionContextInterface, auctionName string) error {

	blindAuction, err := ac.getAuction(ctx, auctionName)
	if err != nil { return fmt.Errorf("could not get auction %v", err) }

	sellerId, err := ac.getSubmitter(ctx)
	if err != nil { return fmt.Errorf("could not get sellerId %v", err) }

	Seller := blindAuction.Seller
	if Seller != sellerId { return fmt.Errorf("only the seller can close the auction %v", err) }

	AuctionState := blindAuction.AuctionState
	if AuctionState != "closed" { return fmt.Errorf("the auction is not closed yet") }

	allRevealedBids := blindAuction.RevealedBids
	if len(allRevealedBids) == 0 { return fmt.Errorf("there are no revealed bids %v", err) }

	for _, currentBid := range allRevealedBids {
		if currentBid.Price > blindAuction.Price {
			blindAuction.WinningBidder = currentBid.Bidder
			blindAuction.Price = currentBid.Price
		}
	}

	higherBidCheck = hasHigherBid(ctx, blindAuction.Price, blindAuction.RevealedBids, blindAuction.HiddenBids)
	if err != nil { return fmt.Errorf("cannot end auction: %v", err) }

	blindAuction.AuctionState = string("ended")
	auctionEndedJSON, _ := json.Marshal(blindAuction)

	err = ctx.GetStub().PutState(auctionName, auctionEndedJSON)
	if err != nil { return fmt.Errorf("could not end auction: %v", err) }

	return nil
}