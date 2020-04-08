export class Partie {
  public partieId: number; //L'id de partie
  public departId: number; //L'id de celui qui a le départ
  public datePartie: Date;
  public nbTour: number; //Nombre de tour de cartes (4)
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

