import { Contrat, Mene } from './model';

export class Utils {
  static imgPath: string = "/assets/cards/";

  static sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static cardValueToImage(value: string, display) {
    return this.imgPath + this.getFullRank(value) + "_of_" + this.getFullSuit(value) + (display == "card-rotate" ? "_rotate" : "") + ".png";
  }

  static getFullRank(value:string) {
    if (value) {
      switch (value.charAt(0)) {
        case '0':
          return "10";
        case 'J':
          return "jack";
        case 'Q':
          return "queen";
        case 'K':
          return "king";
        case 'A':
          return "ace";
        default:
          return value.charAt(0);
      }
    }
  }

  static getFullSuit(value: string) {
    if (value) {
      switch (value.charAt(1)) {
        case 'H':
          return "hearts";
        case 'S':
          return "spades";
        case 'D':
          return "diamonds";
        case 'C':
          return "clubs";
      }
    }
  }


}
