const inputArea = document.querySelector(".comment-block-input__input");
const sendBtn = document.querySelector(".comment-block-input__button");

const comments = document.querySelector(".comments-content__arr");

const showMoreBtn = document.querySelector(".fb-comment__more");

showMoreBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".hidden").classList.remove("hidden");
  showMoreBtn.style.display = "none";
  console.log(typeof showMoreBtn);
});

inputArea.addEventListener("change", (e) => {
  console.log(e);
  e.preventDefault();
  sendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    inputArea.value == false ? console.log("10") : addComment();
  });
});

function addComment() {
  const commentsArr = Array.from(comments.children);
  commentsArr.unshift(inputArea.value);
  const b = document.createElement("div");
  b.classList.add("fb-comment__item");
  b.innerHTML =
    `
    <img src="comments/facebook-user-icon-4.webp"
            alt="" class="fb-comment__avatar flux_cta">
    <div class="fb-comment__content">
        <div class="fb-comment__text">
            <span class="fb-comment__author flux_cta">Guest</span>
            ${inputArea.value}
            <div class="fb-comment__like">
               <img
                        src="comments/like.webp" class="flux_cta">0
            </div>
        </div>
        <div>
            <a class="fb-comment__react flux_cta" href="` +
    offlink +
    `"
                target="_blank">Comme</a>
            <a class="fb-comment__react flux_cta" href="` +
    offlink +
    `"
                target="_blank">Répondre</a>
            <span class="fb-comment__posted">Tout de suite</span>
        </div>
    </div>
    `;

  comments.insertBefore(b, comments.firstChild);
  inputArea.value = "";
}

document.addEventListener("DOMContentLoaded", function () {

  function getURLParameter(name) {
    return (
      decodeURIComponent(
        (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
          location.search
        ) || [null, ""])[1].replace(/\+/g, "%20")
      ) || null
    );
  }

  var tm = getURLParameter("tm");

  var tmElements = document.querySelectorAll(".tm");
  var notmElements = document.querySelectorAll(".notm");

  if (tm === "0") {
    tmElements.forEach(function (el) {
      el.style.display = "none";
    });
    notmElements.forEach(function (el) {
      el.style.display = "block";
    });
  } else {
    tmElements.forEach(function (el) {
      el.style.display = "block";
    });
    notmElements.forEach(function (el) {
      el.style.display = "none";
    });
  }
});