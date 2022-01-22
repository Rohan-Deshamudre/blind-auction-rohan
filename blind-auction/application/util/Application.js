'use strict';

const fs = require('fs');
const path = require('path');

exports.createOrg1CA = () => {
	const orgPath = path.resolve(__dirname, '..', '..', 'test-network', 
	'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
	const fileCheck = fs.existsSync(orgPath);
	if (!fileCheck) {throw new Error(`file does not exist: ${orgPath}`);}
	const readFile = fs.readFileSync(orgPath, 'utf8');
	const jsonParse = JSON.parse(readFile);
	console.log(`Network loaded ${orgPath}`);
	return jsonParse;
};

exports.createOrg2CA = () => {
	const orgPath = path.resolve(__dirname, '..', '..', 'test-network',	
	'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
	const fileCheck = fs.existsSync(orgPath);
	if (!fileCheck) {throw new Error(`no such file or directory: ${orgPath}`);}
	const readFile = fs.readFileSync(orgPath, 'utf8');
	const jsonParse = JSON.parse(readFile);
	console.log(`Network loaded ${orgPath}`);
	return jsonParse;
};

exports.createWallet = async (Wallets, walletPath) => {
	let adminWallet;
	if (walletPath) {
		adminWallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Admin wallet built at ${walletPath}`);
	} else {
		adminWallet = await Wallets.newInMemoryWallet();
		console.log('Admin wallet created');
	}

	return adminWallet;
};

exports.readableJSON = (input) => {
	if (input) { 
		return JSON.stringify(JSON.parse(input), null, 2);
	} else {
		return input;
	}
}
