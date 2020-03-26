export class Participant {
  public nom: string;
  public isAdmin: boolean;
  public id: number;
  public cards: Array<string> = [];
}

export class Contrat {
  public playerId: number;
  public value: string;
  public equipe: number;
  public menes: Mene[];
  public cards: string[][];
}

export class Mene {
  constructor(total1: number, total2: number) {
    this.total1 = total1;
    this.total2 = total2;
  }
  public total1: number;
  public total2: number;
  public cards: MeneCard[];
}

export class MeneCard {
  public id: number;
  public value: string;
}

export class Partie {
  public departId: number;
  public nbTour: number;
  public participants: Array<Participant> = [];
  public contrats: Array<Contrat> = [];
}
