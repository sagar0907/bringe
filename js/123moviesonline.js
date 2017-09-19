_define('123moviesonline', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = 'https://123moviesonline.tv';

    function failFunction() {
        if (bringe.page != "movie") return;
        callback({site: "123moviesonline", status: false});
    }

    function successFunction(linkDetails) {
        if (bringe.page != "movie") return;
        callback({site: "123moviesonline", status: true, linkDetails: linkDetails});
    }

    var isSameNameFunctions = function () {
        function isSameMovieName1(a, b) {
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(/:|,|-|'|"|\(|\)/, "").replaceAll(/\s+/, " ").trim();
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(/:|,|-|'|"|\(|\)/, "").replaceAll(/\s+/, " ").trim();
            return a == b;
        }

        function isSameMovieName2(a, b) {
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replaceAll(/\s+/, " ").trim();
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replaceAll(/\s+/, " ").trim();
            return a == b;
        }

        function isSameMovieName3(a, b) {
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace("part", "").replace(/iii/, "3").replace(/ii/, "2").replaceAll(/\s+/, " ").trim();
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "").replace("part", "").replace(/iii/, "3").replace(/ii/, "2").replaceAll(/\s+/, " ").trim();
            return a == b;
        }

        return [isSameMovieName1, isSameMovieName2, isSameMovieName3];
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

    function getSearchedMovieLink(name, movieItems) {
        if (movieItems.length == 1 && movieItems[0].data && movieItems[0].data.type == 'movies') {
            return movieItems[0].data.href;
        }
        var movieNames = [],
            movieLinks = [];
        util.each(movieItems, function (movieItem) {
            if (movieItem && movieItem.data && movieItem.data.type == 'movies') {
                movieNames.push(movieItem.value);
                movieLinks.push(movieItem.data.href);
            }
        });
        for (var j = 0; j < isSameNameFunctions.length; j++) {
            for (var i = 0; i < movieNames.length; i++) {
                if (isSameNameFunctions[j](movieNames[i], name)) {
                    return movieLinks[i];
                }
            }
        }
        failFunction();
    }

    function dataHandler(index, embed_url) {
        var sourceList = [],
            source = {};
        source.src = embed_url;
        source.file = source.src;
        source.type = 'iframe';
        source.res = '-';
        source.label = '-';
        source.source = '123moviesonline';
        source.origin = '123moviesapp';
        source.id = '123online-' + index + '*' + source.res;
        source.type = 'iframe';
        source.subtitles = [];
        sourceList.push(source);
        successFunction(sourceList);
    }

    function moviePageSuccessFunction(result) {
        if (bringe.page != "movie" || !result) return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            servers = myDoc.find('.tab-content .tab-pane a'),
            embedUrl;
        if (!servers) return;
        for (var i = 0; i < servers.length; i++) {
            embedUrl = $(servers[i]).attr('embedUrl');
            if (embedUrl) {
                dataHandler(i + 1, embedUrl);
            }
        }
    }

    function searchMovie(name, searchList) {
        var found = false;

        function searchSuccessFunction(result) {
            if (bringe.page != "movie" || found || !result) return;
            try {
                result = JSON.parse(result);
            } catch (ignore) {
            }
            if (!result.suggestions || result.suggestions.length == 0) return;
            var movieLink = getSearchedMovieLink(name, result.suggestions);
            if (movieLink) {
                found = true;
                util.sendAjax(base_url + movieLink, "GET", {}, moviePageSuccessFunction, failFunction);
                return;
            }
            failFunction();
        }

        var links = [];
        util.each(searchList, function (searchTerm) {
            links.push(base_url + '/search?q=' + searchTerm);
        });
        util.each(links, function (link) {
            util.sendAjax(link, "GET", {}, searchSuccessFunction, failFunction);
        });
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchNames = getMovieSearchTerms(name);
        searchMovie(name, searchNames);
    }

    return {
        loadMovie: loadMovie
    }
});
