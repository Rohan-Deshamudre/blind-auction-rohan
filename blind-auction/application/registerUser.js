'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { createCA, registerUser } = require('application/util/CA.js');
const { createOrg1CA, createOrg2CA, createWallet } = require('application/util/Application.js');


async function createOrg1User(clientName) {
	console.log('\nRegister new user');
	const org1Admin = createOrg1CA();
	const org1CA = createCA(FabricCAServices, org1Admin, 'ca.org1.example.com');
	const org1Path = path.join(__dirname, 'wallet/org1');
	const org1Wallet = await createWallet(Wallets, org1Path);
	await registerUser(org1CA, org1Wallet, 'Org1MSP', clientName, 'org1.department1');
}

async function createOrg2User(clientName) {
	console.log('\nRegister new user');
	const org2Admin = createOrg2CA();
	const org2CA = createCA(FabricCAServices, org2Admin, 'ca.org2.example.com');
	const org2Path = path.join(__dirname, 'wallet/org2');
	const org2Wallet = await createWallet(Wallets, org2Path);
	await registerUser(org2CA, org2Wallet, 'Org2MSP', clientName, 'org2.department1');
}

async function main() {

	if (process.argv[2] === undefined && process.argv[3] === undefined) {
		console.log('Usage: node registerEnrollUser.js org clientName');
		process.exit(1);
	}
	try {

		if (process.argv[2] === 'org1') {
			await createOrg1User(process.argv[3]);
		}
		else if (process.argv[2] === 'org2') {
			await createOrg2User(process.argv[3]);
		} else {
			console.log('Usage: node registerUser.js org clientName');
		}
	} catch (error) {
		console.error(`Could not enroll user: ${error}`);
		process.exit(1);
	}
}

main();
