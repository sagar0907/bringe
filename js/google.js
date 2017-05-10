/**
 * Created by sagar.ja on 10/05/17.
 */

function Google() {
    function searchMovie(name, year, callback) {
        var link = "https://www.google.co.in/search?q=" + name + "+" + year;
        $.ajax({
            url: link,
            success: function (result) {
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    reviews = [],
                    social = [],
                    i;
                var criticReviews = myDoc.find("critic-reviews-container ._Xai");
                for (i = 0; i < criticReviews.length; i++) {
                    var review = {};
                    var criticReview = $(criticReviews[i]);
                    var text = criticReview.find("._Qsh i").html();
                    var sourceDiv = criticReview.find("._Kpm div");
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
                    var socialLink = $(socialLinks[0]);
                    var link = socialLink.attr("href");
                    var img = socialLink.find("g-img img").attr("src");
                    if (link && img) {
                        social.push({link: link, img: img});
                    }
                }
                thisMovie.reviews = reviews;
                thisMovie.social = social;
                callback(true);
            },
            error: function () {
                callback(false);
            }
        });
    }
    return {
        searchMovie: searchMovie
    }
}
var google = Google();
