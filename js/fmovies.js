_define('fmovies', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = "https://fmovies.is";
    var ts;

    function failFunction(name, error) {
        if (bringe.page != "movie") return;
        callback({site: "fmovies", status: false, name: name});
    }

    function successFunction(name, linkDetails, complete) {
        if (bringe.page != "movie") return;
        callback({site: "fmovies", status: true, name: name, linkDetails: linkDetails, complete: complete});
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

        function isSameMovieName4(a, b) {
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace("part", "").replace(/iii/, "3").replace(/ii/, "2");
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace("part", "").replace(/iii/, "3").replace(/ii/, "2");
            return a == b;
        }

        return [isSameMovieName1, isSameMovieName2, isSameMovieName3, isSameMovieName4];
    }();

    var searchTermFunctions = function () {
        function getMovieSearchTerm1(searchTerm) {
            searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/'/, "").replace(/^the/, "").replaceAll(/,|:| -|- /, " ");
            searchTerm = searchTerm.replace("part", "");
            searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
            return searchTerm;
        }

        function getMovieSearchTerm2(searchTerm) {
            searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,|:| -|- |'/, " ");
            searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
            return searchTerm;
        }

        function getMovieSearchTerm3(searchTerm) {
            searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,|:| -|- |'/, " ");
            searchTerm = searchTerm.replace("part", "");
            searchTerm = searchTerm.replace(/i*$/, "").trim().replaceAll(/\s+/, "+");
            return searchTerm;
        }

        return [getMovieSearchTerm1, getMovieSearchTerm2, getMovieSearchTerm3];
    }();

    function getMovieSearchTerms(searchTerm) {
        var terms = [];
        for (var fIndex = 0; fIndex < searchTermFunctions.length; fIndex++) {
            terms.push(searchTermFunctions[fIndex](searchTerm));
        }
        terms = terms.filter(function (item, pos) {
            return terms.indexOf(item) == pos;
        });
        return terms;
    }

    function getSearchedMovieName(name, movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieNames = [],
            itemIndex, fIndex;
        for (itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
            movieNames.push($(movieItems[itemIndex]).find("a.name").html());
        }
        for (fIndex = 0; fIndex < isSameNameFunctions.length; fIndex++) {
            for (itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
                if (isSameNameFunctions[fIndex](movieNames[itemIndex], name)) {
                    return movieItems[itemIndex];
                }
            }
        }
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

    function cleanSpecialUrl(url) {
        return url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
    }

    function dataHandler(name, index, subtitle, sources) {
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
                source.source = "fmovies";
                source.origin = source.origin || 'fmovies';
                source.id = 'fm-' + index + '*' + source.res;
                source.subtitles = [subtitle];
                sourceList.push(source);
            }
            if (sourceList.length > 0) {
                successFunction(name, sourceList);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    function moviePageSuccessFunction(name, result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            movieFetchLink,
            promisesLeft,
            promises = [],
            linkFound = false,
            servers = myDoc.find('#servers .server'),
            server, serverId,
            movieIds,
            movieId;
        for (var j = 0; j < servers.length; j++) {
            server = $(servers[j]);
            serverId = server.attr('data-id');
            movieIds = server.find("ul.episodes a");
            for (var i = 0; i < movieIds.length; i++) {
                movieId = $(movieIds[i]).attr("data-id");
                movieFetchLink = hashUrl(base_url + '/ajax/episode/info', {
                    id: movieId,
                    update: '0',
                    server: serverId
                });
                promises.push(util.ajaxPromise(movieFetchLink));
            }
        }
        promisesLeft = promises.length;
        function completeAPromise() {
            promisesLeft--;
            if (promisesLeft == 0) {
                if (!linkFound) {
                    successFunction(name, [], true);
                } else {
                    failFunction(name, null, true);
                }
            }
        }
        Promise.all(promises).then(function () {
            if (!linkFound) {
                failFunction(name);
            }
        }).catch(function (error) {
            if (!linkFound) {
                failFunction(name, error);
            }
        });
        util.each(promises, function (promise, index) {
            promise.then(function (json) {
                if (bringe.page != "movie") return;
                try {
                    json = JSON.parse(json);
                } catch (ignore) {
                }
                if (json.target) {
                    json.target = cleanSpecialUrl(json.target);
                    json.origin = getOriginFromUrl(json.target);
                    return {data: [{file: json.target, origin: json.origin, type: 'iframe'}]};
                } else if (json && json.grabber && json.params) {
                    var url = hashUrl(json.grabber, json.params);
                    return util.ajaxPromise(url);
                }
                completeAPromise();
            }).then(function (result) {
                if (!result) return;
                try {
                    result = JSON.parse(result);
                } catch (ignore){}
                if (!result.error || result.data) {
                    linkFound = dataHandler(name, index, result.subtitle, result.data) || linkFound;
                }
                completeAPromise();
            }).catch(function (error) {
                completeAPromise(error);
            });
        });
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchSucceeded = false;
        util.ajaxPromise(base_url).then(function (result) {
            if (bringe.page != "movie") return;
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc),
                searchNames = getMovieSearchTerms(name),
                link,
                promises = [];
            ts = myDoc.find("body").attr("data-ts");

            util.each(searchNames, function (searchTerm) {
                link = hashUrl(base_url + '/ajax/film/search', {sort: 'year:desc', keyword: searchTerm});
                promises.push(util.ajaxPromise(link));
            });
            Promise.all(promises).then(function () {
                if (!searchSucceeded) {
                    failFunction(name);
                }
            }).catch(function (error) {
                if (!searchSucceeded) {
                    failFunction(name, error);
                }
            });
            util.each(promises, function (promise) {
                promise.then(function (result) {
                    if (bringe.page != "movie" || searchSucceeded) return;
                    try {
                        result = JSON.parse(result);
                    } catch (ignore) {
                    }
                    if (!result.html) return;
                    var doc = new DOMParser().parseFromString(result.html, "text/html"),
                        myDoc = $(doc),
                        movieItems = myDoc.find(".item"),
                        path;
                    if (movieItems.length == 0) return;
                    var movieItem = getSearchedMovieName(name, movieItems);
                    if (!movieItem) return;
                    path = $(movieItem).find("a.name").attr("href");
                    if (!path) return;
                    searchSucceeded = true;
                    var moviePageLink = base_url + path;
                    return util.ajaxPromise(moviePageLink);
                }).then(function (result) {
                    if (!result) return;
                    moviePageSuccessFunction(name, result);
                }).catch(function(error){
                    failFunction(name, error);
                });
            });
        }).catch(function (error) {
            if (!searchSucceeded) {
                failFunction(name, error);
            }
        });
    }

    return {
        loadMovie: loadMovie
    }
});
