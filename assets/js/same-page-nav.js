/**
 * Prevent full reload when clicking a link to the page you're already on.
 * Same-page hash links scroll in place instead.
 */
(function () {
  "use strict";

  function pageKey(pathname) {
    var name = pathname.split("/").pop();
    return !name || name === "" ? "index.html" : name;
  }

  function isInternalPageUrl(url) {
    if (url.origin !== window.location.origin) {
      return false;
    }
    var path = url.pathname;
    return path === "/" || /\.html$/i.test(path);
  }

  function closeMobileNav() {
    if (!document.body.classList.contains("mobile-nav-active")) {
      return;
    }
    document.body.classList.remove("mobile-nav-active");
    var show = document.querySelector(".mobile-nav-show");
    var hide = document.querySelector(".mobile-nav-hide");
    if (show) {
      show.classList.remove("d-none");
    }
    if (hide) {
      hide.classList.add("d-none");
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.defaultPrevented) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      var link = e.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      var href = link.getAttribute("href");
      if (
        !href ||
        href.charAt(0) === "#" ||
        href.indexOf("mailto:") === 0 ||
        href.indexOf("tel:") === 0 ||
        href.indexOf("javascript:") === 0
      ) {
        return;
      }

      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (err) {
        return;
      }

      if (!isInternalPageUrl(url)) {
        return;
      }

      if (pageKey(url.pathname) !== pageKey(window.location.pathname)) {
        return;
      }

      e.preventDefault();
      closeMobileNav();

      if (url.hash) {
        var target = document.querySelector(url.hash);
        if (target) {
          var reduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          if (window.history && window.history.pushState) {
            window.history.pushState(null, "", url.pathname + url.search + url.hash);
          }
        }
      }
    },
    false
  );
})();
