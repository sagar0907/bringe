_define('google', [window], function (window) {
    function getSiteName(link) {
        var start = link.indexOf(".");
        start++;
        var end = link.indexOf(".com");
        return link.substring(start, end);
    }

    function getMovieSearchName(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/ /g, '+');
        return searchTerm;
    }

    function searchMovie(name, year, callback) {
        var q = getMovieSearchName(name);
        var link = "https://www.google.com/search?q=" + encodeURIComponent(q) + "+" + year;
        $.ajax({
            url: link,
            success: function (result) {
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    reviews = [],
                    social = [],
                    i;
                var criticReviews = myDoc.find("critic-reviews-container .beulkd");
                for (i = 0; i < criticReviews.length; i++) {
                    var review = {};
                    var criticReview = $(criticReviews[i]);
                    var text = criticReview.find(".NIUoNb i").html();
                    var sourceDiv = criticReview.find(".Htriib div");
                    var source = {};
                    if (sourceDiv.length > 0) {
                        var sourceSite = $(sourceDiv).find("a").text().trim();
                        if (sourceSite && sourceSite != "") {
                            source.sourceSite = sourceSite;
                        }
                        var sourceName = $(sourceDiv).clone().children().remove().end().text();
                        if (sourceName && sourceName != "") {
                            source.name = sourceName;
                        }
                    }
                    if (text && text != "" && source && source.name) {
                        review.text = text;
                        review.source = source;
                        reviews.push(review);
                    }
                }
                var socialLinks = myDoc.find("._Ugf g-link a");
                for (i = 0; i < socialLinks.length; i++) {
                    var socialLink = $(socialLinks[i]);
                    var link = socialLink.attr("href");
                    var site = getSiteName(link);
                    if (link && site && site != "") {
                        social.push({link: link, site: site});
                    }
                }
                var movie = {};
                if (reviews.length > 0) {
                    movie.reviews = reviews;
                }
                if (social.length) {
                    movie.social = social;
                }
                callback(true, movie);
            },
            error: function () {
                callback(false);
            }
        });
    }

    return {
        searchMovie: searchMovie
    }
});
