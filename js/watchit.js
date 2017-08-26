_define('watchit', [window, 'util', 'bringe'], function (window, util, bringe) {
    var base_url = "https://gowatchit.com";

    function failFunction(func) {
        func({site: "watchit", status: false});
    }

    function movieSuccessFunction(youtubeId, linkDetails, func) {
        if (bringe.page != "movie") return;
        func({site: "watchit", status: true, linkDetails: linkDetails, youtubeId: youtubeId});
    }

    function serieSuccessFunction(youtubeId, seasons, func) {
        if (bringe.page != "serie") return;
        func({site: "watchit", status: true, seasons: seasons, youtubeId: youtubeId});
    }

    function seasonSuccessFunction(linkDetails, func) {
        if (bringe.page != "serie") return;
        func({site: "watchit", status: true, linkDetails: linkDetails});
    }

    function getApiKey() {
        return window["X-Api-Key"];
    }

    function getSeasonNoByLink(link) {
        try {
            var part = link.split('/season/')[1];
            var no = part.split('/')[0];
        } catch (ignore) {}
        return no;
    }
    function getIdByLink(link) {
        try {
            var parts = link.split('/');
            var no = parts[parts.length - 1];
        } catch (ignore) {}
        return no;
    }

    function fetchApiKey(callback, func) {
        function fetchApiSuccessFunction(result) {
            var doc = new DOMParser().parseFromString(result, "text/html"),
                myDoc = $(doc);
            try {
                var script = myDoc.find("body script")[0];
                var text = $(script).html(), key;
                text = text.split(";")[0];
                text = text.split("',")[0];
                text = text.split("'")[1];
            } catch (ignore) {}
            if (text && text.length == 24) {
                window["X-Api-Key"] = text;
                callback(text);
                return;
            }
            failFunction(func);
        }
        var link = 'https://gowatchit.com/home';
        util.sendAjax(link, "GET", {}, fetchApiSuccessFunction, util.getProxy(failFunction, [func]));
    }

    function getSearchBody(name, year, isSerie) {
        year = year + "";
        var type = isSerie ? "Show" : "Movie";
        var obj = {"query":{"bool":{"must":[{"bool":{"should":[{"match":{"title":{"query":name}}},{"match_phrase_prefix":{"title":{"query":name,"max_expansions":1024,"lenient":true,"slop":5,"boost":6}}},{"match":{"title":{"query":name,"fuzziness":1,"operator":"and"}}}]}},{"bool":{"should":[{"match":{"year":{"query":year}}}]}},{"terms":{"searchableType":[type]}}]}},"fields":["id","title","year","searchableType","posterUrl","shortDescription","trailerUrl"],"filter":{"type":{"value":"Asset"}}};
        return JSON.stringify(obj);
    }

    function getMoviePageLink(name, id, isSerie) {
        name = name.toLowerCase();
        name = name.replace(/[^0-9a-z ]/gi, '');
        name =name.replace(/ /g, '-');
        if (isSerie) {
            return base_url + '/watch/shows/' + name + '-' + id;
        } else {
            return base_url + '/watch/movies/' + name + '-' + id;
        }
    }

    function moviePageSuccessFunction(movieId, youtubeId, func, result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            divs = myDoc.find("ul.channels li.tile a[data-provider-format-id]"),
            id, link, img;
        var streams = [];
        for (var i = 0; i < divs.length; i++) {
            var div = $(divs[i]);
            id = div.attr("data-provider-format-id");
            link = 'https://gowatchit.com/movies/' + movieId + '/watch_now?provider_format_id=' + id;
            img = div.find("img").attr("src");
            streams.push({link: link, image: img, source: 'watchit', id: 'x' + id});
        }
        movieSuccessFunction(youtubeId, streams, func);
    }
    function seasonPageSuccessFunction(seasonId, func, result) {
        if (bringe.page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            divs = myDoc.find("ul.channels li.tile a[data-provider-format-id]"),
            id, link, img;
        var streams = [];
        for (var i = 0; i < divs.length; i++) {
            var div = $(divs[i]);
            id = div.attr("data-provider-format-id");
            link = 'https://gowatchit.com/seasons/' + seasonId + '/watch_now?provider_format_id=' + id;
            img = div.find("img").attr("src");
            streams.push({link: link, image: img, source: 'watchit', id: 'x' + id});
        }
        seasonSuccessFunction(streams, func);
    }

    function seriePageSuccessFunction(serieId, youtubeId, func, result) {
        if (bringe.page != "serie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            divs = myDoc.find(".seasons-dropdown"),
            link, seasonNo, id;
        var seasons = {};
        for (var i = 0; i < divs.length; i++) {
            var div = $(divs[i]);
            link = div.attr("href");
            link = 'https://gowatchit.com' + link;
            if (div.attr("data-index") > -1) {
                seasonNo = getSeasonNoByLink(link);
                id = getIdByLink(link);
                if (seasonNo) {
                    seasons[seasonNo + ""] = {pageLink: link, seasonNo: seasonNo, seasonId: id};
                }
            }
        }
        serieSuccessFunction(youtubeId, seasons, func);
    }

    function searchMovie(name, year, func, isSerie, apiKey) {
        function searchSuccessFunction(result) {
            if (result && result.hits && result.hits.hits && result.hits.hits[0] && result.hits.hits[0].fields) {
                try {
                    var movie = result.hits.hits[0].fields;
                    var id = movie.id[0].split('-')[1];
                    var title = movie.title && movie.title[0];
                    var trailerUrl = movie.trailerUrl && movie.trailerUrl[0];
                    var posterUrl = movie.posterUrl && movie.posterUrl[0];
                    var link = getMoviePageLink(title, id, isSerie);
                } catch (ignore) {}
                if (link) {
                    var successFunc = isSerie? seriePageSuccessFunction : moviePageSuccessFunction;
                    util.sendAjax(link, "GET", {}, util.getProxy(successFunc, [id, trailerUrl, func]), util.getProxy(failFunction, [func]));
                    return;
                }
            }
            failFunction(func);
        }
        var link = base_url + '/api/v3/advanced_search/_search';
        util.sendAjax(link, "POST", getSearchBody(name, year, isSerie), searchSuccessFunction, util.getProxy(failFunction, [func]), {'X-Api-Key': apiKey});
    }

    function getApiAndSearchMovie(name, year, func, isSerie) {
        var apiKey = getApiKey();
        if(apiKey) {
            searchMovie(name, year, func, isSerie, apiKey);
        } else {
            fetchApiKey(util.getProxy(searchMovie, [name, year, func, isSerie]), func);
        }
    }

    function loadMovie(name, year, func) {
        getApiAndSearchMovie(name, year, func, false);
    }
    function loadSerie(name, year, func) {
        getApiAndSearchMovie(name, year, func, true);
    }
    function loadSeason(link, id, func) {
        if (link) {
            util.sendAjax(link, "GET", {}, util.getProxy(seasonPageSuccessFunction, [id, func]), util.getProxy(failFunction, [func]));
        } else {
            failFunction(func);
        }
    }

    return {
        loadMovie: loadMovie,
        loadSerie: loadSerie,
        loadSeason: loadSeason
    }
});
