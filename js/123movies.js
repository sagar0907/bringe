_define('123movies', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = 'https://123movies.io';

    function failFunction(name) {
        if (bringe.page != "movie") return;
        callback({site: "123movies", status: false, name: name});
    }

    function successFunction(name, linkDetails, complete) {
        if (bringe.page != "movie") return;
        callback({site: "123movies", status: true, name: name, linkDetails: linkDetails, complete: complete});
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

    function dataHandler(name, index, result) {
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
            successFunction(name, sourceList);
            return true;
        }
    }

    function moviePageSuccessFunction(name, result) {
        if (bringe.page != "movie" || !result) return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            episodes = myDoc.find('.le-server .les-content a'),
            episode,
            promises = [],
            episodeId,
            linkFound = false;
        for (var i = 0; i < episodes.length; i++) {
            episode = $(episodes[i]);
            episodeId = episode.attr('episode-id');
            if (episodeId) {
                promises.push(util.ajaxPromise(base_url + '/ajax/load_embed/' + episodeId));
            }
        }
        Promise.all(promises).then(function () {
            if (linkFound) {
                successFunction(name, [], true);
            } else {
                failFunction(name);
            }
        }).catch(function (error) {
            if (linkFound) {
                successFunction(name, [], true);
            } else {
                failFunction(name, error);
            }
        });

        util.each(promises, function (promise, index) {
            promise.then(function (result) {
                linkFound = dataHandler(name, index+1, result) || linkFound;
            });
        });
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchSucceeded = false,
            searchNames = getMovieSearchTerms(name),
            promises = [];
        util.each(searchNames, function (searchTerm) {
            promises.push(util.ajaxPromise(base_url + '/movie/search/' + searchTerm + '/view/all/all'));
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
                var doc = new DOMParser().parseFromString(result, "text/html"),
                    myDoc = $(doc);
                var movieItems = myDoc.find(".movies-list .ml-item");
                if (movieItems.length == 0) return;
                var movieItem = getSearchedMovieName(name, movieItems);
                if (!movieItem) return;
                var movieId = $(movieItem).attr("data-movie-id");
                if (!movieId) return;
                searchSucceeded = true;
                var url = base_url + '/ajax/v2_get_episodes/movie-' + movieId;
                return util.ajaxPromise(url);
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
