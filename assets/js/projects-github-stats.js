/**
 * Loads stars, forks, and watchers from the GitHub REST API for project cards
 * that declare data-github-repo="owner/name" on <article.project-card>.
 */
(function () {
  "use strict";

  function formatCount(n) {
    if (typeof n !== "number" || Number.isNaN(n)) {
      return "—";
    }
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (n >= 10000) {
      return Math.round(n / 1000) + "k";
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return String(n);
  }

  function setStat(card, name, value) {
    var el = card.querySelector('[data-stat="' + name + '"]');
    if (el) {
      el.textContent = value;
    }
  }

  function loadRepo(fullName, card) {
    var url = "https://api.github.com/repos/" + fullName;
    return fetch(url, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        setStat(card, "watchers", formatCount(data.subscribers_count));
        setStat(card, "forks", formatCount(data.forks));
        setStat(card, "stars", formatCount(data.stargazers_count));
      })
      .catch(function () {
        setStat(card, "watchers", "—");
        setStat(card, "forks", "—");
        setStat(card, "stars", "—");
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cards = document.querySelectorAll("article.project-card[data-github-repo]");
    cards.forEach(function (card) {
      var fullName = card.getAttribute("data-github-repo");
      if (!fullName || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(fullName)) {
        return;
      }
      loadRepo(fullName, card);
    });
  });
})();
