const request = require('request');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
let productsToProcess = 0;
let books = []

const booksURL = 'https://www.taniaksiazka.pl';
// Decode ISO-8859-2, only Polish characters
function decode(buffer) { 
    const index = {33 : '\u0104', 35 : '\u0141', 38 : '\u015A', 44 : '\u0179', 47 : '\u017B', 
        49 : '\u0105', 51 : '\u0142', 54 : '\u015B', 60 : '\u017A', 63 : '\u017C', 70 : '\u0106',
        74 : '\u0118', 82 : '\u0147', 83 : '\u00D3', 102 : '\u0107', 106 : '\u0119', 
        113 : '\u0144', 115 : '\u00F3'};
    let result = '';
    for (let byte of buffer) {
        if (byte < 0x80) {
            result += String.fromCharCode(byte);
        }
        else {
            if (index[byte - 0x80]) {
                result += index[byte - 0x80];
            }
            else {
                result += String.fromCharCode(byte);
            }
        }
    }
    return result;
}

function endItemProcessing() {
    --productsToProcess;
    if (productsToProcess === 0) {
        printResult(books);
    }
}

function getBookInfo(bookURL) {
    request({uri: bookURL, encoding: null}, (error, response, body) => {
        console.log('Processing: ' + bookURL);
        if (error) {
            console.error(error);
            endItemProcessing();
            return;
        }
        const document = (new JSDOM(decode(body))).window.document;
        const productInfo = document.querySelector('.product-info');
        if (!productInfo) {
            console.error('Could not find information about product on the page.')
            endItemProcessing();
            return;
        }
        const title = productInfo.querySelector('h1 span');
        const author = productInfo.querySelector('.author h2 a');
        const infoElements = productInfo.querySelectorAll('.book-info .book-info-elem');
        const price = document.querySelector('#p-ourprice strong');
        let pages;
        for (let i = 0; i < infoElements.length; ++i) {
            const infoElement = infoElements[i];
            const label = infoElement.querySelector('.book-info-label');
            if (label.textContent === 'Ilość stron') {
                pages = infoElement.querySelector('.book-info-value');
            }
        }
        if (pages && price) {
            let authorName = '';
            if (author) {
                authorName = author.textContent;
            }
            let priceString = price.textContent.split(' ')[0];
            priceString = priceString.replace(',', '.');

            books.push({title: title.textContent.trim(), author: authorName, 
                pages: parseInt(pages.textContent), price: parseFloat(priceString)});
        }
        endItemProcessing();
    });
}

request({uri: booksURL, encoding: null}, (error, response, body) => {
    console.log('Processing: ' + booksURL);
    if (error) {
        console.error(error);
        return;
    }
    const document = (new JSDOM(decode(body))).window.document;
    const products = document.querySelectorAll('.product-container');
    productsToProcess = products.length;
    for (let i = 0; i < products.length; ++i) {
        const link = products[i].querySelector('a.cmp_m_prod_tytul');
        getBookInfo(booksURL + link.href);
    }
});

function printResult(books) {
    books.forEach((book) => { book.pageprice = book.price / book.pages; });
    books.sort((a, b) => { return a.pageprice - b.pageprice; });
    console.log('Title   Author   Pages   Price   Price per page');
    titles = new Set();
    books.forEach((book) => { 
        if (!titles.has(book.title)) {
            console.log(`${book.title}   ${book.author}   ${book.pages}   ${book.price}   ${book.pageprice}`);
            titles.add(book.title);
        }
    });
}
