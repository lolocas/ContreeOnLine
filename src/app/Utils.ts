import { Contrat, Mene } from './model';

export class Utils {
  static SortCards(cards: Array<string>): Array<string> {
    return cards.sort((n1: string, n2: string) => {
      var replaceRank = [["7", 0], ["8", 1], ["9", 2], ["0", 3], ["J", 4], ["Q", 5], ["K", 6], ["A", 7]];
      var replaceSuit = [["C", 0], ["D", 1], ["S", 2], ["H", 3]];
      var l_intRank1 = replaceRank.filter(function (v) { return v[0] === n1.charAt(0); });
      var l_intRank2 = replaceRank.filter(function (v) { return v[0] === n2.charAt(0); });
      var l_intSuit1 = replaceSuit.filter(function (v) { return v[0] === n1.charAt(1); });
      var l_intSuit2 = replaceSuit.filter(function (v) { return v[0] === n2.charAt(1); });

      return (Number(l_intSuit1[0][1]) - Number(l_intSuit2[0][1]) || (Number(l_intRank1[0][1]) - Number(l_intRank2[0][1])));
    })
  }

  static sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static calculMene(currentContrat: Contrat, currentMene: Mene) {
    var suitAtout = currentContrat.value[currentContrat.value.length - 1];
    var lstCardValue = [["7", 0, 0], ["8", 0, 0], ["9", 0, 14], ["0", 10, 10], ["J", 2, 20], ["Q", 3, 3], ["K", 4, 4], ["A", 11, 11]];
    var listeCardInfo = [];
    var bestCard;
    var total: number = 0;
    currentMene.cards.forEach(card => {
      var cardValue: number = 0;
      var isAtout: boolean = false;
      var rank = card.value.charAt(0);
      var suit = card.value.charAt(1);

      if (suit == suitAtout) {
        cardValue = Number(lstCardValue.find(item => item[0] == card.value.charAt(0))[2]);
        isAtout = true;
      }
      else
        cardValue = Number(lstCardValue.find(item => item[0] == card.value.charAt(0))[1]);
      total += cardValue;
      listeCardInfo.push({ id: card.id, isAtout: isAtout, value: cardValue, rank: rank, suit: suit });
    })
    //Carte la plus forte de la mène
    listeCardInfo.forEach(card => {
      if (!bestCard)
        bestCard = card;
      else {
        //Si bestCard est un atout on ne compare que par rapport à un autre atout
        if (bestCard.isAtout) {
          if (card.isAtout) {
            if (bestCard.rank == "7" && card.rank == "8")
              bestCard = card;
            else if (card.value > bestCard.value)
              bestCard = card;
          }
        }
        //Sinon on compare par rapport à la première carte jouée
        else {
          if (listeCardInfo[0].suit == card.suit) {
            if (bestCard.rank == "7" && (card.rank == "8" || card.rank == "8"))
              bestCard = card;
            else if (bestCard.rank == "8" && card.rank == "9")
              bestCard = card;
            else if (card.value > bestCard.value)
              bestCard = card;
          }
        }
      }
    });
    if (bestCard.id == 1 || bestCard.id == 2)
      currentMene.total1 = total;
    else
      currentMene.total2 = total;
  }
}
