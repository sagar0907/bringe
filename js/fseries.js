_define('fseries', [window, 'util', 'bringe', 'downloads', 'layout'], function (window, util, bringe, downloads, layout) {
    var seasonCallback,
        episodeCallback,
        base_url = "https://fmovies.is",
        ts;

    function failSeasonFunction() {
        seasonCallback(false, {site: "fseries"});
    }

    function failEpisodeFunction() {
        if (bringe.page != "serie") return;
        episodeCallback(false, {site: "fseries"});
    }

    function hashUrl(url, params) {
        var salt = 'ypYZrEpHb';

        function sumOfChars(str) {
            var i = 0;
            for (var e = 0; e < str.length; e++) {
                i += str.charCodeAt(e);
            }
            return i;
        }

        function intermediateHash(saltedKey, value) {
            var sum = sumOfChars(saltedKey) + sumOfChars(value);
            return Number(sum).toString(16);
        }

        function hash(msg) {
            var n = msg.length;
            return n * (n - 1) / 2 + sumOfChars(msg);
        }

        function hashParams(params) {
            var token = hash(salt),
                saltedKey,
                val,
                msg;
            params.ts = '' + ts;
            for (var key in params) {
                if (!params.hasOwnProperty(key)) continue;
                saltedKey = salt + key;
                val = params[key];
                msg = intermediateHash(saltedKey, val);
                token += hash(msg);
            }
            params.ts = '' + ts;
            params['_'] = token;

            return params
        }

        var p = hashParams(params);

        var query = Object.keys(p)
            .map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]);
            })
            .join('&');

        return url + '?' + query;
    }

    function getSeasonData(sNo) {
        bringe.serie.websites.fmovies = bringe.serie.websites.fmovies || {};
        var fmovies = bringe.serie.websites.fmovies;
        fmovies.seasons = fmovies.seasons || [];
        var seasons = fmovies.seasons;
        var season = util.any(seasons, function (season) {
            if (season.seasonNo === sNo) {
                return season;
            }
        });
        if (season) {
            return season;
        }
        season = {seasonNo: sNo};
        fmovies.seasons.push(season);
        return season;
    }

    function getEpisodeData(sNo, epNo) {
        var seasonData = getSeasonData(sNo);
        seasonData.episodes = seasonData.episodes || [];
        var episodes = seasonData.episodes;
        var episode = util.any(episodes, function (episode) {
            if (episode.episodeNo === epNo) {
                return episode;
            }
        });
        if (episode) {
            return episode;
        }
        episode = {episodeNo: epNo};
        seasonData.episodes.push(episode);
        return episode;
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

    function getSeasonSearchTerm(serieName, seasonNo) {
        var searchTerm = serieName;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(".", "").replace(/^the/, "").replaceAll(/,| -|- |'/, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
        searchTerm += "+" + seasonNo;
        return searchTerm;
    }

    function getSearchedSeason(movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var title = bringe.serie.title,
            seasonNo = bringe.season.seasonNo,
            movieNames = [],
            fIndex,
            itemIndex;
        for (itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
            movieNames.push($(movieItems[itemIndex]).html());
        }
        for (fIndex = 0; fIndex < isSameNameFunctions.length; fIndex++) {
            for (itemIndex = 0; itemIndex < movieNames.length; itemIndex++) {
                if (isSameNameFunctions[fIndex](movieNames[itemIndex], title + " " + seasonNo)) {
                    return movieItems[itemIndex];
                }
            }
        }
        if (seasonNo == 1) {
            for (fIndex = 0; fIndex < isSameNameFunctions.length; fIndex++) {
                for (itemIndex = 0; itemIndex < movieNames.length; itemIndex++) {
                    if (isSameNameFunctions[fIndex](movieNames[itemIndex], title)) {
                        return movieItems[itemIndex];
                    }
                }
            }
        }
    }

    function cleanSpecialUrl(url) {
        return url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
    }

    function dataHandler(id, seasonNo, episodeNo, subtitle, result) {
        try {
            result = JSON.parse(result);
            if (result && !result.error && result.data) {
                var sources = result.data,
                    sourceList = [];
                for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    if (source.file && source.file[0] == '/') {
                        source.file = 'http:' + source.file;
                    }
                    source.src = source.file;
                    source.res = source.res || parseInt(source.label);
                    if (!source.res) {
                        source.res = '-';
                        source.label = '-';
                    }
                    source.source = "fseries";
                    source.id = "fm-" + id + '*' + source.res;
                    source.subtitles = [subtitle];
                    sourceList.push(source);
                }
                var episodeData = getEpisodeData(seasonNo, episodeNo);
                episodeData.streams = episodeData.streams || [];
                Array.prototype.push.apply(episodeData.streams, sourceList);
                layout.showEpisodeStreamLink();
                episodeCallback(true, {site: "fseries"});
            } else {
                failEpisodeFunction();
            }
        } catch (error) {
            failEpisodeFunction();
        }
    }

    function getMovieStreams(url, id, seasonNo, episodeNo, subtitle) {
        util.sendAjax(url, "GET", {}, util.getProxy(dataHandler, [id, seasonNo, episodeNo, subtitle]), failEpisodeFunction);
    }

    function episodesSuccessFunction(id, seasonNo, episodeNo, json) {
        if (bringe.page != "serie") return;
        try {
            json = JSON.parse(json);
        } catch (ignore) {
        }
        if (json.target) {
            json.target = cleanSpecialUrl(json.target);
            dataHandler(id, seasonNo, episodeNo, json.subtitle, JSON.stringify({
                data: [{
                    file: json.target,
                    type: 'iframe'
                }]
            }));
        } else if (json && json.grabber && json.params) {
            var url = hashUrl(json.grabber, json.params);
            getMovieStreams(url, id, seasonNo, episodeNo, json.subtitle);
        }
        failEpisodeFunction();
    }

    function getEpisodeInfo(data, seasonNo, episodeNo) {
        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var dataObj = data[i];
                var link = hashUrl(base_url + '/ajax/episode/info', {id: dataObj.id, server: dataObj.server, update: '0'});
                util.sendAjax(link, "GET", {}, util.getProxy(episodesSuccessFunction, [i + 1, seasonNo, episodeNo]), failEpisodeFunction);
            }
        } else {
            failEpisodeFunction();
        }
    }

    function clearOldSeasonData(sNo) {
        var episodes = getSeasonData(sNo).episodes || [];
        util.each(episodes, function (episode) {
            delete episode.data;
        });
    }

    function retrieveDataFromLink(link, seasonNo, serverId) {
        var linkId = $(link).attr("data-id"),
            episodeNo = parseInt($(link).html()),
            episodeData;
        if (linkId && episodeNo) {
            episodeData = getEpisodeData(seasonNo, episodeNo);
            episodeData.data = episodeData.data || [];
            episodeData.data.push({id: linkId, server: serverId});
            return true;
        }
        return false;
    }

    function seasonPageSuccessFunction(seasonNo, result) {
        if (bringe.page != "serie") return;
        var success = false,
            doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            servers = myDoc.find("#servers .server"),
            server,
            serverId,
            links;
        clearOldSeasonData(seasonNo);
        if (servers.length > 0) {
            for (var i = 0; i < servers.length; i++) {
                server = $(servers[i]);
                serverId = server.attr('data-id');
                links = server.find("ul.episodes a").toArray();
                if (links) {
                    util.each(links, function (link) {
                        success = retrieveDataFromLink(link, seasonNo, serverId) || success;
                    });
                }
            }
            seasonCallback(success, {site: "fseries"});
            return;
        }
        failSeasonFunction();
    }

    function searchSuccessFunction(seasonNo, result) {
        if (bringe.page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        ts = myDoc.find("body").attr("data-ts");
        var movieItems = myDoc.find(".movie-list .item a.name");
        if (movieItems.length > 0) {
            var movieItem = getSearchedSeason(movieItems);
            if (movieItem) {
                var seasonLink = base_url + $(movieItem).attr("href");
                util.sendAjax(seasonLink, "GET", {}, util.getProxy(seasonPageSuccessFunction, [seasonNo]), failSeasonFunction);
                return;
            }
        }
        failSeasonFunction();
    }

    function loadSeason(obj, func) {
        var serieName = obj.title,
            seasonNo = obj.seasonNo;
        seasonCallback = func;
        var searchName = getSeasonSearchTerm(serieName, seasonNo);
        var link = base_url + '/search?keyword=' + searchName;
        util.sendAjax(link, "GET", {}, util.getProxy(searchSuccessFunction, [seasonNo]), failSeasonFunction);
    }

    function tsSuccessFunction(data, seasonNo, episodeNo, result) {
        if (bringe.page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        ts = myDoc.find("body").attr("data-ts");
        getEpisodeInfo(data, seasonNo, episodeNo);
    }

    function loadEpisode(obj, func) {
        episodeCallback = func;
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episodeData = getEpisodeData(seasonNo, episodeNo),
            data = episodeData.data;
        episodeData.streams = [];
        util.sendAjax(base_url, "GET", {}, util.getProxy(tsSuccessFunction, [data, seasonNo, episodeNo]), failEpisodeFunction);
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

    function downloadEpisodeStreamLink(obj, callback) {
        var id = obj.id,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            var link = getLinkById(episode.streams, id);
            if (link.type === 'iframe') {
                chrome.tabs.create({'url': link.src}, function (tab) {
                });
            } else {
                link = link.src;
                var name = bringe.episode.title;
                layout.openWaiter("Adding Episode to Downloads");
                downloads.addToDownload(link, name, ".mp4", function () {
                    layout.closeWaiter();
                    layout.shineDownloadButton();
                });
            }
        }
    }

    function streamEpisodeStreamLink(obj, callback) {
        var id = obj.id,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            var link = getLinkById(episode.streams, id);
            link = link.src;
            chrome.tabs.create({'url': link}, function (tab) {
            });
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

    return {
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector,
        downloadEpisodeStreamLink: downloadEpisodeStreamLink,
        streamEpisodeStreamLink: streamEpisodeStreamLink
    }
});
