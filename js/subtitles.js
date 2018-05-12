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

    function getSubsceneLinks(links) {
        var list = [];
        if (bringe.page != "movie" && bringe.page != "serie") return list;
        for (var i = 0; i < links.length; i++) {
            if (links[i].href.match(/https?:\/\/subscene\.com\/subtitles\/.+\/english\/\d+$/)) {
                list.push(links[i].href);
            }
        }
        return list;
    }

    function searchEpisodeSubtitle(thisEpisode, func) {
        var link;
        if (bringe.page != "serie") {
            return;
        }
        link = "https://www.google.com/search?q=" + thisEpisode.serieName + "+" + getSeasonPart(thisEpisode.seasonNo) + getEpisodePart(thisEpisode.episodeNo) + "+english+-arabic+site:subscene.com/subtitles";
        var episode = getSubtitleEpisode(thisEpisode.seasonNo, thisEpisode.episodeNo);
        episode.links = [];
        function searchEpisodeSuccess(result) {
            if (bringe.page != "serie") {
                return;
            }
            var parser = new DOMParser(),
                doc = parser.parseFromString(result, "text/html"),
                myDoc = $(doc),
                links = myDoc.find("a[onmousedown]"),
                subsceneLinks = getSubsceneLinks(links);
            for (var i = 0; i < subsceneLinks.length; i++) {
                util.sendAjax(subsceneLinks[i], "GET", {}, util.getProxy(parseSubtitleEpisodeLink, [thisEpisode, func]), util.getProxy(func, [false]));
            }
        }

        util.sendAjax(link, "GET", {}, searchEpisodeSuccess, util.getProxy(func, [false]));
    }

    function parseSubtitleEpisodeLink(thisEpisode, func, result) {
        if (bringe.page != "serie") return;
        var parser = new DOMParser(),
            doc = parser.parseFromString(result, "text/html"),
            myDoc = $(doc),
            button = myDoc.find("#downloadButton"),
            ratingBox = myDoc.find(".rating"),
            rating = "-";
        if (button.length > 0) {
            var link = "https://subscene.com" + button.attr("href");
            if (ratingBox.length > 0) {
                ratingBox = ratingBox.find("span");
                if (ratingBox.length > 0)
                    rating = ratingBox.html();
            }
            var subtitleEpisode = getSubtitleEpisode(thisEpisode.seasonNo, thisEpisode.episodeNo);
            subtitleEpisode.links = subtitleEpisode.links || [];
            var len = subtitleEpisode.links.length;
            if (len == 0) {
                func(true);
            }
            subtitleEpisode.links.push({link: link, rating: rating, index: len});
        }
    }

    function subtitleSuccessFunction(func, result) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(result, "text/html"),
            myDoc = $(doc),
            button = myDoc.find("#downloadButton"),
            ratingBox = myDoc.find(".rating"),
            rating = "-";
        if (button.length > 0) {
            var link = "https://subscene.com" + button.attr("href");
            if (ratingBox.length > 0) {
                ratingBox = ratingBox.find("span");
                if (ratingBox.length > 0) {
                    rating = ratingBox.html();
                }
            }
            func(true, {link: link, rating: rating});
        }
    }

    function searchMovieSubtitle(name, year, func) {
        function failFunction() {
            func(false);
        }

        function movieSuccessFunction(result) {
            if (bringe.page != "movie") return;
            var parser = new DOMParser(),
                doc = parser.parseFromString(result, "text/html"),
                myDoc = $(doc);
            var links = myDoc.find("h3.r a");
            var subsceneLinks = getSubsceneLinks(links);
            for (var i = 0; i < subsceneLinks.length; i++) {
                util.sendAjax(subsceneLinks[i], "GET", {}, util.getProxy(subtitleSuccessFunction, [func]), failFunction);
            }
        }

        var link = "https://www.google.com/search?q=" + name + "+" + year + "+english+-arabic+site:subscene.com/subtitles";
        util.sendAjax(link, "GET", {}, movieSuccessFunction, failFunction);
    }

    return {
        searchMovieSubtitle: searchMovieSubtitle,
        searchEpisodeSubtitle: searchEpisodeSubtitle,
        getSubtitleEpisode: getSubtitleEpisode
    }
});

