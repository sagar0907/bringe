/**
 * Created by sagar.ja on 03/06/17.
 */
/**
 * Created by sagar.ja on 15/04/17.
 */
function watchit() {
    var callback;
    var base_url = "https://gowatchit.com";

    function failFunction() {
        if (page != "movie") return;
        callback({site: "watchit", status: false});
    }

    function successFunction(youtubeId, linkDetails) {
        if (page != "movie") return;
        callback({site: "watchit", status: true, linkDetails: linkDetails, youtubeId: youtubeId});
    }

    function getApiKey() {
        return window["X-Api-Key"];
    }

    function fetchApiKey(callback) {
        function fetchApiSuccessFunction(result) {
            if (page != "movie") return;
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
            failFunction();
        }
        var link = 'https://gowatchit.com/home';
        util().sendAjax(link, "GET", {}, fetchApiSuccessFunction, failFunction);
    }

    function getSearchBody(name, year) {
        year = year + "";
        var obj = {"query":{"bool":{"must":[{"bool":{"should":[{"match":{"title":{"query":name}}},{"match_phrase_prefix":{"title":{"query":name,"max_expansions":1024,"lenient":true,"slop":5,"boost":6}}},{"match":{"title":{"query":name,"fuzziness":1,"operator":"and"}}}]}},{"bool":{"should":[{"match":{"year":{"query":year}}}]}},{"terms":{"searchableType":["Movie"]}}]}},"fields":["id","title","year","searchableType","posterUrl","shortDescription","trailerUrl"],"filter":{"type":{"value":"Asset"}}};
        return JSON.stringify(obj);
    }

    function getMoviePageLink(name, id) {
        name = name.toLowerCase();
        name = name.replace(/[^0-9a-z ]/gi, '');
        name =name.replace(/ /g, '-');
        return base_url + '/watch/movies/' + name + '-' + id;
    }

    function moviePageSuccessFunction(movieId, youtubeId, result) {
        if (page != "movie") return;
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
        successFunction(youtubeId, streams);
    }

    function searchMovie(name, year, apiKey) {
        function searchSuccessFunction(result) {
            if (page != "movie") return;
            if (result && result.hits && result.hits.hits && result.hits.hits[0] && result.hits.hits[0].fields) {
                try {
                    var movie = result.hits.hits[0].fields;
                    var id = movie.id[0].split('-')[1];
                    var title = movie.title[0];
                    var trailerUrl = movie.trailerUrl[0];
                    var posterUrl = movie.posterUrl;
                    var link = getMoviePageLink(title, id);
                } catch (ignore) {}
                if (link) {
                    util().sendAjax(link, "GET", {}, util().getProxy(moviePageSuccessFunction, [id, trailerUrl]), failFunction);
                    return;
                }
            }
            failFunction();
        }
        var link = base_url + '/api/v3/advanced_search/_search';
        util().sendAjax(link, "POST", getSearchBody(name, year), searchSuccessFunction, failFunction, {'X-Api-Key': apiKey});
    }

    function getApiAndSearchMovie(name, year) {
        var apiKey = getApiKey();
        if(apiKey) {
            searchMovie(name, year, apiKey);
        } else {
            fetchApiKey(util().getProxy(searchMovie, [name, year]));
        }
    }

    function loadMovie(name, year, func) {
        callback = func;
        getApiAndSearchMovie(name, year);
    }

    return {
        loadMovie: loadMovie
    }
}