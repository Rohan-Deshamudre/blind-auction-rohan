const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON } = require('application/util/Application.js');


async function submitBid(ccp,userWallet,bidder,auctionName,bidId) {
    try {
        const gway = new Gateway();
		await gway.connect(ccp,{wallet: userWallet, identity: bidder, discovery: {enabled: true, asLocalhost: true}});

		const auctionNetwork = await gway.getNetwork('mychannel');
		const smartContract = auctionNetwork.getContract('blind-auction','auction-private');

        console.log('\n Get auction to bid on');
		let auction = await smartContract.evaluateTransaction('getAuction',auctionName);
		let auctionJSON = JSON.parse(auction);

        let submitbid = smartContract.createTransaction('submit_bid')
		if (auctionJSON.organizations.length === 2) {
			submitbid.setEndorsingOrganizations(auctionJSON.organizations[0],auctionJSON.organizations[1]);
		} else {
			submitbid.setEndorsingOrganizations(auctionJSON.organizations[0]);
		}

        console.log('\nBid submitted');
		await submitBid.submit(bidder,price,bidderOrg,auctionName,bidId);

		console.log('\nQuery auction');
		let ans = await smartContract.evaluateTransaction('getAuction',auctionName);
		console.log('Auction: ' + formatJSON(ans.toString()));

		gway.disconnect();

    } catch (error) {
		console.error(`Could not submit bid: ${error}`);
		process.exit(1);
    }
}

function formatJSON(string) {
	if (string) {
		return JSON.stringify(JSON.parse(string), null, 2);
	}
	else {
		return string;
	}
}

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined ||
            process.argv[4] === undefined || process.argv[5] === undefined) {
			console.log('Usage: node submitBid.js bidderOrg bidder auctionName bidID');
			process.exit(1);
		}

		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await submitBid(org1Admin,org1Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}
		else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await submitBid(org2Admin,org2Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}
		else {
			console.log('Usage: node submitBid.js bidderOrg bidder auctionName bidID');
		}
	} catch (error) {
		console.error(`Could not run application: ${error}`);
		process.exit(1);
	}
}


main();
