import { Component, OnInit, Input, Output, ElementRef, AfterViewInit } from '@angular/core';
import { CdkDragStart, CdkDragMove, CdkDragExit, CdkDragEnter, CdkDragRelease, CdkDragEnd } from '@angular/cdk/drag-drop';
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
  public id: number;
  @Input()
  public display: string;
  @Input()
  public draggable: boolean;
  @Input()
  public isInvisible: boolean;

  constructor(public myapp: AppComponent, private elRef: ElementRef) {
  }

  public ngAfterViewInit() {
    if (this.isInvisible)
      this.cardPath = this.imgPath + "undefined_of_undefined" + (this.display == "card-rotate" ? "_rotate" : "") + ".png";
    else
      this.cardPath = this.imgPath + this.getFullRank() + "_of_" + this.getFullSuit() + (this.display == "card-rotate" ? "_rotate" : "") + ".png";
    this.cardName = this.getFullRank() + "_of_" + this.getFullSuit();
  }

  public changePosition(posX:number, posY:number) {
    this.dragPosition = { x: posX, y: posY };
  }

  public changeAbsolutePosition(posX: number, posY: number) {
    this.elRef.nativeElement.style.width = posX + "px";
    this.elRef.nativeElement.style.height = posY + "px";
  }

  public setVisible() {
    this.cardPath = this.imgPath + this.getFullRank() + "_of_" + this.getFullSuit() + (this.display == "card-rotate" ? "_rotate" : "") + ".png";
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
    newPos.left = (e.distance.x / window.innerWidth);
    newPos.top = (e.distance.y / window.innerHeight);
    newPos.value = this.value;
    newPos.id = this.id;
    //console.log(e.distance.x, e.distance.y);
    this.myapp.socket.emit("moveCard", newPos);
  }

  onDragEnded(e: CdkDragEnd) {
    //var newPos: any = {};
    //const { offsetLeft, offsetTop } = e.source.element.nativeElement;
    //const { x, y } = e.distance;
    //var positionX = offsetLeft + x;
    //var positionY = offsetTop + y;
    //console.log({ positionX, positionY });
    //newPos.left = Math.abs((positionX / window.innerWidth));
    //newPos.top = Math.abs((positionY / window.innerHeight));
    //newPos.value = this.value;
    this.myapp.socket.emit("cardDropped", this.value);
  }
}
