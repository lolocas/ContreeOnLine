import { Component, OnInit, Input, Output, ElementRef, AfterViewInit } from '@angular/core';
import { CdkDragStart, CdkDragMove, CdkDragExit, CdkDragEnter, CdkDragRelease, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Utils } from '../Utils';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  
  public cardPath: string;
  public cardName: string;
  public dragPosition = { x: 0, y: 0 };

  @Input()
  public value: string;
  @Input()
  public id: number;
  @Input()
  public partieId: number;
  @Input()
  public display: string;
  @Input()
  public draggable: boolean;
  @Input()
  public isInvisible: boolean;
  @Input()
  public socket: any;

  constructor(/*public myapp: AppComponent, */public elRef: ElementRef) {
  }

  public ngOnInit() {
    if (this.isInvisible)
      this.setInVisible();
    else
      this.cardPath = Utils.cardValueToImage(this.value, this.display);
  }

  public changePosition(posX:number, posY:number) {
    this.dragPosition = { x: posX, y: posY };
  }

  public changeAbsolutePosition(posX: number, posY: number) {
    this.elRef.nativeElement.style.width = posX + "px";
    this.elRef.nativeElement.style.height = posY + "px";
  }

  public setVisible() {
    this.cardPath = Utils.cardValueToImage(this.value, this.display);
  }
  public setInVisible() {
    this.cardPath = Utils.imgPath + "undefined_of_undefined" + (this.display == "card-rotate" ? "_rotate" : "") + ".png";
  }

  onDragMoved(e: CdkDragMove) {
    var newPos:any = {};
    newPos.left = (e.distance.x / window.innerWidth);
    newPos.top = (e.distance.y / window.innerHeight);
    newPos.value = this.value;
    newPos.id = this.id;
    newPos.partieId = this.partieId;
    //console.log(e.distance.x, e.distance.y);
    this.socket.emit("moveCard", newPos);
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
    this.socket.emit("cardDropped", { value: this.value, partieId: this.partieId });
  }
}
