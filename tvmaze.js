/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${query}`
  );
  const showsData = response.data.map(showObj => {
    const { id, name } = showObj.show;
    const summary =
      showObj.show.summary.length > 150
        ? showObj.show.summary.substring(0, 150) + "..."
        : showObj.show.summary;
    let image;
    // test this
    if (showObj.show.image) {
      image = showObj.show.image.medium || showObj.show.image;
    } else {
      image = "https://tinyurl.com/tv-missing";
    }
    return { id, name, summary, image };
  });
  return showsData;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 mb-3 Show" data-show-id="${show.id}">
         <div class="card text-center h-100" data-show-id="${show.id}">
         <img class="card-img-top" src=${show.image}>
           <div class="card-body d-flex flex-column">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button id="episodesButton" class="btn btn-info mt-auto">
              Episodes List
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($item);
  }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodesArray = response.data.map(episodeObj => {
    const { id, name, season, number } = episodeObj;
    return { id, name, season, number };
  });
  return episodesArray;
}

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  for (let episode of episodes) {
    const { name, season, number } = episode;
    const newListItem = $(
      // TODO: Style ul and li's
      `<li class="list-group-item">"${name}" (Season ${season}, Episode ${number})</li>`
    );
    $episodesList.append(newListItem);
  }
  $("#episodes-area").show();
}

$("#shows-list").on("click", "#episodesButton", async function(event) {
  const showId = $(event.target)
    .closest("div.col-md-6")
    .data("showId");
  const episodesArray = await getEpisodes(showId);
  populateEpisodes(episodesArray);
});
