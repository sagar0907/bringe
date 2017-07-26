/**
 * Created by sagar.ja on 20/07/17.
 */
function fseries() {
    var seasonCallback,
        episodeCallback,
        base_url = "https://fmovies.is",
        ts;

    thisSerie.websites.fmovies = thisSerie.websites.fmovies || {};
    var fmovies = thisSerie.websites.fmovies;

    function failSeasonFunction() {
        seasonCallback(false, {site: "fseries"});
    }

    function failEpisodeFunction() {
        if (page != "serie") return;
        episodeCallback(false, {site: "fseries"});
    }

    function hashUrl(t, params) {

        var salt = 'bLeqpV';
        var y = ts;

        function r(t, params) {
            var e, i = /([^=\?&]+)(?:=([^&$]+))?/gi, n = {};
            if (t.indexOf('?') > -1) {
                do {
                    e = i.exec(t.url);
                    e && (n[e[1]] = decodeURIComponent(e[2] || '').replace(/\+/g, ' '));
                } while (e);
            }
            if (params) {
                do {
                    e = i.exec(params);
                    e && (n[e[1]] = decodeURIComponent(e[2] || '').replace(/\+/g, ' '));
                } while (e);
            }
            return n;
        }

        function a(t, e) {
            var i, n = 0;
            for (i = 0; i < Math.max(t.length, e.length); i++) {
                n += i < e.length ? e.charCodeAt(i) : 0;
                n += i < t.length ? t.charCodeAt(i) : 0;
            }
            return Number(n).toString(16);
        }

        function s(t) {
            var e, i = 0;
            for (e = 0; e < t.length; e++) {
                i += t.charCodeAt(e) * e;
            }
            return i;
        }

        function o(t) {
            var i, r, o = s(salt), l = {};
            r = t;
            r.ts = '' + y;
            for (i in r) {
                Object.prototype.hasOwnProperty.call(r, i) && (o += s(a(salt + i, r[i])));
            }
            l.ts = y;
            l._ = o;
            return l;
        }

        function d(t, e) {
            var i, n = '';
            for (i in e) {
                Object.prototype.hasOwnProperty.call(e, i) && (n += '&' + i + '=' + e[i]);
            }
            return t + (t.indexOf('?') < 0 ? '?' : '&') + n.substr(1);
        }

        var e = o(r(t, params));
        var x = d(t, e);
        return x + (x.indexOf('?') < 0 ? '?' : '&') + params;
    }

    function getSeasonData(sNo) {
        fmovies.seasons = fmovies.seasons || [];
        var seasons = fmovies.seasons;
        var season = util().any(seasons, function (season) {
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
        var episode = util().any(episodes, function (episode) {
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
        link = util().any(streams, function (stream) {
            if (stream.id === id) {
                link = stream;
                return link;
            }
        });
        return link;
    }

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

    function getMovies123SearchTerm(serieName, seasonNo) {
        var searchTerm = serieName;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(".", "").replace(/^the/, "").replaceAll(/,| -|- |'/, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
        searchTerm += "+" + seasonNo;
        return searchTerm;
    }

    function getMovies123SearchedMovie(movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieItem, movieName;
        for (var i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).html();
            if (isSameMovieName1(movieName, thisSerie.title + " " + thisSeason.seasonNo)) {
                return movieItem;
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).html();
            if (isSameMovieName2(movieName, thisSerie.title + " " + thisSeason.seasonNo)) {
                return movieItem;
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).html();
            if (isSameMovieName3(movieName, thisSerie.title + " " + thisSeason.seasonNo)) {
                return movieItem;
            }
        }
    }

    function cleanSpecialUrl(url) {
        return url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
    }

    function getParamString(obj) {
        var str = "";
        util().each(obj, function (val, key) {
            str += "&" + key + "=" + val;
        });
        return str;
    }

    function dataHandler(id, seasonNo, episodeNo, subtitle, result) {
        try {
            result = JSON.parse(result);
            if (result && !result.error && result.data) {
                var sources = result.data,
                    sourceList = [];
                for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
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
                layout().showEpisodeStreamLink();
                episodeCallback(true, {site: "fseries"});
            } else {
                failEpisodeFunction();
            }
        } catch (error) {
            failEpisodeFunction();
        }
    }

    function getMovieStreams(url, id, seasonNo, episodeNo, subtitle) {
        util().sendAjax(url, "GET", {}, util().getProxy(dataHandler, [id, seasonNo, episodeNo, subtitle]), failEpisodeFunction);
    }

    function episodesSuccessFunction(id, seasonNo, episodeNo, json) {
        if (page != "serie") return;
        try {
            json = JSON.parse(json);
        } catch (ignore) {
        }
        if (json.target) {
            json.target = cleanSpecialUrl(json.target);
            //dataHandler(index, json.subtitle, JSON.stringify({data: [{file: json.target}]}));
        } else if (json && json.grabber && json.params) {
            var url = hashUrl(json.grabber + getParamString(json.params), '');
            getMovieStreams(url, id, seasonNo, episodeNo, json.subtitle);
        }
        failEpisodeFunction();
    }

    function getMovies123MovieLinks(eids, seasonNo, episodeNo) {
        if (eids && eids.length > 0) {
            for (var i = 0; i < eids.length; i++) {
                var eid = eids[i];
                var link = hashUrl(base_url + '/ajax/episode/info', 'id=' + eid + '&update=0');
                util().sendAjax(link, "GET", {}, util().getProxy(episodesSuccessFunction, [i + 1, seasonNo, episodeNo]), failEpisodeFunction);
            }
        } else {
            failEpisodeFunction();
        }
    }

    function clearOldSeasonData(sNo) {
        var episodes = getSeasonData(sNo).episodes || [];
        util().each(episodes, function (episode) {
            delete episode.ids;
        });
    }

    function retrieveDataFromLink(link, seasonNo) {
        var linkId = $(link).attr("data-id"),
            episodeNo = parseInt($(link).html()),
            episodeData;
        if (linkId && episodeNo) {
            episodeData = getEpisodeData(seasonNo, episodeNo);
            episodeData.ids = episodeData.ids || [];
            episodeData.ids.push(linkId);
            return true;
        }
        return false;
    }

    function seasonPageSuccessFunction(seasonNo, result) {
        if (page != "serie") return;
        var success = false,
            doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            servers = myDoc.find("#servers .server");
        clearOldSeasonData(seasonNo);
        if (servers.length > 0) {
            for (var i = 0; i < servers.length; i++) {
                var server = servers[i];
                var title = $(server).find("label").text().trim();
                if (title.indexOf("OpenLoad") !== -1 || title.indexOf("MyCloud") !== -1) {
                    continue;
                }
                var links = $(server).find("ul.episodes a").toArray();
                if (links) {
                    util().each(links, function (link) {
                        success = retrieveDataFromLink(link, seasonNo) || success;
                    });
                }
            }
            seasonCallback(success, {site: "fseries"});
            return;
        }
        failSeasonFunction();
    }

    function searchSuccessFunction(seasonNo, result) {
        if (page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        ts = myDoc.find("body").attr("data-ts");
        var movieItems = myDoc.find(".movie-list .item a.name");
        if (movieItems.length > 0) {
            var movieItem = getMovies123SearchedMovie(movieItems);
            if (movieItem) {
                var movies123MoviePageLink = base_url + $(movieItem).attr("href");
                util().sendAjax(movies123MoviePageLink, "GET", {}, util().getProxy(seasonPageSuccessFunction, [seasonNo]), failSeasonFunction);
                return;
            }
        }
        failSeasonFunction();
    }

    function loadSeason(obj, func) {
        var serieName = obj.title,
            seasonNo = obj.seasonNo;
        seasonCallback = func;
        var searchName = getMovies123SearchTerm(serieName, seasonNo);
        var link = base_url + '/search?keyword=' + searchName;
        util().sendAjax(link, "GET", {}, util().getProxy(searchSuccessFunction, [seasonNo]), failSeasonFunction);
    }

    function tsSuccessFunction(ids, seasonNo, episodeNo, result) {
        if (page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        ts = myDoc.find("body").attr("data-ts");
        getMovies123MovieLinks(ids, seasonNo, episodeNo);
    }

    function loadEpisode(obj, func) {
        episodeCallback = func;
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episodeData = getEpisodeData(seasonNo, episodeNo),
            ids = episodeData.ids;
        episodeData.streams = [];
        util().sendAjax(base_url, "GET", {}, util().getProxy(tsSuccessFunction, [ids, seasonNo, episodeNo]), failEpisodeFunction);
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
            link = link.src;
            var name = thisEpisode.title;
            layout().openWaiter("Adding Episode to Downloads");
            downloads().addToDownload(link, name, ".mp4", function () {
                layout().closeWaiter();
                layout().shineDownloadButton();
            });
            return;
        }
        layout().closeWaiter();
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
}