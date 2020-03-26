const Express = require("express");
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http);

var PORT = process.env.PORT || 3000;

Http.listen(PORT, () => {
  console.log("Listening at :" + PORT +"...");
});

var nbTour = 4; //4
var cards = ['7H', '7S', '7D', '7C', '8H', '8S', '8D', '8C', '9H', '9S', '9D', '9C', '0C', '0H', '0S', '0D', 'JH', 'JS', 'JD', 'JC', 'QH', 'QS', 'QD', 'QC', 'KH', 'KS', 'KD', 'KC', 'AC', 'AH', 'AS', 'AD'];
var currentCards = [];
var currentPartie = {
  departId: 0,
  nbTour: nbTour,
  participants: [],
  contrats: [{
    playerId:0,
    valeur: '',
    equipe: 0,
    cards: [],
    menes: [{
      cards: [],
      total1: 0,
      total2: 0
    }]
  }]
};


Socketio.on("connection", socket => {
  socket.on("addNom", nomInfo => {
    if (nomInfo.isAdmin) {
      currentPartie = {
        departId:0,
        nbTour: nbTour,
        participants: [],
        contrats: [{
          playerId: 1,
          value:'',
          equipe:1,
          cards:[],
          menes: [{
            cards: undefined,
            total1: 0,
            total2:0
          }]
        }]
      }; //TOREMOVE
      currentCards = cards.sort(function () { return 0.5 - Math.random() });
    }
    if (!currentPartie.participants.find(item => item.nom == nomInfo.nom)) {
      var participant = {
        nom: nomInfo.nom,
        id: currentPartie.participants.length + 1,
        isAdmin:nomInfo.isAdmin
      }
      currentPartie.participants.push(participant);
      currentPartie.contrats[currentPartie.contrats.length - 1].cards.push(SortCards(currentCards.slice(0, 8)));
      currentCards = currentCards.slice(8);
    }
    console.log(currentPartie);
    Socketio.emit("addNom", currentPartie);
  })
  socket.on("moveCard", NewPos => {
    //console.log(NewPos);
    socket.broadcast.emit("positionCard", NewPos);
  })
  socket.on("cardDropped", value => {
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];
    if (currentContrat.menes[currentContrat.menes.length - 1].cards == undefined)
      currentContrat.menes[currentContrat.menes.length - 1].cards = [];
    else {
      if (currentContrat.playerId == 1)
        currentContrat.playerId = 4;
      else if (currentContrat.playerId == 2)
        currentContrat.playerId = 3;
      else if (currentContrat.playerId == 3)
        currentContrat.playerId = 1;
      else if (currentContrat.playerId == 4)
        currentContrat.playerId = 2;
    }

    currentContrat.menes[currentContrat.menes.length - 1].cards.push({ id: currentContrat.playerId, value: value });

    //Nouvelle mène
    if (currentContrat.menes[currentContrat.menes.length - 1].cards.length == nbTour) {
      var bestCard = calculMene(currentContrat, currentContrat.menes[currentContrat.menes.length - 1]);

      currentContrat.playerId = bestCard.id; //Celui qui vient de remporter la mène
      currentContrat.menes.push({ cards: undefined, total1: 0, total2: 0 });
    }
    console.log(currentPartie);
    Socketio.emit("cardPlayed", currentPartie);
  })
  socket.on("validateEnchere", enchere => {
    currentPartie.contrats[currentPartie.contrats.length - 1].value = enchere.enchere;
    Socketio.emit("onEnchereValidate", currentPartie);
  })
  socket.on("validatePartance", partance => {
    currentPartie.contrats[currentPartie.contrats.length - 1].playerId = partance.id;
    Socketio.emit("onEnchereValidate", currentPartie);
  })
});

  function SortCards(cards) {
    return cards.sort((n1, n2) => {
      var replaceRank = [["7", 0], ["8", 1], ["9", 2], ["0", 3], ["J", 4], ["Q", 5], ["K", 6], ["A", 7]];
      var replaceSuit = [["C", 0], ["D", 1], ["S", 2], ["H", 3]];
      var l_intRank1 = replaceRank.filter(function (v) { return v[0] === n1.charAt(0); });
      var l_intRank2 = replaceRank.filter(function (v) { return v[0] === n2.charAt(0); });
      var l_intSuit1 = replaceSuit.filter(function (v) { return v[0] === n1.charAt(1); });
      var l_intSuit2 = replaceSuit.filter(function (v) { return v[0] === n2.charAt(1); });

      return (Number(l_intSuit1[0][1]) - Number(l_intSuit2[0][1]) || (Number(l_intRank1[0][1]) - Number(l_intRank2[0][1])));
    })
}

  function calculMene(currentContrat, currentMene) {
  var suitAtout = currentContrat.value[currentContrat.value.length - 1];
  var lstCardValue = [["7", 0, 0], ["8", 0, 0], ["9", 0, 14], ["0", 10, 10], ["J", 2, 20], ["Q", 3, 3], ["K", 4, 4], ["A", 11, 11]];
  var listeCardInfo = [];
  var bestCard;
  var total = 0;
  currentMene.cards.forEach(card => {
    var cardValue = 0;
    var isAtout = false;
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
        if (card.isAtout)
          bestCard = card;
        else if (listeCardInfo[0].suit == card.suit) {
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
  return bestCard;
}
