/**
 * Created by sagar.ja on 08/05/17.
 */

function Trailers() {
    function searchGoogle(searchTerm, func) {
        var link = "https://www.google.com/search?q=" + searchTerm;
        $.ajax({
            url: link,
            success: function (result) {
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc);
                var links = myDoc.find("._Rm");
                if (links.length > 0) {
                    var link = $(links[0]).html();
                    var id = background.util().getParameterByName("v", link);
                    if (id && id != "") {
                        func(true, id);
                        return;
                    }
                }
                func(false);
            },
            error: function () {
                func(false);
            }
        });
    }

    function fetchMovieTrailer(name, year, callback) {
        var searchTerm = name + "+" + year + "+" + "trailer";
        searchGoogle(searchTerm, callback);
    }

    function fetchSeasonTrailer(serie, seasonNo, callback) {
        var name = serie.title;
        var searchTerm = name + "+Season+" + seasonNo + "+" + "trailer";
        searchGoogle(searchTerm, callback);
    }

    function setupYoutube(id) {
        $("#youtubePlayer").attr("src", "https://www.youtube.com/embed/" + id);
    }
    function removeYoutube() {
        $("#youtubePlayer").attr("src", "about:blank");
    }
    return {
        fetchMovieTrailer: fetchMovieTrailer,
        fetchSeasonTrailer: fetchSeasonTrailer,
        setupYoutube: setupYoutube,
        removeYoutube: removeYoutube
    }
}

var trailer = Trailers();
