const read = document.querySelector("#file");
const pages = document.querySelector("#pages");
const back = document.querySelector("#back");
const forward = document.querySelector("#forward");
const footer = document.querySelector("footer");

let lastSeenPage = 1;
let currentPage = lastSeenPage;
let result;
let index;

let currentPdfData;
let pdfPages;
let pdfId;

let booksData = [];

window.onload = () => {
    if (!localStorage.getItem("booksData")) {
        let stringifiedBooksData = JSON.stringify(booksData);
        localStorage.setItem("booksData", stringifiedBooksData);
    } else {
        let parsedBooksData = JSON.parse(localStorage.getItem("booksData"));
        booksData = parsedBooksData;
    } 
}

read.addEventListener("change", event => {
    currentPdfData = null; // to reset pdf data when upload
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
        result = reader.result;
        loadPdf(result);

        footer.classList.remove("hidden");
        back.addEventListener("click", backEvent);
        forward.addEventListener("click", forwardEvent);
    }
});

function loadPdf (data) {
    let loading = pdfjsLib.getDocument(data);
        loading.promise.then(pdf => {
            pdfPages = pdf._pdfInfo.numPages;
            pdfId = pdf._pdfInfo.fingerprints[0];

            booksData.forEach(elem => {
                if (elem.pdfId === pdfId) {
                    index = booksData.indexOf(elem);
                    currentPdfData = booksData[index];
                }
            });

            if (!currentPdfData) {
                currentPdfData = { pdfId, lastSeenPage };
                booksData.push(currentPdfData);
            }

            currentPage = currentPdfData.lastSeenPage;
            renderPage(pdf, currentPage);

            pages.innerHTML = `Page ${currentPage} of ${pdfPages}`;
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
    currentPdfData.lastSeenPage = currentPage;
    booksData.forEach(elem => {
        if (elem.pdfId === currentPdfData.pdfId) {
            elem = currentPdfData;
        }
    });

    let stringifiedBooksData = JSON.stringify(booksData);
    localStorage.setItem("booksData", stringifiedBooksData);
}

function forwardEvent () {
    if (currentPage !== pdfPages) {
        backToTop();
        currentPage++;
        savePage();
        loadPdf(result);  
    }
}

function backEvent () {
    if (currentPage >= 2) {
        backToTop();
        currentPage--;
        savePage();
        loadPdf(result);
    }
}