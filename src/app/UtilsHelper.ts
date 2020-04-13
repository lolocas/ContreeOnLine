export class UtilsHelper {
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

  static couleurToValue(codeCouleur: string) {
    switch (codeCouleur) {
      case "H":
        return "coeur";
      case "S":
        return "pique";
      case "C":
        return "trefle";
      case "D":
        return "carreau";
    }
  }

  static nextPosition(position) {
    if (position == "sud")
      return "est";
    else if (position == "nord")
      return "ouest";
    else if (position == "ouest")
      return "sud";
    else if (position == "est")
      return "nord";
  }

  static previousPosition(position) {
    if (position == "sud")
      return "ouest";
    else if (position == "nord")
      return "est";
    else if (position == "ouest")
      return "nord";
    else if (position == "est")
      return "sud";
  }

  static nextPlayer(id) {
    if (id == 1)
      return 4;
    else if (id == 2)
      return 3;
    else if (id == 3)
      return 1;
    else if (id == 4)
      return 2;
    return 0;
  }

  static previousPlayer(id) {
    if (id == 1)
      return 3;
    else if (id == 2)
      return 4;
    else if (id == 3)
      return 2;
    else if (id == 4)
      return 1;
    return 0;
  }
}
