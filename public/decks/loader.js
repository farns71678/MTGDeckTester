loadDecks();

async function loadDecks() {
    try {
        let deckResponse = await fetch('/decklist');
        if (!deckResponse.ok) {
            throw new Error('Failed to fetch deck information: ' + deckResponse.statusText);
        }
        else {
            const data = await deckResponse.json();
            const decks = data.decks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            const mainPage = document.getElementById('decks-column');
            const loadingMsg = document.getElementById('center-msg-container');
            loadingMsg.style.display = 'none';

            if (decks.length <= 8) {
                $(mainPage).append(`<h2>All</h2><div id="all-container" class="deck-list-container"></div>`);
                const allContainer = document.getElementById('all-container');
                
                decks.forEach(deck => {
                    allContainer.insertAdjacentHTML('beforeend', getDeckHTML(deck, data.username));
                });
            }
            else {
                // recent and all sections
                $(mainPage).append('<h2>Recent</h2><div id="recent-container" class="deck-list-container"></div><a href="./recent" id="recent-decks-link">Recent Decks</a><h2>All</h2><div id="all-container" class="deck-list-container"></div>');
                const recentContainer = document.getElementById('recent-container');
                const allContainer = document.getElementById('all-container');

                const recentdecks = decks.slice(0, 8);
                recentdecks.forEach(deck => {
                    recentContainer.insertAdjacentHTML('beforeend', getDeckHTML(deck, data.username));
                });

                decks.forEach(deck => {
                    allContainer.insertAdjacentHTML('beforeend', getDeckHTML(deck, data.username));
                });
            }
        }
    } 
    catch (error) {
        switchMessage("loading-err-msg");
        console.log("Error loading decks: ", error.message);
    }
}

function switchMessage(id) {
    $(".center-msg").addClass("hidden");
    $("#" + id).removeClass("hidden");
}