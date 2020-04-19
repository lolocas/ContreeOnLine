import { UtilsHelper } from './UtilsHelper';

export class Partie {
  public partieId: number; //L'id de partie
  public departId: number; //L'id de celui qui a le départ
  public datePartie: Date;
  public nbTour: number; //Nombre de tour de cartes (4)
  public isSansEnchere: boolean;
  public participants: Array<Participant>; //La liste des participants
  public contrats: Array<Contrat>; //La liste des contrats
}

export class Participant {
  public nom: string; //Nom du participant
  public isAdmin: boolean; //Est t'il administrateur
  public isSpectateur: boolean; //Est t'il spectateur
  public id: number; //Identifiant
  public cards: Array<string>; //Les cartes du participant
}

export class Contrat {
  constructor(t?: Contrat) {
    Object.assign(this, t);
  }
  public partanceId: number; //Joueur ayant la partance
  public playerId: number; //Joueur actuel
  public enchereId: number; //Joueur qui encherit
  public value: string; //Valeur du contrat
  public menes: Mene[]; //Les mènes
  public cards: string[][]; //La liste des cartes par participant
  public initCards: string[][]; //La liste des cartes par participant au tirage
}

export class Mene {
  constructor(cards: MeneCard[], total1: number, total2: number) {
    this.cards = cards;
    this.total1 = total1;
    this.total2 = total2;
  }
  public cards: MeneCard[]; //Les cartes jouées de la mène
  public total1: number; //Le total de l'équipe 1
  public total2: number; //Le total de l'équipe 2
}

export class MeneCard {
  public id: number;   //L'id du joueur de la carte
  public value: string; //La valeur de la carte
}

export class LastMeneInfo {
  constructor(index?: number, lastMene?: Mene, playerId?: number, participants?: Participant[]) {
    if (lastMene) {
      this.imageCardPath = UtilsHelper.cardValueToImage(lastMene.cards[index].value, '');
      this.nom = participants.find(item => item.id == lastMene.cards[index].id).nom;
      if (playerId == lastMene.cards[index].id) {
        if (playerId <= 2 || playerId > 4)
          this.bestCardStyle = 'equipe1';
        else
          this.bestCardStyle = 'equipe2';
      }
      else
        this.bestCardStyle = 'neutre';
    }
  }
  public imageCardPath: string = '../assets/pi.png';
  public nom: string;
  public bestCardStyle: string;
}

export class EnchereInfo {
  public enchereId: number;
  public nom: string;
  public enchere: number;
  public couleur: string;
  public isPasse: boolean;
  public img: string;
}

export class InfoPartie {
  public partie: Partie;
  public contrat: Contrat;
  public hasDblClick: boolean;
}

