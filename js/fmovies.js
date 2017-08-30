_define('fmovies', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = "https://fmovies.is";
    var ts;

    function failFunction() {
        if (bringe.page != "movie") return;
        callback({site: "fmovies", status: false});
    }

    function successFunction(linkDetails) {
        if (bringe.page != "movie") return;
        callback({site: "fmovies", status: true, linkDetails: linkDetails});
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
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace("part", "").replace(/iii$/, "3").replace(/ii$/, "2");
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace("part", "").replace(/iii$/, "3").replace(/ii$/, "2");
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
        failFunction();
    }

    function dataHandler(index, subtitle, result) {
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
                    source.source = "fmovies";
                    source.id = 'fm-' + index + '*' + source.res;
                    source.subtitles = [subtitle];
                    bringe.movie.streamLinkDetails = bringe.movie.streamLinkDetails || [];
                    sourceList.push(source);
                }
                successFunction(sourceList);
            } else {
                failFunction();
            }
        } catch (error) {
            failFunction();
        }
    }

    function cleanSpecialUrl(url) {
        return url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
    }

    function episodesSuccessFunction(index, json) {
        if (bringe.page != "movie") return;
        try {
            json = JSON.parse(json);
        } catch (ignore) {
        }
        if (json.target) {
            json.target = cleanSpecialUrl(json.target);
            dataHandler(index, json.subtitle, JSON.stringify({data: [{file: json.target, type: 'iframe'}]}));
        } else if (json && json.grabber && json.params) {
            var url = hashUrl(json.grabber, json.params);
            util.sendAjax(url, "GET", {}, util.getProxy(dataHandler, [index, json.subtitle]), failFunction);
        }
        failFunction();
    }

    function moviePageSuccessFunction(result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            movieFetchLink,
            servers = myDoc.find('#servers .server'),
            server, serverId,
            movieIds,
            movieId,
            index = 0;
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
                index++;
                util.sendAjax(movieFetchLink, "GET", {}, util.getProxy(episodesSuccessFunction, [index]), failFunction);
            }
        }
    }

    function searchMovie(name, searchList) {
        var found = false;

        function searchSuccessFunction(result) {
            if (bringe.page != "movie" || found) return;
            try {
                result = JSON.parse(result);
            } catch (ignore) {
            }
            if (result.html) {
                var doc = new DOMParser().parseFromString(result.html, "text/html"),
                    myDoc = $(doc);
                var movieItems = myDoc.find(".item");
                if (movieItems.length > 0) {
                    var movieItem = getSearchedMovieName(name, movieItems);
                    if (movieItem) {
                        found = true;
                        var moviePageLink = base_url + $(movieItem).find("a.name").attr("href");
                        util.sendAjax(moviePageLink, "GET", {}, moviePageSuccessFunction, failFunction);
                        return;
                    }
                }
            }
            failFunction();
        }

        var links = [];
        util.each(searchList, function (searchTerm) {
            links.push(hashUrl(base_url + '/ajax/film/search', {sort: 'year:desc', keyword: searchTerm}));
        });
        util.each(links, function (link) {
            util.sendAjax(link, "GET", {}, searchSuccessFunction, failFunction);
        });
    }

    function tsSuccessFunction(name, result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        ts = myDoc.find("body").attr("data-ts");
        var searchNames = getMovieSearchTerms(name);
        searchMovie(name, searchNames);
    }

    function loadMovie(name, year, func) {
        callback = func;
        util.sendAjax(base_url, "GET", {}, util.getProxy(tsSuccessFunction, [name]), failFunction);
    }

    return {
        loadMovie: loadMovie
    }
});
