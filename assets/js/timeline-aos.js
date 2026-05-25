/**
 * Scroll-reveal for desktop timelines on work.html & academics.html.
 * Requires AOS (initialized in main.js / main_academics.js on window load).
 */
(function () {
  "use strict";

  function refreshAos() {
    if (typeof AOS !== "undefined") {
      AOS.refresh();
    }
  }

  function decorateTimelineScroll() {
    document.querySelectorAll(".timeline").forEach(function (timeline) {
      if (!timeline.hasAttribute("data-aos")) {
        timeline.setAttribute("data-aos", "fade-up");
        timeline.setAttribute("data-aos-duration", "700");
        timeline.setAttribute("data-aos-easing", "ease-out-cubic");
        timeline.setAttribute("data-aos-offset", "80");
      }

      timeline.querySelectorAll(".timeline-item").forEach(function (item, index) {
        if (item.hasAttribute("data-aos")) {
          return;
        }
        item.setAttribute("data-aos", "fade-up");
        item.setAttribute("data-aos-duration", "650");
        item.setAttribute("data-aos-easing", "ease-out-cubic");
        item.setAttribute("data-aos-delay", String(Math.min(index * 90, 450)));
        item.setAttribute("data-aos-offset", "60");
      });
    });

    document.querySelectorAll(".deskrow .col-lg-6.order-lg-2").forEach(function (col) {
      if (col.hasAttribute("data-aos")) {
        return;
      }
      col.setAttribute("data-aos", "fade-left");
      col.setAttribute("data-aos-duration", "750");
      col.setAttribute("data-aos-delay", "150");
      col.setAttribute("data-aos-easing", "ease-out-cubic");
      col.setAttribute("data-aos-offset", "80");
    });

    document.querySelectorAll(".deskrow .work-title, .deskrow .timeline-mode-tabs").forEach(function (el, index) {
      if (el.hasAttribute("data-aos")) {
        return;
      }
      el.setAttribute("data-aos", "fade-up");
      el.setAttribute("data-aos-duration", "700");
      el.setAttribute("data-aos-delay", String(index * 80));
      el.setAttribute("data-aos-offset", "100");
    });

    document.querySelectorAll(".mobrow .sample-page").forEach(function (section, index) {
      if (section.hasAttribute("data-aos") || section.querySelector("[data-aos]")) {
        return;
      }
      section.setAttribute("data-aos", "fade-up");
      section.setAttribute("data-aos-duration", "650");
      section.setAttribute("data-aos-delay", String(Math.min(index * 100, 500)));
      section.setAttribute("data-aos-offset", "80");
    });
  }

  function bindTabRefresh() {
    document.querySelectorAll(".timeline-mode-tabs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.setTimeout(refreshAos, 120);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    decorateTimelineScroll();
    bindTabRefresh();
  });

  window.addEventListener("load", refreshAos);
})();
