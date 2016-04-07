  "use strict"; // don't use let or const or fetch!

  var app = {
      image: null
      , imgOptions: null
      , imgData: null
      , uuid: null
      , urlGetAllReviews: "https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/"
      , urlGetReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/get/"
      , urlSetNewReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/set/"
      , initialize: function () {
          // document.addEventListener('deviceready', this.onDeviceReady, false); //**********************************
          document.addEventListener("DOMContentLoaded", this.onDeviceReady); // for regular development use this
      },

      onDeviceReady: function () {

          // Get the device uuid, Note: we will use the device plugin for this
          app.uuid = "9999"; // device.uuid;  //**********************************

          console.log(app.uuid);


          var params = new FormData();
          params.append("uuid", app.uuid);
          app.ajaxCall(app.urlGetAllReviews
              , params
              , app.gotList
              , app.ajaxErr);
          var btnSubmit = document.getElementById("submit-btn");
          var hammer2 = new Hammer(btnSubmit);
          hammer2.on("tap", app.submitNewReview);
          //btnSubmit.addEventListener("click", app.submitNewReview);

          var cameraBtn = document.getElementById("cameraBtn");
          var hammer3 = new Hammer(cameraBtn);
          hammer3.on("tap", app.callCamera);
          //cameraBtn.addEventListener("click", app.callCamera);
          console.log("button listener added");
          app.image = document.getElementById("picture");
          var pl = document.querySelectorAll(".page-link");

    [].forEach.call(pl, function (obj, index) {
              var touchGesture = new Hammer(obj);
              touchGesture.on("tap", app.navigate);
              // obj.addEventListener("click", app.navigate);
          });
          //add listeners to pages
          var pages = document.querySelectorAll("[data-role=page]");
  [].forEach.call(pages, function (obj, index) {
              obj.className = "inactive-page";
              if (index == 0) {
                  obj.className = "active-page";
              }
              //transitionend or animationend listeners
              obj.addEventListener("animationend", app.pageAnimate);
          });


      },

      ajaxCall: function (url, formData, success, fail) {


          var xhr = new XMLHttpRequest();
          xhr.open("POST", url);
          xhr.addEventListener("load", success);
          xhr.addEventListener("error", fail);
          xhr.send(formData);
      }
      , //display review info for each
      gotList: function (ev) {


          var xhr = ev.target;

          if (parseInt(xhr.status) < 300) {

              var data = JSON.parse(xhr.responseText);

              if (data.code == 0) { // Zero from PHP = OK

                  console.dir(data.reviews);

                  var reviews = data.reviews;

                  var list = document.querySelector("#list"); // get the list element

                  list.innerHTML = ""; // empty the existing list

                  if (reviews.length > 0) { // we have previous review(s)

                      console.log("We have existing reviews: " + data.message);

                      reviews.forEach(function (obj) {
                          var target = ev.target;
                          var id = target.id;
                          var li = document.createElement("li");
                          var tapBtn = new Hammer(li);


                          li.setAttribute("data-review", obj.id);
                          li.setAttribute("class", "reviewLi")

                          li.textContent = obj.title + "  " + obj.rating + " stars";


                          list.appendChild(li);
                          tapBtn.on("tap", app.getDetails);
                          //  li.addEventListener("click", app.getDetails);

                          console.log("Existing data: ID: " + obj.id + " Title: " + obj.title + " Rating: " + obj.rating);
                      });


                  } else { // no existing reviews 

                      console.log("no existing reviews: " + data.message);


                      // create a single list item and display the default message
                      var li = document.createElement("li");
                      li.className = "loading";
                      li.setAttribute("data-review", 0);
                      li.textContent = data.message;
                      list.appendChild(li);

                  }

              } else { // Did not get zero from PHP = NOT OK!
                  app.ajaxErr(data);
              }

          } else { // xhr Status Error
              app.ajaxErr({
                  "message": "Invalid HTTP Response"
              });
          }

      },

      ajaxErr: function (err) {
          alert(err.message); //AJAX problem
      },



      getDetails: function (ev) {
          console.log("clicked");
          ev.preventDefault();
          var target = ev.target;
          var review_id = target.getAttribute("data-review");
          var params = new FormData();
          params.append("uuid", app.uuid);
          params.append("review_id", review_id);
          app.ajaxCall(app.urlGetReview, params, app.gotDetails, app.ajaxErr);

      },

      getRating: function () {
          if (document.getElementById("star-1").checked) {

              return "1";
          } else if (document.getElementById("star-2").checked) {
              return "2";
          } else if (document.getElementById("star-3").checked) {
              return "3";
          } else if (document.getElementById("star-4").checked) {
              return "4";
          } else if (document.getElementById("star-5").checked) {
              return "5";
          }
      },

      gotDetails: function (ev) {
          var xhr = ev.target;

          if (parseInt(xhr.status) < 300) {

              var data = JSON.parse(xhr.responseText);
              console.dir(data);
              if (data.code === 0) { // Zero from PHP = OK
                  var details = data.review_details;


                  console.dir(details);

                  var img = document.getElementById("detailImage");
                  app.imgData = decodeURIComponent(details.img);
                  img.src = app.imgData;

                  document.querySelector("#review_Title").textContent = details.title;
                  document.querySelector("#star_rating").textContent = "stars: " + details.rating;
                  document.querySelector("#review").textContent = details.review_txt;
                  var changePage = document.getElementById("details");
                  var currentPage = document.getElementById("list");
                  var stars = document.querySelector("#star_rating");
                  switch (details.rating) {
                  case 1:
                      stars.textContent = "★"
                      break;
                  case 2:
                      stars.textContent = "★★"
                      break;
                  case 3:
                      stars.textContent = "★★★"
                      break;
                  case 4:
                      stars.textContent = "★★★★"
                      break;
                  case 5:
                      stars.textContent = "★★★★★"
                      break;
                  default:
                      stars.textContent = ""
                      break;
                  }



                  currentPage.setAttribute("class", "inactive-page");
                  changePage.setAttribute("class", "active-page");
              } else { // Did not get zero from PHP = NOT OK!
                  app.ajaxErr(data);

              }

          } else { // xhr Status Error
              app.ajaxErr({
                  "message": "Invalid HTTP Response"
              });
          }

      },

      submitNewReview: function (ev) {


          console.log('sent!');
          var title = document.getElementById('title').value;
          console.log(title);
          var review_text = document.getElementById('review_input').value;
          var imageBase64 = encodeURIComponent(app.image.src);
          var rating = app.getRating();

          var params = new FormData();

          params.append('uuid', app.uuid);
          params.append('action', 'insert'); // for php
          params.append('title', title);
          params.append('rating', rating);
          params.append('review_txt', review_text);
          params.append('img', imageBase64);

          app.ajaxCall(app.urlSetNewReview
              , params
              , app.saveReview
              , app.ajaxErr);

      },



      saveReview: function (ev) {

          console.log("saved");
          var xhr = ev.target;

          if (parseInt(xhr.status) < 300) {

              var data = JSON.parse(xhr.responseText);
              console.dir(data);

              var changePage = document.getElementById("list");
              var currentPage = document.getElementById("add");

              location.reload();




              currentPage.setAttribute("class", "inactive-page");
              changePage.setAttribute("class", "active-page");

          } else { // xhr Status Error
              app.ajaxErr({
                  "message": "Invalid HTTP Response"
              });
          }


      },


      callCamera: function () {
          app.imgOptions = {
              quality: 75
              , destinationType: Camera.DestinationType.DATA_URL
              , sourceType: Camera.PictureSourceType.CAMERA
              , allowEdit: false
              , encodingType: Camera.EncodingType.JPEG
              , mediaType: Camera.MediaType.PICTURE
              , targetWidth: 200
              , cameraDirection: Camera.Direction.FRONT
              , saveToPhotoAlbum: false
          };

          navigator.camera.getPicture(app.imgSuccess, app.imgFail, app.imgOptions);
      },

      imgSuccess: function (imageData) {
          console.log(app.image);
          app.image.src = "data:image/jpeg;base64," + imageData;
          navigator.camera.cleanup();
      },

      imgFail: function (msg) {
          console.log("Failed to get image: " + msg);
      },

      navigate: function (ev) {
          ev.preventDefault();
          var btn = ev.target;
          var href = btn.href;
          var id = href.split("#")[1];
          //history.pushState();
          var pages = document.querySelectorAll('[data-role="page"]');
          for (var p = 0; p < pages.length; p++) {
              //console.log(pages[p].id, page);
              if (pages[p].id === id) {
                  pages[p].classList.remove("hidden");
                  if (pages[p].className !== "active-page") {
                      pages[p].className = "active-page";
                  }
                  //console.log("active ", page)
              } else {
                  if (pages[p].className !== "inactive-page") {
                      pages[p].className = "inactive-page";
                  }
              }
          }
      },

      pageAnimate: function (ev) {
          //console.log("Transition finished for " + ev.target.id);
          //console.dir(ev);
          var page = ev.target;
          if (page.className == "active-page") {
              console.log(ev.target.id, " has just appeared");
          } else {
              console.log(ev.target.id, " has just disappeared");
              ev.target.classList.add("hidden");
          }
      }



  };

  app.initialize();









  //navigation