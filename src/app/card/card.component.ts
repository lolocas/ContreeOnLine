import { Component, OnInit, Input, Output, ElementRef, AfterViewInit } from '@angular/core';
import { CdkDragStart, CdkDragMove, CdkDragExit, CdkDragEnter, CdkDragRelease, CdkDragEnd } from '@angular/cdk/drag-drop';
import { UtilsHelper } from '../UtilsHelper';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  
  public cardPath: string;
  public cardName: string;
  public dragPosition = { x: 0, y: 0 };

  @Output()
  public couleur: string;

  private _value: string;
  @Input()
  @Output()
  set value(valeur: string) {
    this._value = valeur;
    if (this._value) {
      this.couleur = this._value[1];
    }
  }
  get value(): string { return this._value; }

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
  @Input()
  public couleurEnchere: string;

  private _enchereId: number;
  @Input()
  set enchereId(value: number) {
    this._enchereId = value;
    if (this._enchereId == 1 || this._enchereId == 2)
      this.classAtout = 'equipe1';
    else if (this._enchereId == 3 || this._enchereId == 4)
      this.classAtout = 'equipe2';
    else
      this.classAtout = 'atout';
  }
  get enchereId(): number { return this._enchereId; }

  @Output()
  public classAtout: string = 'atout';

  private isCardUnplayable: boolean;

  constructor(/*public myapp: AppComponent, */public elRef: ElementRef) {
  }

  public ngOnInit() {
    if (this.isInvisible)
      this.setInVisible();
    else
      this.cardPath = UtilsHelper.cardValueToImage(this.value, this.display);
  }

  public changePosition(posX:number, posY:number) {
    this.dragPosition = { x: posX, y: posY };
  }

  public changeAbsolutePosition(posX: number, posY: number) {
    this.elRef.nativeElement.style.width = posX + "px";
    this.elRef.nativeElement.style.height = posY + "px";
  }

  public setVisible() {
    this.cardPath = UtilsHelper.cardValueToImage(this.value, this.display);
  }
  public setInVisible() {
    this.cardPath = UtilsHelper.imgPath + "undefined_of_undefined" + (this.display == "card-rotate" ? "_rotate" : "") + ".png";
  }

  public setCardUnplayable() {
    this.isCardUnplayable = true;
    this.elRef.nativeElement.style.opacity = '0.7';
    this.dragPosition = { x: 0, y: 10 };
  }

  public setCardPlayable() {
    this.isCardUnplayable = false;
    this.elRef.nativeElement.style.opacity = '1';
    this.dragPosition = { x: 0, y: 0 };
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

  onDblClick() {
    if (this.draggable)
      this.socket.emit("cardDropped", { value: this.value, partieId: this.partieId, hasDblClick: true });
  }

  onMouseEnter() {
    if (this.draggable && !this.isCardUnplayable)
      this.dragPosition = { x: 0, y: -5 };
  }

  onMouseLeave() {
    if (this.draggable && !this.isCardUnplayable)
      this.dragPosition = { x: 0, y: 5 };
  }
}
