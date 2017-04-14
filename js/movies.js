/**
 * Created by sagar.ja on 24/02/17.
 */
function movies() {
    var totalSites = 2;
    function handleResponse(object) {
        thisMovie.movieRespones.count++;
        if (object.status) {
            var site = object.site;
            if (!thisMovie.movieRespones[site]) {
                thisMovie.movieRespones[site] = true;
                thisMovie.movieRespones.successCount++;
                if (thisMovie.movieRespones.successCount === 1) {
                    layout().showMovieStreamLink();
                    layout().showMovieDownloadLink();
                    layout().movieLoadComplete();
                }
            }
            thisMovie.streamLinkDetails = thisMovie.streamLinkDetails || [];
            for (var i=0; i<object.linkDetails.length; i++) {
                thisMovie.streamLinkDetails.push(object.linkDetails[i]);
            }
        }
        if (thisMovie.movieRespones.count === totalSites) {
            layout().movieLoadComplete();
        }
    }
    function getMovieBySelector(selector) {
        var sourceList = thisMovie.streamLinkDetails,
            source;
        console.log(sourceList);
        console.log(selector);
        for(var i = 0 ; i < sourceList.length; i++) {
            source = sourceList[i];
            if (source.source === selector.source && source.id === selector.id && source.label === selector.label) {
                return source;
            }
        }
    }
    function getDefaultMovie() {
        var sourceList = thisMovie.streamLinkDetails;
        if(sourceList[0])
            return sourceList[0];
    }
    function openMovieStreamLink(selector) {
        var movie;
        if(selector && selector.source && selector.id && selector.label) {
            movie = getMovieBySelector(selector);
            if(movie) {
                chrome.tabs.create({'url': movie.src}, function(tab) {});
            }
        } else {
            movie = getDefaultMovie();
            if(movie) {
                chrome.tabs.create({'url': movie.src}, function(tab) {});
            }
        }
    }
    function downloadMovieStreamLink(selector) {
        layout().openWaiter("Adding Movie to Downloads...");
        var movie;
        if(selector && selector.source && selector.id && selector.label) {
            movie = getMovieBySelector(selector);
        } else {
            movie = getDefaultMovie();
        }
        if(movie) {
            downloads().addToDownload(movie.src, thisMovie.name, ".mp4", function () {
                layout().closeWaiter();
                layout().shineDownloadButton();
            });
        } else {
            layout().closeWaiter();
        }
    }
    function loadMovies() {
        if (page != "movie") return;
        layout().findingMovieLink();
        vumoo().loadVumoo(handleResponse);
        movies123().loadMovies123(handleResponse);
    }
    return {
        loadMovies: loadMovies,
        downloadMovieStreamLink: downloadMovieStreamLink,
        openMovieStreamLink: openMovieStreamLink
    }
}