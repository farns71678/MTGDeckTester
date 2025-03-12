let formatOption = document.getElementById("format-option");
let formats = [
  "standard",
  "modern",
  "legacy",
  "pauper",
  "vintage",
  "brawl",
  "commander",
  "duel",
  "pioneer",
  "penny",
];

formats.forEach((format) => {
  formatOption.innerHTML += `<option name="${format}">${format.charAt(0).toUpperCase() + format.slice(1)}</option>`;
});

$("#search-form").submit(function (event) {
  event.preventDefault();
  let searchInput = $("#search-input").val().trim();
  if (searchInput == "") return;
  $("#search-err").text("");

  $.ajax({
    url:
      "https://api.scryfall.com/cards/search?unique=cards&q=name:/.*" + searchInput + ".*/&order=released",
    type: "GET",
    success: function (cards) {
      if (cards.object == "list" && cards.total_cards > 0) {
        $(".search-card").remove();
        cards.data.forEach((card) => {
          if (card.object == "card" && card.image_uris != undefined && card.image_uris.png != undefined && card.image_uris.png != null ) {
            /*$("#search-results").append(
              "<div class='search-card'>" + card.name + "</div>",
            );*/
            let cardEl = $("<img src='" + pathToSelf(card.image_uris.png) + "' class='search-card'>");

            cardEl.on("click", function (event) {
              event.preventDefault();
            });

            
            $("#search-section").append(cardEl);
            $("#search-section").append("<br />");
          }
        });
      } else {
        $("#search-err").html("No cards found.");
      }
    },
    error: function (err) {
      console.log(err);
      $("#search-err").html("There was an error with your request: " + err.responseText);
    },
  });
});

function pathToSelf(url) {
  return ".." + url.substr(url.substr(9).indexOf("/") + 9);
}
