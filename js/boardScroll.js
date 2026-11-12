/* Board: the little arrow bars at the top and bottom of each column (desktop). They only show up when there are more cards above or below. */

/** @type {number} How far one click on an arrow bar scrolls, as a share of the column height */
const SCROLL_STEP = 0.6;

/**
 * Shows an arrow bar only where there is more to see.
 * @param {HTMLElement} body - the .column__body of one column
 */
function updateScrollBars(body) {
    const list = body.querySelector(".column__list");
    const up = body.querySelector(".column__scroll--up");
    const down = body.querySelector(".column__scroll--down");
    up.hidden = list.scrollTop <= 1;
    down.hidden = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
}

/**
 * Scrolls a column by one step. It glides, unless the user prefers less motion, then it just jumps.
 * @param {HTMLElement} body
 * @param {number} direction - -1 is up, 1 is down
 */
function scrollColumn(body, direction) {
    const list = body.querySelector(".column__list");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ top: direction * list.clientHeight * SCROLL_STEP, behavior: calm ? "auto" : "smooth" });
}

/**
 * Hooks up one column. The arrow bars update when you scroll, when the cards are redrawn and when the window changes size.
 * @param {HTMLElement} body
 */
function initColumnScroll(body) {
    const list = body.querySelector(".column__list");
    const update = () => updateScrollBars(body);
    list.addEventListener("scroll", update, { passive: true });
    new MutationObserver(update).observe(list, { childList: true });
    new ResizeObserver(update).observe(list);
    body.querySelectorAll("[data-scroll]").forEach((bar) => {
        bar.addEventListener("click", () => scrollColumn(body, Number(bar.dataset.scroll)));
    });
    update();
}

document.querySelectorAll(".column__body").forEach(initColumnScroll);
window.addEventListener("load", () => document.querySelectorAll(".column__body").forEach(updateScrollBars));
