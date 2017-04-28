/**
 * Created by sagar.ja on 18/04/17.
 */
function series() {
    var totalSites = 1;
    thisSerie.websites = thisSerie.websites || {};
    function handleResponse(object) {
        thisMovie.movieRespones.count++;
        if (object.status) {
            var site = object.site;
            if (!thisMovie.movieRespones[site]) {
                thisMovie.movieRespones[site] = true;
                thisMovie.movieRespones.successCount++;
                if (thisMovie.movieRespones.successCount === 1) {
                    layout().showMovieStreamLink();
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
        layout().movieLoadComplete();
    }
    function handleSerieResponse() {

    }
    function handleSeasonResponse() {

    }
    function handleEpisodeResponse() {

    }
    function handleDownloadResponse() {

    }
    function handleStreamResponse() {

    }
    function getMovieBySelector(selector) {
        var sourceList = thisMovie.streamLinkDetails,
            source;
        for(var i = 0 ; i < sourceList.length; i++) {
            source = sourceList[i];
            if (source.id === selector.id) {
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
        if(selector && selector.id && selector.label) {
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
        if(selector && selector.id && selector.label) {
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
    function loadSerie() {
        if (page != "serie") return;
        var obj = {title: thisSerie.title};
        watchseries().loadSerie(obj, handleSerieResponse);
    }
    function loadSeason() {
        if (page != "serie") return;
        var obj = {title: thisSerie.title, seasonNo: thisSerie.seasonNo};
        goseries().loadSeason(obj, handleSeasonResponse);
    }
    function loadEpisode() {
        if (page != "serie") return;
        var obj = {title: thisSerie.title, seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo};
        goseries().loadEpisode(obj, handleEpisodeResponse);
        watchseries().loadEpisode(obj ,handleEpisodeResponse);
    }
    function getStreamLinks() {
        if (page != "serie") return;
        var obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo};
        var streamLinks = [],
            links;
        links = goseries().getStreamLinks(obj);
        if (links && util().isArray(links) && links.length > 0) {
            Array.prototype.push.apply(streamLinks, links);
        }
        links = watchseries().getStreamLinks(obj);
        if (links && util().isArray(links) && links.length > 0) {
            Array.prototype.push.apply(streamLinks, links)
        }
        return streamLinks;
    }
    function downloadEpisodeStreamLink(arg) {
        console.log(arg);
        if (page != "serie") return;
        var id = arg.id,
            source = arg.source;
        var obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo, id: id};
        if (source === "goseries") {
            goseries().downloadEpisodeStreamLink(obj, handleDownloadResponse);
        } else if (source === "watchseries") {
            watchseries().downloadEpisodeStreamLink(obj, handleDownloadResponse);
        }
    }
    function streamEpisodeStreamLink(arg) {
        console.log(arg);
        if (page != "serie") return;
        var id = arg.id,
            source = arg.source;
        var obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo, id: id};
        if (source === "goseries") {
            goseries().streamEpisodeStreamLink(obj, handleStreamResponse);
        } else if (source === "watchseries") {
            watchseries().streamEpisodeStreamLink(obj, handleStreamResponse);
        }
    }
    return {
        loadSerie: loadSerie,
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        downloadEpisodeStreamLink: downloadEpisodeStreamLink,
        streamEpisodeStreamLink: streamEpisodeStreamLink
    }
}