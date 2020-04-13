import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { EnchereComponent } from './enchere/enchere.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    EnchereComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    FormsModule,
    RouterModule.forRoot([{
      path: '',
      component: AppComponent
    },
    ])
  ],
  providers: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
