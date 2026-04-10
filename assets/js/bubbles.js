/**
 * Original hero background (particles.js) — triangles, repulse on hover, push on click.
 * Enable via assets/js/hero-bg-loader.js: set HERO_BACKGROUND to 'particles'.
 */
particlesJS("dots", {
  particles: {
    number: {
      value: 250,
    },
    color: {
      value: ["#eee", "#5481ED"],
    },
    shape: {
      type: "triangle",
    },
    opacity: {
      value: 0.25,
      random: true,
      anim: {
        enable: false,
      },
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: true,
      },
    },
    line_linked: {
      enable: false,
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "repulse",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      push: {
        particles_nb: 20,
      },
      repulse: {
        distance: 20,
        duration: 1,
      },
    },
  },
  retina_detect: true,
});
