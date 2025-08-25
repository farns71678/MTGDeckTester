loadDecks();

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

function getDeckHTML(deck, username) {
    let colorHTML = "";
    if (deck.colors.length == 0) {
        colorHTML = '<span class="deck-color card-symbol-C">{C}</span>';
    } else { 
        for (let i = 0; i < deck.colors.length; i++) { 
            const c = deck.colors.toUpperCase()[i];
            colorHTML += '<span class="deck-color card-symbol-' + c + '">{' + c + '}</span>';
        }
    }
    
    return `<div class="deck-container" data-deck-id="${ deck._id }" onclick=editDeck('/${ username }/${ deck._id }') style="background-image: url('${ (deck.backgroundUrl == null || deck.backgroundUrl == "" ? "https://wallpaperbat.com/img/339185-res-1920x-magic-the-gathering-trading-card-games-hd.jpg" : deck.backgroundUrl) }');">
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
                            <i class="bx bxs-share-alt deck-init-hidden"></i>
                            <a href="/${username}/${deck._id}" class="deck-edit-link"><i class="bx bxs-edit deck-init-hidden"></i></a>
                            <i class="bx bx-dots-vertical-rounded"></i>
                        </div>
                    </div>
                </div>
            </div>`;
}

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