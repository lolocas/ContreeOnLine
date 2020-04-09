import { Component, ViewChild, ViewChildren, ElementRef, OnInit, QueryList, ViewContainerRef, Input, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import io from "socket.io-client";
import { CardComponent } from './card/card.component';
import { Participant, Partie, Mene, Contrat, MeneCard, LastMeneInfo } from './model';
import { Utils } from './Utils';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
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
  @Output()
  public partieId: number = 0;
  @Output()
  public selectPartieId: number = 0;
  @Output()
  public hasPartieId: boolean = false;
  @Output()
  public hasSelectPartieId: boolean = false;
  @Output()
  public isSpectateur: boolean = false;
  @Output()
  public infoParties: any[] = [];

  public currentPartie: Partie;
  private currentContrat: Contrat;
  private currentParticipant: Participant;
  public currentCards: string[];
  public currentCards2: any;
  public currentCards3: any;
  public currentCards4: any;
  private lastMene: Mene; //La dernière mène jouée entièrement
  public lastMeneInfo: Array<LastMeneInfo> = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()];

  public currentNom: string;
  public nom1: string;
  public nom2: string;
  public nom3: string;
  public nom4: string;
  public hasSpectateur: boolean;

  public equipeNom1: string;
  public equipeNom2: string;

  public currentId: number;
  public id2: number;
  public id3: number;
  public id4: number;
  public currentMenes: Mene[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
  }

  public ngOnInit() {
    //this.socket = io("http://localhost:3000");
    //this.socket = io("https://contreeonline.herokuapp.com/");
    this.socket = io(environment.socketIoUrl);
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['nom'] || params['admin']) {
        if (params['admin'])
          this.isAdmin = (params['admin'] == 'true');
        if (params['nom'])
          this.currentNom = params['nom'];
        if (params['partieId']) {
          this.partieId = Number(params['partieId']);
          this.hasPartieId = true;
          if (this.partieId > 0) {
            this.socket.emit('partieExists', { nom: this.currentNom, isAdmin: this.isAdmin, partieId: this.partieId });
          }
          else {
            this.hasPartieId = false;
            this.socket.emit('getAllPartie');
          }
        }
        else {
          this.hasPartieId = false;
          this.socket.emit('getAllPartie');
        }
      }
      else {
        this.hasPartieId = false;
        this.socket.emit('getAllPartie');
      }
    });
  }

  public positionneJoueur() {
    this.positionJoueur = "sud";
    this.canAnnulerCarte = false;
    //On démarre la mène
    if (this.currentContrat && this.currentContrat.menes[this.currentContrat.menes.length - 1].cards == undefined) {
      switch (this.currentParticipant.id) {
        case 1:
        default:
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
          default:
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

  public positionneCarte(cardPlayed: MeneCard) {
    var positionCard = "sud";
    var posX;
    var posY;
    switch (this.currentParticipant.id) {
      case 1:
      default:
        switch (cardPlayed.id) {
          case 1: positionCard = "sud"; break;
          case 2: positionCard = "nord"; break;
          case 3: positionCard = "ouest"; break;
          case 4: positionCard = "est"; break;
        }
        break;
      case 2:
        switch (cardPlayed.id) {
          case 1: positionCard = "nord"; break;
          case 2: positionCard = "sud"; break;
          case 3: positionCard = "est"; break;
          case 4: positionCard = "ouest"; break;
        }
        break;
      case 3:
        switch (cardPlayed.id) {
          case 1: positionCard = "est"; break;
          case 2: positionCard = "ouest"; break;
          case 3: positionCard = "sud"; break;
          case 4: positionCard = "nord"; break;
        }
        break;
      case 4:
        switch (cardPlayed.id) {
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
    var cardElt = document.getElementById(cardPlayed.value);
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
    this.socket.emit("annulerDerniereCarte", { value: value, id: this.currentParticipant.id, partieId : this.partieId });
  }

  public onResetPartie() {
    if (confirm('Confirmez-vous le reset de la partie ?')) {
      this.nom1 = '';
      this.nom2 = '';
      this.nom3 = '';
      this.nom4 = '';
      this.partanceId = 1;
      this.socket.emit("resetCurrentPartie", { nom: this.currentNom, isAdmin: this.isAdmin, partieId: this.partieId });
    }
  }

  public onResetContrat() {
    if (confirm('Confirmez-vous le reset du contrat ?')) {
      this.socket.emit("resetCurrentContrat", { partieId: this.partieId });
    }
  }

  public onNewContrat() {
    if (confirm('Confirmez-vous la création d\'un nouveau contrat ?')) {
      this.socket.emit("newContrat", { partieId: this.partieId });
    }
  }

  public onValidateEnchere() {
    this.socket.emit("validateEnchere", { enchere: this.enchere + this.couleur, partieId : this.partieId });
  }

  public onValidatePartance() {
    this.socket.emit("validatePartance", { id: Number(this.partanceId), partieId : this.partieId });
  }

  public onCreerPartie() {
    if (!this.currentNom) {
      alert("Veuillez renseigner un nom");
      return;
    }

    this.socket.emit("creerPartie", { nom: this.currentNom, isAdmin : true });
  }

  public onJoinPartie() {
    if (!this.currentNom) {
      alert("Veuillez renseigner un nom");
      return;
    }
    this.partieId = this.selectPartieId;
    this.socket.emit('addNom', { nom: this.currentNom, isAdmin: false, partieId: this.partieId });
    this.navigate();
  }

  public onSelectPartie(partieId) {
    this.selectPartieId = partieId;
    this.hasSelectPartieId = true;
  }

  public onDeletePartie(partieId) {
    if (confirm('Confirmez-vous la suppression de cette partie ?')) {
      this.socket.emit('deletePartie', { partieId: partieId });
    }
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

  private refreshDesk() {
    Utils.sleep(0).then(() => {
      if (this.isSpectateur)
        this.currentCards = this.currentContrat.cards[0];
      else
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
    });
  }

  private navigate() {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { nom: this.currentNom, partieId: this.partieId },
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  private fillLastMenInfo(lastMene: Mene) {
    this.lastMeneInfo = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()];
    this.lastMeneInfo[0] = new LastMeneInfo(0, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
    this.lastMeneInfo[1] = new LastMeneInfo(1, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
    this.lastMeneInfo[2] = new LastMeneInfo(2, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
    this.lastMeneInfo[3] = new LastMeneInfo(3, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
  }

  public ngAfterViewInit() {
    this.socket.on("onCreerPartie", partieId => {
      if (this.isAdmin && (this.partieId == 0 || this.partieId == null)) {
        this.partieId = partieId;

        this.navigate();
        this.socket.emit('joinRoom', this.partieId);
      }
    });

    this.socket.on("onPartieExists", value => {
      if (value.nom == this.currentNom && value.isAdmin == this.isAdmin && this.partieId == value.partieId) {
        if (value.partieExists) {
          this.socket.emit('joinRoom', this.partieId);
          this.socket.emit('addNom', { nom: this.currentNom, isAdmin: this.isAdmin, partieId: this.partieId });
        }
        else {
          this.partieId = null;
          this.navigate();
        }
      }
    })

    this.socket.on("onGetAllPartie", info => {
      this.infoParties = [];
      info.forEach(element => {
        var info = "Partie " + element.partieId + " créée par " + element.participants[0].nom + " le " + new Date(element.datePartie).toLocaleDateString() + " à " + new Date(element.datePartie).toLocaleTimeString();
        if (element.participants.length >= 2)
          info += " avec " + element.participants[1].nom;
        if (element.participants.length >= 3)
          info += ", " + element.participants[2].nom;
        if (element.participants.length >= 4)
          info += ", " + element.participants[3].nom;
        this.infoParties.push({ id: element.partieId, info: info });
      });
      if (this.infoParties.length == 1) {
        this.selectPartieId = this.infoParties[0].id;
        this.hasSelectPartieId = true;
      }
    })

    this.socket.on("onMoveCard", NewPos => {
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
        currentMene = this.currentContrat.menes[this.currentContrat.menes.length - 2];
        this.fillLastMenInfo(currentMene);
        this.currentMenes.push(currentMene);

        if (this.currentMenes.length == 8) { //Dernière carte du contrat on rajoute le 10 de der
          if (this.currentContrat.playerId == 1 || this.currentContrat.playerId == 2)
            this.currentMenes.push(new Mene(undefined, 10, 0));
          else
            this.currentMenes.push(new Mene(undefined, 0, 10));
        }

        Utils.sleep(2000).then(() => {
          //Suppression de toutes les cartes
          this.currentCards.splice(0, this.currentCards.length);
          this.currentCards2.splice(0, this.currentCards2.length);
          this.currentCards3.splice(0, this.currentCards3.length);
          this.currentCards4.splice(0, this.currentCards4.length);
          //Rafraichissement des cartes
          this.refreshDesk();
        });
      }
      this.positionneJoueur();
      var lastCard = currentMene.cards[currentMene.cards.length - 1];
      if (this.currentParticipant.id != lastCard.id) {
        this.positionneCarte(lastCard)
        var cardToDrop = this.cardList.toArray().find(item => item.value == lastCard.value);
        cardToDrop.setVisible();
      }
    });

    this.socket.on("onAddNom", currentPartie => {
      this.nom1 = this.currentNom;
      this.hasSpectateur = false;

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
          this.isSpectateur = true;
          this.nom1 = this.currentPartie.participants[0].nom;
        }
        else if (this.currentPartie.participants[this.currentPartie.participants.length - 1].isSpectateur) {
          this.hasSpectateur = true;
          alert("Le spectateur " + this.currentPartie.participants[this.currentPartie.participants.length - 1].nom + " se connecte");
        }
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
        if (this.currentPartie.participants.length>= 4) {
          this.equipeNom1 = this.currentPartie.participants[0].nom + ' ' + this.currentPartie.participants[1].nom;
          this.equipeNom2 = this.currentPartie.participants[2].nom + ' ' + this.currentPartie.participants[3].nom;
        }
      }
    });

    this.socket.on("onNewContrat", currentPartie => {

      this.currentCards = [];
      this.currentCards2 = [];
      this.currentCards3 = [];
      this.currentCards4 = [];

      this.currentMenes = [];
      this.lastMeneInfo = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()];
      this.partance = { posX: 0, posY: 0, couleur: '', valeur: "0" };
      this.couleur = '';
      this.enchere = 80;
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[this.currentPartie.contrats.length - 1];

      this.refreshDesk();

      this.positionnePartance();
      this.positionneJoueur();
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
