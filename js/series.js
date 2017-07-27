/**
 * Created by sagar.ja on 18/04/17.
 */
_define('series', [window, 'util', 'bringe', 'layout', 'goseries', 'fseries', 'watchit', 'watchseries'],
    function (window, util, bringe, layout, goseries, fseries, watchit, watchseries) {

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

        function handleWatchitSeason(object) {
            if (object.status) {
                var season;
                var thisSerie = bringe.serie,
                    seasonNo = bringe.season.seasonNo;
                if (thisSerie.websites && thisSerie.websites.watchit && thisSerie.websites.watchit.seasons) {
                    var seasons = thisSerie.websites.watchit.seasons;
                    if (seasons[seasonNo + '']) {
                        season = seasons[seasonNo + ''];
                    }
                }
                if (season) {
                    season.externalStreams = [];
                    for (var i = 0; i < object.linkDetails.length; i++) {
                        season.externalStreams.push(object.linkDetails[i]);
                    }
                }
            }
        }

        function handleWatchitSerie(result) {
            var thisSerie = bringe.serie;
            if (result.status) {
                thisSerie.websites = thisSerie.websites || {};
                thisSerie.websites.watchit = thisSerie.websites.watchit || {};
                thisSerie.websites.watchit.seasons = result.seasons;
            }
        }

        function getWatchitSeason() {
            var thisSerie = bringe.serie;
            var thisSeason = bringe.season;
            if (thisSerie.websites && thisSerie.websites.watchit && thisSerie.websites.watchit.seasons) {
                var seasons = thisSerie.websites.watchit.seasons;
                if (seasons[thisSeason.seasonNo + '']) {
                    return seasons[thisSeason.seasonNo + ''];
                }
            }
        }

        function loadSerie() {
            if (bringe.page != "serie") return;
            var thisSerie = bringe.serie;
            var obj = {title: thisSerie.title};
            watchseries.loadSerie(obj, handleSerieResponse);
            watchit.loadSerie(thisSerie.title, thisSerie.startYear, handleWatchitSerie);
        }

        function loadSeason() {
            if (bringe.page != "serie") return;
            var thisSerie = bringe.serie;
            var obj = {title: thisSerie.title, seasonNo: thisSerie.seasonNo};
            goseries.loadSeason(obj, handleSeasonResponse);
            fseries.loadSeason(obj, handleSeasonResponse);
            var season = getWatchitSeason();
            if (season) {
                watchit.loadSeason(season.pageLink, season.seasonId, handleWatchitSeason);
            }
        }

        function loadEpisode() {
            if (bringe.page != "serie") return;
            var obj = {title: bringe.serie.title, seasonNo: bringe.serie.seasonNo, episodeNo: bringe.serie.episodeNo};
            goseries.loadEpisode(obj, handleEpisodeResponse);
            fseries.loadEpisode(obj, handleEpisodeResponse);
            watchseries.loadEpisode(obj, handleEpisodeResponse);
        }

        function getStreamLinks() {
            if (bringe.page != "serie") return;
            var obj = {seasonNo: bringe.serie.seasonNo, episodeNo: bringe.serie.episodeNo};
            var streamLinks = [],
                links;
            links = goseries.getStreamLinks(obj);
            if (links && util.isArray(links) && links.length > 0) {
                Array.prototype.push.apply(streamLinks, links);
            }
            links = fseries.getStreamLinks(obj);
            if (links && util.isArray(links) && links.length > 0) {
                Array.prototype.push.apply(streamLinks, links)
            }
            links = watchseries.getStreamLinks(obj);
            if (links && util.isArray(links) && links.length > 0) {
                Array.prototype.push.apply(streamLinks, links)
            }
            return streamLinks;
        }

        function downloadEpisodeStreamLink(arg) {
            if (bringe.page != "serie") return;
            var thisSerie = bringe.serie;
            var id = arg.id,
                source = arg.source;
            var obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo, id: id};
            if (source === "goseries") {
                goseries.downloadEpisodeStreamLink(obj, handleDownloadResponse);
            } else if (source === "fseries") {
                fseries.downloadEpisodeStreamLink(obj, handleDownloadResponse);
            } else if (source === "watchseries") {
                watchseries.downloadEpisodeStreamLink(obj, handleDownloadResponse);
            }
        }

        function streamEpisodeStreamLink(arg) {
            if (bringe.page != "serie") return;
            var thisSerie = bringe.serie;
            var id = arg.id,
                source = arg.source;
            var obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo, id: id};
            if (source === "goseries") {
                goseries.streamEpisodeStreamLink(obj, handleStreamResponse);
            } else if (source === "fseries") {
                fseries.streamEpisodeStreamLink(obj, handleStreamResponse);
            } else if (source === "watchseries") {
                watchseries.streamEpisodeStreamLink(obj, handleStreamResponse);
            }
        }

        function getEpisodeBySelector(selector) {
            var id = selector.id,
                source = selector.source;
            var thisSerie = bringe.serie;
            var obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo, id: id};
            if (source === "goseries") {
                return goseries.getEpisodeBySelector(obj);
            } else if (source === "fseries") {
                return fseries.getEpisodeBySelector(obj);
            } else if (source === "watchseries") {
                return watchseries.getEpisodeBySelector(obj);
            }
        }

        return {
            loadSerie: loadSerie,
            loadSeason: loadSeason,
            loadEpisode: loadEpisode,
            getStreamLinks: getStreamLinks,
            getEpisodeBySelector: getEpisodeBySelector,
            downloadEpisodeStreamLink: downloadEpisodeStreamLink,
            streamEpisodeStreamLink: streamEpisodeStreamLink
        }
    });
