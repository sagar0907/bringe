/**
 * Created by sagar.ja on 05/03/17.
 */

function rottenTomatoes() {
    function searchMovie(q) {
        var url = "http://www.rottentomatoes.com/api/private/v1.0/search/?catCount=10&q=" + q;
        $.ajax({
            url: url,
            success: function (result) {
                if (typeof result != "object") {
                    try {
                        result = JSON.parse(result);
                    } catch (e) {
                        result = {};
                    }
                }
                var placedAtleastOne;
                if (result.movieCount || result.tvCount) {
                    if (result.movieCount) {
                        var movies = result.movies;
                        background.movies = movies;
                        placedAtleastOne = layout().placeMoviesList(movies);
                        layout().removeSearchBuffer();
                        if(!placedAtleastOne && !result.tvCount) {
                            layout().showSearchResultText("No results found.");
                        }
                    }
                    if (result.tvCount) {
                        var series = result.tvSeries;
                        background.series = series;
                        layout().placeSeriesList(series);
                        layout().removeSearchBuffer();
                    }
                } else {
                    layout().removeSearchBuffer();
                    layout().showSearchResultText("No results found.");
                }
            },
            error: function (result) {
                layout().removeSearchBuffer();
                layout().showSearchResultText("Could not fetch search results.");
            }
        });
    }

    function getSeasonNumber(link) {
        if (link[link.length - 1] === '/') {
            link = link.slice(0, -1);
        }
        var parts = link.split("/"),
            seasonPart = parts[parts.length - 1],
            no;
        if (seasonPart[0] === 's') {
            no = parseInt(seasonPart.substr(1));
            if (no > 0) {
                return no;
            }
        }
        return null;
    }

    function loadRottenTomatoesEpisodesList(id) {
        var link = "https://www.rottentomatoes.com/api/private/v2.0/tvSeason/" + id +"/episodes?offset=0&limit=50";
        if (page != "serie") return;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "serie") return;
                if (typeof result != "object") {
                    try {
                        result = JSON.parse(result);
                    } catch (e) {
                        result = [];
                    }
                }
                var episodes = [];
                for (var i=0; i < result.length; i++) {
                    result[i].url = 'http://www.rottentomatoes.com' + result[i].url;
                    var episode = {episodeNo: result[i].episodeNumber, title: result[i].title, date: result[i].airDate,
                        synopsis: result[i].synopsis, links: {rotten: result[i].url}};
                    if (result[i].tomatometer && result[i].tomatometer.value) {
                        episode.ratings = {rotten: result[i].tomatometer.value};
                    } else {
                        episode.ratings = {};
                    }
                    if (thisSeason.imdbEpisodes) {
                        episode.ratings.imdb = thisSeason.imdbEpisodes[result[i].episodeNumber];
                    }
                    episodes.push(episode);
                }
                thisSeason.episodes = episodes;
                layout().showRTEpisodesList();
            }
        });
    }

    function loadRottenTomatoesMovie(link) {
        if (page != "movie") return;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "movie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    img,
                    spans,
                    name,
                    role, i;
                var cast = myDoc.find(".cast-item");
                thisMovie.cast = [];
                for (i = 0; i < cast.length && i < 12; i++) {
                    var member = cast[i];
                    img = $(member).find("img").attr("src");
                    spans = $(member).find("span");
                    if (spans[0])
                        name = spans[0].textContent.trim();
                    if(spans[1])
                        role = spans[1].textContent.trim();
                    var person = {name: name || '', role: role || '', image: img};
                    thisMovie.cast.push(person);
                }
                var movieInfoList = myDoc.find("ul.content-meta.info"),
                    oneInfo, label, value, infoList = [];
                if(movieInfoList) {
                    movieInfoList = movieInfoList.find("li.meta-row");
                    for(i=0; i<movieInfoList.length; i++) {
                        oneInfo = movieInfoList[i];
                        label = $(oneInfo).find(".meta-label").text().trim();
                        value = $(oneInfo).find(".meta-value").text().trim();
                        infoList.push({label: label, value: value});
                    }
                    thisMovie.infoList = infoList;
                }
                var audienceScore = myDoc.find(".audience-score .meter-value span").text().trim();
                if (audienceScore) {
                    thisMovie.audienceScore = audienceScore;
                }
                var movieSynopsis = myDoc.find("#movieSynopsis").text().trim();
                thisMovie.movieSynopsis = movieSynopsis;
                layout().showRTMovie();
            }
        });
    }

    function loadRottenTomatoesSerie(link) {
        if (page != "serie") return;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    img,
                    spans,
                    name,
                    role, i;
                var cast = myDoc.find(".cast-item");
                thisSerie.cast = [];
                for (i = 0; i < cast.length && i < 12; i++) {
                    var member = cast[i];
                    img = $(member).find("img").attr("src");
                    spans = $(member).find("span");
                    if (spans[0])
                        name = spans[0].textContent.trim();
                    if(spans[1])
                        role = spans[1].textContent.trim();
                    var person = {name: name || '', role: role || '', image: img};
                    thisSerie.cast.push(person);
                }
                var serieSynopsis = myDoc.find("#movieSynopsis").text().trim();
                if (serieSynopsis) {
                    thisSerie.synopsis = serieSynopsis;
                }
                var audienceScore = myDoc.find(".audience-score .meter-value span").text().trim();
                if (audienceScore) {
                    thisSerie.ratings.audienceScore = audienceScore;
                }
                var serieInfoList, movieInfo, subtle, oneInfo, tds, label, value, infoList = [];
                movieInfo = myDoc.find("#series_info .movie_info");
                if (movieInfo.length > 0) {
                    movieInfo.find("#movieSynopsis").remove();
                    serieInfoList = movieInfo.find("div");
                    for (i=0; i<serieInfoList.length; i++) {
                        oneInfo = serieInfoList[i];
                        subtle = $(oneInfo).find(".subtle");
                        if (subtle.length > 0) {
                            label = subtle.text().trim();
                            subtle.remove();
                            value = $(oneInfo).text().trim();
                            infoList.push({label: label, value: value});
                        }
                    }
                }
                serieInfoList = myDoc.find("#detail_panel tr");
                for(i=0; i<serieInfoList.length; i++) {
                    oneInfo = serieInfoList[i];
                    tds = $(oneInfo).find("td");
                    label = $(tds[0]).text().trim();
                    value = $(tds[1]).text().trim();
                    infoList.push({label: label, value: value});
                }
                thisSerie.infoList = infoList;
                var seasons = [], oneSeason, seasonNumber, image, mediaBody, rottenLink, seasonName, meterValue, consensus, info, seasonId;
                var seasonsList = myDoc.find("#seasonList .seasonItem");
                for(i=0; i<seasonsList.length; i++) {
                    oneSeason = $(seasonsList[i]);
                    seasonId = oneSeason.attr("id").replace("season", "");
                    image = oneSeason.find(".posterImage").attr("src");
                    mediaBody = oneSeason.find(".media-body");
                    link = oneSeason.find("a");
                    rottenLink = link.attr("href");
                    seasonName = link.text().trim();
                    seasonNumber = getSeasonNumber(rottenLink);
                    if (seasonNumber) {
                        rottenLink = "http://www.rottentomatoes.com" + rottenLink;
                        meterValue = mediaBody.find(".meter-value").text().trim();
                        consensus = mediaBody.find(".consensus").text().trim();
                        info = mediaBody.find(".season_info").text().trim();
                        seasons.push({seasonNo: seasonNumber, title: seasonName, info: info, image: image,
                            consensus: consensus, links: {rotten: rottenLink},
                            ratings: {rotten: meterValue}, metaData: {rottenId: seasonId}});
                    }
                }
                thisSerie.seasons = seasons;
                layout().showRTSerie();
            }
        });
    }
    function loadRottenTomatoesSeason(link) {
        if (page != "serie") return;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    img,
                    spans,
                    name,
                    role, i;
                var cast = myDoc.find(".cast-item");
                thisSeason.metadata = thisSeason.metadata || {};
                thisSeason.metadata.rottenId = thisSeason.metadata.rottenId || myDoc.find("meta[name='seasonID']").attr("content");
                thisSeason.cast = [];
                for (i = 0; i < cast.length && i < 12; i++) {
                    var member = cast[i];
                    img = $(member).find("img").attr("src");
                    spans = $(member).find("span");
                    if (spans[0])
                        name = spans[0].textContent.trim();
                    if(spans[1])
                        role = spans[1].textContent.trim();
                    var person = {name: name || '', role: role || '', image: img};
                    thisSeason.cast.push(person);
                }
                var seasonSynopsis = myDoc.find("#movieSynopsis").text().trim();
                if (seasonSynopsis) {
                    thisSeason.synopsis = seasonSynopsis;
                }
                var audienceScore = myDoc.find(".audience-score .meter-value span").text().trim();
                if (audienceScore) {
                    thisSeason.ratings.audienceScore = audienceScore;
                }
                var seasonInfoList, oneInfo, label, value, infoList = [];
                seasonInfoList = myDoc.find("section.movie_info li");
                for(i=0; i<seasonInfoList.length; i++) {
                    oneInfo = seasonInfoList[i];
                    label = $(oneInfo).find(".meta-label").text().trim();
                    value = $(oneInfo).find(".meta-value").text().trim();
                    infoList.push({label: label, value: value});
                }
                thisSeason.infoList = infoList;
                loadRottenTomatoesEpisodesList(thisSeason.metadata.rottenId);
                layout().showRTSeasonData("season");
            }
        });
    }


    function loadRottenTomatoesEpisode(link) {
        if (page != "serie") return;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    img,
                    spans,
                    name,
                    role, i;
                var cast = myDoc.find(".cast-item");
                thisEpisode.cast = [];
                thisEpisode.image = myDoc.find('#tv-image-section img').attr("src");
                var audienceScore = myDoc.find(".audience-score .meter-value span").text().trim();
                if (audienceScore) {
                    thisEpisode.ratings.audienceScore = audienceScore;
                }
                for (i = 0; i < cast.length && i < 12; i++) {
                    var member = cast[i];
                    img = $(member).find("img").attr("src");
                    spans = $(member).find("span");
                    if (spans[0])
                        name = spans[0].textContent.trim();
                    if(spans[1])
                        role = spans[1].textContent.trim();
                    var person = {name: name || '', role: role || '', image: img};
                    thisEpisode.cast.push(person);
                }
                var episodeInfoList, oneInfo, label, value, infoList = [];
                episodeInfoList = myDoc.find("ul.content-meta li.meta-row");
                for(i=0; i<episodeInfoList.length; i++) {
                    oneInfo = episodeInfoList[i];
                    label = $(oneInfo).find(".meta-label").text().trim();
                    value = $(oneInfo).find(".meta-value").text().trim();
                    infoList.push({label: label, value: value});
                }
                thisEpisode.infoList = infoList;
                layout().showRTEpisodeData("episode");
            }
        });
    }

    function getMovie(index) {
        if(background.movies[index]) {
            layout().hideAllSection();
            var movie = background.movies[index];
            var rottenLink = "http://www.rottentomatoes.com" + movie.url;
            thisMovie = movie;
            thisMovie.rottenlink = rottenLink;
            thisMovie.movieRespones = {count:0, successCount:0};
            layout().showRottenLoader($(".movie-wrapper"));
            layout().showMoviePart();
            loadRottenTomatoesMovie(rottenLink);
            imdb().searchMovie(thisMovie.name, thisMovie.year);
            movies().loadMovies();
            google().searchSubtitle();
        }
    }

    function getSerie(index) {
        if(background.series[index]) {
            layout().hideAllSection();
            serieLevel = "serie";
            var serie = background.series[index],
                rottenLink = "http://www.rottentomatoes.com" + serie.url,
                seasonNumber = getSeasonNumber(rottenLink);
            if(seasonNumber) {
                getOnlySeason(index, seasonNumber);
                return;
            }
            thisSerie = {};
            thisSerie.title = serie.title;
            thisSerie.startYear = serie.startYear;
            thisSerie.endYear = serie.endYear;
            thisSerie.image = serie.posterImage || serie.image;
            thisSerie.ratings = thisSerie.ratings || {};
            thisSerie.ratings.rotten = serie.meterValue;
            thisSerie.links = thisSerie.links || {};
            thisSerie.links.rotten = rottenLink;
            thisSerie.websites = {};
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            loadRottenTomatoesSerie(rottenLink);
            imdb().searchSerie(thisSerie.title);
            series().loadSerie();
        }
    }
    function getSeason(index) {
        if (thisSerie.seasons && thisSerie.seasons[index]) {
            layout().hideAllSection();
            layout().clearAllSeasonData();
            serieLevel = "season";
            thisSeason = thisSerie.seasons[index];
            thisSerie.seasonNo = thisSeason.seasonNo;
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            loadRottenTomatoesSeason(thisSeason.links.rotten);
            if(thisSerie.metaData.imdbId) {
                imdb().loadEpisodes(thisSerie.metaData.imdbId, thisSerie.seasonNo);
            }
            series().loadSeason();
        }
    }
    function getOnlySeason(index, seasonNumber) {
        layout().hideAllSection();
        layout().clearAllSeasonData();
        serieLevel = "season";
        thisSerie = {};
        thisSerie.seasons = [];
        thisSerie.seasonNo = 1;
        thisSerie.websites = {};
        var season = background.series[index];
        thisSeason = {};
        thisSeason.seasonNo = seasonNumber;
        thisSerie.title = season.title;
        thisSeason.title = season.title;
        thisSeason.image = season.image;
        thisSeason.info = thisSeason.startYear || thisSeason.endYear;
        thisSeason.links ={};
        thisSeason.ratings = {};
        thisSeason.links.rotten = "http://www.rottentomatoes.com" + season.url;
        thisSeason.ratings.rotten = season.meterValue;
        thisSerie.seasons.push(thisSeason);
        layout().showRottenLoader($(".serie-wrapper"));
        layout().showSeriePart();
        loadRottenTomatoesSeason(thisSeason.links.rotten);
        if(thisSerie.metaData && thisSerie.metaData.imdbId) {
            imdb().loadEpisodes(thisSerie.metaData.imdbId, thisSerie.seasonNo);
        }
        series().loadSerie();
        series().loadSeason();
    }
    function getEpisode(index) {
        if (thisSeason.episodes && thisSeason.episodes[index]) {
            layout().hideAllSection();
            layout().clearAllEpisodeData();
            serieLevel = "episode";
            thisEpisode = thisSeason.episodes[index];
            thisSerie.episodeNo = thisEpisode.episodeNo;
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            loadRottenTomatoesEpisode(thisEpisode.links.rotten);
            series().loadEpisode();
            google().searchSubtitle();
        }
    }
    return {
        searchMovie: searchMovie,
        getMovie: getMovie,
        getSerie: getSerie,
        getSeason: getSeason,
        getEpisode: getEpisode
    }
}
