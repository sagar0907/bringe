/**
 * Created by sagar.ja on 28/04/17.
 */

function manager() {
    function searchEntered() {
        var handleSearchResult = function (success, result) {
            layout().removeSearchBuffer();
            if (success) {
                if (result.movieCount || result.tvCount) {
                    if (result.movieCount) {
                        var movies = result.movies;
                        searchResults.movies = movies;
                        layout().placeMoviesList(movies);
                        layout().setMovieListVisible();
                    } else {
                        layout().setSerieListVisible();
                    }
                    if (result.tvCount) {
                        var series = result.tvSeries;
                        searchResults.series = series;
                        layout().placeSeriesList(series);
                    }
                    layout().hideTrending();
                } else {
                    layout().hideTrending();
                    layout().showSearchResultText("No results found.");
                }
            } else {
                layout().hideTrending();
                layout().showSearchResultText("Could not fetch search results.");
            }
        };
        layout().clearSearchList();
        var q = $("#search-input").val();
        if (q != "") {
            rottenTomatoes().searchMovie(q, handleSearchResult);
            layout().searching();
        }
    }

    function fetchTrendingMovies() {
        function fetchSuccessFunction(result) {
            console.log(result);
            try {
                result = JSON.parse(result);
            } catch(ignore) {}
            if (result.results && result.results.length > 0) {
                window.trending = window.trending || {};
                window.trending.movies = result.results;
                layout().showTrendingMovies(window.trending.movies);
            }
        }
        function failFunction() {

        }
        var url = "https://www.rottentomatoes.com/api/private/v2.0/browse";
        var params = {maxTomato: 100, maxPopcorn: 100,certified: 'true',sortBy: 'popularity', type: 'cf-in-theaters'};
        util().sendAjax(url, "GET", params, fetchSuccessFunction, failFunction);
    }

    function getMovie(index) {
        function setupThisMovie(movie) {
            var theMovie = {name: movie.name, title: movie.name, subline: movie.subline, year: movie.year};
            theMovie.ratings = {meterScore: movie.meterScore};
            theMovie.images = {thumbnail: movie.image};
            return theMovie;
        }
        function handleRottenLoaded(success, movie) {
            if (success) {
                thisMovie = thisMovie || {};
                thisMovie.rotten = {link: movie.rottenlink};
                thisMovie.cast = movie.cast;
                thisMovie.images.coverImage = movie.coverImage;
                thisMovie.images.image = movie.image;
                thisMovie.infoList = movie.infoList;
                thisMovie.ratings.audienceScore = movie.audienceScore;
                thisMovie.synopsis = movie.movieSynopsis;
                layout().showRTMovie();
            } else {
                layout().goToHome();
                layout().showSearchResultText("Couldn't fetch data.");
            }
        }

        function handleSubtitleLoad(success, subtitle) {
            if (success) {
                thisMovie = thisMovie || {};
                thisMovie.subtitleLinks = thisMovie.subtitleLinks || [];
                var len = thisMovie.subtitleLinks.length;
                subtitle.index = len;
                thisMovie.subtitleLinks.push(subtitle);
                if (len == 0) {
                    layout().showSubtitleLink();
                }
            }
        }

        function handleTrailerLoad(success, id) {
            if (success) {
                thisMovie.trailer = thisMovie.trailer || {};
                thisMovie.trailer.youtube = thisMovie.trailer.youtube || {};
                thisMovie.trailer.youtube.id = thisMovie.trailer.youtube.id || {};
                thisMovie.trailer.youtube.id.google = id;
                layout().showMovieTrailerLink();
            }
        }

        function handleImdbLoaded(success, movie) {
            thisMovie = thisMovie || {};
            thisMovie.ratings.imdbRating = movie.imdbRating;
            thisMovie.ratings.metaRating = movie.metaRating;
            thisMovie.imdb = {id: movie.imdbId};
            if (success) {
                layout().placeImdbMovieRating();
            }
        }

        function handleGoogleLoaded(success, movie) {
            if (success) {
                thisMovie.reviews = movie.reviews;
                thisMovie.social = movie.social;
                layout().placeGoogleMovieData();
            }
        }

        if (searchResults.movies[index]) {
            layout().hideAllSection();
            var movie = searchResults.movies[index];
            thisMovie = setupThisMovie(movie);
            layout().showRottenLoader($(".movie-wrapper"));
            layout().showMoviePart();
            rottenTomatoes().getMovie(movie, handleRottenLoaded);
            imdb().searchMovie(movie.name, movie.year, handleImdbLoaded);
            google.searchMovie(movie.name, movie.year, handleGoogleLoaded);
            trailer.fetchMovieTrailer(movie.name, movie.year, handleTrailerLoad);
            movies().loadMovies();
            subscene().searchMovieSubtitle(movie.name, movie.year, handleSubtitleLoad);
        }
    }

    function getTrendingMovie(index) {
        function setupThisMovie(movie) {
            var theMovie = {name: movie.title, title: movie.title};
            theMovie.ratings = {meterScore: movie.tomatoScore};
            var image = movie.posters.primary;
            theMovie.images = {thumbnail: image};
            return theMovie;
        }
        function handleRottenLoaded(success, movie) {
            if (success) {
                thisMovie = thisMovie || {};
                thisMovie.rotten = {link: movie.rottenlink};
                thisMovie.cast = movie.cast;
                thisMovie.images.coverImage = movie.coverImage;
                thisMovie.images.image = movie.image;
                thisMovie.infoList = movie.infoList;
                thisMovie.ratings.audienceScore = movie.audienceScore;
                thisMovie.synopsis = movie.movieSynopsis;
                thisMovie.year = movie.year;
                imdb().searchMovie(thisMovie.name, thisMovie.year, handleImdbLoaded);
                google.searchMovie(thisMovie.name, thisMovie.year, handleGoogleLoaded);
                trailer.fetchMovieTrailer(thisMovie.name, thisMovie.year, handleTrailerLoad);
                movies().loadMovies();
                subscene().searchMovieSubtitle(thisMovie.name, thisMovie.year, handleSubtitleLoad);
                layout().showRTMovie();
            } else {
                layout().goToHome();
                layout().showSearchResultText("Couldn't fetch data.");
            }
        }
        function handleSubtitleLoad(success, subtitle) {
            if (success) {
                thisMovie = thisMovie || {};
                thisMovie.subtitleLinks = thisMovie.subtitleLinks || [];
                var len = thisMovie.subtitleLinks.length;
                subtitle.index = len;
                thisMovie.subtitleLinks.push(subtitle);
                if (len == 0) {
                    layout().showSubtitleLink();
                }
            }
        }

        function handleTrailerLoad(success, id) {
            if (success) {
                thisMovie.trailer = thisMovie.trailer || {};
                thisMovie.trailer.youtube = thisMovie.trailer.youtube || {};
                thisMovie.trailer.youtube.id = thisMovie.trailer.youtube.id || {};
                thisMovie.trailer.youtube.id.google = id;
                layout().showMovieTrailerLink();
            }
        }

        function handleImdbLoaded(success, movie) {
            thisMovie = thisMovie || {};
            thisMovie.ratings.imdbRating = movie.imdbRating;
            thisMovie.ratings.metaRating = movie.metaRating;
            thisMovie.imdb = {id: movie.imdbId};
            if (success) {
                layout().placeImdbMovieRating();
            }
        }

        function handleGoogleLoaded(success, movie) {
            if (success) {
                thisMovie.reviews = movie.reviews;
                thisMovie.social = movie.social;
                layout().placeGoogleMovieData();
            }
        }
        if (window.trending.movies[index]) {
            layout().hideAllSection();
            var movie = window.trending.movies[index];
            thisMovie = setupThisMovie(movie);
            layout().showRottenLoader($(".movie-wrapper"));
            layout().showMoviePart();
            rottenTomatoes().getMovie(movie, handleRottenLoaded);
        }
    }

    function getSerie(index) {
        function handleRottenLoaded(success) {
            if (success) {
                layout().showRTSerie();
            }
        }
        function handleImdbLoaded(success) {
            if(success) {
                layout().placeImdbSerieRating();
            }
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

        if (searchResults.series[index]) {
            layout().hideAllSection();
            serieLevel = "serie";
            var serie = searchResults.series[index],
                rottenLink = "http://www.rottentomatoes.com" + serie.url,
                seasonNumber = getSeasonNumber(rottenLink);
            if (seasonNumber) {
                layout().clearAllSeasonData();
                thisSerie = {};
                thisSerie.seasons = [];
                thisSerie.websites = {};
                thisSerie.startYear = serie.startYear;
                thisSerie.onlySeason = true;
                var season = {};
                season.seasonNo = seasonNumber;
                thisSerie.title = serie.title;
                season.title = serie.title;
                season.image = serie.image;
                season.info = serie.startYear || serie.endYear;
                season.links = {};
                season.ratings = {};
                season.links.rotten = "http://www.rottentomatoes.com" + serie.url;
                season.ratings.rotten = serie.meterValue;
                thisSerie.seasons.push(season);
                series().loadSerie();
                getSeason(0);
                return;
            }
            thisSerie = {};
            thisSerie.title = serie.title;
            thisSerie.startYear = serie.startYear;
            thisSerie.endYear = serie.endYear;
            thisSerie.thumbnail = serie.image;
            thisSerie.ratings = thisSerie.ratings || {};
            thisSerie.ratings.rotten = serie.meterValue;
            thisSerie.links = thisSerie.links || {};
            thisSerie.links.rotten = rottenLink;
            thisSerie.websites = {};
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            rottenTomatoes().getSerie(thisSerie, handleRottenLoaded);
            imdb().searchSerie(thisSerie.title, handleImdbLoaded);
            series().loadSerie();
        }
    }

    function getSeason(index) {
        function handleRottenLoaded(success) {
            if (success) {
                layout().showRTSeasonData();
            }
        }

        function handleEpisodesLoaded(success) {
            if (success) {
                layout().showRTEpisodesList();
            }
        }

        function handleTrailerLoad(success, id) {
            if (success) {
                thisSeason.youtubeId = id;
            }
        }

        if (thisSerie.seasons && thisSerie.seasons[index]) {
            layout().hideAllSection();
            layout().clearAllSeasonData();
            serieLevel = "season";
            thisSeason = thisSerie.seasons[index];
            thisSerie.seasonNo = thisSeason.seasonNo;
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            rottenTomatoes().getSeason(thisSeason, handleRottenLoaded, handleEpisodesLoaded);
            trailer.fetchSeasonTrailer(thisSerie, thisSerie.seasonNo, handleTrailerLoad);
            if (thisSerie.metaData && thisSerie.metaData.imdbId) {
                imdb().loadEpisodes(thisSerie.metaData.imdbId, thisSerie.seasonNo);
            }
            series().loadSeason();
        }
    }

    function getEpisode(index) {
        function handleRottenLoaded(success) {
            if (success) {
                layout().showRTEpisodeData();
            }
        }

        function handleSubtitleLoad(success) {
            if (success) {
                layout().showEpisodeSubtitleLink();
            }
        }

        if (thisSeason.episodes && thisSeason.episodes[index]) {
            layout().hideAllSection();
            layout().clearAllEpisodeData();
            serieLevel = "episode";
            thisEpisode = thisSeason.episodes[index];
            thisSerie.episodeNo = thisEpisode.episodeNo;
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            rottenTomatoes().getEpisode(thisEpisode, handleRottenLoaded);
            series().loadEpisode();
            subscene().searchSubtitle(handleSubtitleLoad);
            if (thisSeason.youtubeId) {
                layout().showEpisodeTrailerLink();
            }
        }
    }

    function openMovieStreamLink(selector) {
        if(selector && selector.id) {
            var movie = movies().getMovieBySelector(selector);
            if(movie) {
                var obj = {src: movie.src};
                if (thisMovie.coverImage && thisMovie.coverImage != "") {
                    obj.poster = thisMovie.coverImage;
                }
                player.setupVideo(obj);
                layout().openVideoPopup();
            }
        }
    }

    function downloadMovieStreamLink(obj) {
        movies().downloadMovieStreamLink(obj);
    }

    function downloadMovieSubtitle(id) {
        layout().openWaiter("Adding Subtitle to Downloads");
        downloads().addToDownload(thisMovie.subtitleLinks[id].link, thisMovie.name, ".zip", function () {
            layout().closeWaiter();
            layout().shineDownloadButton();
        });
    }

    function downloadEpisodeSubtitle(id) {
        layout().openWaiter("Adding Subtitle to Downloads");
        downloads().addToDownload(subscene().getSubtitleEpisode().links[id].link, thisSerie.title, ".zip", function () {
            layout().closeWaiter();
            layout().shineDownloadButton();
        });
    }

    function openSerieStreamLink(selector) {
        if (selector && selector.id && selector.source)
        var episode = series().getEpisodeBySelector(selector);
        if(episode) {
            var obj = {src: episode.src};
            if (thisSerie.coverImage && thisSerie.coverImage != "") {
                obj.poster = thisSerie.coverImage;
            }
            player.setupVideo(obj);
            layout().openVideoPopup();
        }
    }

    function downloadSerieStreamLink(obj) {
        series().downloadEpisodeStreamLink(obj);
    }

    function openMovieStreamPopup() {
        layout().openMovieStreamPopup(thisMovie);
    }

    function openMovieSubtitlePopup() {
        layout().openMovieSubtitlePopup(thisMovie);
    }

    function openEpisodesStreamPopup() {
        var streamLinks = series().getStreamLinks();
        layout().openEpisodesStreamPopup(streamLinks);
    }

    function openEpisodesSubtitlePopup() {
        var episode = subscene().getSubtitleEpisode() || {};
        layout().openEpisodesSubtitlePopup(episode);
    }

    function openMovieTrailer() {
        if (thisMovie.trailer && thisMovie.trailer.youtube && thisMovie.trailer.youtube.id) {
            if (thisMovie.trailer.youtube.id.watchit) {
                layout().openTrailerPopup();
                trailer.setupYoutube(thisMovie.trailer.youtube.id.watchit);
            } else if (thisMovie.trailer.youtube.id.google) {
                layout().openTrailerPopup();
                trailer.setupYoutube(thisMovie.trailer.youtube.id.google);
            }
        }
    }

    function openSeasonTrailer() {
        if (thisSeason.youtubeId) {
            layout().openTrailerPopup();
            trailer.setupYoutube(thisSeason.youtubeId);
        }
    }

    function searchOnGoogle(q) {
        q = q.replace(/ /g, '+');
        var url = "https://www.google.com/search?q=" + q;
        background.openLinkInBrowser(url);
    }

    function closeVideo() {
        layout().closeVideoPopup();
        player.removeVideo();
    }

    function closeYoutube() {
        layout().closeTrailerPopup();
        trailer.removeYoutube();
    }

    return {
        searchEntered: searchEntered,
        fetchTrendingMovies: fetchTrendingMovies,
        getMovie: getMovie,
        getTrendingMovie: getTrendingMovie,
        getSerie: getSerie,
        getSeason: getSeason,
        getEpisode: getEpisode,
        openMovieStreamLink: openMovieStreamLink,
        openMovieTrailer: openMovieTrailer,
        openSeasonTrailer: openSeasonTrailer,
        downloadMovieStreamLink: downloadMovieStreamLink,
        downloadMovieSubtitle: downloadMovieSubtitle,
        downloadEpisodeSubtitle: downloadEpisodeSubtitle,
        openSerieStreamLink: openSerieStreamLink,
        downloadSerieStreamLink: downloadSerieStreamLink,
        openMovieStreamPopup: openMovieStreamPopup,
        openMovieSubtitlePopup: openMovieSubtitlePopup,
        openEpisodesStreamPopup: openEpisodesStreamPopup,
        openEpisodesSubtitlePopup: openEpisodesSubtitlePopup,
        searchOnGoogle: searchOnGoogle,
        closeVideo: closeVideo,
        closeYoutube: closeYoutube
    }
}
