/**
 * Created by sagar.ja on 21/02/17.
 */
_define('vumoo', [window, 'util', 'bringe'], function (window, util, bringe) {
    var callback;
    function failFunction() {
        if (bringe.page != "movie") return;
        callback({site:"vumoo", status: false});
    }
    function successFunction(linkDetails) {
        if (bringe.page != "movie") return;
        callback({site:"vumoo", status: true, linkDetails: linkDetails});
    }

    function vumooMovieComparator(a, b) {
        var a_ratingPart = $(a).find(".rating-overlay");
        var b_ratingPart = $(b).find(".rating-overlay");
        if(a_ratingPart) {
            var a_rating = a_ratingPart.text().trim();
            if(a_rating != "") a_rating = parseInt(a_rating);
            else return 1;
        } else return 1;
        if(b_ratingPart) {
            var b_rating = b_ratingPart.text().trim();
            if(b_rating != "") b_rating = parseInt(b_rating);
            else return -1;
        } else return -1;
        if(a_rating > b_rating) return -1;
        else if(a_rating < b_rating) return 1;
        return 0;
    }

    function getVumooSearchTerm() {
        var searchTerm = bringe.movie.name;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/,"").replace(/^the/, "").replaceAll(/,| -|- /," ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/,"").replaceAll(/\s\s+/," ").trim().replaceAll(" ", "+");
        return searchTerm;
    }

    function getVumooSearchedMovie(movieItems) {
        if(movieItems.length == 0) {
            return null;
        }
        if(movieItems.length == 1) {
            return movieItems;
        }
        var sameNameMovies = [];
        for(var i=0; i<movieItems.length; i++) {
            var movieItem = movieItems[i];
            var movieName = $(movieItem).find(".cover-text-overlay").text();
            if(util.isSameMovieName(movieName, bringe.movie.name)) {
                sameNameMovies.push(movieItem);
            }
        }
        if(sameNameMovies.length == 0) {
            return sameNameMovies[0];
        }
        sameNameMovies.sort(vumooMovieComparator);
        return sameNameMovies[0];
    }

    function getMovieSuccessFunction(result) {
        if (bringe.page != "movie") return;
        try {
            var json = JSON.parse(result);
            if (json.length > 0) {
                var vumooMovies = [];
                for (var i = 0; i < json.length; i++) {
                    var source = json[i];
                    var ext = source.type.split('/');
                    source.type = ext[ext.length - 1];
                    source.src = "http://vumoo.li" + source.src;
                    source.source = "vumoo";
                    source.id = 1;
                    vumooMovies.push(source);
                }
                if (vumooMovies.length > 0) {
                    successFunction(vumooMovies);
                    return;
                }
            }
        } catch (ignore){}
        failFunction();
    }

    function moviePageSuccessFunction(result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        var vumooMovieId = myDoc.find("button[data-url]").attr("data-url");
        bringe.movie.vumooMovieId = vumooMovieId.replace("_p_", "");
        var movieFetchLink = "http://vumoo.li/api/getContents?id=" + bringe.movie.vumooMovieId +"&p=1";
        util.sendAjax(movieFetchLink, "GET", {}, getMovieSuccessFunction, failFunction)
    }

    function searchSuccessFunction(result) {
        if (bringe.page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc);
        var movieItems = myDoc.find("article.movie_item");
        if(movieItems.length > 0) {
            var movieItem = getVumooSearchedMovie(movieItems);
            if(movieItem) {
                var vumooMoviePageLink = "http://vumoo.li" + $(movieItem).find("a").attr("href");
                var vumooImdbRating = $(movieItem).find(".rating-overlay").text().trim();
                if (vumooImdbRating) {
                    bringe.movie.vumooImdbRating = vumooImdbRating;
                }
                util.sendAjax(vumooMoviePageLink, "GET", {}, moviePageSuccessFunction, failFunction);
                return;
            }
        }
        failFunction();
    }

    function loadVumoo(func) {
        callback = func;
        util.sendAjax('http://vumoo.li/videos/search/?search=' + getVumooSearchTerm(), "GET", {}, searchSuccessFunction, failFunction);
    }
    return {
        loadVumoo: loadVumoo
    }
});
