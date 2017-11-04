_define('123seriesonline', [window, 'util', 'bringe'], function (window, util, bringe) {
    var base_url = 'https://123moviesonline.tv';

    function getSeasonData(sNo) {
        bringe.serie.websites.online123 = bringe.serie.websites.online123 || {};
        var series123 = bringe.serie.websites.online123;
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

    function getEpisodeNoFromEpisodeString(str) {
        str = str.toLowerCase();
        var spNo = str.split('e')[1];
        if (spNo) {
            return parseInt(spNo);
        }
    }

    function getSearchedSerieLink(name, movieItems) {
        if (movieItems.length == 1 && movieItems[0].data && movieItems[0].data.type == 'tv-series') {
            return movieItems[0].data.href;
        }
        var movieNames = [],
            movieLinks = [];
        util.each(movieItems, function (movieItem) {
            if (movieItem && movieItem.data && movieItem.data.type == 'tv-series') {
                movieNames.push(movieItem.value);
                movieLinks.push(movieItem.data.href);
            }
        });
        for (var j = 0; j < isSameNameFunctions.length; j++) {
            for (var i = 0; i < movieNames.length; i++) {
                if (isSameNameFunctions[j](movieNames[i], name)) {
                    return movieLinks[i];
                }
            }
        }
    }

    function addServer(obj, embedUrl, epNo, index) {
        var episodeData,
            source = {};
        episodeData = getEpisodeData(obj.seasonNo, epNo);
        episodeData.streams = episodeData.streams || [];
        source.src = embedUrl;
        source.file = source.src;
        source.res = '-';
        source.label = '-';
        source.source = "123seriesonline";
        source.id = '123online-' + index + '*' + source.res;
        source.type = 'iframe';
        source.origin = '123moviesapp';
        source.subtitles = [];
        episodeData.streams = episodeData.streams || [];
        episodeData.streams.push(source);
    }

    function loadSeason(obj, callback) {
        var searchTerm = util.getSearchTerm(obj.title),
            seasonNo = obj.seasonNo,
            search_url = base_url + '/search?q=' + searchTerm + '+Season+' + seasonNo;
        util.ajaxPromise(search_url).then(function (result) {
            if (bringe.page != "serie" || !result) return;
            try {
                result = JSON.parse(result);
            } catch (ignore) {
            }
            if (!result.suggestions || result.suggestions.length == 0) return;
            var movieLink = getSearchedSerieLink(obj.title + ' Season ' + seasonNo, result.suggestions);
            if (!movieLink) {
                callback({site: "123seriesonline", status: false});
                throw Error('Not found on 123moviesonline');
            }
            return util.ajaxPromise(base_url + movieLink);
        }).then(function (result) {
            if (bringe.page != "serie" || !result) return;
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc),
                servers = myDoc.find('.tab-content .tab-pane a'),
                server,
                embedUrl,
                episodeString,
                epNo,
                success = false;
            if (!servers) return;
            for (var i = 0; i < servers.length; i++) {
                server = $(servers[i]);
                embedUrl = server.attr('embedUrl');
                episodeString = server.html().trim();
                epNo = getEpisodeNoFromEpisodeString(episodeString);
                if (embedUrl && episodeString && epNo) {
                    addServer(obj, embedUrl, epNo, i + 1);
                    success = true;
                }
            }
            if (success) {
                callback({site: "123seriesonline", status: true});
            } else {
                callback({site: "123seriesonline", status: false});
            }
        }).catch(function (err) {
            callback({site: "123seriesonline", status: false, error: err});
        });
    }

    return {
        loadSeason: loadSeason,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
