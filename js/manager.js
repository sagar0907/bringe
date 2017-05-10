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
                    }
                    if (result.tvCount) {
                        var series = result.tvSeries;
                        searchResults.series = series;
                        layout().placeSeriesList(series);
                    }
                } else {
                    layout().showSearchResultText("No results found.");
                }
            } else {
                layout().showSearchResultText("Could not fetch search results.");
            }
        };
        layout().clearSearchList();
        layout().searching();
        var q = $("#search-input").val();
        if (q != "") {
            rottenTomatoes().searchMovie(q, handleSearchResult);
        }
    }

    function getMovie(index) {
        function handleRottenLoaded(success) {
            if (success) {
                layout().showRTMovie();
            }
        }

        function handleSubtitleLoad(success) {
            if (success) {
                layout().showSubtitleLink();
            }
        }

        function handleImdbLoaded(success) {
            if (success) {
                layout().placeImdbMovieRating();
            }
        }

        function handleGoogleLoaded(success) {
            if (success) {
                layout().placeGoogleMovieData();
            }
        }

        if (searchResults.movies[index]) {
            layout().hideAllSection();
            thisMovie = searchResults.movies[index];
            layout().showRottenLoader($(".movie-wrapper"));
            layout().showMoviePart();
            rottenTomatoes().getMovie(thisMovie, handleRottenLoaded);
            imdb().searchMovie(thisMovie.name, thisMovie.year, handleImdbLoaded);
            google.searchMovie(thisMovie.name, thisMovie.year, handleGoogleLoaded);
            movies().loadMovies();
            subscene().searchSubtitle(handleSubtitleLoad);
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
            thisSerie.image = serie.posterImage || serie.image;
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

        if (thisSerie.seasons && thisSerie.seasons[index]) {
            layout().hideAllSection();
            layout().clearAllSeasonData();
            serieLevel = "season";
            thisSeason = thisSerie.seasons[index];
            thisSerie.seasonNo = thisSeason.seasonNo;
            layout().showRottenLoader($(".serie-wrapper"));
            layout().showSeriePart();
            rottenTomatoes().getSeason(thisSeason, handleRottenLoaded, handleEpisodesLoaded);
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
        }
    }

    function openMovieStreamLink(obj) {
        movies().openMovieStreamLink(obj);
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

    function openSerieStreamLink(obj) {
        series().streamEpisodeStreamLink(obj);
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

    return {
        searchEntered: searchEntered,
        getMovie: getMovie,
        getSerie: getSerie,
        getSeason: getSeason,
        getEpisode: getEpisode,
        openMovieStreamLink: openMovieStreamLink,
        downloadMovieStreamLink: downloadMovieStreamLink,
        downloadMovieSubtitle: downloadMovieSubtitle,
        downloadEpisodeSubtitle: downloadEpisodeSubtitle,
        openSerieStreamLink: openSerieStreamLink,
        downloadSerieStreamLink: downloadSerieStreamLink,
        openMovieStreamPopup: openMovieStreamPopup,
        openMovieSubtitlePopup: openMovieSubtitlePopup,
        openEpisodesStreamPopup: openEpisodesStreamPopup,
        openEpisodesSubtitlePopup: openEpisodesSubtitlePopup
    }
}
