const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON} = require('application/util/Application.js');


async function initAuction(org1Admin,org1Wallet,seller,auctionName,sellingItem) {
    try {
        const gway = new Gateway();
        await gway.connect(org1Admin,{wallet: org1Wallet, identity: seller, discovery: {enabled: true, asLocalhost: true}});
        const auctionChannel = await gway.getNetwork('mychannel');
		const smartContract = auctionChannel.getContract('blind-auction','auction-private');

        let auctionTransaction = smartContract.createTransaction('initAuction');
        console.log('\n Create a new auction');
		await auctionTransaction.submit(sellingItem, auctionName);
		console.log('New auction created and committed');

		console.log('\n Get auction');
		let auction = await smartContract.evaluateTransaction('getAuction',auctionName);
		console.log('Auction: '+ readableJSON(auction.toString()));

		gway.disconnect();
    } catch (error) {
        console.error("Could not create auction");
    }
}

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined || 
            process.argv[4] === undefined || process.argv[5] === undefined) {
			console.log('Usage: node initAuction.js sellerOrg seller auctionName sellingItem');
			process.exit(1);
		}

		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await initAuction(org1Admin,org1Wallet,process.argv[3],process.argv[4],process.argv[5]);
		} else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await initAuction(org2Admin,org2Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}  else {
			console.log('Usage: node initAuction.js sellerOrg seller auctionName sellingItem');
		}
	} catch (error) {
		console.error(`Could not run application: ${error}`);
	}
}

main();
