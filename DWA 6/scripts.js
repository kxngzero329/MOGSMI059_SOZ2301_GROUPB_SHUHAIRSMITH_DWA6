// @ts-nocheck

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
/**
 * The html object contains constant variables that select HTML DOM elements with specific data attribute values and makes
 * them easily accessible.
 * 
 * @typedef {Object} html - html Element data attribute values
 * @prop {Object} header - HTML header data attribute values
 * @prop {Object} list - HTML list data attribute values
 * @prop {Object} search - HTML search data attribute values
 * @prop {Object} settings - HTML settings data attribute values
 */

/**
 * Html object containing HTML data attributes
 * @type {html}
 */


let page = 1;
let matches = books;
 
function createBookElement({ author, id, image, title }) { //function takes a book object as input and creates an HTML element representing the book.
  const element = document.createElement('button');
  element.classList = 'preview'; //Creates button element with class 'preview' and sets data-preview attribute to book's ID. 
  element.setAttribute('data-preview', id);
//Creates an image and div element inside button for displaying book's title and author. 
  element.innerHTML = ` 
    <img
      class="preview__image"
      src="${image}"
    />
    
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return element; //Function returns created element.
}

function updateBookList(result) { //function updates book list based on provided result data.
  const listMessageElement = document.querySelector('[data-list-message]'); //Finds and stores references to necessary DOM elements.
  const listItemsElement = document.querySelector('[data-list-items]');
  const listButtonElement = document.querySelector('[data-list-button]');

  if (result.length < 1) { //Checks if result array is empty and shows/hides list message accordingly.
    listMessageElement.classList.add('list__message_show');
  } else {
    listMessageElement.classList.remove('list__message_show');
  }

  listItemsElement.innerHTML = ''; //Clears existing list items in listItemsElement.
  const newItems = document.createDocumentFragment(); //Creates new document fragment to hold new list items.

  for (const book of result.slice(0, BOOKS_PER_PAGE)) { //Iterates over result array and calls 'createBookElement' for each book.
    const element = createBookElement(book);
    newItems.appendChild(element); //Appends document fragment to listItemsElement.
  }

  listItemsElement.appendChild(newItems);
  listButtonElement.disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1; //Updates disabled state and content of listButtomElement based on number of remaining books.
//Updates inner HTML of listButtonElement to display remaining books. 
  listButtonElement.innerHTML = ` 
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
  `;
}

function applyTheme() { //Function applies appropriate theme based on user's preference. 
  const settingsThemeElement = document.querySelector('[data-settings-theme]'); //Finds and stores reference to settingsThemeElement DOM element.

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { //Checks if user's system prefers dark colour theme.
    settingsThemeElement.value = 'night'; //If dark is prefered, sets value of settingsThemeElement to night and updates CSS variables '--color-dark' and '--color-light' to appropriate values for a dark theme.
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
  } else { //Otherwise it sets value of settingsThemeElement to day and updates CSS variable for light theme.
    settingsThemeElement.value = 'day';
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
  }
}

function handleSearchFormSubmit(event) { //Fuction handles submission of search form.
  event.preventDefault(); //Takes event object as input.
  const formData = new FormData(event.target); //Prevents default form submission behavior.
  const filters = Object.fromEntries(formData); //Extracts form data using FormData.
  const result = []; //Creates empty array called 'result' to store filtered books.

  for (const book of books) { //Iterates over each book in the 'books' array.
    let genreMatch = filters.genre === 'any';

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    if (
      (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && //Applies seach filters.
      (filters.author === 'any' || book.author === filters.author) &&
      genreMatch
    ) {
      result.push(book); //Adds matching books to 'result' array.
    }
  }

  page = 1; //After filtering, resets the page counter.
  matches = result;
  updateBookList(result); //Updates book list by calling 'updateBookList' with 'result' array.

  window.scrollTo({ top: 0, behavior: 'smooth' }); //Scrolls to top of page.
  document.querySelector('[data-search-overlay]').open = false; //Closes search overlay.
  document.querySelector('[data-search-form]').reset(); //Resets search form.
}

function handleListButtonClick() { //Function handles click even on 'Show more' button in book list.
  const fragment = document.createDocumentFragment(); //Retrieves reference to listItemsElement and creates document fragment. 

  for (const book of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) { //Iterates over 'matches' array, starting from appropriate indec based on current page number.
    const element = createBookElement(book);
    fragment.appendChild(element); //Appends created book elements to document fragment.
  }

  document.querySelector('[data-list-items]').appendChild(fragment); //Appends doucment fragment to listItemsElement and increments page counter.
  page += 1;
}




function handleListItemClick(event) { //function handles click event on book item in list.
  const pathArray = Array.from(event.path || event.composedPath());
  let active = null;

  for (const node of pathArray) {
    if (active) break;

    if (node?.dataset?.preview) { //Retrieves clicked element and finds ancestor element with 'data-preview' attribute.
      for (const singleBook of books) {
        if (singleBook.id === node?.dataset?.preview) { //Matches clicked book with corresponding book object from books array using 'dataset.preview' value.
          active = singleBook;
          break;
        }
      }
    }
  }

  if (active) { //If match is founds, it retrieves necessary DOM elements for displaying book details and updates content accordingly.
    document.querySelector('[data-list-active]').open = true;
    document.querySelector('[data-list-blur]').src = active.image;
    document.querySelector('[data-list-image]').src = active.image;
    document.querySelector('[data-list-title]').innerText = active.title;
    document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
    document.querySelector('[data-list-description]').innerText = active.description;
  }
}

// Event Listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = false;
  document.querySelector('[data-search-form]').reset();
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
  });

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
  document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = true;
  document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
  document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);

  if (theme === 'night') {
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
  } else {
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
  }

  document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-search-form]').addEventListener('submit', handleSearchFormSubmit);

document.querySelector('[data-list-button]').addEventListener('click', handleListButtonClick);

document.querySelector('[data-list-items]').addEventListener('click', handleListItemClick);

// Initial setup
applyTheme();
updateBookList(matches);
