'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { createCA, setOrgAdmin } = require('application/util/CA.js');
const { createOrg1CA, createOrg2CA, createWallet } = require('application/util/Application.js');

async function createOrg1Admin() {
	console.log('\nSetting up CA for Organisation 1');
	const org1Admin = createOrg1CA();
	const org1CA = createCA(FabricCAServices, org1Admin, 'ca.org1.example.com');
	const org1Path = path.join(__dirname, 'wallet/org1');
	const org1Wallet = await createWallet(Wallets, org1Path);
	await setOrgAdmin(org1CA, org1Wallet, 'Org1MSP');
}

async function createOrg2Admin() {
	console.log('\nSetting up CA for Organisation 2');
	const org2Admin = createOrg2CA();
	const org2CA = createCA(FabricCAServices, org2Admin, 'ca.org2.example.com');
	const org2Path = path.join(__dirname, 'wallet/org2');
	const org2Wallet = await createWallet(Wallets, org2Path);
	await setOrgAdmin(org2CA, org2Wallet, 'Org2MSP');
}


async function main() {
	if (process.argv[2] === undefined) {
		console.log('Usage: node setOrgAdmin.js Org');
		process.exit(1);
	}

	try {
		if (process.argv[2] === 'org1') {
			await createOrg1Admin();
		}
		else if (process.argv[2] === 'org2') {
			await createOrg2Admin();
		} else {
			console.log('Usage: node registerUser.js org userID');
		}
	} catch (error) {
		console.error(`Could not enroll admin: ${error}`);
		process.exit(1);
	}
}

main();
