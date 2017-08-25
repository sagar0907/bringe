/**
 * Created by sagar.ja on 15/04/17.
 */
_define('gomovies', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = "https://gostream.is";
    var mid;

    function failFunction() {
        if (bringe.page != "movie") return;
        callback({site: "gomovies", status: false});
    }

    function successFunction(linkDetails) {
        if (bringe.page != "movie") return;
        callback({site: "gomovies", status: true, linkDetails: linkDetails});
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
        a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace(/iii$/, "3").replace(/ii$/, "2");
        b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace(/iii$/, "3").replace(/ii$/, "2");
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

    function getMovies123SearchedMovie(movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieItem, movieName, name = bringe.movie.name;
        for (var i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find(".ss-title").text();
            if (isSameMovieName1(movieName, name)) {
                return movieItem;
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find(".ss-title").text();
            if (isSameMovieName2(movieName, name)) {
                return movieItem;
            }
        }
        for (i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find(".ss-title").text();
            if (isSameMovieName3(movieName, name)) {
                return movieItem;
            }
        }
        failFunction();
    }

    function getMovies123SearchedMovie2(name, movieItems) {
        if (movieItems.length == 1) {
            return movieItems;
        }
        var movieItem, movieName, movieNames = [];
        for (var i = 0; i < movieItems.length; i++) {
            movieItem = movieItems[i];
            movieName = $(movieItem).find("a").attr("title");
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

    function dataHandler(eid, result) {
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
                    source.source = "gomovies";
                    source.id = eid + '*' + source.res;
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

    function hashSuccessFunction(eid, result) {
        var parts = result.split(',');
        var x = parts[0].split("'")[1];
        var y = parts[1].split("'")[1];
        var link = base_url + '/ajax/movie_sources/' + eid + '?x=' + x + '&y=' + y;
        if (x && y) {
            util.sendAjax(link, "GET", {}, util.getProxy(dataHandler, [eid]), failFunction);
        } else {
            failFunction();
        }
    }

    function getMovies123MovieLinks(eids) {
        for (var i = 0; i < eids.length; i++) {
            var eid = eids[i];
            var link = base_url + '/ajax/movie_token?eid=' + eid + '&mid=' + mid;
            util.sendAjax(link, "GET", {}, util.getProxy(hashSuccessFunction, [eid]), failFunction);
        }
    }

    function getMovieId(url) {
        var parts = url.split("-");
        var part = parts[parts.length - 1];
        var id = part.split("/")[0];
        return id;
    }

    function getMovies123Eids(servers) {
        var eids = [];
        for (var i = 0; i < servers.length; i++) {
            var server = servers[i];
            var link = $(server).find("a.btn-eps");
            var eid = link.attr("data-id");
            if (eid) {
                eids.push(eid);
            }
        }
        return eids;
    }

    function episodesSuccessFunction(result) {
        if (bringe.page != "movie") return;
        try {
            var json = JSON.parse(result);
            if (json.status) {
                var doc = new DOMParser().parseFromString(json.html, "text/html"),
                    myDoc = $(doc),
                    servers = myDoc.find(".le-server");
                if (servers.length > 0) {
                    var eids = getMovies123Eids(servers);
                    if (eids.length > 0) {
                        getMovies123MovieLinks(eids);
                        return;
                    }
                }
            }
        } catch (ignore) {
        }
        failFunction();
    }

    function moviePageSuccessFunction(result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            url = myDoc.find(".fb-comments").attr("data-href"),
            movies123MovieId = getMovieId(url),
            movies123FetchLink = base_url + "/ajax/movie_episodes/" + movies123MovieId;
        mid = movies123MovieId;
        util.sendAjax(movies123FetchLink, "GET", {}, episodesSuccessFunction, failFunction);
    }

    function searchSuccessFunction1(result) {
        if (bringe.page != "movie") return;
        result = JSON.parse(result);
        if (result.status == 1 && result.message == "Success") {
            var content = result.content;
            var doc = new DOMParser().parseFromString(content, "text/html"),
                myDoc = $(doc);
            var movieItems = myDoc.find("li:not(.ss-bottom)");
            if (movieItems.length > 0) {
                var movieItem = getMovies123SearchedMovie(movieItems);
                if (movieItem) {
                    var movies123MoviePageLink = $(movieItem).find(".ss-title").attr("href") + "watching.html";
                    util.sendAjax(movies123MoviePageLink, "GET", {}, moviePageSuccessFunction, failFunction);
                    return;
                }
            }
        }
        failFunction();
    }

    function load(func) {
        callback = func;
        var salt = "x6a4moj7q8xq6dk5";
        var searchName = getMovies123SearchTerm();
        var link = base_url + '/ajax/suggest_search';
        util.sendAjax(link, "POST", {
            keyword: searchName,
            token: md5(searchName + salt)
        }, searchSuccessFunction1, failFunction);
    }

    function searchMovie(name, searchList) {
        var found = false;

        function searchSuccessFunction(result) {
            if (bringe.page != "movie" || found) return;
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc);
            var movieItems = myDoc.find(".movies-list .ml-item");
            if (movieItems.length > 0) {
                var movieItem = getMovies123SearchedMovie2(name, movieItems);
                if (movieItem) {
                    found = true;
                    var movies123MoviePageLink = $(movieItem).find("a").attr("href") + "watching.html";
                    util.sendAjax(movies123MoviePageLink, "GET", {}, moviePageSuccessFunction, failFunction);
                    return;
                }
            }
            failFunction();
        }

        var links = [];
        util.each(searchList, function (searchTerm) {
            links.push(base_url + '/movie/search/' + searchTerm);
        });
        util.each(links, function (link) {
            util.sendAjax(link, "GET", {}, searchSuccessFunction, failFunction);
        });
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchNames = getMovies123SearchTerms(name);
        searchMovie(name, searchNames);
    }

    return {
        loadMovie: loadMovie
    }
});
