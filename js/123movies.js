_define('123movies', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = 'https://123movies.io';

    function failFunction() {
        if (bringe.page != "movie") return;
        callback({site: "123movies", status: false});
    }

    function successFunction(linkDetails) {
        if (bringe.page != "movie") return;
        callback({site: "123movies", status: true, linkDetails: linkDetails});
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
            movieNames.push($(movieItems[itemIndex]).find(".mli-info h2").html());
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

    function dataHandler(index, result) {
        try {
            result = JSON.parse(result);
        } catch (ignore) {
        }
        if (result && result.status == 1 && result.embed_url) {
            var extUrl = result.embed_url,
                sourceList = [],
                source = {};
            source.src = extUrl;
            if (extUrl[0] == '/') {
                source.src = 'https:' + extUrl;
            }
            source.file = source.src;
            source.res = '-';
            source.label = '-';
            source.source = "123movies";
            source.origin = getOriginFromUrl(source.src) || '123movies';
            source.id = '123-' + index + '*' + source.res;
            source.type = 'iframe';
            source.subtitles = [];
            sourceList.push(source);
            successFunction(sourceList);
        } else {
            failFunction();
        }
    }

    function episodesSuccessFunction(result) {
        if (bringe.page != "movie" || !result) return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            episodes = myDoc.find('.le-server .les-content a'),
            episodeIds = [],
            links = [];
        for (var i = 0; i < episodes.length; i++) {
            episodeIds.push($(episodes[i]).attr('episode-id'));
        }
        util.each(episodeIds, function (epId) {
            if (epId) {
                links.push('https://123movies.io/ajax/load_embed/' + epId);
            }
        });

        if (links.length > 0) {
            util.each(links, function(link, i) {
                util.sendAjax(link, "GET", {}, util.getProxy(dataHandler, [i+1]), failFunction);
            });
        } else {
            failFunction();
        }
    }

    function fetchMovieSources(movieId) {
        var url = base_url + '/ajax/v2_get_episodes/movie-' + movieId;
        util.sendAjax(url, "GET", {}, episodesSuccessFunction, failFunction);
    }

    function searchMovie(name, searchList) {
        var found = false;

        function searchSuccessFunction(result) {
            if (bringe.page != "movie" || found || !result) return;
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc);
            var movieItems = myDoc.find(".movies-list .ml-item");
            if (movieItems.length > 0) {
                var movieItem = getSearchedMovieName(name, movieItems);
                if (movieItem) {
                    found = true;
                    var movieId = $(movieItem).attr("data-movie-id");
                    fetchMovieSources(movieId);
                    return;
                }
            }
            failFunction();
        }

        var links = [];
        util.each(searchList, function (searchTerm) {
            links.push('https://123movies.io/movie/search/' + searchTerm + '/view/all/all');
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
