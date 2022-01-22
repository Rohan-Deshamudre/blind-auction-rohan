const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON } = require('application/util/Application.js');

async function getBid(ccp,userWallet,bidder,auctionName,bidId) {
    try {
        const gway = new Gateway();
        await gway.connect(ccp,{wallet: userWallet, identity: bidder, discovery: {enabled: true, asLocalhost: true}});

        const auctionNetwork = await gway.getNetwork('mychannel');
        const smartContract = auctionNetwork.getContract('blind-auction', 'auction-private');

        console.log('\nGet the bid');
		let bid = await smartContract.evaluateTransaction('getBid',auctionName,bidId);
		console.log('Auction: ' + readableJSON(bid.toString()));

		gateway.disconnect();
    } catch (error) {
        console.error(`could not get bid: ${error}`);
    }
} 

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined ||
            process.argv[4] === undefined || process.argv[5] === undefined) {
			console.log('Usage: node getBid.js org bidder auctionName bidID');
			process.exit(1);
		}


		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await getBid(org1Admin,org1Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}
		else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await getBid(org2Admin,org2Wallet,process.argv[3],process.argv[4],process.argv[5]);
		} else {
			console.log('Usage: node getBid.js org bidder auctionName bidID');
		}
	} catch (error) {
		console.error(`Could not get bid: ${error}`);
	}
}


main();