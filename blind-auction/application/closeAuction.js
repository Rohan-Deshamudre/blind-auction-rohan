const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { createOrg1CA, createOrg2CA, createWallet, readableJSON } = require('application/util/Application.js');

async function closeAuction(ccp,userWallet,seller,auctionName) {
    try {
        const gway = new Gateway();
        await gway.connect(ccp,{wallet: userWallet, identity: seller, discovery: {enabled: true, asLocalhost: true}});
        const auctionChannel = await gway.getNetwork('mychannel');
		const smartContract = auctionChannel.getContract('blind-auction','auction-private');

        let blindAuction = smartContract.evaluateTransaction('getAuction', auctionName);
        let blindAuctionJSON = JSON.parse(blindAuction);
        let closeAuctionTransaction = smartContract.createTransaction('closeAuction');

        if (blindAuctionJSON.organisations.length === 2) {
			closeAuctionTransaction.setEndorsingOrganizations(blindAuctionJSON.organisations[0],blindAuctionJSON.organisations[1]);
		} else {
			closeAuctionTransaction.setEndorsingOrganizations(blindAuctionJSON.organisations[0]);
		}

        console.log('\n Close auction');
		await closeAuctionTransaction.submit(auctionName);
		console.log('Auction closed and transaction committed');

		console.log('\n Get auction');
		let updatedAuction = await smartContract.evaluateTransaction('getAuction',auctionName);
		console.log('Auction: ' + readableJSON(updatedAuction.toString()));

		gway.disconnect();
    } catch (error) {
        console.error('Could not close auction');
        process.exit(1);
    }
}

async function main() {
	try {

		if (process.argv[2] === undefined || process.argv[3] === undefined ||
            process.argv[4] === undefined) {
			console.log('Usage: node closeAuction.js org seller auctionName');
			process.exit(1);
		}

		if (process.argv[2] === 'org1') {
			const org1Admin = createOrg1CA();
			const org1Path = path.join(__dirname, 'wallet/org1');
			const org1Wallet = await createWallet(Wallets, org1Path);
			await closeAuction(org1Admin,org1Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}
		else if (process.argv[2] === 'org2') {
			const org2Admin = createOrg2CA();
			const org2Path = path.join(__dirname, 'wallet/org2');
			const org2Wallet = await createWallet(Wallets, org2Path);
			await closeAuction(org2Admin,org2Wallet,process.argv[3],process.argv[4],process.argv[5]);
		}  else {
			console.log('Usage: node closeAuction.js org seller auctionName ');
		}
	} catch (error) {
		console.error(`Could not run application: ${error}`);
		process.exit(1);
	}
}


main();
