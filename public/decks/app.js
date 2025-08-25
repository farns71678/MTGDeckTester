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
                        location.href = "/decks";
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