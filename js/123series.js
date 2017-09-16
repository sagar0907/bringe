_define('123series', [window, 'util', 'bringe'], function (window, util, bringe) {
    var base_url = "https://123movies.io";

    function getSeasonData(sNo) {
        bringe.serie.websites.series123 = bringe.serie.websites.series123 || {};
        var series123 = bringe.serie.websites.series123;
        series123.seasons = series123.seasons || [];
        var seasons = series123.seasons;
        seasons[sNo] = seasons[sNo] || {seasonNo: sNo};
        return seasons[sNo];
    }

    function getEpisodeData(sNo, epNo) {
        var seasonData = getSeasonData(sNo);
        seasonData.episodes = seasonData.episodes || [];
        var episodes = seasonData.episodes;
        episodes[epNo] = episodes[epNo] || {episodeNo: sNo};
        return episodes[epNo];
    }

    function getLinkById(streams, id) {
        var link = null;
        link = util.any(streams, function (stream) {
            if (stream.id === id) {
                link = stream;
                return link;
            }
        });
        return link;
    }

    var isSameNameFunctions = function () {
        function isSameMovieName1(a, b) {
            a = a.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "");
            b = b.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "");
            return a == b;
        }

        function isSameMovieName2(a, b) {
            a = a.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            b = b.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            return a == b;
        }

        function isSameMovieName3(a, b) {
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            return a == b;
        }

        return [isSameMovieName1, isSameMovieName2, isSameMovieName3];
    }();

    function getSearchedSerie(title, movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieNames = [],
            fIndex,
            itemIndex;
        for (itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
            movieNames.push($(movieItems[itemIndex]).find(".mli-info h2").html());
        }
        for (fIndex = 0; fIndex < isSameNameFunctions.length; fIndex++) {
            for (itemIndex = 0; itemIndex < movieNames.length; itemIndex++) {
                if (isSameNameFunctions[fIndex](movieNames[itemIndex], title)) {
                    return movieItems[itemIndex];
                }
            }
        }
    }

    function getStreamLinks(obj) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            return episode.streams;
        } else {
            return null;
        }
    }

    function getEpisodeBySelector(selector) {
        var id = selector.id,
            seasonNo = selector.seasonNo,
            episodeNo = selector.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            return getLinkById(episode.streams, id);
        }
    }

    function getEpisodeNoFromLink(link) {
        var title = link.attr('title'),
            episodePart = title.split(':')[0];
        episodePart = episodePart.toLowerCase().replace('episode', '').trim();
        return parseInt(episodePart);
    }

    function getOriginFromUrl(url) {
        var part = url.split('//')[1],
            origin;
        if (part) {
            origin = part.split('.')[0];
            if (origin == 'www') {
                origin = part.split('.')[1];
            }
            return origin;
        }
    }

    function loadEpisode(obj, callback) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episodeData = getEpisodeData(seasonNo, episodeNo),
            ids = episodeData.ids,
            url = base_url + '/ajax/load_embed/';
        getEpisodeData(seasonNo, episodeNo).streams = [];
        function episodeSuccessFunction(episodeData, index, result) {
            try {
                result = JSON.parse(result);
            } catch (ignore) {
            }
            if (result && result.status == 1 && result.embed_url) {
                var extUrl = result.embed_url,
                    source = {};
                source.src = extUrl;
                if (extUrl[0] == '/') {
                    source.src = 'https:' + extUrl;
                }
                source.file = source.src;
                source.res = '-';
                source.label = '-';
                source.source = "123series";
                source.id = '123-' + index + '*' + source.res;
                source.type = 'iframe';
                source.origin = getOriginFromUrl(source.src) || '123movies';
                source.subtitles = [];
                episodeData.streams = episodeData.streams || [];
                episodeData.streams.push(source);
                callback(true, {site: "123series"});
            } else {
                callback(false, {site: "123series"});
            }
        }
        util.each(ids, function(id, index) {
            util.sendAjax(url + id, "GET", {}, util.getProxy(episodeSuccessFunction, [episodeData, index + 1]), util.getProxy(callback, [false, {site: "123series"}]));
        });
    }

    function loadSeason(obj, callback) {
        var seasonNo = obj.seasonNo,
            link;

        function seasonSuccessFunction(result) {
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc),
                servers = myDoc.find('.le-server'),
                server, i,
                links, j,
                link, epNo,
                epId,
                success = false;
            getSeasonData(seasonNo).episodes = [];
            for (i = 0; i < servers.length; i++) {
                server = $(servers[i]);
                links = server.find('.les-content a');
                for (j = 0; j < links.length; j++) {
                    link = $(links[j]);
                    epNo = getEpisodeNoFromLink(link);
                    epId = link.attr('episode-id');
                    if (epId) {
                        success = true;
                        var episodeData = getEpisodeData(seasonNo, epNo);
                        episodeData.ids = episodeData.ids || [];
                        episodeData.ids.push(epId);
                    }
                }
            }
            callback(success, {site: "123series"});
        }

        if (bringe.serie.websites && bringe.serie.websites.series123 && bringe.serie.websites.series123.serieId) {
            link = base_url + '/ajax/v2_get_episodes/s' + seasonNo + '-' + bringe.serie.websites.series123.serieId;
            util.sendAjax(link, "GET", {}, util.getProxy(seasonSuccessFunction), util.getProxy(callback, [false, {site: "123series"}]));
        }
    }

    function loadSerie(obj, callback) {
        var searchTerm = util.getSearchTerm(obj.title);
        var link = base_url + '/serie/search/' + searchTerm + '/view/all/all';

        function searchSuccessFunction(result) {
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc),
                movieItems = myDoc.find(".movies-list .ml-item");
            if (movieItems.length > 0) {
                var movieItem = getSearchedSerie(obj.title, movieItems);
                if (movieItem) {
                    var movieId = $(movieItem).attr("data-movie-id");
                    bringe.serie.websites.series123 = bringe.serie.websites.series123 || {};
                    bringe.serie.websites.series123.serieId = movieId;
                    callback(true, {site: "123series"});
                    return;
                }
            }
            callback(false, {site: "123series"});
        }
        util.sendAjax(link, "GET", {}, searchSuccessFunction, util.getProxy(callback, [false, {site: "123series"}]));
    }

    return {
        loadSerie: loadSerie,
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
