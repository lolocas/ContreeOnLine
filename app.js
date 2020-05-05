const Express = require("express");
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http, { 'pingTimeout': 10000, 'pingInterval': 5000 });

var PORT = process.env.PORT || 3000;

Http.listen(PORT, () => {
  console.log("Listening at :" + PORT +"...");
});

var listePartie = [];
var nbTour = 4; //4
var cards = ['7H', '7S', '7D', '7C', '8H', '8S', '8D', '8C', '9H', '9S', '9D', '9C', '0C', '0H', '0S', '0D', 'JH', 'JS', 'JD', 'JC', 'QH', 'QS', 'QD', 'QC', 'KH', 'KS', 'KD', 'KC', 'AC', 'AH', 'AS', 'AD'];
var channels = {};

Socketio.on("connection", socket => {
  socket.on('joinRoom', function (room) {
    socket.join(room);
  });

  socket.on("addNom", nomInfo => {
    var currentPartie = getCurrentPartie(nomInfo.partieId);
    console.log("Connect", currentPartie);
    if (currentPartie) {
      addNom(currentPartie, nomInfo);
      Socketio.in(nomInfo.partieId).emit("onAddNom", getInfoPartie(currentPartie));
    }
  });

  socket.on("removeNom", nomInfo => {
    var currentPartie = getCurrentPartie(nomInfo.partieId);
    if (!currentPartie)
      return;
    var currentIndexParticipant = currentPartie.participants.findIndex(item => item.id == nomInfo.id);
    if (currentIndexParticipant > -1)
      currentPartie.participants.splice(currentIndexParticipant, 1);
    console.log("removeNom", currentIndexParticipant, "id", nomInfo.id);
    Socketio.in(nomInfo.partieId).emit("onAddNom", getInfoPartie(currentPartie));
  });

  socket.on("creerPartie", nomInfo => {
    var lastPartieId = 0;
    if (listePartie.length > 0) {
      var lastPartieId = listePartie[listePartie.length - 1].partieId;
    }
    lastPartieId = lastPartieId + 1;
    var currentPartie = newPartie(lastPartieId);
    TirageCarte(currentPartie.contrats[0], cards);

    listePartie.push(currentPartie);
    addNom(currentPartie, nomInfo);
    Socketio.emit("onCreerPartie", lastPartieId);
  });

  socket.on("getAllPartie", () => {
    var infoParties = [];

    listePartie.forEach(element => {
      infoParties.push({ partieId: element.partieId, datePartie: element.datePartie, participants: element.participants });
    });

    Socketio.emit("onGetAllPartie", infoParties);
  });

  socket.on("partieExists", value => {
    var currentPartie = getCurrentPartie(value.partieId);
    value.partieExists = false;
    if (currentPartie) {
      if (currentPartie.participants
        && currentPartie.participants.find(item => item.nom == value.nom)) {
        value.partieExists = true;
      }
    }
    Socketio.emit("onPartieExists", value);
  });

  socket.on("deletePartie", value => {
    var currentPartie = getCurrentPartie(value.partieId);
    listePartie.splice(listePartie.indexOf(currentPartie), 1);

    var infoParties = [];

    listePartie.forEach(element => {
      infoParties.push({ partieId: element.partieId, datePartie: element.datePartie, participants: element.participants });
    });

    Socketio.emit("onGetAllPartie", infoParties);
  });

  socket.on("moveCard", NewPos => {
    //console.log(NewPos);
    socket.to(NewPos.partieId).emit("onMoveCard", NewPos);
  });

  socket.on("cardDropped", value => {
    var currentPartie = getCurrentPartie(value.partieId);
    if (currentPartie == undefined) {
      console.log("cardDropped", listePartie, "Partie " + value.partieId + " non trouvée");
      return;
    }
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];

    if (!currentContrat.initCards[value.id - 1].includes(value.value)) {
      console.log("cardDropped erreur", value);
      return;
    }

    if (currentContrat.menes[currentContrat.menes.length - 1].cards == undefined)
      currentContrat.menes[currentContrat.menes.length - 1].cards = [];
    else
      currentContrat.playerId = nextPlayer(currentContrat.playerId);

    if (currentContrat.menes[currentContrat.menes.length - 1].cards.some(item => item.value == value.value)) {
      console.log("cardDropped", value.value + " existe");
      return;
    }
    currentContrat.menes[currentContrat.menes.length - 1].cards.push({ id: value.id, value: value.value });

    console.log(currentContrat.menes[currentContrat.menes.length - 1].cards);

    //Nouvelle mène
    if (currentContrat.menes[currentContrat.menes.length - 1].cards.length == nbTour) {
      var bestCard = calculMene(currentContrat, currentContrat.menes[currentContrat.menes.length - 1]);

      currentContrat.playerId = bestCard.id; //Celui qui vient de remporter la mène

      //Suppression des 4 cartes jouées
      for (var intTour = 0; intTour < currentPartie.nbTour; intTour++) {
        var currentCard = currentContrat.menes[currentContrat.menes.length - 1].cards[intTour];
        currentContrat.cards[currentCard.id - 1].splice(currentContrat.cards[currentCard.id - 1].indexOf(currentCard.value), 1);
      }
      //nouvelle mène
      currentContrat.menes.push({ playerId: currentContrat.playerId, cards: undefined, total1: 0, total2: 0 });
    }
    //console.log("cardDropped", currentPartie);

    var infoPartie = getInfoPartie(currentPartie);
    infoPartie.hasDblClick = value.hasDblClick;

    Socketio.in(value.partieId).emit("onCardPlayed", infoPartie);
  });

  socket.on("validateEnchere", enchere => {
    var currentPartie = getCurrentPartie(enchere.partieId);
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];
    console.log(enchere);
    if (enchere.enchere > 0)
      currentContrat.value = enchere.enchere + enchere.couleur;
    currentContrat.enchereId = enchere.enchereId;
    Socketio.in(enchere.partieId).emit("onValidateEnchere", { partanceId: currentContrat.partanceId, enchereId: enchere.enchereId, enchere: enchere.enchere, couleur: enchere.couleur });
  });

  socket.on("validatePartance", partance => {
    var currentPartie = getCurrentPartie(partance.partieId);
    if (currentPartie == undefined) {
      console.log("validatePartance", listePartie, "Partie " + partance.partieId + " non trouvée");
      return;
    }
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];
    var currentMene = currentContrat.menes[currentContrat.menes.length - 1];
    currentContrat.partanceId = partance.id;
    currentContrat.playerId = partance.id;
    currentMene.playerId = partance.id;
    Socketio.in(partance.partieId).emit("onValidatePartance", getInfoPartie(currentPartie));
  });

  socket.on("validateSansEnchere", infoSansEnchere => {
    var currentPartie = getCurrentPartie(infoSansEnchere.partieId);
    currentPartie.isSansEnchere = infoSansEnchere.isSansEnchere;
    console.log("validateSansEnchere", infoSansEnchere);
    Socketio.in(infoSansEnchere.partieId).emit("onValidateSansEnchere", infoSansEnchere.isSansEnchere);
  });

  socket.on("validateTotal", infoTotal => {
    var currentPartie = getCurrentPartie(infoTotal.partieId);
    currentPartie.total1 = infoTotal.total1;
    currentPartie.total2 = infoTotal.total2;
    console.log("validateTotal", infoTotal);
    Socketio.in(infoTotal.partieId).emit("onValidateTotal", infoTotal);
  });

  socket.on("annulerDerniereCarte", value => {
    var currentPartie = getCurrentPartie(value.partieId);
    console.log("annulerDerniereCarte", value);
    var newPlayerId = value.id;
    var currentMene = currentPartie.contrats[currentPartie.contrats.length - 1].menes[currentPartie.contrats[currentPartie.contrats.length - 1].menes.length - 1];
    //Annulation en début de mène on garde le même player
    if (currentMene && currentMene.cards && currentMene.cards.length == 1)
      currentMene.cards = undefined;
    else { //Annulation en cours de mène on recule le player d'un cran
      currentMene.cards.splice(-1, 1);
      newPlayerId = previousPlayer(value.id);
    }
    currentPartie.contrats[currentPartie.contrats.length - 1].playerId = newPlayerId;
    Socketio.in(value.partieId).emit("onAnnulerDerniereCarte", { currentPartie: currentPartie, value: value });
  });

  socket.on("annulerDerniereEnchere", enchere => {
    var currentPartie = getCurrentPartie(enchere.partieId);
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];
    Socketio.in(enchere.partieId).emit("onAnnulerDerniereEnchere", { partanceId: currentContrat.partanceId });
  });

  socket.on("resetCurrentPartie", nomInfo => {
    var currentPartie = getCurrentPartie(nomInfo.partieId);
    currentPartie.datePartie = new Date();
    currentPartie.participants = [];
    currentPartie.contrats = [{
      partanceId: 1,
      playerId: 1,
      enchereId: 1,
      value: '',
      initCards: [],
      cards: [],
      menes: [{
        playerId: 0,
        cards: undefined,
        total1: 0,
        total2: 0
      }]
    }];
    TirageCarte(currentPartie.contrats[0], cards);
    console.log("resetCurrentPartie", listePartie);
    addNom(currentPartie, nomInfo);
    Socketio.in(nomInfo.partieId).emit("onResetPartie");
  });

  socket.on("resetCurrentContrat", info => {
    var currentPartie = getCurrentPartie(info.partieId);
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];

    currentContrat.cards = [];
    for (var intTour = 0; intTour < currentPartie.nbTour; intTour++) {
      var newCards = currentContrat.initCards[intTour];
      if (newCards)
        currentContrat.cards.push(newCards.slice(0));//Clonage
    }
    currentContrat.playerId = currentContrat.partanceId;

    currentContrat.menes = [{
      playerId: 0,
      cards: undefined,
      total1: 0,
      total2: 0
    }];
    Socketio.in(info.partieId).emit("onNewContrat", getInfoPartie(currentPartie));
  });


  socket.on("resetMene", info => {
    var currentPartie = getCurrentPartie(info.partieId);
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];

    var currentMene = currentContrat.menes[currentContrat.menes.length - 1];
    if (currentMene.cards == undefined) { //Nouvelle même on regarde la mène précédente
      if (currentContrat.menes.length == 1) //Une seule mène vide on sort
        return;
      currentContrat.menes.splice(-1, 1); //Suppression de la mène vide
      currentMene = currentContrat.menes[currentContrat.menes.length - 1];
      //On remet les cartes jouées
      for (var intTour = 0; intTour < currentMene.cards.length; intTour++) {
        var currentCard = currentMene.cards[intTour];
        currentContrat.cards[currentCard.id - 1].push(currentCard.value);
        SortCards(currentContrat.cards[currentCard.id - 1]);
      }
    }
    currentContrat.playerId = currentMene.playerId;
    currentContrat.menes.splice(-1, 1); //Suppression de la mène
    //nouvelle mène
    currentContrat.menes.push({ playerId: currentContrat.playerId, cards: undefined, total1: 0, total2: 0 });
    console.log("resetMene", currentContrat.menes);

    Socketio.in(info.partieId).emit("onResetMene", getInfoPartie(currentPartie));
  });

  socket.on("newContrat", info => {
    var currentPartie = getCurrentPartie(info.partieId);
    var currentContrat = currentPartie.contrats[currentPartie.contrats.length - 1];
    var listCards = [];
    listCards = listCards.concat(currentContrat.initCards[0]);
    listCards = listCards.concat(currentContrat.initCards[1]);
    listCards = listCards.concat(currentContrat.initCards[2]);
    listCards = listCards.concat(currentContrat.initCards[3]);

    var newPlayer = nextPlayer(currentContrat.partanceId);

    var newContrat = {
      partanceId: newPlayer,
      playerId: newPlayer,
      value: '',
      initCards: [],
      cards: [],
      menes: [{
        playerId: newPlayer,
        cards: undefined,
        total1: 0,
        total2: 0
      }]
    };


    TirageCarte(newContrat, listCards);

    currentPartie.contrats.push(newContrat);
    Socketio.in(info.partieId).emit("onNewContrat", getInfoPartie(currentPartie));
  });

  socket.on('new-channel', function (data) {
    channels[data.channel] = data.channel;
    onNewNamespace(data.channel, data.sender);
  });
});

function addNom(currentPartie, nomInfo) {
  if (!currentPartie.participants.find(item => item.nom == nomInfo.nom)) {
    var participant = {
      nom: nomInfo.nom,
      id: currentPartie.participants.length + 1,
      isAdmin: nomInfo.isAdmin,
      avatar: nomInfo.avatar
    }
    if (currentPartie.participants.length <= 3) {
      currentPartie.participants.push(participant);
    }
    else {
      participant.isSpectateur = true;
      currentPartie.participants.push(participant);
    }
    console.log("addNom", currentPartie.datePartie);
  }
}

function nextPlayer(currentPlayer) {
  if (currentPlayer == 1)
    return 4;
  else if (currentPlayer == 2)
    return 3;
  else if (currentPlayer == 3)
    return 1;
  else if (currentPlayer == 4)
    return 2;
}

function previousPlayer(currentPlayer) {
  if (currentPlayer == 1)
    return 3;
  else if (currentPlayer == 2)
    return 4;
  else if (currentPlayer == 3)
    return 2;
  else if (currentPlayer == 4)
    return 1;
}

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
  if (!currentContrat.value) {
    console.log("calculMene", "Pas d'atout défini");
    return;
  }
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

function newPartie(partieId) {
  return {
    partieId: partieId,
    departId: 0,
    datePartie : new Date(),
    nbTour: nbTour,
    total1: 0,
    total2: 0,
    participants: [],
    contrats: [{
      partanceId: 1,
      playerId: 1,
      enchereId:1,
      isSansEnchere : false,
      initCards: [],
      cards: [],
      menes: [{
        playerId: 0,
        cards: undefined,
        total1: 0,
        total2: 0
      }]
    }]
  };
}

function getCurrentPartie(partieId) {
  return listePartie.find(item => item.partieId == partieId);
}

function TirageCarte(newContrat, initCards) {
  var sortedCards = initCards.sort(function () { return 0.5 - Math.random() });
  for (var numParticipant = 1; numParticipant <= 4; numParticipant++) {
    var newCards = SortCards(sortedCards.slice(0, 8));
    newContrat.initCards.push(newCards.slice(0));
    newContrat.cards.push(newCards.slice(0)); //Clonage
    sortedCards = sortedCards.slice(8);
  }
}

function getInfoPartie(currentPartie) {
  return {
    partie: {
      partieId: currentPartie.partieId,
      departId: currentPartie.departId,
      datePartie: currentPartie.datePartie,
      nbTour: currentPartie.nbTour,
      total1: currentPartie.total1,
      total2 :currentPartie.total2,
      participants: currentPartie.participants
    },
    contrat: currentPartie.contrats[currentPartie.contrats.length - 1]
  }
}



function onNewNamespace(channel, sender) {
  console.log('onNewNamespace', channel, sender);
  Socketio.of('/' + channel).on('connection', function (socket) {
    var username;
    if (Socketio.isConnected) {
      Socketio.isConnected = false;
      socket.emit('connect', true);
    }

    socket.on('message', function (data) {
      if (data.sender == sender) {
        if (!username) username = data.data.sender;
        console.log('message', data.data);
        socket.broadcast.emit('message', data.data);
      }
    });

    socket.on('disconnect', function () {
      if (username) {
        socket.broadcast.emit('user-left', username);
        username = null;
      }
    });
  });
}
