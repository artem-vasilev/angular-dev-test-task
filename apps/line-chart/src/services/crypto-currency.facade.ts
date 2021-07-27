import { Injectable } from '@angular/core';
import { IChartLineItem } from '@bp/feature/chart';
import { CryptoCurrencyCode, CRYPTO_CURRENCIES_PRICES_COLLECTION_NAME, CRYPTO_CURRENCY_CODES_AND_NAMES } from '@bp/shared-models';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';


@Injectable()
export class CryptoCurrencyFacade {
	currencyList = Object.entries(CRYPTO_CURRENCY_CODES_AND_NAMES).map((c) => ({ key: c[0], text: c[1] }));
	currencyData$ = new BehaviorSubject<IChartLineItem>({ data: [] });
	unsubscribeRTMCallback: () => void;

	constructor(private firebaseService: FirebaseService) {

	}

	async getCurrencyData(currency: CryptoCurrencyCode) {
		const currencyData = await this.firebaseService.getRecords(currency, 100);
		this.currencyData$.next({ data: currencyData.sort((a, b) => (a.x - b.x)) });
	}

	rtmOn(currency: CryptoCurrencyCode) {
		this.firebaseService.turnOnRealtimeCryptoCurrencyPrices(currency);
	}

	changeRealTimeCurrency(currency: CryptoCurrencyCode) {
		this.unsubscribeRTMCallback && this.unsubscribeRTMCallback();

		this.unsubscribeRTMCallback = this.firebaseService.firestore.collection(`${ CRYPTO_CURRENCIES_PRICES_COLLECTION_NAME }/${ currency }/prices`)
			.onSnapshot({
				next: (snapshot) => {
					const data = snapshot.docChanges().map((change) => ({
						x: +change.doc.id,
						y: +change.doc.data().price,
					}));
					const sortedData = [...this.currencyData$.getValue().data, ...data].sort((a, b) => (a.x - b.x));
					this.currencyData$.next({ data: sortedData });
				},
			});
	}

	destroy() {
		this.unsubscribeRTMCallback && this.unsubscribeRTMCallback();
	}
}
