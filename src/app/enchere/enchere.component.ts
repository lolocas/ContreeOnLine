import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsHelper } from '../UtilsHelper';

@Component({
  selector: 'app-enchere',
  templateUrl: './enchere.component.html',
  styleUrls: ['./enchere.component.css']
})
export class EnchereComponent implements OnInit {

  private _encherePosition: string;
  @Input()
  set encherePosition(value: string) {
    this._encherePosition = value;
    this.posDepart = this.getPositionDepart(value);
  }

  get encherePosition(): string {
    return this._encherePosition;
  }

  private _enchere: number = 80;
  @Input() 
  set enchere(value: number) {
    this._enchere = value;
    this.enchereChange.emit(value);
  }
  get enchere(): number { return this._enchere; }
  @Output()
  public enchereChange = new EventEmitter<number>();

  @Input()
  private _couleur: string;
  @Input()
  set couleur(value: string) {
    this._couleur = value;
    this.couleurChange.emit(value);
  }
  get couleur(): string { return this._couleur; }
  @Output()
  public couleurChange = new EventEmitter<string>();
  
  @Output()
  public posDepart: { posX: string, posY: string } = { posX: '0px', posY: '0px' };

  @Input()
  public minEnchere: number = 80;
  @Input()
  public socket: any;

  @Output()
  public counter: number = 59;
  private interval: any;


  private _enchereId: number;
  @Input()
  set enchereId(value: number) {
    this._enchereId = value;
    if (this._enchereId == 1 || this._enchereId == 2)
      this.backgroundColor = 'lightskyblue';
    else
      this.backgroundColor = 'lightgreen'
  }
  get enchereId(): number { return this._enchereId; }
  @Input()
  public partieId: number;
  @Output()
  public backgroundColor: string;

  constructor() {

  }

  ngOnInit(): void {
  }

  public onValidate() {
    this.socket.emit("validateEnchere", { enchere: this.enchere, couleur: this.couleur, enchereId: this.enchereId, partieId: this.partieId });
    this.couleur = '';
    this.encherePosition = UtilsHelper.nextPosition(this.encherePosition);
    this.enchereId = UtilsHelper.nextPlayer(this.enchereId);
    clearInterval(this.interval);
  }

  public onPasser() {
    this.socket.emit("validateEnchere", { enchere: 0, couleur: '', enchereId: this.enchereId, partieId: this.partieId });
    this.couleur = '';
    this.encherePosition = UtilsHelper.nextPosition(this.encherePosition);
    this.enchereId = UtilsHelper.nextPlayer(this.enchereId);
    clearInterval(this.interval);
  }

  public getPositionDepart(position: string) {
    var posDepart: { posX: string, posY: string } = { posX: '', posY: '' };
    switch (position) {
      case "sud":
        posDepart.posX = "calc(50% - 200px)";
        posDepart.posY = (window.innerHeight * 0.75) - 150 + 'px';
        break;
      case "nord":
        posDepart.posX = "calc(50% - 200px)";
        posDepart.posY = (window.innerHeight * 0.25) + 'px';
        break;
      case "ouest":
        posDepart.posX = (window.innerWidth * 0.20) - 100 + 'px';
        posDepart.posY = "calc(50% - 150px)";
        break;
      case "est":
        posDepart.posX = (window.innerWidth * 0.70) + 'px';
        posDepart.posY = "calc(50% - 150px)";
        break;
    }

    clearInterval(this.interval);
    this.counter = 59;
    var formModel = this;
    this.interval = setInterval(function () {
      if (formModel.counter == 0)
        clearInterval(formModel.interval);
      else
        formModel.counter--;
    }, 1000);

    return posDepart;
  }
}
