_define('goseries', [window, 'util', 'bringe'], function (window, util, bringe) {
    var episodeCallback;
    var base_url = "https://gostream.is";

    function failEpisodeFunction(name, seasonNo, episodeNo) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "goseries", status: false, name: name, seasonNo: seasonNo, episodeNo: episodeNo});
    }

    function successEpisodeFunction(name, seasonNo, episodeNo, complete) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "goseries", status: true, name: name, seasonNo: seasonNo, episodeNo: episodeNo, complete: complete});
    }

    function getSeasonData(sNo) {
        bringe.serie.websites.gomovies = bringe.serie.websites.gomovies || {};
        var gomovies = bringe.serie.websites.gomovies;
        gomovies.seasons = gomovies.seasons || [];
        var seasons = gomovies.seasons;
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
    };

    function getMovies123SearchTerm(serieName, seasonNo) {
        var searchTerm = serieName;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(".", "").replace(/^the/, "").replaceAll(/,| -|- |'/, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
        searchTerm += "+-+Season+" + seasonNo;
        return searchTerm;
    }

    function getSearchedSerie(title, seasonNo, movieItems) {
        if (movieItems.length == 1) {
            return $(movieItems[0]);
        }
        var movieNames = [];
        util.eachDomObj(movieItems, function (movieItem) {
            movieNames.push(movieItem.find(".mli-info h2").html());
        });
        return util.any(isSameNameFunctions, function (isSameNameFunction) {
            return util.any(movieNames, function (movieName, index) {
                if (isSameNameFunction(movieName, title + " - Season " + seasonNo)) {
                    return $(movieItems[index]);
                }
            });
        });
    }

    function dataHandler(eid, name, seasonNo, episodeNo, result) {
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
                    source.origin = "gomovies";
                    source.id = eid + '*' + source.res;
                    sourceList.push(source);
                }
                var episodeData = getEpisodeData(seasonNo, episodeNo);
                episodeData.streams = episodeData.streams || [];
                Array.prototype.push.apply(episodeData.streams, sourceList);
                successEpisodeFunction(name, seasonNo, episodeNo);
                return true;
            }
        } catch (error) {
            return false;
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
        var title = link.attr("title"),
            linkId = link.attr("data-id"),
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

    function loadSeason(obj, callback) {
        var serieName = obj.title,
            seasonNo = obj.seasonNo;
        var searchName = getMovies123SearchTerm(serieName, seasonNo);
        var link = base_url + '/movie/search/' + searchName;
        util.ajaxPromise(link).then(function (result) {
            if (bringe.page != "serie") return;
            var doc = util.getDocFromHTML(result);
            var movieItems = doc.find(".movies-list .ml-item");
            var movieItem = getSearchedSerie(serieName, seasonNo, movieItems);
            if (!movieItem) {
                throw Error('Search Failed');
            }
            var movies123MoviePageLink = $(movieItem).find("a").attr("href") + "watching.html";
            return util.ajaxPromise(movies123MoviePageLink);
        }).then(function (response) {
            if (bringe.page != "serie" || !response) return;
            var doc = util.getDocFromHTML(response),
                url = doc.find(".fb-comments").attr("data-href"),
                movies123MovieId = getMovieId(url),
                movies123FetchLink = base_url + "/ajax/movie_episodes/" + movies123MovieId;
            getSeasonData(seasonNo).seasonId = movies123MovieId;
            return util.ajaxPromise(movies123FetchLink);
        }).then(function (response) {
            if (bringe.page != "serie" || !response) return;
            var json = JSON.parse(response),
                success = false;
            if (!json.status) {
                throw Error('Bad Response');
            }
            var doc = util.getDocFromHTML(json.html),
                servers = doc.find(".le-server");
            clearOldSeasonData(seasonNo);
            util.eachDomObj(servers, function (server) {
                var serverId = server.attr("data-id"),
                    title = server.find(".les-title").text();
                if (title.indexOf("OpenLoad") !== -1) {
                    return;
                }
                var links = server.find("a.btn-eps");
                util.eachDomObj(links, function (link) {
                    success = retrieveDataFromLink(link, seasonNo, serverId) || success;
                });
            });
            callback(success, {site: "goseries"});
        }).catch(function (error) {
            callback(false, {site: "goseries"}, error);
        });
    }

    function loadEpisode(obj, callback) {
        episodeCallback = callback;
        var name = obj.title,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episodeData = getEpisodeData(seasonNo, episodeNo),
            eids = episodeData.ids,
            promises = [],
            promisesLeft,
            success = false;
        episodeData.streams = [];
        if (!eids && eids.length == 0) {
            failEpisodeFunction(name, seasonNo, episodeNo);
        }
        util.each(eids, function (eid) {
            var link = base_url + '/ajax/movie_token?eid=' + eid + '&mid=' + getSeasonData(seasonNo).seasonId;
            promises.push(util.ajaxPromise(link));
        });
        promisesLeft = promises.length;
        function completeAPromise() {
            promisesLeft--;
            if (promisesLeft == 0) {
                if (success) {
                    successEpisodeFunction(name, seasonNo, episodeNo, true);
                } else {
                    failEpisodeFunction(name, seasonNo, episodeNo);
                }
            }
        }

        util.each(promises, function (promise, i) {
            promise.then(function (response) {
                var parts = response.split(','),
                    x = parts[0].split("'")[1],
                    y = parts[1].split("'")[1],
                    link = base_url + '/ajax/movie_sources/' + eids[i] + '?x=' + x + '&y=' + y;
                if (!x || !y) {
                    return completeAPromise();
                }
                return util.ajaxPromise(link);
            }).then(function (response) {
                if (!response) return;
                success = dataHandler(eids[i], name, seasonNo, episodeNo, response) || success;
                completeAPromise();
            }).catch(function (error) {
                completeAPromise(error);
            });
        });
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

    return {
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
