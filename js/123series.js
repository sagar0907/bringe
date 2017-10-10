_define('123series', [window, 'util', 'bringe'], function (window, util, bringe) {
    var base_url = "https://123movies.io",
        episodeCallback;

    function ignoreError(error) {
    }
    function failEpisodeFunction(name, seasonNo, episodeNo, error) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "123series", status: false, name: name, seasonNo: seasonNo, episodeNo: episodeNo});
    }

    function successEpisodeFunction(name, seasonNo, episodeNo, complete) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "123series", status: true, name: name, seasonNo: seasonNo, episodeNo: episodeNo, complete: complete});
    }

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
            return $(movieItems[0]);
        }
        var movieNames = [];
        util.eachDomObj(movieItems, function (movieItem) {
            movieNames.push(movieItem.find(".mli-info h2").html());
        });
        return util.any(isSameNameFunctions, function (isSameNameFunction) {
            return util.any(movieNames, function (movieName, index) {
                if (isSameNameFunction(movieName, title)) {
                    return $(movieItems[index]);
                }
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
        episodeCallback = callback;
        var name = obj.title,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episodeData = getEpisodeData(seasonNo, episodeNo),
            ids = episodeData.ids,
            url = base_url + '/ajax/load_embed/',
            promises = [],
            success = false;
        episodeData.streams = [];
        util.each(ids, function (id) {
            promises.push(util.ajaxPromise(url + id));
        });
        Promise.all(promises).then(function () {
            if (success) {
                successEpisodeFunction(name, seasonNo, episodeNo, true);
            } else {
                failEpisodeFunction(name, seasonNo, episodeNo);
            }
        }).catch(function(error) {
            if (success) {
                successEpisodeFunction(name, seasonNo, episodeNo, true, error);
            } else {
                failEpisodeFunction(name, seasonNo, episodeNo, error);
            }
        });
        util.each(promises, function(promise, index) {
            promise.then(function(result) {
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
                    source.id = '123-' + (index+1) + '*' + source.res;
                    source.type = 'iframe';
                    source.origin = getOriginFromUrl(source.src) || '123movies';
                    source.subtitles = [];
                    episodeData.streams = episodeData.streams || [];
                    episodeData.streams.push(source);
                    success = true;
                    successEpisodeFunction(name, seasonNo, episodeNo);
                }
            }).catch(function(error) {
                ignoreError(error);
            });
        });
    }

    function loadSeason(obj, callback) {
        if (!bringe.serie.websites || !bringe.serie.websites.series123 || !bringe.serie.websites.series123.serieId) {
            callback(false, {site: "123series"});
        }
        var seasonNo = obj.seasonNo,
            link = base_url + '/ajax/v2_get_episodes/s' + seasonNo + '-' + bringe.serie.websites.series123.serieId;
        util.ajaxPromise(link).then(function (result) {
            var myDoc = util.getDocFromHTML(result),
                servers = myDoc.find('.le-server'),
                success = false;
            getSeasonData(seasonNo).episodes = [];
            util.eachDomObj(servers, function (server) {
                var links = server.find('.les-content a');
                util.eachDomObj(links, function (link) {
                    var epNo = getEpisodeNoFromLink(link);
                    var epId = link.attr('episode-id');
                    if (!epNo || !epId) return;
                    success = true;
                    var episodeData = getEpisodeData(seasonNo, epNo);
                    episodeData.ids = episodeData.ids || [];
                    episodeData.ids.push(epId);
                });
            });
            callback(success, {site: "123series"});
        }).catch(function (error) {
            callback(false, {site: "123series"}, error);
        });
    }

    function loadSerie(obj, callback) {
        var searchTerm = util.getSearchTerm(obj.title);
        var link = base_url + '/serie/search/' + searchTerm + '/view/all/all';
        util.ajaxPromise(link).then(function (result) {
            var myDoc = util.getDocFromHTML(result),
                movieItems = myDoc.find(".movies-list .ml-item");
            var movieItem = getSearchedSerie(obj.title, movieItems);
            if (!movieItem) {
                return callback(false, {site: "123series"});
            }
            var movieId = $(movieItem).attr("data-movie-id");
            bringe.serie.websites.series123 = bringe.serie.websites.series123 || {};
            bringe.serie.websites.series123.serieId = movieId;
            callback(true, {site: "123series"});
        }).catch(function (error) {
            callback(false, {site: "123series"}, error);
        });
    }

    return {
        loadSerie: loadSerie,
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
