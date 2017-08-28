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

    function hashUrl(t, params) {

        var salt = 'BMdMTbaboeoF';
        var y = ts;

        function r(t, params) {
            var e, i = /([^=\?&]+)(?:=([^&$]+))?/gi, n = {};
            if (t.indexOf('?') > -1) {
                do {
                    e = i.exec(t.url),
                    e && (n[e[1]] = decodeURIComponent(e[2] || '').replace(/\+/g, ' '));
                } while (e);
            }
            if (params) {
                do {
                    e = i.exec(params),
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
                i += t.charCodeAt(e) + e;
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

    function getMovies123SearchTerm1(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/'/, "").replace(/^the/, "").replaceAll(/,|:| -|- /, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
        return searchTerm;
    }

    function getMovies123SearchTerm2(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,|:| -|- |'/, " ");
        searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
        return searchTerm;
    }

    function getMovies123SearchTerm3(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,|:| -|- |'/, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/i*$/, "").trim().replaceAll(/\s+/, "+");
        return searchTerm;
    }

    function getMovies123SearchTerms(searchTerm) {
        var terms = [];
        terms.push(getMovies123SearchTerm1(searchTerm));
        terms.push(getMovies123SearchTerm2(searchTerm));
        terms.push(getMovies123SearchTerm3(searchTerm));
        terms = terms.filter(function (item, pos) {
            return terms.indexOf(item) == pos;
        });
        return terms;
    }

    function getMovies123SearchedMovie2(name, movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieItem, movieName, movieNames = [];
        for (var i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find("a.name").html();
            movieNames.push(movieName);
        }
        for (i = 0; i < movieItems.length; i++) {
            if (isSameMovieName1(movieNames[i], name)) {
                return movieItems[i];
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            if (isSameMovieName2(movieNames[i], name)) {
                return movieItems[i];
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            if (isSameMovieName3(movieNames[i], name)) {
                return movieItems[i];
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            if (isSameMovieName4(movieNames[i], name)) {
                return movieItems[i];
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

    function getMovieStreams(url, index, subtitle) {
        util.sendAjax(url, "GET", {}, util.getProxy(dataHandler, [index, subtitle]), failFunction);
    }

    function cleanSpecialUrl(url) {
        return url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
    }

    function getParamString(obj) {
        var str = "";
        util.each(obj, function (val, key) {
            str += "&" + key + "=" + val;
        });
        return str;
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
            var url = hashUrl(json.grabber + getParamString(json.params), '');
            getMovieStreams(url, index, json.subtitle);
        }
        failFunction();
    }

    function moviePageSuccessFunction(result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            movies123FetchLink,
            movies123MovieIds = myDoc.find("ul.episodes a"),
            movieId;
        for (var i = 0; i < movies123MovieIds.length; i++) {
            movieId = $(movies123MovieIds[i]).attr("data-id");
            movies123FetchLink = hashUrl(base_url + '/ajax/episode/info', 'id=' + movieId + '&update=0');
            util.sendAjax(movies123FetchLink, "GET", {}, util.getProxy(episodesSuccessFunction, [i]), failFunction);
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
                    var movieItem = getMovies123SearchedMovie2(name, movieItems);
                    if (movieItem) {
                        found = true;
                        var movies123MoviePageLink = base_url + $(movieItem).find("a.name").attr("href");
                        util.sendAjax(movies123MoviePageLink, "GET", {}, moviePageSuccessFunction, failFunction);
                        return;
                    }
                }
            }
            failFunction();
        }

        var links = [];
        util.each(searchList, function (searchTerm) {
            links.push(hashUrl(base_url + '/ajax/film/search', 'sort=year%3Adesc&keyword=' + searchTerm));
        });
        util.each(links, function (link) {
            util.sendAjax(link, "GET", {}, searchSuccessFunction, failFunction);
        });
    }

    function tsSuccessFunction(name, searchNames, result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        ts = myDoc.find("body").attr("data-ts");
        searchMovie(name, searchNames);
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchNames = getMovies123SearchTerms(name);
        util.sendAjax(base_url, "GET", {}, util.getProxy(tsSuccessFunction, [name, searchNames]), failFunction);
    }

    return {
        loadMovie: loadMovie
    }
});
