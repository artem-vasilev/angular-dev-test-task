import { Injectable } from '@angular/core';

import type { CryptoCurrencyCode } from '@bp/shared-models';
// @ts-ignore
import { TURN_ON_REALTIME_CRYPTO_CURRENCY_PRICES_FB_FN, CRYPTO_CURRENCIES_PRICES_COLLECTION_NAME } from '@bp/shared-models';
import firebase from 'firebase/app';

// Firebase App (the core Firebase SDK) is always required and must be listed first
import 'firebase/firestore';
import 'firebase/functions';


@Injectable({
	providedIn: 'root',
})
export class FirebaseService {

	get firestore(): firebase.firestore.Firestore {
		return firebase.firestore();
	}

	protected get functions(): firebase.functions.Functions {
		return firebase.functions();
	}

	constructor() {
		firebase.initializeApp({
			apiKey: 'AIzaSyBlTgmKN7hPNG_A1EqaPyVHF668SkfFl4s',
			authDomain: 'angular-dev-test-task.firebaseapp.com',
			projectId: 'angular-dev-test-task',
			storageBucket: 'angular-dev-test-task.appspot.com',
			messagingSenderId: '978693463659',
			appId: '1:978693463659:web:7aa38253892da9c0b15b2e',
		});
	}

	getRecords(currency: CryptoCurrencyCode, limit: number) {
		return this.firestore
			.collection(`${ CRYPTO_CURRENCIES_PRICES_COLLECTION_NAME }/${currency}/prices`)
			.orderBy('timestamp', 'desc')
			.limitToLast(limit)
			.get()
			.then((snapshot) => {
				return snapshot.docChanges().map((change) => ({
					x: +change.doc.id,
					y: +change.doc.data().price,
				})).reverse();
			})
	}

	async turnOnRealtimeCryptoCurrencyPrices(cryptoCurrencyCode: CryptoCurrencyCode): Promise<any> {
		return await this.functions
			.httpsCallable(<string>TURN_ON_REALTIME_CRYPTO_CURRENCY_PRICES_FB_FN)({ cryptoCurrencyCode });
	}

}
