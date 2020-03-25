import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CdkDragStart, CdkDragMove, CdkDragExit, CdkDragEnter, CdkDragRelease } from '@angular/cdk/drag-drop';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements AfterViewInit {
  private imgPath: string = "/assets/cards/";
  public cardPath: string;
  public cardName: string;
  public dragPosition = { x: 0, y: 0 };

  @Input()
  public value: string;
  @Input()
  public display: string;
  @Input()
  public draggable: boolean;

  constructor(public myapp: AppComponent) {
  }

  public ngAfterViewInit() {
    this.cardPath = this.imgPath + this.getFullRank() + "_of_" + this.getFullSuit() + (this.display =="card-rotate" ? "_rotate":"") + ".png";
    this.cardName = this.getFullRank() + "_of_" + this.getFullSuit();
    //this.draggable = false;
    //if (this.display == "card-draggable") {
    //  this.draggable = true;
    // // this.changePosition();
    //}
  }

  public changePosition(posX:number, posY:number) {
    this.dragPosition = { x: posX, y: posY };
  }

  private getFullRank() {
    if (this.value) {
      switch (this.value.charAt(0)) {
        case '0':
          return "10";
        case 'J':
          return "jack";
        case 'Q':
          return "queen";
        case 'K':
          return "king";
        case 'A':
          return "ace";
        default:
          return this.value.charAt(0);
      }
    }
  }

  private getFullSuit() {
    if (this.value) {
      switch (this.value.charAt(1)) {
        case 'H':
          return "hearts";
        case 'S':
          return "spades";
        case 'D':
          return "diamonds";
        case 'C':
          return "clubs";
      }
    }
  }

  onDragMoved(e: CdkDragMove) {
    var newPos:any = {};
    //newPos.left = (e.pointerPosition.x / window.innerWidth);
    //newPos.top = (e.pointerPosition.y / window.innerHeight);
    newPos.left = (e.distance.x / window.innerWidth);
    newPos.top = (e.distance.y / window.innerHeight);
    newPos.value = this.value;
    //console.log(e.pointerPosition.x, e.pointerPosition.y);
    this.myapp.socket.emit("moveCard", newPos);
  }

  onDragRelease(e: CdkDragRelease) {
    this.myapp.socket.emit("cardDropped", this.value);
  }
}
