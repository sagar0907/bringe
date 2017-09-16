_define('series', [window, 'util', 'bringe', 'layout', 'fseries', '123series', 'watchit', 'watchseries'],
    function (window, util, bringe, layout, fseries, series123, watchit, watchseries) {

        var serieAdapters = {
            'fseries': fseries,
            '123series': series123,
            'watchseries': watchseries
        };

        function handleSerieResponse() {

        }

        function handleSeasonResponse() {

        }

        function handleEpisodeResponse(success) {
            if (success) {
                layout.showEpisodeStreamLink();
            }
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
            util.each(serieAdapters, function(serieAdapter){
                if (util.isFunction(serieAdapter.loadSerie)) {
                    serieAdapter.loadSerie(obj, handleSerieResponse);
                }
            });
            watchit.loadSerie(thisSerie.title, thisSerie.startYear, handleWatchitSerie);
        }

        function loadSeason() {
            if (bringe.page != "serie") return;
            var thisSerie = bringe.serie;
            var obj = {title: thisSerie.title, seasonNo: thisSerie.seasonNo};
            util.each(serieAdapters, function(serieAdapter){
                if (util.isFunction(serieAdapter.loadSeason)) {
                    serieAdapter.loadSeason(obj, handleSeasonResponse);
                }
            });
            var season = getWatchitSeason();
            if (season) {
                watchit.loadSeason(season.pageLink, season.seasonId, handleWatchitSeason);
            }
        }

        function loadEpisode() {
            if (bringe.page != "serie") return;
            var obj = {title: bringe.serie.title, seasonNo: bringe.serie.seasonNo, episodeNo: bringe.serie.episodeNo};
            util.each(serieAdapters, function(serieAdapter){
                if (util.isFunction(serieAdapter.loadEpisode)) {
                    serieAdapter.loadEpisode(obj, handleEpisodeResponse);
                }
            });
        }

        function getStreamLinks() {
            if (bringe.page != "serie") return;
            var obj = {seasonNo: bringe.serie.seasonNo, episodeNo: bringe.serie.episodeNo},
                streamLinks = [];
            util.each(serieAdapters, function(serieAdapter){
                var links = serieAdapter.getStreamLinks(obj);
                if (links && util.isArray(links) && links.length > 0) {
                    Array.prototype.push.apply(streamLinks, links);
                }
            });
            return streamLinks;
        }

        function getEpisodeBySelector(selector) {
            var id = selector.id,
                source = selector.source,
                thisSerie = bringe.serie,
                obj = {seasonNo: thisSerie.seasonNo, episodeNo: thisSerie.episodeNo, id: id},
                serieAdapter = serieAdapters[source];
            return serieAdapter.getEpisodeBySelector(obj);
        }

        return {
            loadSerie: loadSerie,
            loadSeason: loadSeason,
            loadEpisode: loadEpisode,
            getStreamLinks: getStreamLinks,
            getEpisodeBySelector: getEpisodeBySelector
        }
    });
