_define('movies', [window, 'bringe', 'layout', 'gomovies', 'fmovies', 'watchit', 'downloads'],
    function (window, bringe, layout, gomovies, fmovies, watchit, downloads) {
        var totalSites = 2;

        function handleResponse(object) {
            var thisMovie = bringe.movie;
            thisMovie.movieRespones.count++;
            if (object.status) {
                var site = object.site;
                if (!thisMovie.movieRespones[site]) {
                    thisMovie.movieRespones[site] = true;
                    thisMovie.movieRespones.successCount++;
                    if (thisMovie.movieRespones.successCount === 1) {
                        layout.showMovieStreamLink();
                        layout.movieLoadComplete();
                    }
                }
                thisMovie.streamLinkDetails = thisMovie.streamLinkDetails || [];
                for (var i = 0; i < object.linkDetails.length; i++) {
                    thisMovie.streamLinkDetails.push(object.linkDetails[i]);
                }
            }
            if (thisMovie.movieRespones.count === totalSites) {
                layout.movieLoadComplete();
            }
            layout.movieLoadComplete();
        }

        function handleWatchItResponse(object) {
            if (object.status) {
                var thisMovie = bringe.movie;
                if (object.youtubeId) {
                    thisMovie.trailer = thisMovie.trailer || {};
                    thisMovie.trailer.youtube = thisMovie.trailer.youtube || {};
                    thisMovie.trailer.youtube.id = thisMovie.trailer.youtube.id || {};
                    thisMovie.trailer.youtube.id.watchit = object.youtubeId;
                    layout.showMovieTrailerLink();
                }
                thisMovie.externalStreams = thisMovie.externalStreams || [];
                for (var i = 0; i < object.linkDetails.length; i++) {
                    thisMovie.externalStreams.push(object.linkDetails[i]);
                }
                if (object.linkDetails.length > 0) {
                    layout.showExternalMovieStreaming();
                }
            }
        }

        function getMovieBySelector(selector) {
            var sourceList = bringe.movie.streamLinkDetails,
                source;
            for (var i = 0; i < sourceList.length; i++) {
                source = sourceList[i];
                if (source.id === selector.id) {
                    return source;
                }
            }
        }

        function getDefaultMovie() {
            var sourceList = bringe.movie.streamLinkDetails;
            if (sourceList[0])
                return sourceList[0];
        }

        function openMovieStreamLink(selector) {
            var movie;
            if (selector && selector.id && selector.label) {
                movie = getMovieBySelector(selector);
                if (movie) {
                    chrome.tabs.create({'url': movie.src}, function (tab) {
                    });
                }
            } else {
                movie = getDefaultMovie();
                if (movie) {
                    chrome.tabs.create({'url': movie.src}, function (tab) {
                    });
                }
            }
        }

        function downloadMovieStreamLink(selector) {
            layout.openWaiter("Adding Movie to Downloads...");
            var movie;
            if (selector && selector.id && selector.source) {
                movie = getMovieBySelector(selector);
            } else {
                movie = getDefaultMovie();
            }
            if (movie) {
                downloads.addToDownload(movie.src, bringe.movie.name, ".mp4", function () {
                    layout.closeWaiter();
                    layout.shineDownloadButton();
                });
            } else {
                layout.closeWaiter();
            }
        }

        function loadMovies() {
            if (bringe.page != "movie") return;
            layout.findingMovieLink();
            var thisMovie = bringe.movie;
            thisMovie.movieRespones = {count: 0, successCount: 0};
            gomovies.loadMovie(thisMovie.name, thisMovie.year, handleResponse);
            fmovies.loadMovie(thisMovie.name, thisMovie.year, handleResponse);
            watchit.loadMovie(thisMovie.name, thisMovie.year, handleWatchItResponse);
        }

        return {
            loadMovies: loadMovies,
            getMovieBySelector: getMovieBySelector,
            downloadMovieStreamLink: downloadMovieStreamLink,
            openMovieStreamLink: openMovieStreamLink
        }
    });
