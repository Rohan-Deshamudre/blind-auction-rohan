package blindAuction

import (
	"fmt"
	"encoding/base64"

	"github.com/hyperledger/fabric-chaincode-go/pkg/statebased"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (ac *AuctionContract) getSubmitter(ctx contractapi.TransactionContextInterface) (string,error) {

	submitterIdB64, err := ctx.GetClientIdentity().GetID()
	if err != nil { return "", fmt.Errorf("could not get submitterId: %v", err) }

	decodedSubmitterId, err := base64.StdEncoding.DecodeString(submitterIdB64)
	if err != nil {	return "", fmt.Errorf("could not decode submitterId: %v", err) }
	
	return string(decodedSubmitterId), nil
}

func (ac *AuctionContract) getOrgs(ctx contractapi.TransactionContextInterface) (string, error) {
	orgId, err := ctx.GetClientIdentity().GetMSPID();
	if err != nil {return "", fmt.Errorf("could not get ordId")}

	orgs := "Org:" + orgId

	return orgs, nil
}

func (ac *AuctionContract) matchClientAndPeerOrg(ctx contractapi.TransactionContextInterface) error {
	submitterId, err := ctx.GetClientIdentity.GetMSPID();
	if err != nil { return fmt.Errorf("Could not get submitterId %v", err)}

	peerId, err := shim.GetMSPID();
	if err != nil { return fmt.Errorf("Could not get peer Id %v", err)}

	if(submitterId != peerId) { return fmt.Errorf("A client of org %v cannot bid from a peer of org %v", submitterId, peerId)}

	return nil;
}

func (ac *AuctionContract) addOrgValidation(ctx contractapi.TransactionContextInterface, auctionName string, org string) error {
	currentValidationList, err := ctx.GetStub().GetStateValidationParameter(auctionName)
	if err != nil {return err}

	newValidationList, err := statebased.NewStateEP(currentValidationList)
	if err != nil {return err}

	addOrg = newValidationList.AddOrgs(statebased.RoleTypePeer, org)
	if err != nil {return fmt.Errorf("could not add org to validation: %v", err)}

	validation,err := newValidationList.Policy()
	if err != nil {return fmt.Errorf("could not set validation for org: %v", err)}

	err = ctx.GetStub().SetStateValidationParameter(auctionName, validation)
	if err != nil {	return fmt.Errorf("Could not set validation for org %v", err) }

	return nil
}

func (ac *AuctionContract) setOrgValidation(ctx contractapi.TransactionContextInterface, auctionName string, org string) error {
	
	validatedList, err := statebased.NewStateEP(nil)
	if err != nil { return err }

	err = validatedList.AddOrgs(statebased.RoleTypePeer, org)
	if err != nil { return fmt.Errorf("Could not add org to validated list: %v", err) }

	verifiedOrg, err := validatedList.Policy()
	if err != nil { return fmt.Errorf("Could not create validation bytes from org %v", err) }

	err = ctx.GetStub().SetStateValidationParameter(auctionName, verifiedOrg)
	if err != nil {	return fmt.Errorf("Could not set validation for org %v", err) }

	return nil
}