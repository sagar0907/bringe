_define('123moviesonline', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = 'https://123moviesonline.tv';

    function failFunction(name) {
        if (bringe.page != "movie") return;
        callback({site: "123moviesonline", status: false, name:name});
    }

    function successFunction(name, linkDetails, complete) {
        if (bringe.page != "movie") return;
        callback({site: "123moviesonline", status: true, name: name, linkDetails: linkDetails, complete: complete});
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
    }

    function dataHandler(name, index, embed_url) {
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
        successFunction(name, sourceList);
    }

    function moviePageSuccessFunction(name, result) {
        if (bringe.page != "movie" || !result) return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            servers = myDoc.find('.tab-content .tab-pane a'),
            embedUrl,
            found = false;
        if (!servers) return;
        for (var i = 0; i < servers.length; i++) {
            embedUrl = $(servers[i]).attr('embedUrl');
            if (embedUrl) {
                dataHandler(name, i + 1, embedUrl);
                found = true;
            }
        }
        if (found) {
            successFunction(name, [], true);
        } else {
            failFunction(name, null, true);
        }
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchSucceeded = false,
            searchNames = getMovieSearchTerms(name),
            promises = [];
        util.each(searchNames, function (searchTerm) {
            promises.push(util.ajaxPromise(base_url + '/search?q=' + searchTerm));
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
                if (bringe.page != "movie" || searchSucceeded || !result) return;
                try {
                    result = JSON.parse(result);
                } catch (ignore) {
                }
                if (!result.suggestions || result.suggestions.length == 0) return;
                var movieLink = getSearchedMovieLink(name, result.suggestions);
                if (!movieLink) return;
                searchSucceeded = true;
                return util.ajaxPromise(base_url + movieLink);
            }).then(function (result) {
                if (!result) return;
                moviePageSuccessFunction(name, result);
            }).catch(function (error) {
                failFunction(name, error);
            });
        });
    }

    return {
        loadMovie: loadMovie
    }
});
