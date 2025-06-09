/**
* Template Name: PhotoFolio
* Updated: Jan 09 2024 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/photofolio-bootstrap-photography-website-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
document.addEventListener('DOMContentLoaded', () => {
  "use strict";

/**
 * Preloader
 */
const preloader = document.querySelector('#preloader');
if (preloader) {
  window.addEventListener('load', () => {
    preloader.classList.add('loaded');

    // Use a slight delay to ensure the preloader animation completes smoothly
    setTimeout(() => {
      preloader.remove();
    }, 300); // Adjust as needed to ensure smooth transition
  });
}


  /**
   * Mobile nav toggle
   */
  const mobileNavShow = document.querySelector('.mobile-nav-show');
  const mobileNavHide = document.querySelector('.mobile-nav-hide');

  document.querySelectorAll('.mobile-nav-toggle').forEach(el => {
    el.addEventListener('click', function(event) {
      event.preventDefault();
      mobileNavToogle();
    })
  });

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavShow.classList.toggle('d-none');
    mobileNavHide.classList.toggle('d-none');
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navbar a').forEach(navbarlink => {

    if (!navbarlink.hash) return;

    let section = document.querySelector(navbarlink.hash);
    if (!section) return;

    navbarlink.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  const navDropdowns = document.querySelectorAll('.navbar .dropdown > a');

  navDropdowns.forEach(el => {
    el.addEventListener('click', function(event) {
      if (document.querySelector('.mobile-nav-active')) {
        event.preventDefault();
        this.classList.toggle('active');
        this.nextElementSibling.classList.toggle('dropdown-active');

        let dropDownIndicator = this.querySelector('.dropdown-indicator');
        dropDownIndicator.classList.toggle('bi-chevron-up');
        dropDownIndicator.classList.toggle('bi-chevron-down');
      }
    })
  });

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const togglescrollTop = function() {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
    window.addEventListener('load', togglescrollTop);
    document.addEventListener('scroll', togglescrollTop);
    scrollTop.addEventListener('click', window.scrollTo({
      top: 0,
      behavior: 'smooth'
    }));
  }

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper slider with 1 slide at once in desktop view
   */
  new Swiper('.slides-1', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });

  /**
   * Init swiper slider with 3 slides at once in desktop view
   */
  new Swiper('.slides-3', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 40
      },

      1200: {
        slidesPerView: 3,
      }
    }
  });

  /**
   * Animation on scroll function and init
   */
  function aos_init() {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', () => {
    aos_init();
  });

});

document.addEventListener("DOMContentLoaded", function () {
  const sectionHeaders = document.querySelectorAll('.work-section-header');
  const sectionContents = document.querySelectorAll('.work-section-content');

  sectionHeaders.forEach((header, index) => {
    header.addEventListener('click', function () {
      // Toggle the visibility of the clicked section's content
      const content = sectionContents[index];
      content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';

      // Close all other sections
      sectionContents.forEach((otherContent, otherIndex) => {
        if (otherIndex !== index) {
          otherContent.style.display = 'none';
        }
      });
    });
  });

  sectionContents.forEach(content => {
    content.addEventListener('click', function (event) {
      // Prevent hiding when clicking on the content itself
      event.stopPropagation();
    });
  });

  document.body.addEventListener('click', function (event) {
    // Close all sections if the user clicks somewhere else on the page
    if (!event.target.closest('.work-section-header')) {
      sectionContents.forEach(content => {
        content.style.display = 'none';
      });
    }
  });
});

function showJobDetails(section, jobId) {
  // Remove active class from all items
  document.querySelectorAll('.timeline-item').forEach(function(item) {
      item.classList.remove('active');
  });

  // Add active class to the clicked item
  const selectedTimelineItem = document.querySelector(`#${section}Timeline .timeline-item:nth-child(${jobId})`);
  selectedTimelineItem.classList.add('active');

  // Hide all job details
  document.querySelectorAll('.job-details').forEach(function(detail) {
    detail.classList.add('d-none');
  });

  document.querySelectorAll('.education-details').forEach(function(detail) {
    detail.classList.add('d-none');
  });

  // Show the selected job details
  document.getElementById(section + 'Details' + jobId).classList.remove('d-none');
}

document.getElementById('schoolBtn').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('cocurricularBtn').classList.remove('active');
  document.getElementById('schoolTimeline').classList.remove('d-none');
  document.getElementById('cocurricularTimeline').classList.add('d-none');
  showJobDetails('school', 1); // Show the first school detail by default
});

document.getElementById('cocurricularBtn').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('schoolBtn').classList.remove('active');
  document.getElementById('schoolTimeline').classList.add('d-none');
  document.getElementById('cocurricularTimeline').classList.remove('d-none');
  showJobDetails('cocurricular', 1); // Show the first cocurricular detail by default
});
document.getElementById('schoolBtnmob').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('cocurricularBtnmob').classList.remove('active');
  document.getElementById('schoolmob').classList.remove('d-none');
  document.getElementById('cocurricularmob').classList.add('d-none');
  showJobDetails('school', 1); // Show the first school detail by default
});

document.getElementById('cocurricularBtnmob').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('schoolBtnmob').classList.remove('active');
  document.getElementById('schoolmob').classList.add('d-none');
  document.getElementById('cocurricularmob').classList.remove('d-none');
  showJobDetails('cocurricular', 1); // Show the first cocurricular detail by default
});

function showJobDetails(section, jobId) {
  // Remove active class from all items
  document.querySelectorAll('.timeline-item').forEach(function(item) {
      item.classList.remove('active');
  });

  // Add active class to the clicked item
  const selectedTimelineItem = document.querySelector(`#${section}Timeline .timeline-item:nth-child(${jobId})`);
  selectedTimelineItem.classList.add('active');

  // Handle smaller screens
  if (window.innerWidth <= 768) {
    // Hide all job details first
    document.querySelectorAll('.timeline-item .job-details').forEach(function(detail) {
      detail.style.display = 'none';
    });

    document.querySelectorAll('.timeline-item .education-details').forEach(function(detail) {
      detail.style.display = 'none';
  });

    // Show the selected job details below the selected timeline item
    const selectedJobDetail = document.getElementById(section + 'Details' + jobId);
    selectedJobDetail.style.display = 'block';
  } else {
    // Handle larger screens
    document.querySelectorAll('.job-details').forEach(function(detail) {
      detail.classList.add('d-none');
    });

    document.querySelectorAll('.education-details').forEach(function(detail) {
      detail.classList.add('d-none');
  });

    // Show the selected job details on the right for larger screens
    document.getElementById(section + 'Details' + jobId).classList.remove('d-none');
  }
}

// Event listeners for the buttons
document.getElementById('schoolBtnmob').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('cocurricularBtnmob').classList.remove('active');
  document.getElementById('schoolmob').classList.remove('d-none');
  document.getElementById('cocurricularmob').classList.add('d-none');
  showJobDetails('school', 1); // Show the first school detail by default
});

document.getElementById('cocurricularBtnmob').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('schoolBtnmob').classList.remove('active');
  document.getElementById('schoolmob').classList.add('d-none');
  document.getElementById('cocurricularmob').classList.remove('d-none');
  showJobDetails('cocurricular', 1); // Show the first cocurricular detail by default
});
// Event listeners for the buttons
document.getElementById('schoolBtn').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('cocurricularBtn').classList.remove('active');
  document.getElementById('schoolTimeline').classList.remove('d-none');
  document.getElementById('cocurricularTimeline').classList.add('d-none');
  showJobDetails('school', 1); // Show the first school detail by default
});

document.getElementById('cocurricularBtn').addEventListener('click', function () {
  this.classList.add('active');
  document.getElementById('schoolBtn').classList.remove('active');
  document.getElementById('schoolTimeline').classList.add('d-none');
  document.getElementById('cocurricularTimeline').classList.remove('d-none');
  showJobDetails('cocurricular', 1); // Show the first cocurricular detail by default
});

// Ensure the details are shown on load based on screen size
window.addEventListener('load', function () {
  if (window.innerWidth <= 768) {
    showJobDetails('school', 1);
  } else {
    showJobDetails('school', 1);
  }
});