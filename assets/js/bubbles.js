// Normal //
// particlesJS(
//     "dots", {
//     "particles": {
//       "number": {
//         "value": 250
//       },
//       "color": {
//         "value": ["#eee", "#2cbc85"]//, "ef6603"]
//       },
//       "shape": {
//         "type": "circle"
//       },
//       "opacity": {
//         "value": 0.2,
//         "random": true,
//         "anim": {
//           "enable": false
//         }
//       },
//       "size": {
//         "value": 7,
//         "random": true,
//         "anim": {
//           "enable": false,
//         }
//       },
//       "line_linked": {
//         "enable": false
//       },
//       "move": {
//         "enable": true,
//         "speed": 3,
//         "direction": "none",
//         "random": true,
//         "straight": false,
//         "out_mode": "out"
//       }
//     },
//     "interactivity": {
//       "detect_on": "canvas",
//       "events": {
//         "onhover": {
//           "enable": false
//         },
//         "onclick": {
//           "enable": true,
//           "mode": "push"
//         },
//         "resize": true
//       },
//       "modes": {
//         "push": {
//           "particles_nb": 30
//         }
//       }
//     },
//     "retina_detect": true
//   });  



// Push On Hover //

particlesJS(
    "dots", {
    "particles": {
      "number": {
        "value": 150
      },
      "color": {
        "value": ["#eee", "#5481ED"]
      },
      "shape": {
        "type": "triangle"
      },
      "opacity": {
        "value": 0.25,
        "random": true,
        "anim": {
          "enable": false
        }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": {
          "enable": true,
        }
      },
      "line_linked": {
        "enable": false
      },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out"
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "push": {
          "particles_nb": 20
        },
        "repulse": {
          "distance": 20,
          "duration": 1
        }
      }
    },
    "retina_detect": true
  });
