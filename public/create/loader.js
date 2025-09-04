formatOption = document.getElementById("format-option");

formats.forEach((format) => {
formatOption.innerHTML += `<option value="${format.name}">${
    format.name.charAt(0).toUpperCase() + format.name.slice(1)
}</option>`;
});
$("#format-collapsed-info").html($("#format-option").val().toUpperCase());


loadDeck();

async function loadDeck() {
  try {
    const url = new URL(window.location.href);
    const paths = url.pathname.split('/');
    const username = paths[1];
    const deckId = paths[2];

    const response = await fetch("/deckinfo?_id=" + deckId + (PROXY_ON ? "&retreiveData=true" : "&retreiveData=false"));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${await response.message}`);
    }
    const data = await response.json();
    console.log(data);
    const deck = data;
    if (deck.format != null && deck.format != undefined) {
      formatOption.value = formats[deck.format].name;
      refreshDeckFormat();
    }
    if (deck.name != null && deck.name != undefined)
      $("#deck-name-input").val(deck.name);
    if (deck.description != null && deck.description != undefined)
      $("#description-input").val(deck.description);
    if (deck.cards != null && deck.cards != undefined) {
      loadedCards = [];
      for (let i = 0; i < deck.cards.length; i++) {
        const url = (PROXY_ON ? "/cards/" : "https://api.scryfall.com/cards/") + deck.cards[i].scryfallId;
        let card;
        if (!PROXY_ON) {
          let cardData = await fetch(url);
          if (!cardData.ok) {
            throw new Error(`HTTP error! status: ${cardData.message}`);
          }
          let cardInfo = await cardData.json();
          card = { ...deck.cards[i], ...cardInfo };
        }
        else card = deck.cards[i];
        loadedCards.push(card);
        if (
          (currentFormat.name == "commander" ||
            currentFormat.name == "brawl") &&
            card.commander
        ) {
          if ($("#commander-info-container").hasClass("hidden")) {
            $(commanderImages).attr("src", card.image_uris.normal);
            $(commanderImages).attr("data-name", card.name);
            $("#commander-info-container").removeClass("hidden");
          }
          else {
            let partner = $(".commander-display-image:nth-child(2)");
            $(partner).attr("src", card.image_uris.normal);
            $(partner).attr("data-name", card.name);
            partner.removeClass('hidden');
          }
        }
        else {
          if (card.count > 0) addCard(card, false);
          if (card.sideboard > 0) addCardToSideboard(card);
        }
        refreshDeckColors();
        refreshSections();
      }
    }
    //writeAllLocalStorage();
    refreshDeckColors();
    refreshDeckCardCount();
    refreshEvents();

      // load images
    $(document).ready(function () {
      console.log("loading images...");
      var imagesLoaded = 0;
      var totalImages = $(".card-image:not(#drag-image)").length;

      $(".card-image:not(#drag-image)").each(function (index, img) {
        $(img).on("load", imageLoaded).attr("src", $(img).attr("src"));
      });

      function imageLoaded() {
        console.log(imagesLoaded + 1 + " of " + totalImages + " images loaded");
        imagesLoaded++;
        if (imagesLoaded == totalImages) {
          allImagesLoaded();
        }
      }

      function allImagesLoaded() {
        refreshSections();
        documentLoaded();
      }
    });
  }
  catch (error) {
    //alert('There was an error loading the deck: ' + error.message);
    console.log(error);
    $("#preloader>*").addClass("hidden");
    $("#preloader-error").removeClass("hidden");
    return;
  }
}
