_define('manager', [window, 'util', 'bringe', 'layout', 'rottenTomatoes', 'series', 'subscene', 'imdb', 'movies', 'downloads', 'player', 'google', 'trailer'],
    function (window, util, bringe, layout, rottenTomatoes, series, subscene, imdb, movies, downloads, player, google, trailer) {
        function searchEntered() {
            var handleSearchResult = function (success, result) {
                layout.removeSearchBuffer();
                if (success) {
                    if (result.movieCount || result.tvCount) {
                        if (result.movieCount) {
                            var movies = result.movies;
                            bringe.searchResults.movies = movies;
                            layout.placeMoviesList(movies);
                            layout.setMovieListVisible();
                        } else {
                            layout.setSerieListVisible();
                        }
                        if (result.tvCount) {
                            var series = result.tvSeries;
                            bringe.searchResults.series = series;
                            layout.placeSeriesList(series);
                        }
                        layout.hideTrending();
                    } else {
                        layout.hideTrending();
                        layout.showSearchResultText("No results found.");
                    }
                } else {
                    layout.hideTrending();
                    layout.showSearchResultText("Could not fetch search results.");
                }
            };
            layout.clearSearchList();
            var q = $("#search-input").val();
            if (q != "") {
                rottenTomatoes.searchMovie(q, handleSearchResult);
                layout.searching();
            }
        }

        function fetchTrendingMovies() {
            function fetchSuccessFunction(result) {
                try {
                    result = JSON.parse(result);
                } catch (ignore) {
                }
                if (result.results && result.results.length > 0) {
                    window.trending = window.trending || {};
                    window.trending.movies = result.results;
                    layout.showTrendingMovies(window.trending.movies);
                }
            }

            function failFunction() {

            }

            var url = "https://www.rottentomatoes.com/api/private/v2.0/browse";
            var params = {
                maxTomato: 100,
                maxPopcorn: 100,
                certified: 'true',
                sortBy: 'popularity',
                type: 'cf-in-theaters'
            };
            util.sendAjax(url, "GET", params, fetchSuccessFunction, failFunction);
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
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.rotten = {link: movie.rottenlink};
                    thisMovie.cast = movie.cast;
                    thisMovie.images.coverImage = movie.coverImage;
                    thisMovie.images.image = movie.image;
                    thisMovie.infoList = movie.infoList;
                    thisMovie.ratings.audienceScore = movie.audienceScore;
                    thisMovie.synopsis = movie.movieSynopsis;
                    layout.showRTMovie();
                } else {
                    layout.goToHome();
                    layout.showSearchResultText("Couldn't fetch data.");
                }
            }

            function handleSubtitleLoad(success, subtitle) {
                if (success) {
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.subtitleLinks = thisMovie.subtitleLinks || [];
                    var len = thisMovie.subtitleLinks.length;
                    subtitle.index = len;
                    thisMovie.subtitleLinks.push(subtitle);
                    if (len == 0) {
                        layout.showSubtitleLink();
                    }
                }
            }

            function handleTrailerLoad(success, id) {
                if (success) {
                    bringe.movie.trailer = bringe.movie.trailer || {};
                    var trailer = bringe.movie.trailer;
                    trailer.youtube = trailer.youtube || {};
                    trailer.youtube.id = trailer.youtube.id || {};
                    trailer.youtube.id.google = id;
                    layout.showMovieTrailerLink();
                }
            }

            function handleImdbLoaded(success, movie) {
                if (success) {
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.ratings.imdbRating = movie.imdbRating;
                    thisMovie.ratings.metaRating = movie.metaRating;
                    thisMovie.imdb = {id: movie.imdbId};
                    layout.placeImdbMovieRating();
                }
            }

            function handleGoogleLoaded(success, movie) {
                if (success) {
                    bringe.movie.reviews = movie.reviews;
                    bringe.movie.social = movie.social;
                    layout.placeGoogleMovieData();
                }
            }

            if (bringe.searchResults.movies[index]) {
                layout.hideAllSection();
                var movie = bringe.searchResults.movies[index];
                bringe.movie = setupThisMovie(movie);
                layout.showRottenLoader($(".movie-wrapper"));
                layout.showMoviePart();
                rottenTomatoes.getMovie(movie, handleRottenLoaded);
                imdb.searchMovie(movie.name, movie.year, handleImdbLoaded);
                google.searchMovie(movie.name, movie.year, handleGoogleLoaded);
                trailer.fetchMovieTrailer(movie.name, movie.year, handleTrailerLoad);
                movies.loadMovies();
                subscene.searchMovieSubtitle(movie.name, movie.year, handleSubtitleLoad);
            }
        }

        function getTrendingMovie(index) {
            function setupThisMovie(movie) {
                var theMovie = {name: movie.title, title: movie.title};
                theMovie.ratings = {meterScore: movie.tomatoScore};
                var image = movie.posters && movie.posters.primary;
                theMovie.images = {thumbnail: image};
                return theMovie;
            }

            function handleRottenLoaded(success, movie) {
                if (success) {
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.rotten = {link: movie.rottenlink};
                    thisMovie.cast = movie.cast;
                    thisMovie.images.coverImage = movie.coverImage;
                    thisMovie.images.image = movie.image;
                    thisMovie.infoList = movie.infoList;
                    thisMovie.ratings.audienceScore = movie.audienceScore;
                    thisMovie.synopsis = movie.movieSynopsis;
                    thisMovie.year = movie.year;
                    imdb.searchMovie(thisMovie.name, thisMovie.year, handleImdbLoaded);
                    google.searchMovie(thisMovie.name, thisMovie.year, handleGoogleLoaded);
                    trailer.fetchMovieTrailer(thisMovie.name, thisMovie.year, handleTrailerLoad);
                    movies.loadMovies();
                    subscene.searchMovieSubtitle(thisMovie.name, thisMovie.year, handleSubtitleLoad);
                    layout.showRTMovie();
                } else {
                    layout.goToHome();
                    layout.showSearchResultText("Couldn't fetch data.");
                }
            }

            function handleSubtitleLoad(success, subtitle) {
                if (success) {
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.subtitleLinks = thisMovie.subtitleLinks || [];
                    var len = thisMovie.subtitleLinks.length;
                    subtitle.index = len;
                    thisMovie.subtitleLinks.push(subtitle);
                    if (len == 0) {
                        layout.showSubtitleLink();
                    }
                }
            }

            function handleTrailerLoad(success, id) {
                if (success) {
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.trailer = thisMovie.trailer || {};
                    thisMovie.trailer.youtube = thisMovie.trailer.youtube || {};
                    thisMovie.trailer.youtube.id = thisMovie.trailer.youtube.id || {};
                    thisMovie.trailer.youtube.id.google = id;
                    layout.showMovieTrailerLink();
                }
            }

            function handleImdbLoaded(success, movie) {
                if (success) {
                    bringe.movie = bringe.movie || {};
                    var thisMovie = bringe.movie;
                    thisMovie.ratings.imdbRating = movie.imdbRating;
                    thisMovie.ratings.metaRating = movie.metaRating;
                    thisMovie.imdb = {id: movie.imdbId};
                    layout.placeImdbMovieRating();
                }
            }

            function handleGoogleLoaded(success, movie) {
                if (success) {
                    bringe.movie.reviews = movie.reviews;
                    bringe.movie.social = movie.social;
                    layout.placeGoogleMovieData();
                }
            }

            if (window.trending.movies[index]) {
                layout.hideAllSection();
                var movie = window.trending.movies[index];
                bringe.movie = setupThisMovie(movie);
                layout.showRottenLoader($(".movie-wrapper"));
                layout.showMoviePart();
                rottenTomatoes.getMovie(movie, handleRottenLoaded);
            }
        }

        function getSerie(index) {
            function handleRottenLoaded(success) {
                if (success) {
                    layout.showRTSerie();
                }
            }

            function handleImdbLoaded(success) {
                if (success) {
                    layout.placeImdbSerieRating();
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

            if (bringe.searchResults.series[index]) {
                layout.hideAllSection();
                bringe.serieLevel = "serie";
                var serie = bringe.searchResults.series[index],
                    rottenLink = "http://www.rottentomatoes.com" + serie.url,
                    seasonNumber = getSeasonNumber(rottenLink);
                if (seasonNumber) {
                    layout.clearAllSeasonData();
                    bringe.serie = {};
                    var thisSerie = bringe.serie;
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
                    series.loadSerie();
                    getSeason(0);
                    return;
                }
                bringe.serie = {};
                thisSerie = bringe.serie;
                thisSerie.title = serie.title;
                thisSerie.startYear = serie.startYear;
                thisSerie.endYear = serie.endYear;
                thisSerie.thumbnail = serie.image;
                thisSerie.ratings = thisSerie.ratings || {};
                thisSerie.ratings.rotten = serie.meterValue;
                thisSerie.links = thisSerie.links || {};
                thisSerie.links.rotten = rottenLink;
                thisSerie.websites = {};
                layout.showRottenLoader($(".serie-wrapper"));
                layout.showSeriePart();
                rottenTomatoes.getSerie(thisSerie, handleRottenLoaded);
                imdb.searchSerie(thisSerie.title, handleImdbLoaded);
                series.loadSerie();
            }
        }

        function getSeason(index) {
            function handleRottenLoaded(success) {
                if (success) {
                    layout.showRTSeasonData();
                }
            }

            function handleEpisodesLoaded(success) {
                if (success) {
                    layout.showRTEpisodesList();
                }
            }

            function handleTrailerLoad(success, id) {
                if (success) {
                    bringe.season.youtubeId = id;
                }
            }

            if (bringe.serie.seasons && bringe.serie.seasons[index]) {
                layout.hideAllSection();
                layout.clearAllSeasonData();
                bringe.serieLevel = "season";
                bringe.season = bringe.serie.seasons[index];
                bringe.serie.seasonNo = bringe.season.seasonNo;
                layout.showRottenLoader($(".serie-wrapper"));
                layout.showSeriePart();
                rottenTomatoes.getSeason(bringe.season, handleRottenLoaded, handleEpisodesLoaded);
                trailer.fetchSeasonTrailer(bringe.serie, bringe.serie.seasonNo, handleTrailerLoad);
                if (bringe.serie.metaData && bringe.serie.metaData.imdbId) {
                    imdb.loadEpisodes(bringe.serie.metaData.imdbId, bringe.serie.seasonNo);
                }
                series.loadSeason();
            }
        }

        function getEpisode(index) {
            function handleRottenLoaded(success) {
                if (success) {
                    layout.showRTEpisodeData();
                }
            }

            function handleSubtitleLoad(success) {
                if (success) {
                    layout.showEpisodeSubtitleLink();
                }
            }

            if (bringe.season.episodes && bringe.season.episodes[index]) {
                layout.hideAllSection();
                layout.clearAllEpisodeData();
                bringe.serieLevel = "episode";
                bringe.episode = bringe.season.episodes[index];
                bringe.episode.seasonNo = bringe.season.seasonNo;
                bringe.episode.serieName = bringe.serie.title;
                bringe.serie.episodeNo = bringe.episode.episodeNo;
                layout.showRottenLoader($(".serie-wrapper"));
                layout.showSeriePart();
                rottenTomatoes.getEpisode(bringe.episode, handleRottenLoaded);
                series.loadEpisode();
                subscene.searchEpisodeSubtitle(bringe.episode, handleSubtitleLoad);
                if (bringe.season.youtubeId) {
                    layout.showEpisodeTrailerLink();
                }
            }
        }

        function openMovieStreamLink(selector) {
            if (selector && selector.id) {
                var movie = movies.getMovieBySelector(selector);
                if (movie) {
                    if (movie.type === 'iframe') {
                        chrome.tabs.create({'url': movie.src}, function (tab) {
                        });
                    } else {
                        var obj = {src: movie.src};
                        if (bringe.movie.coverImage && bringe.movie.coverImage != "") {
                            obj.poster = bringe.movie.coverImage;
                        }
                        player.setupVideo(obj);
                        layout.openVideoPopup();
                    }
                }
            }
        }

        function downloadMovieStreamLink(obj) {
            movies.downloadMovieStreamLink(obj);
        }

        function downloadMovieSubtitle(id) {
            layout.openWaiter("Adding Subtitle to Downloads");
            downloads.addToDownload(bringe.movie.subtitleLinks[id].link, bringe.movie.name, ".zip", function (downloadId) {
                layout.closeWaiter();
                if (downloadId) {
                    layout.shineDownloadButton();
                }
            });
        }

        function downloadEpisodeSubtitle(id) {
            var serie = bringe.serie;
            layout.openWaiter("Adding Subtitle to Downloads");
            downloads.addToDownload(subscene.getSubtitleEpisode(serie.seasonNo, serie.episodeNo).links[id].link, serie.title, ".zip", function (downloadId) {
                layout.closeWaiter();
                if (downloadId) {
                    layout.shineDownloadButton();
                }
            });
        }

        function openSerieStreamLink(selector) {
            if (selector && selector.id && selector.source) {
                var episode = series.getEpisodeBySelector(selector);
                if (episode) {
                    if (episode.type === 'iframe') {
                        chrome.tabs.create({'url': episode.src}, function (tab) {
                        });
                    } else {
                        var obj = {src: episode.src};
                        if (bringe.serie.coverImage && bringe.serie.coverImage != "") {
                            obj.poster = bringe.serie.coverImage;
                        }
                        player.setupVideo(obj);
                        layout.openVideoPopup();
                    }
                }
            }
        }

        function downloadSerieStreamLink(selector) {
            if (selector && selector.id && selector.source) {
                var episode = series.getEpisodeBySelector(selector),
                    link;
                if (episode) {
                    if (episode.type === 'iframe') {
                        chrome.tabs.create({'url': episode.src}, function (tab) {
                        });
                    } else {
                        link = episode.src;
                        var name = bringe.episode.title;
                        layout.openWaiter("Adding Episode to Downloads");
                        downloads.addToDownload(link, name, ".mp4", function (downloadId) {
                            layout.closeWaiter();
                            if (downloadId) {
                                layout.shineDownloadButton();
                            }
                        });
                    }
                }
            }
        }

        function openMovieStreamPopup() {
            layout.openMovieStreamPopup(bringe.movie);
        }

        function openMovieSubtitlePopup() {
            layout.openMovieSubtitlePopup(bringe.movie);
        }

        function openEpisodesStreamPopup() {
            var streamLinks = series.getStreamLinks();
            layout.openEpisodesStreamPopup(streamLinks);
        }

        function openEpisodesSubtitlePopup() {
            var serie = bringe.serie;
            var episode = subscene.getSubtitleEpisode(serie.seasonNo, serie.episodeNo) || {};
            layout.openEpisodesSubtitlePopup(episode);
        }

        function openMovieTrailer() {
            if (bringe.movie.trailer && bringe.movie.trailer.youtube && bringe.movie.trailer.youtube.id) {
                if (bringe.movie.trailer.youtube.id.watchit) {
                    layout.openTrailerPopup();
                    trailer.setupYoutube(bringe.movie.trailer.youtube.id.watchit);
                } else if (bringe.movie.trailer.youtube.id.google) {
                    layout.openTrailerPopup();
                    trailer.setupYoutube(bringe.movie.trailer.youtube.id.google);
                }
            }
        }

        function openSeasonTrailer() {
            if (bringe.season.youtubeId) {
                layout.openTrailerPopup();
                trailer.setupYoutube(bringe.season.youtubeId);
            }
        }

        function searchOnGoogle(q) {
            q = q.replace(/ /g, '+');
            var url = "https://www.google.com/search?q=" + q;
            background.openLinkInBrowser(url);
        }

        function closeVideo() {
            layout.closeVideoPopup();
            player.removeVideo();
        }

        function closeYoutube() {
            layout.closeTrailerPopup();
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
    });