// TEXT SLIDER STARTED.

(() => {
  let TypingSpeed = 60;
  let NxtMsgDelay = 2000;
  let CharacterPos = 0;
  let MsgBuffer = "";
  let MsgIndex = 0;
  let delay;
  let id = document.getElementById("typing-text");
  let messages = [
    "Welcome To Our Website !",
    "Tutor Finder",
    "The Best Way To Learn From Home.",
  ];

  const StartTyping = () => {
    if (CharacterPos != messages[MsgIndex].length) {
      MsgBuffer += messages[MsgIndex].charAt(CharacterPos);
      id.innerHTML =
        MsgBuffer + (CharacterPos != messages[MsgIndex].length - 1 ? "_" : "");
      delay = TypingSpeed;
      id.scrollTop = id.scrollHeight;
    } else {
      delay = NxtMsgDelay;
      MsgBuffer = "";
      CharacterPos = -1;
      if (MsgIndex != messages.length - 1) {
        MsgIndex++;
      } else {
        MsgIndex = 0;
      }
    }
    CharacterPos++;
    setTimeout(StartTyping, delay);
  };

  StartTyping();
})();

// TEXT SLIDER ENDED.
// Review
var swiper = new Swiper(".slide-content", {
  slidesPerView: 3,
  spaceBetween: 25,
  loop: true,
  centerSlide: "true",
  fade: "true",
  grabCursor: "true",
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    520: {
      slidesPerView: 2,
    },
    950: {
      slidesPerView: 3,
    },
  },
});
