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

  @ViewChildren(CardComponent)
  private cardList: QueryList<CardComponent>;

  @Input()
  public posDepart: { posX: number, posY: number } = { posX: 0, posY: 0 };
  @Output()
  public positionJoueur: string;
  @Input()
  public partance: { posX: number, posY: number, couleur: string, valeur: string } = { posX: 0, posY: 0, couleur: 'pi', valeur: "0" };
  @Input()
  public enchere: string;
  @Input()
  public couleur: string;
  @Input()
  public partanceId: number;

  private ctxCardTable: CanvasRenderingContext2D;
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
    this.socket = io("http://localhost:3000");
    //this.socket = io("https://contreeonline.herokuapp.com/");
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

  public positionneJoueur() {
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

  public positionneCarte(value: string) {
    var positionCard = "sud";
    var posX;
    var posY;
    switch (this.currentParticipant.id) {
      case 1:
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
    switch (positionCard) {
      case "sud":
        posX = this.ctxCardTable.canvas.offsetLeft + (this.ctxCardTable.canvas.width / 2);
        posY = this.ctxCardTable.canvas.offsetTop + this.ctxCardTable.canvas.height;
        break;
      case "nord":
        posX = this.ctxCardTable.canvas.offsetLeft + (this.ctxCardTable.canvas.width / 2);
        posY = this.ctxCardTable.canvas.offsetTop;
        break;
      case "ouest":
        posX = this.ctxCardTable.canvas.offsetLeft;
        posY = this.ctxCardTable.canvas.offsetTop + (this.ctxCardTable.canvas.height / 2);
        break;
      case "est":
        posX = -((window.innerWidth / 2)-620); //Canvas/2 - panel
        posY = 0;
        break;
    }
    var element = document.getElementById(value);
    element.style.position = "fixed";
    element.style.transform = null;
    element.style.right = '0px';
    element.style.bottom = '0px';
    element.style.left = posX + 'px';
    element.style.top = posY + 'px';

    var cardToDrop = this.cardList.toArray().find(item => item.value == value);
    cardToDrop.setVisible();
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

  public onValidateEnchere() {
    if (!this.enchere || !this.couleur)
    {
      alert("Enchère incomplète");
      return;
    }
    this.socket.emit("validateEnchere", { enchere: this.enchere + this.couleur });
  }
  public onValidatePartance() {
    if (!this.partanceId) {
      alert("Partance incomplète");
      return;
    }
    this.socket.emit("validatePartance", { id: Number(this.partanceId) });
  }

  public ngAfterViewInit() {
    this.socket.on("positionCard", NewPos => {
      var cardToMove = this.cardList.toArray().find(item => item.value == NewPos.value);

      if (NewPos.id == 1) {
        if (this.currentId == 2) {
          var posX = NewPos.left * window.innerWidth;
          var posY = -NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 3) {
          var posX = NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 4) {
          var posX = -NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
      }
      else if (NewPos.id == 2) {
        if (this.currentId == 1) {
          var posX = NewPos.left * window.innerWidth;
          var posY = -NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 3) {
          var posX = NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 4) {
          var posX = NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
      }
      else if (NewPos.id == 3) {
        if (this.currentId == 1) {
          var posX = NewPos.left * window.innerWidth;
          var posY = -NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 3) {
          var posX = NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 4) {
          var posX = NewPos.left * window.innerWidth;
          var posY = -NewPos.top * window.innerHeight;
        }
      }
      else if (NewPos.id == 4) {
        if (this.currentId == 1) {
          var posX = NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 3) {
          var posX = NewPos.left * window.innerWidth;
          var posY = NewPos.top * window.innerHeight;
        }
        else if (this.currentId == 4) {
          var posX = NewPos.left * window.innerWidth;
          var posY = -NewPos.top * window.innerHeight;
        }
      }
      cardToMove.changePosition(posX, posY);

    });

    this.socket.on("cardPlayed", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[currentPartie.contrats.length - 1];
      var lastMene = this.currentContrat.menes[this.currentContrat.menes.length - 1];

      //Dernière carte de la mène
      if (lastMene.cards == undefined) {
        var lastMene = this.currentContrat.menes[this.currentContrat.menes.length - 2];

        this.currentMenes.push(lastMene);

        if (this.currentMenes.length == 8) { //Dernière carte du contrat on rajoute le 10 de der
          if (this.currentContrat.playerId == 1 || this.currentContrat.playerId == 2)
            this.currentMenes.push(new Mene(10, 0));
          else
            this.currentMenes.push(new Mene(0, 10));
        }

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
      this.positionneJoueur();
      this.positionneCarte(lastMene.cards[lastMene.cards.length - 1].value)
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
            this.id2 = currentConnected.id;
            this.currentCards2 = currentConnectedCards;
          }
          else {
            //on affiche les cartes du premier participant
            this.nom2 = this.currentPartie.participants.find(item => item.id == 1).nom;
            this.id2 = this.currentPartie.participants.find(item => item.id == 1).id;
            this.currentCards2 = currentConnectedContrat.cards[0];
          }
        }
        //Le troisième participant se connecte
        else if ((currentConnected.id == 3)) {
          //on affiche les cartes au premier et deuxième participant
          if (this.currentParticipant.id == 1) {
            this.nom3 = currentConnected.nom;
            this.id3 = currentConnected.id;
            this.currentCards3 = currentConnectedCards;
          }
          else if (this.currentParticipant.id == 2) {
            this.nom4 = currentConnected.nom;
            this.id4 = currentConnected.id;
            this.currentCards4 = currentConnectedCards;
          }
          else {
            //on affiche les cartes du premier et deuxième participant
            this.nom3 = this.currentPartie.participants.find(item => item.id == 2).nom;
            this.id3 = this.currentPartie.participants.find(item => item.id == 2).id;
            this.currentCards3 = currentConnectedContrat.cards[1];
            this.nom4 = this.currentPartie.participants.find(item => item.id == 1).nom;
            this.id4 = this.currentPartie.participants.find(item => item.id == 1).id;
            this.currentCards4 = currentConnectedContrat.cards[0];
          }
        }
        //Le quatrième participant se connecte
        else if ((currentConnected.id == 4)) {
          //on affiche les cartes au premier et deuxième participant
          if (this.currentParticipant.id == 1) {
            this.nom4 = currentConnected.nom;
            this.id4 = currentConnected.id;
            this.currentCards4 = currentConnectedCards;
          }
          else if (this.currentParticipant.id == 2) {
            this.nom3 = currentConnected.nom;
            this.id3 = currentConnected.id;
            this.currentCards3 = currentConnectedCards;
          }
          //on affiche les cartes au troisième
          else if (this.currentParticipant.id == 3) {
            this.nom2 = currentConnected.nom;
            this.id2 = currentConnected.id;
            this.currentCards2 = currentConnectedCards;
          }
          else {
            //on affiche les cartes du premier, deuxième et troisième participant
            this.nom3 = this.currentPartie.participants.find(item => item.id == 1).nom;
            this.id3 = this.currentPartie.participants.find(item => item.id == 1).id;
            this.currentCards3 = currentConnectedContrat.cards[0];
            this.nom4 = this.currentPartie.participants.find(item => item.id == 2).nom;
            this.id4 = this.currentPartie.participants.find(item => item.id == 2).id;
            this.currentCards4 = currentConnectedContrat.cards[1];
            this.nom2 = this.currentPartie.participants.find(item => item.id == 3).nom;
            this.id2 = this.currentPartie.participants.find(item => item.id == 3).id;
            this.currentCards2 = currentConnectedContrat.cards[2];
          }
        }
      }
    });

    this.socket.on("onEnchereValidate", currentPartie => {
      this.currentPartie = currentPartie;
      this.currentContrat = this.currentPartie.contrats[currentPartie.contrats.length - 1]
      var positionPartance: string;
      switch (this.currentParticipant.id) {
        case 1:
          switch (this.currentContrat.playerId) {
            case 1: positionPartance = "sud"; break;
            case 2: positionPartance = "nord"; break;
            case 3: positionPartance = "ouest"; break;
            case 4: positionPartance = "est"; break;
          }
          break;
        case 2:
          switch (this.currentContrat.playerId) {
            case 1: positionPartance = "nord"; break;
            case 2: positionPartance = "sud"; break;
            case 3: positionPartance = "est"; break;
            case 4: positionPartance = "ouest"; break;
          }
          break;
        case 3:
          switch (this.currentContrat.playerId) {
            case 1: positionPartance = "est"; break;
            case 2: positionPartance = "ouest"; break;
            case 3: positionPartance = "sud"; break;
            case 4: positionPartance = "nord"; break;
          }
          break;
        case 4:
          switch (this.currentContrat.playerId) {
            case 1: positionPartance = "ouest"; break;
            case 2: positionPartance = "est"; break;
            case 3: positionPartance = "nord"; break;
            case 4: positionPartance = "sud"; break;
          }
          break;
      }
      switch (positionPartance) {
        case "sud":
          this.partance.posX = this.ctxCardTable.canvas.offsetLeft + (this.ctxCardTable.canvas.width / 2) - 200;
          this.partance.posY = this.ctxCardTable.canvas.offsetTop + this.ctxCardTable.canvas.height;
          break;
        case "nord":
          this.partance.posX = this.ctxCardTable.canvas.offsetLeft + (this.ctxCardTable.canvas.width / 2) + 200;
          this.partance.posY = this.ctxCardTable.canvas.offsetTop;
          break;
        case "ouest":
          this.partance.posX = this.ctxCardTable.canvas.offsetLeft;
          this.partance.posY = this.ctxCardTable.canvas.offsetTop + (this.ctxCardTable.canvas.height / 2) - 100;
          break;
        case "est":
          this.partance.posX = this.ctxCardTable.canvas.offsetLeft + this.ctxCardTable.canvas.width;
          this.partance.posY = this.ctxCardTable.canvas.offsetTop + (this.ctxCardTable.canvas.height / 2) + 100;
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
      this.positionneJoueur();
    });

    this.ctxCardTable = this.cardTableCanvas.nativeElement.getContext("2d");
    var img = new Image();
    img.src = '../assets/Card_Table.png';
    this.paint(this.ctxCardTable, img);

   
  }
}
