import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
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
