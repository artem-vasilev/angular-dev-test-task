import type { OnDestroy } from '@angular/core';
import type { Subscription } from 'rxjs';


export class BaseComponent implements OnDestroy {
	subscriptions: Subscription[];

	ngOnDestroy() {
		this.subscriptions.forEach((s) => s.unsubscribe());
	}
}
