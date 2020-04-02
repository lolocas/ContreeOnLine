import { Component, ViewChild, ViewChildren, ElementRef, OnInit, QueryList, ViewContainerRef, Input, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import io from "socket.io-client";
import { CardComponent } from './card/card.component';
import { Participant, Partie, Mene, Contrat } from './model';
import { Utils } from './Utils';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    
  @ViewChild("cardTable")
  private cardTableCanvas: ElementRef;

  @ViewChildren(CardComponent)
  private cardList: QueryList<CardComponent>;

  @Input()
  public posDepart: { posX: string, posY: string } = { posX: '', posY: '' };
  @Output()
  public positionJoueur: string;
  @Input()
  public partance: { posX: number, posY: number, couleur: string, valeur: string } = { posX: 0, posY: 0, couleur: '', valeur: "0" };
  @Input()
  public enchere: number = 80;
  @Input()
  public couleur: string;
  @Input()
  public partanceId: number;
  @Input()
  public canAnnulerCarte: boolean;
  @Input()
  public isCardVisible: boolean;

  @Output()
  public socket: any;
  @Output()
  public isAdmin: boolean = false;

  public currentPartie: Partie;
  private currentContrat: Contrat;
  private currentParticipant: Participant;
  public currentCards: string[];
  public currentCards2: any;
  public currentCards3: any;
  public currentCards4: any;
  private lastMene: Mene; //La dernière mène jouée entièrement

  public currentNom: string;
  public nom2: string;
  public nom3: string;
  public nom4: string;

  public currentId: number;
  public id2: number;
  public id3: number;
  public id4: number;
  public currentMenes: Mene[] = [];

  constructor(private activatedRoute: ActivatedRoute) {
  }

  public ngOnInit() {

    environment.production
    //this.socket = io("http://localhost:3000");
    //this.socket = io("https://contreeonline.herokuapp.com/");
    this.socket = io(environment.socketIoUrl);
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

  public positionneJoueur() {
    this.positionJoueur = "";
    this.canAnnulerCarte = false;
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
              case 1: this.positionJoueur = "est"; this.canAnnulerCarte = true; break;
              case 2: this.positionJoueur = "ouest"; break;
              case 3: this.positionJoueur = "sud"; break;
              case 4: this.positionJoueur = "nord"; break;
            }
            break;
          case 2:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "ouest"; break;
              case 2: this.positionJoueur = "est"; this.canAnnulerCarte = true; break;
              case 3: this.positionJoueur = "nord"; break;
              case 4: this.positionJoueur = "sud"; break;
            }
            break;
          case 3:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "nord"; break;
              case 2: this.positionJoueur = "sud"; break;
              case 3: this.positionJoueur = "est"; this.canAnnulerCarte = true; break;
              case 4: this.positionJoueur = "ouest"; break;
            }
            break;
          case 4:
            switch (this.currentContrat.playerId) {
              case 1: this.positionJoueur = "sud"; break;
              case 2: this.positionJoueur = "nord"; break;
              case 3: this.positionJoueur = "ouest"; break;
              case 4: this.positionJoueur = "est"; this.canAnnulerCarte = true; break;
            }
            break;
        }
      }
    }
    this.posDepart.posX = '';
    this.posDepart.posY = '';
    switch (this.positionJoueur) {
      case "sud":
        this.posDepart.posX = "calc(50% - 164px)";
        this.posDepart.posY = (window.innerHeight * 0.75) - 150 + 'px';
        break;
      case "nord":
        this.posDepart.posX = "calc(50% - 164px)";
        this.posDepart.posY = (window.innerHeight * 0.25) + 'px';
        break;
      case "ouest":
        this.posDepart.posX = (window.innerWidth * 0.20) - 100 + 'px';
        this.posDepart.posY = "calc(50% - 46px)";
        break;
      case "est":
        this.posDepart.posX = (window.innerWidth * 0.70) + 'px';
        this.posDepart.posY = "calc(50% - 46px)";
        break;
    }
  }

  public positionneCarte(value:string) {
    var positionCard = "sud";
    var posX;
    var posY;
    switch (this.currentParticipant.id) {
      case 1:
      default:
        switch (this.currentContrat.playerId) {
          case 1: positionCard = "sud"; break;
          case 2: positionCard = "nord"; break;
          case 3: positionCard = "ouest"; break;
          case 4: positionCard = "est"; break;
        }
        break;
      case 2:
        switch (this.currentContrat.playerId) {
          case 1: positionCard = "nord"; break;
          case 2: positionCard = "sud"; break;
          case 3: positionCard = "est"; break;
          case 4: positionCard = "ouest"; break;
        }
        break;
      case 3:
        switch (this.currentContrat.playerId) {
          case 1: positionCard = "est"; break;
          case 2: positionCard = "ouest"; break;
          case 3: positionCard = "sud"; break;
          case 4: positionCard = "nord"; break;
        }
        break;
      case 4:
        switch (this.currentContrat.playerId) {
          case 1: positionCard = "ouest"; break;
          case 2: positionCard = "est"; break;
          case 3: positionCard = "nord"; break;
          case 4: positionCard = "sud"; break;
        }
        break;
    }

    //Position à atteindre
    posX = 0;
    posY = 0;
    switch (positionCard) {
      case "sud":
        posX = (window.innerWidth / 2);
        posY = (window.innerHeight * 0.75) - 300;
        break;
      case "nord":
        posX = (window.innerWidth / 2) - 150;
        posY = (window.innerHeight * 0.25);
        break;
      case "ouest":
        posX = (window.innerWidth * 0.20) - 100;
        posY = (window.innerHeight / 2) - 50;
        break;
      case "est":
        posX = (window.innerWidth * 0.70);
        posY = (window.innerHeight / 2) - 50;
        break;
    }
    var cardElt = document.getElementById(value);
    var cardStyle = window.getComputedStyle(cardElt);

    var transformValue = new WebKitCSSMatrix(cardStyle.transform);

    var rect = cardElt.getBoundingClientRect();

    //Position actuelle en absolue
    var posAbsX = rect.x;
    var posAbsY = rect.y;

    //Différence entre la position actuelle et la position à atteindre
    var transX = transformValue.e - (posAbsX - posX);
    var transY = transformValue.f - (posAbsY - posY);

    cardElt.style.transform = "translate3d(" + Math.trunc(transX) + "px, " + Math.trunc(transY) + "px, 0px)";
  }

  public positionnePartance() {
    var positionPartance: string;
    switch (this.currentParticipant.id) {
      case 1:
      default:
        switch (this.currentContrat.partanceId) {
          case 1: positionPartance = "sud"; break;
          case 2: positionPartance = "nord"; break;
          case 3: positionPartance = "ouest"; break;
          case 4: positionPartance = "est"; break;
        }
        break;
      case 2:
        switch (this.currentContrat.partanceId) {
          case 1: positionPartance = "nord"; break;
          case 2: positionPartance = "sud"; break;
          case 3: positionPartance = "est"; break;
          case 4: positionPartance = "ouest"; break;
        }
        break;
      case 3:
        switch (this.currentContrat.partanceId) {
          case 1: positionPartance = "est"; break;
          case 2: positionPartance = "ouest"; break;
          case 3: positionPartance = "sud"; break;
          case 4: positionPartance = "nord"; break;
        }
        break;
      case 4:
        switch (this.currentContrat.partanceId) {
          case 1: positionPartance = "ouest"; break;
          case 2: positionPartance = "est"; break;
          case 3: positionPartance = "nord"; break;
          case 4: positionPartance = "sud"; break;
        }
        break;
    }
    switch (positionPartance) {
      case "sud":
        this.partance.posX = (window.innerWidth * 0.25) - 100;
        this.partance.posY = (window.innerHeight * 0.75) - 150;
        break;
      case "nord":
        this.partance.posX = (window.innerWidth * 0.75) - 300;
        this.partance.posY = (window.innerHeight * 0.25);
        break;
      case "ouest":
        this.partance.posX = (window.innerWidth * 0.20) - 100;
        this.partance.posY = (window.innerHeight * 0.5) - 200;
        break;
      case "est":
        this.partance.posX = (window.innerWidth * 0.70);
        this.partance.posY = (window.innerHeight * 0.5) + 50;
        break;
    }
    this.partance.valeur = this.currentContrat.value.substr(0, this.currentContrat.value.length - 1);
    var couleur = this.currentContrat.value[this.currentContrat.value.length - 1];
  switch (couleur) {
    case "H":
      this.partance.couleur = "coeur";
      break;
    case "S":
      this.partance.couleur = "pique";
      break;
    case "C":
      this.partance.couleur = "trefle";
      break;
    case "D":
      this.partance.couleur = "carreau";
      break;
  }
}

  public getTotal1() {
    var total = 0;
    this.currentMenes.forEach(item => {
      total += item.total1;
    });
    return total;
  }

  public getTotal2() {
    var total = 0;
    this.currentMenes.forEach(item => {
      total += item.total2;
    });
    return total;
  }

  public onAnnulerCarte() {
    var currentMene = this.currentContrat.menes[this.currentContrat.menes.length - 1];
    var value = currentMene.cards[currentMene.cards.length - 1].value;
    this.socket.emit("annulerDerniereCarte", { value: value, id: this.currentParticipant.id });
  }

  public onResetPartie() {
    if (confirm('Confirmez-vous le reset de la partie ?')) {
      this.nom2 = '';
      this.nom3 = '';
      this.nom4 = '';
      this.partanceId = 1;
      this.socket.emit("resetCurrentPartie", { nom: this.currentNom, isAdmin: this.isAdmin });
    }
  }

  public onResetContrat() {
    if (confirm('Confirmez-vous le reset du contrat ?')) {
      this.socket.emit("resetCurrentContrat");
    }
  }

  public onNewContrat() {
    if (confirm('Confirmez-vous la création d\'un nouveau contrat ?')) {
      this.socket.emit("newContrat");
    }
  }

  public onValidateEnchere() {
    this.socket.emit("validateEnchere", { enchere: this.enchere + this.couleur });
  }

  public onValidatePartance() {
    this.socket.emit("validatePartance", { id: Number(this.partanceId) });
  }

  public rotationCard(index: number, position: string): any {
    if (position == "sud") {
      index = index + Math.trunc((8 - this.currentCards.length) / 2);
      if (index == 0)
        return { transform: 'rotate(-12deg) translate3d(70px, 28px, 0px)' };
      if (index == 1)
        return { transform: 'rotate(-9deg) translate3d(50px, 5px, 0px)' };
      if (index == 2)
        return { transform: 'rotate(-6deg) translate3d(30px, -10px, 0px)' };
      if (index == 3)
        return { transform: 'rotate(-3deg) translate3d(10px, -20px, 0px)' };
      if (index == 4)
        return { transform: 'rotate(3deg) translate3d(-10px, -20px, 0px)' };
      if (index == 5)
        return { transform: 'rotate(6deg) translate3d(-30px, -10px, 0px)' };
      if (index == 6)
        return { transform: 'rotate(9deg) translate3d(-50px, 5px, 0px)' };
      if (index == 7)
        return { transform: 'rotate(12deg) translate3d(-70px, 28px, 0px)' };
    }
    else if (position == "nord") {
      index = index + Math.trunc((8 - this.currentCards2.length) / 2);
      if (index == 0)
        return { transform: 'rotate(12deg) translate3d(70px, -28px, 0px)' };
      if (index == 1)
        return { transform: 'rotate(9deg) translate3d(50px, -5px, 0px)' };
      if (index == 2)
        return { transform: 'rotate(6deg) translate3d(30px, 10px, 0px)' };
      if (index == 3)
        return { transform: 'rotate(3deg) translate3d(10px, 20px, 0px)' };
      if (index == 4)
        return { transform: 'rotate(-3deg) translate3d(-10px, 20px, 0px)' };
      if (index == 5)
        return { transform: 'rotate(-6deg) translate3d(-30px, 10px, 0px)' };
      if (index == 6)
        return { transform: 'rotate(-9deg) translate3d(-50px, -5px, 0px)' };
      if (index == 7)
        return { transform: 'rotate(-12deg) translate3d(-70px, -28px, 0px)' };
    }
  }

  public cardValueToImage(cardNumber: number): string {
    if (this.lastMene && this.lastMene.cards && this.lastMene.cards.length == 4)
      return Utils.cardValueToImage(this.lastMene.cards[cardNumber].value, '');
    
    return '../assets/pi.png';
  }

  public cardValueToName(cardNumber: number): string {
    if (this.lastMene && this.lastMene.cards && this.lastMene.cards.length == 4)
      return this.currentPartie.participants.find(item => item.id == this.lastMene.cards[cardNumber].id).nom;
    return '';
  }

  private refreshDesk() {
    this.currentCards = this.currentContrat.cards[this.currentParticipant.id - 1];
    switch (this.currentParticipant.id) {
      case 1:
      default:
        this.currentCards2 = this.currentContrat.cards[1];
        this.currentCards3 = this.currentContrat.cards[2];
        this.currentCards4 = this.currentContrat.cards[3];
        break;
      case 2:
        this.currentCards2 = this.currentContrat.cards[0];
        this.currentCards3 = this.currentContrat.cards[3];
        this.currentCards4 = this.currentContrat.cards[2];
        break;
      case 3:
        this.currentCards2 = this.currentContrat.cards[3];
        this.currentCards3 = this.currentContrat.cards[1];
        this.currentCards4 = this.currentContrat.cards[0];
        break;
      case 4:
        this.currentCards2 = this.currentContrat.cards[2];
        this.currentCards3 = this.currentContrat.cards[0];
        this.currentCards4 = this.currentContrat.cards[1];
        break;
    }
  }

  public ngAfterViewInit() {
    this.socket.on("positionCard", NewPos => {
      var cardToMove = this.cardList.toArray().find(item => item.value == NewPos.value);
      var posX: number;
      var posY: number;
      if (NewPos.id == 1) {
        if (this.currentId == 2) {
          posX = NewPos.left * window.innerWidth;
          posY = -NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 3) {
          posX = NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId == 4) {
          posX = -NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId > 4) {
          posX = NewPos.left * window.innerWidth;
          posY = NewPos.top * window.innerHeight;
        }
      }
      else if (NewPos.id == 2) {
        if (this.currentId == 1 || this.currentId > 4) {
          posX = NewPos.left * window.innerWidth;
          posY = -NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 3) {
          posX = -NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId == 4) {
          posX = NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
      }
      else if (NewPos.id == 3) {
        if (this.currentId == 1 || this.currentId > 4) {
          posX = -NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId == 2) {
          posX = NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId == 4) {
          posX = NewPos.left * window.innerWidth;
          posY = -NewPos.top * window.innerHeight;
        }
      }
      else if (NewPos.id == 4) {
        if (this.currentId == 1 || this.currentId > 4) {
          posX = NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId == 2) {
          posX = -NewPos.top * window.innerHeight;
          posY = NewPos.left * window.innerWidth;
        }
        else if (this.currentId == 3) {
          posX = NewPos.left * window.innerWidth;
          posY = -NewPos.top * window.innerHeight;
        }
      }
      cardToMove.changePosition(posX, posY);
    });

    this.socket.on("cardPlayed", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[currentPartie.contrats.length - 1];
      var currentMene = this.currentContrat.menes[this.currentContrat.menes.length - 1];

      //Dernière carte de la mène
      if (currentMene.cards == undefined) {
        this.lastMene = this.currentContrat.menes[this.currentContrat.menes.length - 2];
        var currentMene = this.lastMene;
        this.currentMenes.push(currentMene);

        if (this.currentMenes.length == 8) { //Dernière carte du contrat on rajoute le 10 de der
          if (this.currentContrat.playerId == 1 || this.currentContrat.playerId == 2)
            this.currentMenes.push(new Mene(undefined, 10, 0));
          else
            this.currentMenes.push(new Mene(undefined, 0, 10));
        }

        Utils.sleep(1500).then(() => {
          //Suppression des cartes sur le tapis
          //for (var intTour = 0; intTour < this.currentPartie.nbTour; intTour++) {
          //  if (this.currentCards && this.currentCards.indexOf(currentMene.cards[intTour].value) >= 0)
          //    this.currentCards.splice(this.currentCards.indexOf(currentMene.cards[intTour].value), 1);
          //  if (this.currentCards2 && this.currentCards2.indexOf(currentMene.cards[intTour].value) >= 0)
          //    this.currentCards2.splice(this.currentCards2.indexOf(currentMene.cards[intTour].value), 1);
          //  if (this.currentCards3 && this.currentCards3.indexOf(currentMene.cards[intTour].value) >= 0)
          //    this.currentCards3.splice(this.currentCards3.indexOf(currentMene.cards[intTour].value), 1);
          //  if (this.currentCards4 && this.currentCards4.indexOf(currentMene.cards[intTour].value) >= 0)
          //    this.currentCards4.splice(this.currentCards4.indexOf(currentMene.cards[intTour].value), 1);
          //}
            this.currentCards.splice(0, this.currentCards.length);
            this.currentCards2.splice(0, this.currentCards2.length);
            this.currentCards3.splice(0, this.currentCards3.length);
            this.currentCards4.splice(0, this.currentCards4.length);
          //Rafraichissement des cartes
          Utils.sleep(0).then(() => {
            this.refreshDesk();
          });
        });
      }
      this.positionneJoueur();

      if (this.currentParticipant.id != this.currentContrat.playerId) {
        this.positionneCarte(currentMene.cards[currentMene.cards.length - 1].value)
        var cardToDrop = this.cardList.toArray().find(item => item.value == currentMene.cards[currentMene.cards.length - 1].value);
        cardToDrop.setVisible();
      }
    });

    this.socket.on("addNom", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[currentPartie.contrats.length - 1];

      //Participant courant
      this.currentParticipant = this.currentPartie.participants.find(item => item.nom == this.currentNom);
      if (this.currentParticipant) {
        this.currentCards = this.currentPartie.contrats[this.currentPartie.contrats.length - 1].cards[this.currentParticipant.id - 1];
        this.currentId = this.currentParticipant.id;
      }
      this.positionneJoueur();

      var index2: number = 0;
      var index3: number = 0;
      var index4: number = 0;

      if (this.currentParticipant) {
        switch (this.currentParticipant.id) {
          case 1:
            index2 = 1;
            index3 = 2;
            index4 = 3;
            break;
          case 2:
            index2 = 0;
            index3 = 3;
            index4 = 2;
            break;
          case 3:
            index2 = 3;
            index3 = 1;
            index4 = 0;
            break;
          case 4:
            index2 = 2;
            index3 = 0;
            index4 = 1;
            break;          
        }
        //Spectateur
        if (this.currentParticipant.id > 4) {
          this.currentCards = this.currentContrat.cards[0];
          index2 = 1;
          index3 = 2;
          index4 = 3;
          this.isCardVisible = true;
        }
        else if (this.currentPartie.participants.length > 4)
          alert("Le spectateur " + this.currentPartie.participants[this.currentPartie.participants.length - 1].nom + " se connecte");

        if (this.currentPartie.participants.length > index2) {
          this.currentCards2 = this.currentContrat.cards[index2];
          this.nom2 = this.currentPartie.participants[index2].nom;
          this.id2 = this.currentPartie.participants[index2].id;
        }
        if (this.currentPartie.participants.length > index3) {
          this.currentCards3 = this.currentContrat.cards[index3];
          this.nom3 = this.currentPartie.participants[index3].nom;
          this.id3 = this.currentPartie.participants[index3].id;
        }
        if (this.currentPartie.participants.length > index4) {
          this.currentCards4 = this.currentContrat.cards[index4];
          this.nom4 = this.currentPartie.participants[index4].nom;
          this.id4 = this.currentPartie.participants[index4].id;
        }
      }
    });

    this.socket.on("onNewContrat", currentPartie => {

      this.currentCards = [];
      this.currentCards2 = [];
      this.currentCards3 = [];
      this.currentCards4 = [];

      this.currentMenes = [];
      this.lastMene = null;
      this.partance = { posX: 0, posY: 0, couleur: '', valeur: "0" };
      this.couleur = '';
      this.enchere = 80;
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[this.currentPartie.contrats.length - 1];

      Utils.sleep(500).then(() => {        
        this.refreshDesk();

        this.positionnePartance();
        this.positionneJoueur();
      });
    });

    this.socket.on("onEnchereValidate", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[this.currentPartie.contrats.length - 1]
      this.positionnePartance();
      this.positionneJoueur();
    });

    this.socket.on("onAnnulerDerniereCarte", infoDerniereCarte => {
      this.currentPartie = infoDerniereCarte.currentPartie;
      this.currentContrat = this.currentPartie.contrats[infoDerniereCarte.currentPartie.contrats.length - 1];
      var cardToMove = this.cardList.toArray().find(item => item.value == infoDerniereCarte.value.value);
      cardToMove.changePosition(0, 0);
      this.positionneJoueur();
      if (infoDerniereCarte.value.id != this.currentParticipant.id) {
        cardToMove.setInVisible();
      }
    })
  }
}
