/** Map Shows
 *    - given an array of show objects, maps the array and
 *      returns relevant information
 * 
 *    - Returns an array of objects. Each object should 
 *      include the following show information:
 *      {
          id: <show id>,
          name: <show name>,
          summary: <show summary>,
          image: <an image from the show data or a default image>
        }
  */
function mapShows(showsArray) {
  return showsArray.map(showObj => {
    const { id, name } = showObj.show;

    // truncate summary string to 150 characters
    // set to empty string if no summary exists
    const summary = !showObj.show.summary
      ? ""
      : showObj.show.summary.length > 150
      ? showObj.show.summary.substring(0, 150) + "..."
      : showObj.show.summary;

    // set default image if none exists
    const image = showObj.show.image
      ? showObj.show.image.medium || showObj.show.image
      : "https://tinyurl.com/tv-missing";

    return { id, name, summary, image };
  });
}

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async so it
 *       will return a promise.
 */
async function searchShows(query) {
  const url = `http://api.tvmaze.com/search/shows?q=${query}`;
  const response = await axios.get(url);

  // Retrieve specific show data from response object
  return mapShows(response.data);
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    const $item = createCard(show);
    $showsList.append($item);
  }
}

/** Given an object of show data, create jQuery card object */
function createCard(showObject) {
  const { id, image, name, summary } = showObject;
  return $(
    `<div class="col-md-6 col-lg-3 mb-3 Show" data-show-id="${id}">
       <div class="card text-center h-100" data-show-id="${id}">
       <img class="card-img-top" src=${image}>
         <div class="card-body d-flex flex-column">
           <h5 class="card-title">${name}</h5>
           <p class="card-text">${summary}</p>
           <button id="episodesButton" class="btn btn-info mt-auto">
            Episodes List
           </button>
         </div>
       </div>
     </div>
    `
  );
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */
$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();
  const query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  const shows = await searchShows(query);
  populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */
async function getEpisodes(id) {
  const url = `http://api.tvmaze.com/shows/${id}/episodes`;
  const response = await axios.get(url);
  const episodesArray = response.data.map(episodeObj => {
    const { id, name, season, number } = episodeObj;
    return { id, name, season, number };
  });
  return episodesArray;
}

/** Populate Episodes:
 *     - given list of episodes, add shows to DOM
 *     - show list element
 */
function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  for (let episode of episodes) {
    $episodesList.append(createListItem(episode));
  }
  $("#episodes-area").show();
}

/** Given an episode object, return jQuery list item object */
function createListItem(episodeObject) {
  const { name, season, number } = episodeObject;
  return $(
    `<li class="list-group-item">"${name}" (Season ${season}, Episode ${number})</li>`
  );
}

/** Handle episodes button click:
 *    - get show id from parent div
 *    - retrieve episodes list and append to DOM
 */
$("#shows-list").on("click", "#episodesButton", async function(event) {
  const showId = $(event.target)
    .closest("div.col-md-6")
    .data("showId");
  const episodesArray = await getEpisodes(showId);
  populateEpisodes(episodesArray);
  location.href = "#episodes-area";
});
