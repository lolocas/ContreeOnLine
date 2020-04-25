import { Component, ViewChild, ViewChildren, ElementRef, OnInit, QueryList, ViewContainerRef, Input, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import io from "socket.io-client";
import { CardComponent } from './card/card.component';
import { Participant, Partie, Mene, Contrat, MeneCard, LastMeneInfo, EnchereInfo, InfoPartie } from './model';
import { UtilsHelper } from './UtilsHelper';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';
declare function getMediaElement(video: any, options:any);
declare function conference(config: any): any;
declare function getUserMedia(options);

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
  @Output()
  public positionPartance: string;
  @Input()
  public partance: { posX: number, posY: number, value: string, couleur: string, suit: string } = { posX: 0, posY: 0, value: '', couleur: '', suit: '' };

  @Input()
  @Output()
  public enchere: number = 80;
  @Output()
  public minEnchere: number = 80;
  @Output()
  public encherePosition: string;
  @Output()
  public enchereId: number;
  @Output()
  public bestEnchereId: number;
  @Output()
  public isEnchereVisible: boolean;
  @Output()
  public canAnnulerEnchere: boolean;
  @Output()
  public isSansEnchere: boolean = false;
  @Output()
  public canPlayCard: boolean = true;

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
  public isConnected: boolean = false;
  @Output()
  public isReconnected: boolean = true;
  @Output()
  public isAdmin: boolean = false;
  @Output()
  public isWebcam: boolean = false;
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
  @Output()
  public hasSpectateur: boolean;
  @Output()
  public counter: number = 59;
  private interval: any;

  public currentPartie: Partie;
  private currentContrat: Contrat;
  private currentParticipant: Participant;
  public currentCards: string[];
  public currentCards2: any;
  public currentCards3: any;
  public currentCards4: any;
  public lastMeneInfo: Array<LastMeneInfo> = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()]; //La dernière mène jouée entièrement

  public currentNom: string;
  public nom1: string;
  public nom2: string;
  public nom3: string;
  public nom4: string;
  public ListeSpectateur: string[] = [];

  public equipeNom1: string;
  public equipeNom2: string;
  public classEquipe1: string;
  public classEquipe2: string;

  public currentId: number;
  public id2: number;
  public id3: number;
  public id4: number;
  public currentMenes: Mene[] = [];
  public currentEncheres: EnchereInfo[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private titleService: Title) {
  }

  public ngOnInit() {
    //this.socket = io("http://localhost:3000");
    //this.socket = io("https://contreeonline.herokuapp.com/");
    this.socket = io(environment.socketIoUrl);
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['nom'] || params['admin']) {
        if (params['admin'])
          this.isAdmin = (params['admin'] == 'true');
        if (params['webcam'])
          this.isWebcam = (params['webcam'] == 'true');
        if (params['nom']) {
          this.currentNom = params['nom'];
          this.titleService.setTitle("ContreeOnLine - " + this.currentNom);
        }
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

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.isReconnected = false;
      console.log("Connexion");
    });
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.isReconnected = false;
      this.infoParties = [];
      this.hasSelectPartieId = false;
      this.hasPartieId = false;
      console.log("Déconnexion");
    });
    this.socket.on('reconnect', () => {
      console.log("Reconnexion");
      this.isReconnected = true;
      if (this.partieId > 0)
        this.socket.emit('joinRoom', this.partieId);
    })
  }

  public positionneJoueur() {
    this.positionJoueur = "sud";
    this.canAnnulerCarte = false;
    //On démarre la mène
    if (this.currentParticipant && this.currentContrat && this.currentContrat.menes[this.currentContrat.menes.length - 1].cards == undefined) {
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
        if (this.positionJoueur == "est")
          this.canAnnulerCarte = true;
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

  //Positionne la partance et met l'enchere dessus
  public positionnePartance(currentId: number, partanceId: number, enchere: number = 0, couleur?: string) {
    this.partance = { posX: 0, posY: 0, value: '', couleur: '', suit : '' };
    switch (currentId) {
      case 1:
      default:
        switch (partanceId) {
          case 1: this.positionPartance = "sud"; break;
          case 2: this.positionPartance = "nord"; break;
          case 3: this.positionPartance = "ouest"; break;
          case 4: this.positionPartance = "est"; break;
        }
        break;
      case 2:
        switch (partanceId) {
          case 1: this.positionPartance = "nord"; break;
          case 2: this.positionPartance = "sud"; break;
          case 3: this.positionPartance = "est"; break;
          case 4: this.positionPartance = "ouest"; break;
        }
        break;
      case 3:
        switch (partanceId) {
          case 1: this.positionPartance = "est"; break;
          case 2: this.positionPartance = "ouest"; break;
          case 3: this.positionPartance = "sud"; break;
          case 4: this.positionPartance = "nord"; break;
        }
        break;
      case 4:
        switch (partanceId) {
          case 1: this.positionPartance = "ouest"; break;
          case 2: this.positionPartance = "est"; break;
          case 3: this.positionPartance = "nord"; break;
          case 4: this.positionPartance = "sud"; break;
        }
        break;
    }
    switch (this.positionPartance) {
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

    if (enchere > 0)
      this.partance.value = enchere.toString();
    this.partance.suit = couleur;
    this.partance.couleur = UtilsHelper.couleurToValue(couleur);
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

  public onAnnulerEnchere() {
    this.socket.emit("annulerDerniereEnchere", {  partieId: this.partieId });
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

  public onResetMene() {
    if (confirm('Confirmez-vous le reset de la mène ?')) {
      this.socket.emit("resetMene", { partieId: this.partieId });
    }
  }

  public onNewContrat() {
    if (confirm('Confirmez-vous la création d\'un nouveau contrat ?')) {
      this.socket.emit("newContrat", { partieId: this.partieId });
    }
  }

  public onValidateEnchere() {
    this.socket.emit("validateEnchere", { enchere: this.enchere, couleur: this.couleur, enchereId: 0, partieId: this.partieId });
  }

  public onValidatePartance() {
    this.socket.emit("validatePartance", { id: Number(this.partanceId), partieId : this.partieId });
  }

  public onValidateSansEnchere() {
    this.socket.emit("validateSansEnchere", { isSansEnchere: this.isSansEnchere, partieId: this.partieId });
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
    this.hasPartieId = true;
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

  private refreshDeck() {
    UtilsHelper.sleep(0).then(() => {
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
    })
  }

  private navigate() {
    var queryParams: any = { nom: this.currentNom, partieId: this.partieId };
    if (this.isWebcam)
      queryParams.webcam = true;

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
    // window.location.reload();
  }


  private fillLastMeneInfo(lastMene: Mene) {
    this.lastMeneInfo = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()];
    this.lastMeneInfo[0] = new LastMeneInfo(0, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
    this.lastMeneInfo[1] = new LastMeneInfo(1, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
    this.lastMeneInfo[2] = new LastMeneInfo(2, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
    this.lastMeneInfo[3] = new LastMeneInfo(3, lastMene, this.currentContrat.playerId, this.currentPartie.participants);
  }

  public ngAfterViewInit() {
    this.socket.on("onCreerPartie", (partieId: number) => {
      if (this.isAdmin) {
        this.navigate();
        if ((this.partieId == 0 || this.partieId == null)) {
          this.partieId = partieId;

          this.socket.emit('joinRoom', this.partieId);
        }
        else
          this.hasPartieId = true;
      }
      else
        this.socket.emit('getAllPartie');
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

    this.socket.on("onCardPlayed", (infoPartie: InfoPartie) => {
      this.currentPartie = infoPartie.partie;
      this.currentContrat = infoPartie.contrat;
      var currentMene = this.currentContrat.menes[this.currentContrat.menes.length - 1];
      var firstCard: MeneCard = null;

      //Dernière carte de la mène
      if (currentMene.cards == undefined) {
        this.canPlayCard = false;

        currentMene = this.currentContrat.menes[this.currentContrat.menes.length - 2];
        this.fillLastMeneInfo(currentMene);
        this.currentMenes.push(currentMene);

        if (this.currentMenes.length == 8) { //Dernière carte du contrat on rajoute le 10 de der
          if (this.currentContrat.playerId == 1 || this.currentContrat.playerId == 2)
            this.currentMenes.push(new Mene(undefined, 10, 0));
          else
            this.currentMenes.push(new Mene(undefined, 0, 10));
        }

        UtilsHelper.sleep(1500).then(() => {
          //Suppression de toutes les cartes
          this.currentCards.splice(0, this.currentCards.length);
          this.currentCards2.splice(0, this.currentCards2.length);
          this.currentCards3.splice(0, this.currentCards3.length);
          this.currentCards4.splice(0, this.currentCards4.length);
          //Rafraichissement des cartes
          this.refreshDeck();
          this.canPlayCard = true;
        });
      }
      //On joue au moins une carte pour mettre en place le suggesteur de cartes
      else if (this.currentContrat.cards.length >= 2)
        firstCard = currentMene.cards[0];

      this.positionneJoueur();
      //Au joueur connecté de jouer
      if (this.positionJoueur == "sud" && firstCard) {
        var l_lstCard = this.cardList.toArray().filter(item => item.id == this.currentId);
        //Toutes les cartes jouables (après annulation de carte)
        for (var l_intCard = 0; l_intCard < l_lstCard.length; l_intCard++) {
          l_lstCard[l_intCard].setCardPlayable();
        }
        if (firstCard) {
          //Vérification si le jeu contient la couleur de départ => Obligation de jouer une carte de cette couleur
          if (l_lstCard.some(item => item.value[1] == firstCard.value[1])) {
            for (var l_intCard = 0; l_intCard < l_lstCard.length; l_intCard++) {
              if (l_lstCard[l_intCard].value[1] != firstCard.value[1])
                l_lstCard[l_intCard].setCardUnplayable();
            }
          }
          //Sinon vérification qu'il y'a de l'atout => Obligation de jouer l'atout
          //else if (l_lstCard.some(item => item.value[1] == this.currentContrat.value[this.currentContrat.value.length - 1])) {
          //  for (var l_intCard = 0; l_intCard < l_lstCard.length; l_intCard++) {
          //    if (l_lstCard[l_intCard].value[1] != this.currentContrat.value[this.currentContrat.value.length - 1])
          //      l_lstCard[l_intCard].setCardUnplayable();
          //  }
          //}
        }
      }

      var lastCard = currentMene.cards[currentMene.cards.length - 1];
      if (infoPartie.hasDblClick || this.currentParticipant.id != lastCard.id) {
        this.positionneCarte(lastCard)
        var cardToDrop = this.cardList.toArray().find(item => item.value == lastCard.value);
        cardToDrop.setVisible();
      }
      else
        this.cardList.toArray().find(item => item.value == lastCard.value).elRef.nativeElement.opacity = '1';

      clearInterval(this.interval);
      this.counter = 59;
      var formModel = this;
      this.interval = setInterval(function () {
        if (formModel.counter == 0)
          clearInterval(formModel.interval);
        else
          formModel.counter--;
      }, 1000);
    });

    this.socket.on("onAddNom", (infoPartie: InfoPartie) => {
      this.canPlayCard = true;
      this.nom1 = this.currentNom;
      this.hasSpectateur = false;

      this.currentPartie = infoPartie.partie;
      this.currentContrat = infoPartie.contrat;

      //Participant courant
      this.currentParticipant = this.currentPartie.participants.find(item => item.nom == this.currentNom);
      if (this.currentParticipant) {
        this.currentCards = this.currentContrat.cards[this.currentParticipant.id - 1];
        this.currentId = this.currentParticipant.id;
      }
      this.positionneJoueur();

      this.classEquipe1 = 'nomPlayer ' + (this.currentId <= 2 || this.currentId > 4 ? 'equipe1' : 'equipe2');
      this.classEquipe2 = 'nomPlayer ' + (this.currentId <= 2 || this.currentId > 4 ? 'equipe2' : 'equipe1');

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
          var nomSpectateur = this.currentPartie.participants[this.currentPartie.participants.length - 1].nom;
          if (this.ListeSpectateur.indexOf(nomSpectateur) < 0) {
            this.ListeSpectateur.push(nomSpectateur);
            alert("Le spectateur " + this.currentPartie.participants[this.currentPartie.participants.length - 1].nom + " se connecte");
          }
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
        if (this.currentPartie.participants.length >= 4) {
          this.equipeNom1 = this.currentPartie.participants[0].nom + ' ' + this.currentPartie.participants[1].nom;
          this.equipeNom2 = this.currentPartie.participants[2].nom + ' ' + this.currentPartie.participants[3].nom;
        }
      }
    });

    this.socket.on("onNewContrat", (infoPartie: InfoPartie) => {

      this.currentCards = [];
      this.currentCards2 = [];
      this.currentCards3 = [];
      this.currentCards4 = [];

      this.currentMenes = [];
      this.currentEncheres = [];
      this.lastMeneInfo = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()];
      this.partance = { posX: 0, posY: 0, couleur: '', value: "0", suit : '' };
      this.couleur = '';
      this.enchere = 80;
      this.minEnchere = 80;
      this.currentPartie = infoPartie.partie;
      this.currentContrat = infoPartie.contrat;

      this.refreshDeck();

      this.positionnePartance(this.currentParticipant.id, this.currentContrat.partanceId);
      this.positionneJoueur();
      this.enchereId = this.currentContrat.partanceId;
      this.encherePosition = this.positionPartance;
      this.isEnchereVisible = !this.isSansEnchere;
      this.bestEnchereId = 0;
    });

    this.socket.on("onResetMene", (infoPartie: InfoPartie) => {
      this.currentPartie = infoPartie.partie;
      this.currentContrat = infoPartie.contrat;

      if (this.currentMenes.length >= this.currentContrat.menes.length)
        this.currentMenes.splice(-1, 1);

      UtilsHelper.sleep(0).then(() => {
        //Suppression de toutes les cartes
        this.currentCards.splice(0, this.currentCards.length);
        this.currentCards2.splice(0, this.currentCards2.length);
        this.currentCards3.splice(0, this.currentCards3.length);
        this.currentCards4.splice(0, this.currentCards4.length);
        //Rafraichissement des cartes
        this.refreshDeck();
      });

      this.positionneJoueur();

      if (this.currentContrat.menes.length > 1)
        this.fillLastMeneInfo(this.currentContrat.menes[this.currentContrat.menes.length - 2]);
      else
        this.lastMeneInfo = [new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo(), new LastMeneInfo()];
    });

    this.socket.on("onValidatePartance", (infoPartie: InfoPartie) => {
      this.canPlayCard = true;
      this.currentPartie = infoPartie.partie;
      this.currentContrat = infoPartie.contrat;
      var enchere:number;
      var couleur: string;
      var value = this.currentContrat.value;
      if (value) {
        enchere = Number(value.substr(0, value.length - 1));
        var couleur = value[value.length - 1];
      }
      this.positionnePartance(this.currentParticipant.id, this.currentContrat.partanceId, enchere, couleur);
      this.positionneJoueur();
      this.enchereId = this.currentContrat.partanceId;
      this.encherePosition = this.positionPartance;
      this.isEnchereVisible = !this.isSansEnchere;
      this.bestEnchereId = 0;
    });

    this.socket.on("onValidateSansEnchere", isSansEnchere => {
      this.isSansEnchere = isSansEnchere;
      this.isEnchereVisible = !this.isSansEnchere;
    });

    this.socket.on("onValidateEnchere", infoEnchere => {
      if (infoEnchere.enchere > 0) {
        this.positionnePartance(this.currentParticipant.id, infoEnchere.partanceId, infoEnchere.enchere, infoEnchere.couleur);
        this.enchere = Number(infoEnchere.enchere);
        this.bestEnchereId = infoEnchere.enchereId;

        if (this.enchere < 160) {
          if (infoEnchere.enchereId) {
            this.enchere = this.enchere + 10;
            this.minEnchere = this.enchere;
          }
          else
            this.isEnchereVisible = false;
        }
      }

      this.enchereId = UtilsHelper.nextPlayer(infoEnchere.enchereId);
      this.encherePosition = UtilsHelper.nextPosition(this.encherePosition);

      if (infoEnchere.enchereId)
        var nom = this.currentPartie.participants[infoEnchere.enchereId - 1].nom;
      var isPasse: boolean = (infoEnchere.enchere == 0);
      var img: string;
      if (!isPasse)
        img = "../assets/" + UtilsHelper.couleurToValue(infoEnchere.couleur) + ".png";

      if (infoEnchere.enchereId) {
        this.currentEncheres.push({ enchereId: infoEnchere.enchereId, nom: nom, enchere: infoEnchere.enchere, couleur: infoEnchere.couleur, isPasse: isPasse, img: img });
        //Savoir quand fini l'enchère
        var lnEnchere = this.currentEncheres.length;
        if (lnEnchere >= 4) {
          if (this.currentEncheres[lnEnchere - 1].isPasse
            && this.currentEncheres[lnEnchere - 2].isPasse
            && this.currentEncheres[lnEnchere - 3].isPasse)
            this.isEnchereVisible = false;
        }
        this.canAnnulerEnchere = false;
        if (this.encherePosition == "est")
          this.canAnnulerEnchere = true;
      }
    });

    this.socket.on("onAnnulerDerniereEnchere", infoEnchere => {
      this.canAnnulerEnchere = false;
      if (this.currentEncheres.length > 1) {
        for (var iEnchere = this.currentEncheres.length - 2; iEnchere >= 0; iEnchere--) {
          if (this.currentEncheres[iEnchere].enchere > 0) {
            this.couleur = this.currentEncheres[iEnchere].couleur;
            this.enchere = this.currentEncheres[iEnchere].enchere + 10;
            this.minEnchere = this.enchere;
            break;
          }
        }
      }
      else {
        this.enchere = 80;
        this.minEnchere = this.enchere;
      }

      this.enchereId = UtilsHelper.previousPlayer(this.enchereId);
      this.encherePosition = UtilsHelper.previousPosition(this.encherePosition);
      this.currentEncheres.pop();
      this.positionnePartance(this.currentParticipant.id, infoEnchere.partanceId, this.enchere, this.couleur);
    });

    this.socket.on("onAnnulerDerniereCarte", infoDerniereCarte => {
      this.canPlayCard = true;
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
