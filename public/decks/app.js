$(document).ready(() => {
    $(".deck-btn-flex>i>.tooltip").each((i, obj) => {
        let rect = obj.getBoundingClientRect();
        obj.style.marginLeft = ( -1 * rect.width / 2) + 'px';
    });

    $(".legal-icon-container").on("click", (event) => {
        $(event.target.parentNode.parentNode.parentNode).toggleClass("legal-view");
    });

    $(".deck-btn-flex>.bx-arrow-back").on("click", (event) => {
        $(event.target.parentNode.parentNode).removeClass("legal-view");
    });

    $(".legal-icon-container").hover((event) => {
        event.preventDefault();
        let parent = event.target;
        if (event.target.tagName == "I" || 
            event.target.classList.contains("legal-text")
        ) parent = event.target.parentNode;
        $(parent.children[0]).toggleClass("bxs-error");
        $(parent.children[0]).toggleClass("bx-error");
        $(parent.children[1]).toggleClass("hover");
    });

    $(".deck-btn-flex>i").on("mouseenter", (event) => {
        let next = event.target.children[0];
        let rect = next.getBoundingClientRect();
        next.style.marginLeft = ( -1 * rect.width / 2);
    });

    $(".deck-btn-flex>i.bx-edit").on("click", (event) => {
        event.preventDefault();
        window.open("../create", "_blank");
    });
});