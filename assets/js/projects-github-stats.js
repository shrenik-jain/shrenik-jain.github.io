/**
 * Loads stars, forks, and watchers from the GitHub REST API for project cards
 * that declare data-github-repo="owner/name" on <article.project-card>.
 *
 * Uses one request per distinct owner (GET /users/{owner}/repos) instead of one
 * request per repository, so a page view costs 1 API call instead of N — this
 * stays under GitHub's unauthenticated rate limit (60 req/hour per IP) far longer.
 *
 * Initial numbers in HTML are stored as fallbacks: if the API fails, a repo is
 * missing from the response, or a field is absent from the list payload, those
 * fallbacks are restored instead of forcing zeros.
 */
(function () {
  "use strict";

  var STAT_NAMES = ["watchers", "forks", "stars"];

  function formatCount(n) {
    var x = typeof n === "number" && !Number.isNaN(n) ? n : 0;
    if (x >= 1000000) {
      return (x / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (x >= 10000) {
      return Math.round(x / 1000) + "k";
    }
    if (x >= 1000) {
      return (x / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return String(x);
  }

  function setStat(card, name, value) {
    var el = card.querySelector('[data-stat="' + name + '"]');
    if (el) {
      el.textContent = value;
    }
  }

  /** Remember whatever is in the HTML so we can restore it on API failure. */
  function captureStatFallbacks(cards) {
    for (var c = 0; c < cards.length; c++) {
      var card = cards[c];
      for (var s = 0; s < STAT_NAMES.length; s++) {
        var name = STAT_NAMES[s];
        var el = card.querySelector('[data-stat="' + name + '"]');
        if (el && !el.getAttribute("data-fallback")) {
          el.setAttribute("data-fallback", el.textContent.trim());
        }
      }
    }
  }

  function restoreStatFromFallback(card, name) {
    var el = card.querySelector('[data-stat="' + name + '"]');
    if (!el) {
      return;
    }
    var fb = el.getAttribute("data-fallback");
    if (fb !== null && fb !== "") {
      el.textContent = fb;
    }
  }

  function restoreCardFallbacks(card) {
    for (var i = 0; i < STAT_NAMES.length; i++) {
      restoreStatFromFallback(card, STAT_NAMES[i]);
    }
  }

  function fetchReposForOwner(owner) {
    var accumulated = [];
    function fetchPage(pageNum) {
      if (pageNum > 15) {
        return Promise.resolve(accumulated);
      }
      var url =
        "https://api.github.com/users/" +
        encodeURIComponent(owner) +
        "/repos?per_page=100&page=" +
        pageNum +
        "&type=owner&sort=updated";
      return fetch(url, { headers: { Accept: "application/vnd.github+json" } })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("HTTP " + res.status);
          }
          return res.json();
        })
        .then(function (repos) {
          if (!Array.isArray(repos) || repos.length === 0) {
            return accumulated;
          }
          accumulated = accumulated.concat(repos);
          if (repos.length < 100) {
            return accumulated;
          }
          return fetchPage(pageNum + 1);
        });
    }
    return fetchPage(1);
  }

  function mergeRepoMaps(arrays) {
    var map = {};
    for (var a = 0; a < arrays.length; a++) {
      var repos = arrays[a];
      if (!Array.isArray(repos)) {
        throw new Error("unexpected API response");
      }
      for (var i = 0; i < repos.length; i++) {
        var r = repos[i];
        if (r && r.full_name) {
          map[r.full_name.toLowerCase()] = r;
        }
      }
    }
    return map;
  }

  function applyRepoStats(card, repo) {
    if (typeof repo.subscribers_count === "number" && !Number.isNaN(repo.subscribers_count)) {
      setStat(card, "watchers", formatCount(repo.subscribers_count));
    } else {
      restoreStatFromFallback(card, "watchers");
    }
    if (typeof repo.forks === "number" && !Number.isNaN(repo.forks)) {
      setStat(card, "forks", formatCount(repo.forks));
    } else {
      restoreStatFromFallback(card, "forks");
    }
    if (typeof repo.stargazers_count === "number" && !Number.isNaN(repo.stargazers_count)) {
      setStat(card, "stars", formatCount(repo.stargazers_count));
    } else {
      restoreStatFromFallback(card, "stars");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cards = document.querySelectorAll("article.project-card[data-github-repo]");
    if (!cards.length) {
      return;
    }

    captureStatFallbacks(cards);

    var owners = {};
    for (var c = 0; c < cards.length; c++) {
      var fullName = cards[c].getAttribute("data-github-repo");
      if (!fullName || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(fullName)) {
        continue;
      }
      owners[fullName.split("/")[0]] = true;
    }
    var ownerList = Object.keys(owners);
    if (!ownerList.length) {
      return;
    }

    var fetches = ownerList.map(fetchReposForOwner);

    Promise.all(fetches)
      .then(mergeRepoMaps)
      .then(function (map) {
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          var fn = card.getAttribute("data-github-repo");
          if (!fn || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(fn)) {
            continue;
          }
          var repo = map[fn.toLowerCase()];
          if (!repo) {
            restoreCardFallbacks(card);
            continue;
          }
          applyRepoStats(card, repo);
        }
      })
      .catch(function () {
        for (var j = 0; j < cards.length; j++) {
          restoreCardFallbacks(cards[j]);
        }
      });
  });
})();
