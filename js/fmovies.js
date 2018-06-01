_define('fmovies', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    var base_url = "https://www5.fmovies.io";

    function failFunction(name, error) {
        if (bringe.page != "movie") return;
        callback({site: "fmovies", status: false, name: name});
    }

    function successFunction(name, linkDetails, complete) {
        if (bringe.page != "movie") return;
        callback({site: "fmovies", status: true, name: name, linkDetails: linkDetails, complete: complete});
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
            return $(movieItems.find("a")[0]);
        }
        var movieNames = [],
            itemIndex, fIndex;
        for (itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
            movieItems[itemIndex] = $(movieItems[itemIndex].find("a")[0]);
            movieNames.push(movieItems[itemIndex] && movieItems[itemIndex].attr(title));
        }
        for (fIndex = 0; fIndex < isSameNameFunctions.length; fIndex++) {
            for (itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
                if (isSameNameFunctions[fIndex](movieNames[itemIndex], name)) {
                    return movieItems[itemIndex];
                }
            }
        }
    }

    function playerPageSuccessFunction(name, result) {
        if (bringe.page != "movie") return;
        var myDoc = util.getDocFromHTML(result),
            script = $(myDoc.find('.videocontent script')[0]),
            regx = /playerInstance.setup\({sources:\[{file:'(.+?)',label:'autoP'/;
        script = script.html().replaceAll(' ', '').replaceAll('\n', '');
        var matches = script && regx.exec(script);
        var url = matches && matches[1];
        if (!url) {
            failFunction(name);
        } else {
            successFunction(name, [{
                file: url,
                src: url,
                res: '-',
                label: '-',
                source: 'fmovies',
                origin: 'fmovies',
                id: 'fm-1*-'
            }], true);
        }
    }

    function moviePageSuccessFunction(name, result) {
        if (bringe.page != "movie") return;
        var myDoc = util.getDocFromHTML(result),
            script = $(myDoc.find('body script')[10]),
            regx = /var link_server_f2 = "\/\/(.+)";/;
        script = script && script.html();
        var matches = script && regx.exec(script);
        var url = matches && matches[1];
        if (!url) {
            failFunction(name);
        } else {
            url = "https://" + url;
            var promise = util.ajaxPromise(url);
            promise.then(function (result) {
                playerPageSuccessFunction(name, result);
            }).catch(function (error) {
                failFunction(name, error);
            })
        }
    }

    function loadMovie(name, year, func) {
        callback = func;
        var searchSucceeded = false;
        var searchNames = getMovieSearchTerms(name),
            link,
            promises = [];

        util.each(searchNames, function (searchTerm) {
            link = base_url + '/search.html?keyword=' + searchTerm;
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
                result = util.getDocFromHTML(result);
                var items = result.find("article.col2 ul li");
                var movieItem = getSearchedMovieName(name, items);
                var path = movieItem && movieItem.attr("href");
                if (!path) {
                    throw Error('No matching movie found');
                }
                searchSucceeded = true;
                return util.ajaxPromise(base_url + path);
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
