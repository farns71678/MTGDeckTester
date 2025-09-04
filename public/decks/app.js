
const formats = [
    { name: "standard", singleton: false, size: 60 },
    { name: "modern", singleton: false, size: 60 },
    { name: "legacy", singleton: false, size: 60 },
    { name: "pauper", singleton: false, size: 60 },
    { name: "vintage", singleton: false, size: 60 },
    { name: "brawl", singleton: true, size: 60 },
    { name: "commander", singleton: true, size: 100 },
    { name: "duel", singleton: false, size: 60 },
    { name: "pioneer", singleton: false, size: 60 },
    { name: "penny", singleton: false, size: 60 },
];

$(document).ready(() => {

    $("#create-from-load").on("click", (event) => {
        event.preventDefault();
        $("#deck-file-load").trigger("click");
    });

    $("#deck-file-load").on("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                try {
                    const deckData = JSON.parse(content);
                    if (deckData && deckData.cards && deckData.cards.length > 0) {
                        const deck = {
                            name: deckData.name || "Untitled Deck",
                            format: deckData.format,
                            cards: deckData.cards.map(card => ({
                                scryfallId: card.id,
                                count: card.count || 1,
                                sideboard: card.sideboard || false
                            }))
                        };
                        const response = await fetch('/createdeck', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(deck)
                            });
                        if (!response.ok) {
                            const errorText = await response.text();
                            displayError(errorText);
                            return;
                        }

                        if ($("#create-from-load").length == 0) {
                            const data = await response.json();
                            const html = getDeckHTML(data.deck, data.username);
                            $("#all-container").prepend(html);
                            $("#recent-container").prepend(html);
                        }
                        else location.href = "/decks";
                    } 
                    else {
                        displayError("Invalid deck file format. Make sure the file is valid JSON and contains a 'cards' array.");
                    }
                } 
                catch (error) {
                    displayError(error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    $("#error-back").on("click", (event) => {
        event.preventDefault();
        switchMessage("no-decks-container");
    });

    $("#clear-search").on("click", (event) => {
        $("#deck-search").val("");
    });

    $("#sort-direction").on("click", function () {
        $(this).toggleClass("bx-sort-up bx-sort-down");
    });

    $("#load-deck").on("click", () => {
        $("#deck-file-load").trigger("click");
    });

    /*$(".modal-close-btn").on("click", function () {
        $(".modal-container").addClass("hidden");
    });*/

    $("#delete-deck-btn").on("click", async function() {
        const deckId = $(this).data('deck-id');
        const error = $("#delete-deck-dialog p.error")[0];
        error.textContent = "";
        try {
            if (deckId) {
                const response = await fetch('/deletedeck', {
                    method: "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": { _id: deckId }
                });

                if (!response.ok) throw new Error("Error deleting deck. ");

                $(`.deck-container[data-deck-id='${ deckId }']`).remove();
                $("#delete-deck-cancel-btn").trigger('click');
            }
            else {
                error.textContent = "An unexpected error occured. Please close and try again.";
            }
        }
        catch (err) {
            error.textContent = "An unexpected error occured. Please close and try again.";
        }
    });
});

function displayError(msg) {
    $("#error-msg").text(msg);
    switchMessage("error-msg-container");
}

function switchMessage(id) {
    $(".center-msg").addClass("hidden");
    $("#" + id).removeClass("hidden");
}

function editDeck(url) {
    window.location = url;
}

function toggleIconToolRow(id) {
    const container = document.getElementById(id);
    const row = container.querySelector(".deck-icon-tool-row");
    row.classList.toggle("deck-icon-tool-hidden");
}

function showModal(id) {
    const dialog = document.getElementById(id);

    if (dialog) {
        $(".modal-dialog").addClass("hidden");
        dialog.removeClass("hidden");
        $("modal-container").removeClass("hidden");
    }
}

function deleteDeck(deck) {
    //showDeleteDialog(deck);
    alert('called');
    const dialog = document.getElementById("delete-deck-dialog");
    dialog.querySelector("p.error").innerHTML = "Error";
    dialog.querySelector("#delete-deck-name").innerHTML = deck.name;
    dialog.querySelector("#delete-deck-btn").setAttribute("data-deck-id", deck._id);
}

const getDeckHTML = (deck, username) => {
    let colorHTML = "";
    if (deck.colors.length == 0) {
        colorHTML = '<span class="deck-color card-symbol-C">{C}</span>';
    } else { 
        for (let i = 0; i < deck.colors.length; i++) { 
            const c = deck.colors.toUpperCase()[i];
            colorHTML += '<span class="deck-color card-symbol-' + c + '">{' + c + '}</span>';
        }
    }
    
    return `<div id="deck-${ deck._id}" class="deck-container" data-deck-id="${ deck._id }" data-deck="${ JSON.stringify(deck) }" ondblclick=editDeck('/${ username }/${ deck._id }') style="background-image: url('${ (deck.backgroundUrl == null || deck.backgroundUrl == "" ? "https://wallpaperbat.com/img/339185-res-1920x-magic-the-gathering-trading-card-games-hd.jpg" : deck.backgroundUrl) }');">
        <div class="deck-icon-tool-row deck-init-hidden deck-icon-tool-hidden">
            <i class="bx bx-share-alt"></i>
            <i class="bx bx-git-repo-forked"></i>
            <i class="bx bxs-trash" onclick="deleteDeck(${ deck })" data-bs-toggle="modal" data-bs-target="#delete-deck-dialog"></i>
        </div>        
        <div class="deck-fade"></div>
            <div class="deck-details">
                <div class="deck-color-row deck-init-hidden">
                    ${colorHTML}
                    <div class="deck-format">${ formats[deck.format].name }</div>
                    <i class="bx bx-check"></i>
                    <div class="deck-count">${ deck.count }/${ formats[deck.format].size }</div>
                </div>
                <div class="deck-header">
                    <div class="deck-name deck-flex-last">${ (deck.name == null ? "Untitled Deck" : deck.name) }</div>
                    <div class="deck-icon-row">
                        <a href="/${username}/${deck._id}" class="deck-edit-link"><i class="bx bxs-edit deck-init-hidden"></i></a>
                        <i class="bx bx-dots-vertical-rounded" onclick="toggleIconToolRow('deck-${ deck._id }')"></i>
                    </div>
                </div>
            </div>
        </div>`;
}

const deleteDeckModalHTML = (deck) => {
    return `<div class="modal" tabindex="-1">
      <div id="delete-deck-dialog" class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Deck</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Warning!</strong> This action is irreversible. Are you sure you want to delete deck "<span id="delete-deck-name">${ deck.name }</span>"?</p>
            <p class="error"></p>
          </div>
          <div class="modal-footer">
            <button type="button" id="delete-deck-cancel-btn" class="cancel-btn btn-outline-secondary modal-close-btn" data-bs-dismiss="modal">Close</button>
            <button type="button" id="delete-deck-btn" class="btn-outline-warning" data-deck-id="${ deck._id }">Delete Deck</button>
          </div>
        </div>
      </div>
    </div>`;
}