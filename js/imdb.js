/**
 * Created by sagar.ja on 15/04/17.
 */
function imdb() {
    function failFunction() {

    }
    function getEpisodeByNo(season, no) {
        var episodes = season.episodes,
            reqdEpisode = null;
        util().each(episodes, function (episode) {
            if (episode.episodeNo === no) {
                reqdEpisode = episode;
            }
        });
        return reqdEpisode;
    }
    function getSearchTerm(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,| -|- /, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").replaceAll(/\s\s+/, " ").trim().replaceAll(" ", "+");
        return searchTerm;
    }
    function getRequiredMovie(divList, name) {
        var movieDetails = null;
        for (var i = 0; i < divList.length; i++) {
            var div = $(divList[i]);
            var divName  = div.find(".lister-item-header a").text().trim();
            console.log(divName);
            if (util().isSameMovieName(divName, name)) {
                movieDetails = {};
                var imdbId = div.find(".lister-top-right .ribbonize").attr("data-tconst");
                var imdbRating = div.find(".ratings-imdb-rating").attr("data-value");
                var metaRating = div.find("span.metascore").text().trim();
                if (imdbId){
                    movieDetails.imdbId = imdbId;
                }
                if (imdbRating){
                    movieDetails.imdbRating = imdbRating;
                }
                if (metaRating){
                    movieDetails.metaRating = metaRating;
                }
                return movieDetails;
            }
        }
        return movieDetails;
    }
    function searchMovieSuccess(name, func, result) {
        if (page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            movieDivList = myDoc.find(".lister-item"),
            movieDetails = getRequiredMovie(movieDivList, name);
        if (!movieDetails) {
            func(false);
            return;
        }
        var movie = {};
        if (movieDetails.imdbRating) {
            movie.imdbRating = movieDetails.imdbRating;
        }
        if (movieDetails.metaRating) {
            movie.metaRating = movieDetails.metaRating;
        }
        if (movieDetails.imdbId) {
            movie.imdbId = movieDetails.imdbId;
        }
        func(true, movie);
    }
    function searchSerieSuccess(func, result) {
        if (page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            serieDivList = myDoc.find(".lister-item"),
            serieDetails = getRequiredMovie(serieDivList, thisSerie.title);
        if (serieDetails.imdbRating) {
            thisSerie.ratings.imdbRating = serieDetails.imdbRating;
        }
        if (serieDetails.metaRating) {
            thisSerie.ratings.metaRating = serieDetails.metaRating;
        }
        if (serieDetails.imdbId) {
            thisSerie.metaData = thisSerie.metaData || {};
            thisSerie.metaData.imdbId = serieDetails.imdbId;
        }
        func(true);
    }
    function searchMovie(name, year, func) {
        var q = getSearchTerm(name);
        var url;
        if (year) {
            url = encodeURI('http://www.imdb.com/search/title?title=' + q + '&release_date=' + year + ',' + year + '&title_type=feature&view=advanced');
        } else {
            url = encodeURI('http://www.imdb.com/search/title?title=' + q + '&title_type=feature&view=advanced');
        }
        util().sendAjax(url, "GET", {}, util().getProxy(searchMovieSuccess, [name, func]), failFunction);
    }

    function searchSerie(q, func) {
        q = util().getSearchTerm(q);
        var url = encodeURI('http://www.imdb.com/search/title?title=' + q + '&title_type=tv_series&view=advanced');
        util().sendAjax(url, "GET", {}, util().getProxy(searchSerieSuccess, [func]), failFunction);
    }
    function episodeSuccess(result) {
        if (page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            episodeDivList = myDoc.find("#eplist a.btn-full");
        var episodes = [];
        if (episodeDivList) {
            for (var i = 0; i < episodeDivList.length; i++) {
                var div = $(episodeDivList[i]),
                    title = div.find(".text-large"),
                    no = parseInt(title.contents().not(title.children()).text().trim().replace(".", "")),
                    rating = $(div.find("strong")[1]).text().trim();
                episodes[no] = rating;
                if (thisSerie.episodes) {
                    var episode = getEpisodeByNo(thisSeason, no);
                    episode.ratings.imdb = rating;
                }
            }
            if (!thisSerie.episodes) {
                thisSeason.imdbEpisodes = episodes;
            }
        }
    }
    function loadEpisodes(serieId, sNo) {
        var url = 'http://m.imdb.com/title/' + serieId +'/episodes/_ajax/?season=' + sNo;
        util().sendAjax(url, "GET", {}, episodeSuccess, failFunction);
    }
    return {
        searchMovie: searchMovie,
        searchSerie: searchSerie,
        loadEpisodes:loadEpisodes
    }
}