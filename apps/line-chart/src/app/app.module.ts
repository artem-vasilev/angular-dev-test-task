import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FeatureChartModule } from '@bp/feature/chart';

import { AppComponent } from './app.component';


@NgModule({
	declarations: [AppComponent],
	imports: [BrowserModule, BrowserAnimationsModule, FeatureChartModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule, ReactiveFormsModule, FormsModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
