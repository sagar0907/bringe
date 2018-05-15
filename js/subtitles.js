_define('subscene', [window, 'util', 'bringe'], function (window, util, bringe) {

    function getSubtitleSeason(sNo) {
        var seasons,
            subtitles;
        bringe.serie.subtitles = bringe.serie.subtitles || {};
        subtitles = bringe.serie.subtitles;
        subtitles.seasons = subtitles.seasons || [];
        seasons = subtitles.seasons;
        seasons[sNo] = seasons[sNo] || {seasonNo: sNo};
        return seasons[sNo];
    }

    function getSubtitleEpisode(sNo, epNo) {
        var season = getSubtitleSeason(sNo);
        season.episodes = season.episodes || [];
        var episodes = season.episodes || [];
        episodes[epNo] = episodes[epNo] || {episodeNo: sNo};
        return episodes[epNo];
    }

    function getSeasonPart() {
        var seasonNo = bringe.serie.seasonNo,
            seasonPart = 's';
        if (seasonNo) {
            if (seasonNo > 9) {
                return seasonPart + seasonNo;
            } else {
                return seasonPart + '0' + seasonNo;
            }
        }
        return '';
    }

    function getEpisodePart() {
        var episodeNo = bringe.serie.episodeNo,
            episodePart = 'e';
        if (episodeNo) {
            if (episodeNo > 9) {
                return episodePart + episodeNo;
            } else {
                return episodePart + '0' + episodeNo;
            }
        }
        return '';
    }

    function filterSubsceneLinks(links) {
        var list = [];
        if (bringe.page != "movie" && bringe.page != "serie") return list;
        for (var i = 0; i < links.length; i++) {
            if (links[i].href.match(/https?:\/\/subscene\.com\/subtitles\/.+\/english\/\d+$/)) {
                list.push(links[i].href);
            }
        }
        return list;
    }

    function getSubsceneLinks(result) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(result, "text/html"),
            myDoc = $(doc);
        var links = myDoc.find("h3.r a");
        return filterSubsceneLinks(links);
    }

    function getSubtitleLinkFromSubscene(result) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(result, "text/html"),
            myDoc = $(doc),
            button = myDoc.find("#downloadButton"),
            ratingBox = myDoc.find(".rating span"),
            rating = "-";
        if (button.length > 0) {
            var link = "https://subscene.com" + button.attr("href");
            if (ratingBox.length > 0) {
                rating = ratingBox.html();
            }
            return {link: link, rating: rating};
        }
    }

    function searchEpisodeSubtitle(thisEpisode, callback) {
        var link = "https://www.google.com/search?q=" + thisEpisode.serieName + "+" + getSeasonPart(thisEpisode.seasonNo) + getEpisodePart(thisEpisode.episodeNo) + "+english+-arabic+site:subscene.com/subtitles";
        var episode = getSubtitleEpisode(thisEpisode.seasonNo, thisEpisode.episodeNo);
        episode.links = [];

        util.ajaxPromise(link).then(function (response) {
            var links = getSubsceneLinks(response);
            util.each(links, function (link) {
                util.ajaxPromise(link).then(function (response) {
                    var link = getSubtitleLinkFromSubscene(response);
                    if (link) {
                        var subtitleEpisode = getSubtitleEpisode(thisEpisode.seasonNo, thisEpisode.episodeNo);
                        subtitleEpisode.links = subtitleEpisode.links || [];
                        var len = subtitleEpisode.links.length;
                        link.index = len;
                        subtitleEpisode.links.push(link);
                        if (len == 0) {
                            callback(true);
                        }
                    }
                });
            });
        }).catch(function (error) {
            callback(false, error);
        });
    }

    function searchMovieSubtitle(name, year, callback) {
        var link = "https://www.google.com/search?q=" + name + "+" + year + "+english+-arabic+site:subscene.com/subtitles";
        util.ajaxPromise(link).then(function (response) {
            var links = getSubsceneLinks(response);
            util.each(links, function (link) {
                util.ajaxPromise(link).then(function (response) {
                    var link = getSubtitleLinkFromSubscene(response);
                    if (link) {
                        callback(true, link);
                    }
                });
            });
        }).catch(function (error) {
            callback(false, error);
        })
    }

    return {
        searchMovieSubtitle: searchMovieSubtitle,
        searchEpisodeSubtitle: searchEpisodeSubtitle,
        getSubtitleEpisode: getSubtitleEpisode
    }
});

