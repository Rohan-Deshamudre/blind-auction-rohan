const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON } = require('application/util/Application.js');



async function createBid(ccp, userWallet, bidder, bidderOrg, auctionName, price) {
    try {
        const gway = new Gateway();
        await gway.connect(ccp,{wallet: userWallet, identity: bidder, discovery: {enabled: true, asLocalhost: true}});

        const auctionNetwork = await gway.getNetwork('mychannel');
        const smartContract = auctionNetwork.getContract('blind-auction', 'auction-private');

        console.log('\n Get bidder ID');
		let bidderId = await smartContract.evaluateTransaction('getSubmitter');
		console.log('Bidder ID: ' + bidderId.toString());

        let bidInfo = {objectType: 'bid', price: parseInt(price), bidderOrg: bidderOrg, bidder: bidder.toString()};

        let createBid = smartContract.createTransaction('create_bid');
		createBid.setEndorsingOrganizations(bidderOrg);
		
        let bidId = createBid.getTransactionId();
		console.log('\n Create bid');
		await createBid.submit(bidder,price,bidderOrg,auctionName);
		console.log('Bid committed');
		console.log('BidID: ' + bidId.toString());

		console.log('\nGet bid');
		let bid = await smartContract.evaluateTransaction('getBid',auctionName,bidId);
		console.log('Bid: ' + readableJSON(bid.toString()));

		gateway.disconnect();

    } catch (error) {
		console.error(`could not create bid: ${error}`);
		process.exit(1);
    }
}

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined ||
            process.argv[4] === undefined || process.argv[5] === undefined) {
			console.log('Usage: node createbid.js bidderOrg bidder auctionName price');
			process.exit(1);
		}

		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await createBid(org1Admin,org1Wallet,process.argv[3],'Org1MSP', process.argv[4], process.argv[5]);
		}
		else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await createBid(org2Admin,org2Wallet,process.argv[3],'Org2MSP', process.argv[4], process.argv[5]);
		}  else {
			console.log('Usage: node createbid.js bidderOrg bidder auctionName price');
		}
	} catch (error) {
		console.error(`Could not run application: ${error}`);
		process.exit(1);
	}
}

main();
