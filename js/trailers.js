_define('trailer', ['util'], function (util) {
    function searchGoogle(searchTerm, func) {
        var link = "https://www.google.com/search?q=" + searchTerm;
        var promise = util.ajaxPromise(link);
        function handleLink(link) {
            if (link) {
                var id = background.util().getParameterByName("v", link);
                if (id && id != "") {
                    func(true, id);
                    return true;
                }
            }
            return false;
        }
        promise.then(function (result) {
            var doc = util.getDocFromHTML(result),
                mainLink = doc.find("._ELb a"),
                links = doc.find("._Rm"),
                link;
            if (mainLink.length > 0) {
                link = mainLink.attr('href');
                if (handleLink(link)) {
                    return;
                }
            }
            if (links.length > 0) {
                for (var i = 0; i < links.length; i++) {
                    link = $(links[i]).html();
                    if (handleLink(link)) {
                        return;
                    }
                }
            }
            func(false);
        }).catch(function (error) {
            func(false, error);
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
});
