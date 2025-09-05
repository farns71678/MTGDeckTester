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
                    "body": JSON.stringify({ _id: deckId })
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

    $("#copy-share-link").on("click", async function () {
        const link = $(this).data("share-link");
        const dialog = document.getElementById("share-dialog");
        const error = dialog.querySelector("p.error");
        error.innerHTML = "";

        try {
            if (link) {
                await navigator.clipboard.writeText(link);
                this.classList.remove("bi-clipboard");
                this.classList.add("bi-clipboard-check");
            }
            else {
                throw new Error("An unexpected error occured. Please close and try again later.");
            }
        }
        catch (err) {
            error.innerHTML = "An unexpected error occured. Please close and try again later.";
                this.classList.remove("bi-clipboard");
                this.classList.add("bi-clipboard-x");
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

function deleteDeck(deck) {
    deck = JSON.parse(decodeURIComponent(deck));
    const dialog = document.getElementById("delete-deck-dialog");
    dialog.querySelector("p.error").innerHTML = "";
    dialog.querySelectorAll(".modal-deck-name").forEach((el) => { el.innerHTML = deck.name || "Untitled deck"; });
    dialog.querySelector("#delete-deck-btn").setAttribute("data-deck-id", deck._id);
}

// deck is actually { deck: deck, username: username }
function shareDeck(deck) {
    deck = JSON.parse(decodeURIComponent(deck));
    const dialog = document.getElementById("share-dialog");
    dialog.querySelector("p.error").innerHTML = "";
    dialog.querySelectorAll(".modal-deck-name").forEach((el) => { el.innerHTML = deck.deck.name || "Untitled deck"; });
    const copy = dialog.querySelector("#copy-share-link")
    const link = "https://cautious-happiness-69g5ww6x9prgf546-3000.app.github.dev/" + deck.username + "/" + deck.deck._id;
    copy.setAttribute("data-share-link", link);
    copy.classList.remove("bi-clipboard-x");
    copy.classList.remove("bi-clipboard-check");
    copy.classList.add("bi-clipboard");
    dialog.querySelector("#share-link").innerHTML = link;
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
            <i class="bx bx-cog"></i>
            <i class="bx bx-share-alt" onclick="shareDeck('${ encodeURIComponent(JSON.stringify({ deck, username })) }')" data-bs-toggle="modal" data-bs-target="#share-dialog"></i>
            <i class="bx bx-git-repo-forked"></i>
            <i class="bx bxs-trash" onclick="deleteDeck('${ encodeURIComponent(JSON.stringify(deck)) }')" data-bs-toggle="modal" data-bs-target="#delete-deck-dialog"></i>
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
