// this variable will store images for preview
var images = [];

// this function will select images
function image_select() {
  var image = document.getElementById("image").files;

  for (i = 0; i < image.length; i++) {
    if (check_duplicate(image[i].name)) {
      images.push({
        name: image[i].name,
        url: URL.createObjectURL(image[i]),
        file: image[i],
      });
    } else {
      alert(image[i].name + " is already added to the list");
    }
  }

  /* document.getElementById("form").reset(); */
  document.getElementById("container").innerHTML = image_show();
}
// this function will show images in the DOM
function image_show() {
  var image = "";
  images.forEach((i) => {
    image +=
      `<div class="image_container d-flex justify-content-center position-relative">
                   <img src="` +
      i.url +
      `" alt="Image">
                   <span class="position-absolute" onclick="delete_image(` +
      images.indexOf(i) +
      `)">&times;</span>
             </div>`;
  });
  return image;
}

// this function will get all images from the array
function get_image_data() {
  var form = new FormData();
  for (let index = 0; index < images.length; index++) {
    form.append("file[" + index + "]", images[index]["file"]);
  }
  return form;
}

// this function will delete a specific image from the container
function delete_image(e) {
  images.splice(e, 1);

  var niz = document.getElementById("image").files;

  console.log("Niz privremeni: ", images);
  /* console.log("Glavni niz splice: ", niz.splice(e, 1)); */
  /* console.log("Glavni niz direktno: ", document.getElementById("image").files); */
  /* console.log("Glavni niz napr: ", niz); */

  let fileArray = Array.from(document.getElementById("image").files);
  console.log("Niz fileArray: ", fileArray);

  fileArray.splice(e, 1);
  console.log("Niz fileArray poslije: ", fileArray);

  document.getElementById("container").innerHTML = image_show();
}

// this function will check duplicate images
function check_duplicate(name) {
  var image = true;
  if (images.length > 0) {
    for (e = 0; e < images.length; e++) {
      if (images[e].name == name) {
        image = false;
        break;
      }
    }
  }
  return image;
}
