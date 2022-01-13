let svgElem;

$(document).ready(async function () {
  await changeImgToSvg("svg-image");
});

// script to convert img tag to svg
const changeImgToSvg = async (id, url) => {
  $(`#${id}`).each(async function () {
    var img = $(this);
    var image_uri = url || img.attr("src");
    await $.get(
      image_uri,
      function (data) {
        var svg = $(data).find("svg");
        svg.removeAttr("xmlns:a");
        svg.attr("id", id);
        svg.addClass("svg-image");
        img.replaceWith(svg);
      },
      "xml"
    );
    svgElem = document.getElementById("svg-image");
    const svg = document.getElementById("image-container");
    getLink("svg-image", "link");
    createCanvas(svg.innerHTML);
    getColorsByPath();
  });
};

// get all colors from svg

const getColorsByPath = () => {
  Array.prototype.slice
    .call(document.getElementsByTagName("path"))
    .map((pathElem, index) => {
      if (window.getComputedStyle(pathElem).fill == "none") {
        return;
      }
      $(pathElem).attr("id", `path-${index + 1}`);
      const container = document.getElementById("color-container");
      const inputElem = document.createElement("input");
      inputElem.setAttribute("id", index + 1);
      inputElem.setAttribute("class", "svg-fill");
      inputElem.setAttribute("type", "color");
      inputElem.setAttribute(
        "value",
        rgb2hex(window.getComputedStyle(pathElem).fill)
      );
      inputElem.addEventListener("input", (e) => {
        $(pathElem).attr("fill", e.target.value);
      });
      inputElem.addEventListener("mouseenter", (e) => {
        const pathElement = document.getElementById(`path-${index + 1}`);
        pathElement.setAttribute("stroke", "blue");
      });
      inputElem.addEventListener("mouseleave", (e) => {
        const pathElement = document.getElementById(`path-${index + 1}`);
        pathElement.removeAttribute("stroke", "blue");
      });
      container.appendChild(inputElem);
    });
};

const getColorsByClass = () => {
  Array.prototype.slice.call(svgElem.children).map((child, index) => {
    if ($(child)[0].localName == "defs") {
      Array.prototype.slice.call($(child)[0].children).map((el) => {
        if ($(el)[0].localName == "style") {
          const html = `${$(el)[0].innerHTML}`;
          const allStyles2 = html.split(";}");
          allStyles2.map((el) => {
            if (el.split(",.").at(-1).includes("fill")) {
              const container = document.getElementById("color-container");
              const inputElem = document.createElement("input");
              inputElem.setAttribute("id", el);
              inputElem.setAttribute("class", "svg-fill");
              inputElem.setAttribute("type", "color");
              const index = el.indexOf("fill:");
              inputElem.setAttribute(
                "value",
                el.substring(index + 5, index + 12)
              );
              const classes = el.split("{")[0].split(",");
              inputElem.addEventListener("input", (e) => {
                classes.map((classElem) => {
                  $(classElem).css("fill", e.target.value);
                });
              });
              inputElem.addEventListener("mouseenter", (e) => {
                classes.map((classElem) => {
                  $(classElem).css("stroke", "blue");
                });
              });
              inputElem.addEventListener("mouseleave", (e) => {
                classes.map((classElem) => {
                  $(classElem).css("stroke", "none");
                });
              });
              container.appendChild(inputElem);
            }
          });
        }
      });
    }
  });
};

// convert rgb to hex

const rgb2hex = (rgb) =>
  `#${rgb
    .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    .slice(1)
    .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
    .join("")}`;

// export to svg file
const getLink = (svgId, anchorId) => {
  //get svg element.
  var svg = document.getElementById(svgId);

  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);

  //add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    );
  }

  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  //convert svg source to URI data scheme.
  var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  //set url value to a element's href attribute.
  document.getElementById(anchorId).href = url;
  document.getElementById(anchorId).download = "image.svg";
  return url;
  //you can download svg file by right click menu.
};

const createCanvas = (svg) => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  v = canvg.Canvg.fromString(ctx, svg);

  // Start SVG rendering with animations and mouse handling.
  v.start();
};

const convertToSvg = (file, type) => {
  var form = new FormData();
  form.append("inputFile", file, "file");

  var settings = {
    url: `https://api.cloudmersive.com/convert/image/${type}/to/SVG`,
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "multipart/form-data",
      Apikey: "dcaaf110-2028-4888-9394-88199deda3d6",
    },
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: form,
  };

  $.ajax(settings).done(function (response) {});
};

document.getElementById("file").addEventListener("input", async (e) => {
  // convertToSvg(e.target.files[0], "PNG");
  const url = URL.createObjectURL(e.target.files[0]);
  // await changeImgToSvg("svg-image", url);
  ImageTracer.imageToSVG(
    url /* input filename / URL */,

    function (svgstr) {
      const svg = document.getElementById("image-container");
      svg.innerHTML = svgstr;
      const newSvgElem = svg.getElementsByTagName("svg");
      newSvgElem[0].setAttribute("id", "svg-image");
      newSvgElem[0].setAttribute("class", "svg-image");
      ImageTracer.appendSVGString(svgstr, "svgcontainer");
    } /* callback function to run on SVG string result */,

    "default" /* Option preset */
  );
});

document.getElementById("colorBy").addEventListener("change", async (e) => {
  if (e.target.value == "path") {
    document.getElementById("color-container").innerHTML = "";
    getColorsByPath();
  } else {
    document.getElementById("color-container").innerHTML = "";
    getColorsByClass();
  }
});

document
  .getElementById("imageDownloadBy")
  .addEventListener("change", async (e) => {
    if (e.target.value == "svg") {
      document.getElementById("size").style.display = "none";
    } else if (e.target.value == "png") {
      document.getElementById("size").style.display = "inline-block";
    } else {
      document.getElementById("size").style.display = "inline-block";
    }
  });

document.getElementById("width").addEventListener("input", (e) => {
  const svg = document.getElementById("image-container");
  document.getElementById("canvas").setAttribute("width", e.target.value);
  createCanvas(svg.innerHTML);
});

document.getElementById("height").addEventListener("input", (e) => {
  const svg = document.getElementById("image-container");
  document.getElementById("canvas").setAttribute("height", e.target.value);
  createCanvas(svg.innerHTML);
});

document.getElementById("submit-btn").addEventListener("click", async () => {
  const url = document.getElementById("url-input").value;
  await changeImgToSvg("svg-image", url);
});

document.getElementById("download-btn").addEventListener("click", () => {
  const imageType = document.getElementById("imageDownloadBy").value;
  let imageUrl;
  const anchorElem = document.getElementById("link");
  if (imageType == "svg") {
    imageUrl = getLink("svg-image", "link");
  } else if (imageType == "png") {
    imageUrl = canvas.toDataURL("image/png");
    anchorElem.href = imageUrl;
    anchorElem.download = "image.png";
  } else {
    imageUrl = canvas.toDataURL("image/png");
    anchorElem.href = imageUrl;
    anchorElem.download = "image.jpeg";
  }
  anchorElem.click();
});
