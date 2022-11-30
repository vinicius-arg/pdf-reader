const read = document.querySelector("#file");
const pages = document.querySelector("#pages");
const back = document.querySelector("#back");
const forward = document.querySelector("#forward");
const footer = document.querySelector("footer");

let lastSeenPage = 1;
let currentPage;
let result;
let pdfPages;

window.onload = () => {
    if (!localStorage.getItem("page")) {
        localStorage.setItem("page", lastSeenPage);
    } else {
        lastSeenPage = localStorage.getItem("page");
    } 
}

read.addEventListener("change", event => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
        result = reader.result;
        currentPage = Number(lastSeenPage);
        loadPdf(result, currentPage);

        footer.classList.remove("hidden");
        back.addEventListener("click", backEvent);
        forward.addEventListener("click", forwardEvent);
    }
});

function loadPdf (data, page) {
    let loading = pdfjsLib.getDocument(data);
        loading.promise.then(pdf => {
            renderPage(pdf, page);
            pdfPages = pdf._pdfInfo.numPages;
            pages.innerHTML = `Page ${page} of ${pdfPages}`;
        });
}

function renderPage (pdf, page) {
    pdf.getPage(page)
        .then(page => {
            let scale = 1.5;
            let viewport = page.getViewport({ scale });
            let outputScale = window.devicePixelRatio;

            const canvas = document.querySelector("#viewer");
            const canvasContext = canvas.getContext("2d");
            
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);

            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.heigth = Math.floor(viewport.heigth) + "px";

            let transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

            let renderContext = {
                canvasContext,
                transform,
                viewport
            };

            page.render(renderContext);
        });
}

function backToTop () {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
}

function savePage () {
    lastSeenPage = currentPage;
    localStorage.setItem("page", lastSeenPage);
}

function forwardEvent () {
    if (currentPage !== pdfPages) {
        backToTop();
        currentPage++;
        loadPdf(result, currentPage);  
    }

    savePage();
}

function backEvent () {
    if (currentPage >= 2) {
        backToTop();
        currentPage--;
        loadPdf(result, currentPage);
    }

    savePage();
}