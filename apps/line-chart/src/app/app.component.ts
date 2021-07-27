import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { CryptoCurrencyFacade } from '../services/crypto-currency.facade';
import { CurrencyChartPageViewModel } from '../services/currency-chart-page.view-model';


@Component({
	selector: 'bp-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	providers: [CurrencyChartPageViewModel, CryptoCurrencyFacade],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	title = 'line-chart';

	constructor(public vm: CurrencyChartPageViewModel) {

	}

	ngOnInit() {
		this.vm.init();
	}
}
