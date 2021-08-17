import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView.js';
//import icons from '../img/icongs.svg'; //parcel 1
//parcel 2, cosas que no sean archivos de codigo se pone url
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';

//const { async } = require('q');

//const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
/*
if (module.hot) {
  module.hot.accept();
}
*/
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0) Update results view to mark select search result
    resultsView.update(model.getSearchResultsPage());

    // 1.- Updating bookmarks view

    bookmarksView.update(model.state.bookmarks);
    //2.- loading the recipe
    await model.loadRecipe(id); //await because is async function returning promise

    //3.- rendering recipe
    recipeView.render(model.state.recipe);

    //let ingredients;
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1.- Get search query
    const query = searchView.getQuery();
    if (!query)
      return resultsView.renderError(
        'No recipes found for your query! Please try again ;)'
      );

    //2.- Load search results
    await model.loadSearchResults(query);

    //3.- Render results
    resultsView.render(model.getSearchResultsPage(1));

    //4.- Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};
const controlPagination = function (goToPage) {
  //1.- Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //resultsView.update(model.getSearchResultsPage(goToPage));
  //2.- Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  //Update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  // 1.- Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);
  //2.- Update recipe view
  recipeView.update(model.state.recipe);

  //3.- Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    console.log('entra dentro');
    //Show loading spinner
    addRecipeView.renderSpinner();
    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message

    addRecipeView.renderMessage();

    //Render the bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.closeWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('***', error);
    addRecipeView.renderError(error.message);
  }
};

const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlderAddBookMark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome to forkify App!');
};

init();
