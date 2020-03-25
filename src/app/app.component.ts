import { Component, ViewChild, ViewChildren, ElementRef, OnInit, QueryList, ViewContainerRef, Input, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import io from "socket.io-client";
import { CardComponent } from './card/card.component';
import { Participant, Partie, Mene, Contrat } from './model';
import { Utils } from './Utils';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    
  @ViewChild("cardTable")
  private cardTableCanvas: ElementRef;

  @ViewChild('viewContainerRef', { read: ViewContainerRef })
  private VCR: ViewContainerRef;

  @ViewChildren(CardComponent)
  private cardList: QueryList<CardComponent>;

  @Input()
  public posDepart: { posX: number, posY: number } = { posX: 0, posY: 0 };
  @Output()
  public positionJoueur: string;

  private ctxCardTable: CanvasRenderingContext2D;
  public socket: any;
  private isAdmin: boolean = false;
  public currentNom: string;

  public currentPartie: Partie;
  private currentContrat: Contrat;
  private currentParticipant: Participant;
  public currentCards: string[];
  public currentCards2: any;
  public currentCards3: any;
  public currentCards4: any;
  public nom2: string;
  public nom3: string;
  public nom4: string;
  public currentMenes: Mene[] = [];

  constructor(private activatedRoute: ActivatedRoute) {
  }

  public ngOnInit() {
    this.socket = io("http://localhost:3000");
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['nom']) {
        if (params['admin'])
          this.isAdmin = (params['admin'] == 'true');
        if (params['nom'])
          this.currentNom = params['nom'];
        this.socket.emit('addNom', { nom: this.currentNom, isAdmin: this.isAdmin });
      }
    });
  }

  paint(ctx, img) {

    ctx.drawImage(img, 0, 0, 640, 480);

    setTimeout(() => {
      this.paint(ctx, img);
    }, 300);
  }

  public PositionneJoueur() {
    this.positionJoueur = "sud";
    //On démarre la mène
    if (this.currentContrat && this.currentContrat.menes[this.currentContrat.menes.length - 1].cards == undefined) {
      switch (this.currentParticipant.id) {
        case 1:
          switch (this.currentContrat.playerId) {
            case 1: this.positionJoueur = "sud"; break;
            case 2: this.positionJoueur = "nord"; break;
            case 3: this.positionJoueur = "ouest"; break;
            case 4: this.positionJoueur = "est"; break;
          }
          break;
        case 2:
          switch (this.currentContrat.playerId) {
            case 1: this.positionJoueur = "nord"; break;
            case 2: this.positionJoueur = "sud"; break;
            case 3: this.positionJoueur = "est"; break;
            case 4: this.positionJoueur = "ouest"; break;
          }
          break;
        case 3:
          switch (this.currentContrat.playerId) {
            case 1: this.positionJoueur = "est"; break;
            case 2: this.positionJoueur = "ouest"; break;
            case 3: this.positionJoueur = "sud"; break;
            case 4: this.positionJoueur = "nord"; break;
          }
          break;
        case 4:
          switch (this.currentContrat.playerId) {
            case 1: this.positionJoueur = "ouest"; break;
            case 2: this.positionJoueur = "est"; break;
            case 3: this.positionJoueur = "nord"; break;
            case 4: this.positionJoueur = "sud"; break;
          }
          break;
      }
    }
    else {
      if (this.currentContrat && this.currentParticipant) {
        switch (this.currentParticipant.id) {
          case 1:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "est"; break;
              case 2: this.positionJoueur = "ouest"; break;
              case 3: this.positionJoueur = "sud"; break;
              case 4: this.positionJoueur = "nord"; break;
            }
            break;
          case 2:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "ouest"; break;
              case 2: this.positionJoueur = "est"; break;
              case 3: this.positionJoueur = "nord"; break;
              case 4: this.positionJoueur = "sud"; break;
            }
            break;
          case 3:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "nord"; break;
              case 2: this.positionJoueur = "sud"; break;
              case 3: this.positionJoueur = "est"; break;
              case 4: this.positionJoueur = "ouest"; break;
            }
            break;
          case 4:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "sud"; break;
              case 2: this.positionJoueur = "nord"; break;
              case 3: this.positionJoueur = "ouest"; break;
              case 4: this.positionJoueur = "est"; break;
            }
            break;
        }
      }
    }
    if (this.ctxCardTable) {
    this.posDepart.posX = 0;
    this.posDepart.posY = 0;
      switch (this.positionJoueur) {
        case "sud":
          this.posDepart.posX = this.ctxCardTable.canvas.offsetLeft + (this.ctxCardTable.canvas.width / 2);
          this.posDepart.posY = this.ctxCardTable.canvas.offsetTop + this.ctxCardTable.canvas.height;
          break;
        case "nord":
          this.posDepart.posX = this.ctxCardTable.canvas.offsetLeft + (this.ctxCardTable.canvas.width / 2);
          this.posDepart.posY = this.ctxCardTable.canvas.offsetTop;
          break;
        case "ouest":
          this.posDepart.posX = this.ctxCardTable.canvas.offsetLeft;
          this.posDepart.posY = this.ctxCardTable.canvas.offsetTop + (this.ctxCardTable.canvas.height / 2);
          break;
        case "est":
          this.posDepart.posX = this.ctxCardTable.canvas.offsetLeft + this.ctxCardTable.canvas.width;
          this.posDepart.posY = this.ctxCardTable.canvas.offsetTop + (this.ctxCardTable.canvas.height / 2);
          break;
      }
    }
  }

  public ngAfterViewInit() {
    this.socket.on("positionCard", NewPos => {
      var cardToMove = this.cardList.toArray().find(item => item.value == NewPos.value);

      var posX = (NewPos.left * window.innerWidth);
      var posY = -NewPos.top * window.innerHeight;
      cardToMove.changePosition(posX, posY);

    });

    this.socket.on("cardPlayed", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[currentPartie.contrats.length - 1];
      this.PositionneJoueur();
      //Dernière carte de la mène
      if (this.currentContrat.menes[this.currentContrat.menes.length - 1].cards == undefined) {
        var lastMene = this.currentContrat.menes[this.currentContrat.menes.length - 2];
        Utils.calculMene(this.currentContrat, lastMene);
        this.currentMenes.push(lastMene);
        Utils.sleep(2000).then(() => {
          for (var intTour = 0; intTour < this.currentPartie.nbTour; intTour++) {
            if (this.currentCards && this.currentCards.indexOf(lastMene.cards[intTour].value) >= 0)
              this.currentCards.splice(this.currentCards.indexOf(lastMene.cards[intTour].value), 1);
            if (this.currentCards2 && this.currentCards2.indexOf(lastMene.cards[intTour].value) >= 0)
              this.currentCards2.splice(this.currentCards2.indexOf(lastMene.cards[intTour].value), 1);
            if (this.currentCards3 && this.currentCards3.indexOf(lastMene.cards[intTour].value) >= 0)
              this.currentCards3.splice(this.currentCards3.indexOf(lastMene.cards[intTour].value), 1);
            if (this.currentCards4 && this.currentCards4.indexOf(lastMene.cards[intTour].value) >= 0)
              this.currentCards4.splice(this.currentCards4.indexOf(lastMene.cards[intTour].value), 1);
          }
        });
      }


    });

    this.socket.on("addNom", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[currentPartie.contrats.length - 1];

      //Participant courant
      this.currentParticipant = this.currentPartie.participants.find(item => item.nom == this.currentNom);
      if (this.currentParticipant)
        this.currentCards = this.currentPartie.contrats[this.currentPartie.contrats.length - 1].cards[this.currentParticipant.id - 1];

      this.PositionneJoueur();

      //Dernier connecté
      var currentConnected:Participant = this.currentPartie.participants[this.currentPartie.participants.length - 1];
      var currentConnectedContrat = this.currentPartie.contrats[this.currentPartie.contrats.length - 1];
      var currentConnectedCards = currentConnectedContrat.cards[currentConnected.id - 1];

      if (this.currentParticipant) {
        //Le deuxième participant se connecte
        if ((currentConnected.id == 2)) {
          //On affiche pour le premier
          if (this.currentParticipant.id == 1) {
            this.nom2 = currentConnected.nom;
            this.currentCards2 = currentConnectedCards;
          }
          else {
            //on affiche les cartes du premier participant
            this.nom2 = this.currentPartie.participants.find(item => item.id == 1).nom;
            this.currentCards2 = currentConnectedContrat.cards[0];
          }
        }
        //Le troisième participant se connecte
        else if ((currentConnected.id == 3)) {
          //on affiche les cartes au premier et deuxième participant
          if (this.currentParticipant.id == 1) {
            this.nom3 = currentConnected.nom;
            this.currentCards3 = currentConnectedCards;
          }
          else if (this.currentParticipant.id == 2) {
            this.nom4 = currentConnected.nom;
            this.currentCards4 = currentConnectedCards;
          }
          else {
            //on affiche les cartes du premier et deuxième participant
            this.nom3 = this.currentPartie.participants.find(item => item.id == 2).nom;
            this.currentCards3 = currentConnectedContrat.cards[1];
            this.nom4 = this.currentPartie.participants.find(item => item.id == 1).nom;
            this.currentCards4 = currentConnectedContrat.cards[0];
          }
        }
        //Le quatrième participant se connecte
        else if ((currentConnected.id == 4)) {
          //on affiche les cartes au premier et deuxième participant
          if (this.currentParticipant.id == 1) {
            this.nom4 = currentConnected.nom;
            this.currentCards4 = currentConnectedCards;
          }
          else if (this.currentParticipant.id == 2) {
            this.nom3 = currentConnected.nom;
            this.currentCards3 = currentConnectedCards;
          }
          //on affiche les cartes au troisième
          else if (this.currentParticipant.id == 3) {
            this.nom2 = currentConnected.nom;
            this.currentCards2 = currentConnectedCards;
          }
          else {
            //on affiche les cartes du premier, deuxième et troisième participant
            this.nom3 = this.currentPartie.participants.find(item => item.id == 1).nom;
            this.currentCards3 = currentConnectedContrat.cards[0];
            this.nom4 = this.currentPartie.participants.find(item => item.id == 2).nom;
            this.currentCards4 = currentConnectedContrat.cards[1];
            this.nom2 = this.currentPartie.participants.find(item => item.id == 3).nom;
            this.currentCards2 = currentConnectedContrat.cards[2];
          }
        }
      }
    });

    this.ctxCardTable = this.cardTableCanvas.nativeElement.getContext("2d");
    var img = new Image();
    img.src = '../assets/Card_Table.png';
    this.paint(this.ctxCardTable, img);

   
  }
}
