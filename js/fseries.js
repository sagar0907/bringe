_define('fseries', [window, 'util', 'bringe'], function (window, util, bringe) {
    var episodeCallback,
        base_url = "https://fmovies.se",
        ts;

    function failEpisodeFunction(name, seasonNo, episodeNo, error) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "fseries", status: false, name: name, seasonNo: seasonNo, episodeNo: episodeNo});
    }

    function successEpisodeFunction(name, seasonNo, episodeNo, complete) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "fseries", status: true, name: name, seasonNo: seasonNo, episodeNo: episodeNo, complete: complete});
    }

    function hashUrl(url, params) {
        var salt = 'FuckYouBitch';

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

        if (url.indexOf('?') === -1) {
            return url + '?' + query;
        } else {
            return url + '&' + query;
        }
    }

    function getDecodedParams(params) {
        util.each(params, function(val, key) {
            if (val[0] === '.') {
                params[key] = util.caesarShift(val.substr(1), 8);
            }
        });
        return params;
    }

    function getSeasonData(sNo) {
        bringe.serie.websites.fmovies = bringe.serie.websites.fmovies || {};
        var fmovies = bringe.serie.websites.fmovies;
        fmovies.seasons = fmovies.seasons || [];
        var seasons = fmovies.seasons;
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
            return $(movieItems[0]);
        }
        var title = bringe.serie.title,
            seasonNo = bringe.season.seasonNo,
            movieNames = [];
        util.eachDomObj(movieItems, function (movieItem) {
            movieNames.push(movieItem.html());
        });
        var movieItem = util.any(isSameNameFunctions, function (isSameNameFunction) {
            return util.any(movieNames, function (movieName, itemIndex) {
                if (isSameNameFunction(movieName, title + " " + seasonNo)) {
                    return $(movieItems[itemIndex]);
                }
            });
        });
        if (movieItem) return movieItem;
        if (seasonNo == 1) {
            return util.any(isSameNameFunctions, function (isSameNameFunction) {
                return util.any(movieNames, function (movieName, itemIndex) {
                    if (isSameNameFunction(movieName, title)) {
                        return $(movieItems[itemIndex]);
                    }
                });
            });
        }
    }

    function cleanSpecialUrl(url) {
        return url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
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

    function dataHandler(name, seasonNo, episodeNo, index, subtitle, sources) {
        try {
            var sourceList = [];
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
                source.origin = source.origin || 'fmovies';
                source.id = "fm-" + index + '*' + source.res;
                source.subtitles = [subtitle];
                sourceList.push(source);
            }
            if (sourceList.length > 0) {
                var episodeData = getEpisodeData(seasonNo, episodeNo);
                episodeData.streams = episodeData.streams || [];
                Array.prototype.push.apply(episodeData.streams, sourceList);
                successEpisodeFunction(name, seasonNo, episodeNo);
                return true;
            } else {
                return false;
            }

        } catch (error) {
            return false;
        }
    }

    function retrieveDataFromLink(link, seasonNo, serverId) {
        var linkId = link.attr("data-id"),
            episodeNo = parseInt(link.html()),
            episodeData;
        if (linkId && episodeNo) {
            episodeData = getEpisodeData(seasonNo, episodeNo);
            episodeData.data = episodeData.data || [];
            episodeData.data.push({id: linkId, server: serverId});
            return true;
        }
        return false;
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

    function loadEpisode(obj, func) {
        episodeCallback = func;
        var name = obj.title,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episodeData = getEpisodeData(seasonNo, episodeNo),
            data = episodeData.data;
        episodeData.streams = [];
        util.ajaxPromise(base_url).then(function (result) {
            if (bringe.page != "serie") return;
            var doc = util.getDocFromHTML(result),
                promises = [],
                promisesLeft,
                linkFound;
            ts = doc.find("body").attr("data-ts");
            if (!data || data.length == 0) {
                failEpisodeFunction(name, seasonNo, episodeNo);
                return;
            }
            util.each(data, function (dataObj) {
                var link = hashUrl(base_url + '/ajax/episode/info', {
                    id: dataObj.id,
                    server: dataObj.server,
                    update: '0'
                });
                promises.push(util.ajaxPromise(link));
            });
            promisesLeft = promises.length;
            function completeAPromise() {
                promisesLeft--;
                if (promisesLeft == 0) {
                    if (linkFound) {
                        successEpisodeFunction(name, seasonNo, episodeNo, true);
                    } else {
                        failEpisodeFunction(name, seasonNo, episodeNo);
                    }
                }
            }

            util.each(promises, function (promise, i) {
                promise.then(function (json) {
                    if (bringe.page != "serie") return;
                    try {
                        json = JSON.parse(json);
                    } catch (ignore) {
                    }
                    if (json.target) {
                        json = getDecodedParams(json);
                        json.target = cleanSpecialUrl(json.target);
                        json.origin = getOriginFromUrl(json.target);
                        return {
                            data: [{
                                file: json.target,
                                origin: json.origin,
                                type: 'iframe'
                            }]
                        };
                    } else if (json && json.grabber && json.params) {
                        var params = getDecodedParams(json.params);
                        var url = hashUrl(json.grabber, params);
                        return util.ajaxPromise(url);
                    }
                    completeAPromise();
                }).then(function (result) {
                    if (!result) return;
                    try {
                        result = JSON.parse(result);
                    } catch (ignore) {
                    }
                    if (!result.error || result.data) {
                        linkFound = dataHandler(name, seasonNo, episodeNo, i + 1, result.subtitle, result.data) || linkFound;
                    }
                    completeAPromise();
                }).catch(function (error) {
                    completeAPromise(error);
                });
            });
        }).catch(function (error) {
            failEpisodeFunction(name, seasonNo, episodeNo, error);
        });
    }

    function loadSeason(obj, callback) {
        var serieName = obj.title,
            seasonNo = obj.seasonNo,
            searchName = getSeasonSearchTerm(serieName, seasonNo),
            link = base_url + '/search?keyword=' + searchName;
        util.ajaxPromise(link).then(function (result) {
            if (bringe.page != "serie") return;
            var myDoc = util.getDocFromHTML(result);
            ts = myDoc.find("body").attr("data-ts");
            var movieItems = myDoc.find(".movie-list .item a.name"),
                movieItem = getSearchedSeason(movieItems);
            if (!movieItem) {
                throw Error('No matching season found');
            }
            var seasonLink = base_url + movieItem.attr("href");
            return util.ajaxPromise(seasonLink);
        }).then(function (result) {
            if (bringe.page != "serie") return;
            var success = false,
                myDoc = util.getDocFromHTML(result),
                servers = myDoc.find("#servers .server");
            getSeasonData(seasonNo).episodes = [];
            util.eachDomObj(servers, function (server) {
                var serverId = server.attr('data-id'),
                    links = server.find("ul.episodes a");
                util.eachDomObj(links, function (link) {
                    success = retrieveDataFromLink(link, seasonNo, serverId) || success;
                });
            });
            callback(success, {site: "fseries"});
        }).catch(function (error) {
            callback(false, {site: "fseries"}, error);
        });
    }

    return {
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
