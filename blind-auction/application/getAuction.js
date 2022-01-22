const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON} = require('application/util/Application.js');


async function getAuction(ccp, userWallet, seller, auctionName) {
    try {
        const gway = new Gateway();
        await gway.connect(ccp,{wallet: userWallet, identity: seller, discovery: {enabled: true, asLocalhost: true}});
        const auctionChannel = await gway.getNetwork('mychannel');
		const smartContract = auctionChannel.getContract('blind-auction','auction-private');

        console.log('\nGet the auction');
		let auction = await smartContract.evaluateTransaction('getAuction',auctionName);
		console.log('Auction: ' + readableJSON(auction.toString()));

		gateway.disconnect();
    } catch (error) {
        console.error("Failed to submit bid");
    }
    
}

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined || process.argv[4] === undefined) {
			console.log('Usage: node getAuction.js process.argv[2] seller auctionName');
			process.exit(1);
		}

		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await getAuction(org1Admin,org1Wallet,process.argv[3],process.argv[4]);
		} else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await getAuction(org2Admin,org2Wallet,process.argv[3],process.argv[4]);
		}  else {
			console.log('Usage: node getAuction.js org seller auctionName');
		}
	} catch (error) {
		console.error(`Could not run application: ${error}`);
	}
}

main();
