const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON } = require('application/util/Application.js');

async function showBid(ccp,userWallet,bidder,auctionName,bidId) {
	try {
		const gway = new Gateway();
		await gway.connect(ccp,{wallet: userWallet, identity: bidder, discovery: {enabled: true, asLocalhost: true}});

		const auctionNetwork = await gway.getNetwork('mychannel');
        const smartContract = auctionNetwork.getContract('blind-auction', 'auction-private');

		console.log('\n Reveal bid');
		let getBid = await smartContract.evaluateTransaction('getBid',auctionName,bidId);
		let bidJSON = JSON.parse(getBid);

		let getAuction = await smartContract.evaluateTransaction('getAuction',auctionName);
		let auctionJSON = JSON.parse(getAuction);

		let bidInfo = { objectType: 'bid', price: parseInt(bidJSON.price), org: bidJSON.organisation, bidder: bidJSON.bidder};
		console.log('Bid: ' + JSON.stringify(bidInfo,null,2));

		let showBid = smartContract.createTransaction('showBid');
		
		if (auctionJSON.organisations.length === 2) {
			showBid.setEndorsingOrganizations(auctionJSON.organisations[0], auctionJSON.organisations[1]);
		} else {
			showBid.setEndorsingOrganizations(auctionJSON.organisations[0]);
		}

		await showBid.submit(auctionName,bidId);

		console.log('\n--> Query auction');
		let auction = await contract.evaluateTransaction('getAuction',auctionName);
		console.log('Auction: ' + readableJSON(auction.toString()));

		gway.disconnect;
	} catch (error) {
		console.error(`could not reveal bid: ${error}`)
	}    
}

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined ||
            process.argv[4] === undefined || process.argv[5] === undefined) {
			console.log('Usage: node showBid.js org bidder auctionName bidID');
			process.exit(1);
		}

		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await showBid(org1Admin,org1Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}
		else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await showBid(org2Admin,org2Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}
		else {
			console.log('Usage: node showBid.js org userID auctionID bidID');
		}
	} catch (error) {
		console.error(`Could not reveal bid: ${error}`);
		process.exit(1);
	}
}


main();