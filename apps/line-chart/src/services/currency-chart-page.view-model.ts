import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IChartLineItem } from '@bp/feature/chart';
import { CryptoCurrencyCode } from '@bp/shared-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CryptoCurrencyFacade } from './crypto-currency.facade';


@Injectable()
export class CurrencyChartPageViewModel {
	currencies = this.currencyFacade.currencyList;
	currencyControl = new FormControl(this.currencies[0].key);
	realTimeModeControl = new FormControl(false);

	chartData$: Observable<{ [key: string]: IChartLineItem }> = this.currencyFacade.currencyData$.pipe(
		map((lineData: IChartLineItem) => {
			return {
				[this.currencyControl.value]: lineData
			}
		}),
	);

	isRealTime() {
		return this.realTimeModeControl.value;
	}

	constructor(private currencyFacade: CryptoCurrencyFacade) {
		this.currencyControl.valueChanges.subscribe(async (currency) => {
			await this.getChartData(currency);
		});
		this.realTimeModeControl.valueChanges.subscribe((rtmMode) => {
			if (!rtmMode) {
				this.currencyFacade.unsubscribeRTMCallback();
			} else {
				this.currencyFacade.rtmOn(this.currencyControl.value);
				this.currencyFacade.changeRealTimeCurrency(this.currencyControl.value);
			}
		})
	}

	init() {
		this.getChartData(<CryptoCurrencyCode>this.currencies[0].key);
	}

	private getChartData(currency: CryptoCurrencyCode) {
		if (!this.isRealTime()) {
			this.currencyFacade.getCurrencyData(currency);
		} else {
			this.currencyFacade.rtmOn(currency);
			this.currencyFacade.changeRealTimeCurrency(currency);
		}
	}
}
