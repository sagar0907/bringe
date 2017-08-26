_define('goseries', [window, 'util', 'bringe', 'layout', 'downloads'], function (window, util, bringe, layout, downloads) {
    var seasonCallback;
    var episodeCallback;
    var base_url = "https://gostream.is";

    function failSeasonFunction() {
        seasonCallback(false, {site: "goseries"});
    }
    function failEpisodeFunction() {
        if (bringe.page != "serie") return;
        episodeCallback(false, {site: "goseries"});
    }

    function getSeasonData(sNo) {
        bringe.serie.websites.gomovies = bringe.serie.websites.gomovies || {};
        var gomovies = bringe.serie.websites.gomovies;
        gomovies.seasons = gomovies.seasons || [];
        var seasons = gomovies.seasons;
        var season = util.any(seasons, function (season) {
            if (season.seasonNo === sNo) {
                return season;
            }
        });
        if (season) {
            return season;
        }
        season = {seasonNo: sNo};
        gomovies.seasons.push(season);
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
            if(stream.id === id) {
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
        searchTerm += "+-+Season+" + seasonNo;
        return searchTerm;
    }

    function getMovies123SearchedMovie(movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieItem, movieName,
            title = bringe.serie.title,
            seasonNo = bringe.season.seasonNo;
        for (var i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find("a").attr("title");
            if (isSameMovieName1(movieName, title + " - Season " + seasonNo)) {
                return movieItem;
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find("a").attr("title");
            if (isSameMovieName2(movieName, title + " - Season " + seasonNo)) {
                return movieItem;
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find("a").attr("title");
            if (isSameMovieName3(movieName, title + " - Season " + seasonNo)) {
                return movieItem;
            }
        }
        failSeasonFunction();
    }

    function dataHandler(eid, seasonNo, episodeNo, result) {
        try {
            result = JSON.parse(result);
            if (result && result.playlist && result.playlist[0] && result.playlist[0].sources && result.playlist[0].sources.length > 0) {
                var sources = result.playlist[0].sources,
                    sourceList = [];
                for (var i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    source.src = source.file;
                    source.res = source.res || parseInt(source.label);
                    if (!source.res) {
                        source.res = '-';
                        source.label = '-';
                    }
                    source.source = "goseries";
                    source.id = eid + '*' + source.res;
                    sourceList.push(source);
                }
                var episodeData = getEpisodeData(seasonNo, episodeNo);
                episodeData.streams = episodeData.streams || [];
                Array.prototype.push.apply(episodeData.streams, sourceList);
                layout.showEpisodeStreamLink();
                episodeCallback(true, {site: "goseries"});
            } else {
                failEpisodeFunction();
            }
        } catch (error) {
            failEpisodeFunction();
        }
    }

    function hashSuccessFunction(eid, seasonNo, episodeNo, result) {
        var parts = result.split(',');
        var x = parts[0].split("'")[1];
        var y = parts[1].split("'")[1];
        var link = base_url + '/ajax/movie_sources/' + eid + '?x=' + x + '&y=' + y;
        if (x && y) {
            util.sendAjax(link, "GET", {}, util.getProxy(dataHandler, [eid, seasonNo, episodeNo]), failEpisodeFunction);
        } else {
            failEpisodeFunction();
        }
    }

    function getMovies123MovieLinks(eids, seasonNo, episodeNo) {
        if (eids && eids.length > 0) {
            for (var i = 0; i < eids.length; i++) {
                var eid = eids[i];
                var link = base_url + '/ajax/movie_token?eid=' + eid + '&mid=' + getSeasonData(seasonNo).seasonId;
                util.sendAjax(link, "GET", {}, util.getProxy(hashSuccessFunction, [eid, seasonNo, episodeNo]), failEpisodeFunction);
            }
        } else {
            failEpisodeFunction();
        }
    }

    function getMovieId(url) {
        var parts = url.split("-");
        var part = parts[parts.length - 1];
        return part.split("/")[0];
    }

    function getEpisodeNoFromTitle(title) {
        var epPart = title.split(":")[0].split(" ");
        return parseInt(epPart[epPart.length - 1]);
    }

    function clearOldSeasonData(sNo) {
        var episodes = getSeasonData(sNo).episodes || [];
        util.each(episodes, function (episode) {
            delete episode.ids;
        });
    }

    function retrieveDataFromLink(link, seasonNo, serverId) {
        var title = $(link).attr("title"),
            linkId = $(link).attr("data-id"),
            episodeNo = getEpisodeNoFromTitle(title),
            episodeData;
        if (linkId && episodeNo) {
            episodeData = getEpisodeData(seasonNo, episodeNo);
            episodeData.ids = episodeData.ids || [];
            episodeData.ids.push(linkId);
            return true;
        }
        return false;
    }

    function episodesSuccessFunction(seasonNo, result) {
        if (bringe.page != "serie") return;
        try {
            var json = JSON.parse(result);
            var success = false;
            if (json.status) {
                var doc = new DOMParser().parseFromString(json.html, "text/html"),
                    myDoc = $(doc),
                    servers = myDoc.find(".le-server");
                clearOldSeasonData(seasonNo);
                if (servers.length > 0) {
                    for (var i = 0; i < servers.length; i++) {
                        var server = servers[i],
                            serverId = $(server).attr("data-id");
                        var title = $(server).find(".les-title").text();
                        if (title.indexOf("OpenLoad") !== -1) {
                            continue;
                        }
                        var links = $(server).find("a.btn-eps").toArray();
                        if (links) {
                            util.each(links, function (link) {
                                success = retrieveDataFromLink(link, seasonNo, serverId) || success;
                            });
                        }
                    }
                    seasonCallback(success, {site: "goseries"});
                    return;
                }
            }
            failSeasonFunction();
        } catch (ignore) {
            failSeasonFunction();
        }
    }

    function seasonPageSuccessFunction(seasonNo, result) {
        if (bringe.page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            url = myDoc.find(".fb-comments").attr("data-href"),
            movies123MovieId = getMovieId(url),
            movies123FetchLink = base_url + "/ajax/movie_episodes/" + movies123MovieId;
        getSeasonData(seasonNo).seasonId = movies123MovieId;
        util.sendAjax(movies123FetchLink, "GET", {}, util.getProxy(episodesSuccessFunction, [seasonNo]), failSeasonFunction);
    }

    function searchSuccessFunction(seasonNo, result) {
        if (bringe.page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        var movieItems = myDoc.find(".movies-list .ml-item");
        if (movieItems.length > 0) {
            var movieItem = getMovies123SearchedMovie(movieItems);
            if (movieItem) {
                var movies123MoviePageLink = $(movieItem).find("a").attr("href") + "watching.html";
                util.sendAjax(movies123MoviePageLink, "GET", {}, util.getProxy(seasonPageSuccessFunction, [seasonNo]), failSeasonFunction);
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
        var link = base_url + '/movie/search/' + searchName;
        util.sendAjax(link, "GET", {}, util.getProxy(searchSuccessFunction, [seasonNo]), failSeasonFunction);
    }

    function loadEpisode(obj, func) {
        episodeCallback = func;
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episodeData = getEpisodeData(seasonNo, episodeNo),
            ids = episodeData.ids;
        episodeData.streams = [];
        getMovies123MovieLinks(ids, seasonNo, episodeNo);
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
            var name = bringe.episode.title;
            layout.openWaiter("Adding Episode to Downloads");
            downloads.addToDownload(link, name, ".mp4", function () {
                layout.closeWaiter();
                layout.shineDownloadButton();
            });
            return;
        }
        layout.closeWaiter();
    }
    function streamEpisodeStreamLink(obj, callback) {
        var id = obj.id,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            var link = getLinkById(episode.streams, id);
            link = link.src;
            chrome.tabs.create({'url': link}, function(tab) {});
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
