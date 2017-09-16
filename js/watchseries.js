_define('watchseries', [window, 'util', 'bringe'], function (window, util, bringe) {
    var base_url = 'http://ewatchseries.to';

    function getSeasonData(sNo) {
        bringe.serie.websites.watchSeries = bringe.serie.websites.watchSeries || {};
        var watchSeries = bringe.serie.websites.watchSeries;
        watchSeries.seasons = watchSeries.seasons || [];
        var seasons = watchSeries.seasons;
        seasons[sNo] = seasons[sNo] || {seasonNo: sNo};
        return seasons[sNo];
    }

    function getEpisodeData(sNo, epNo) {
        var seasonData = getSeasonData(sNo);
        seasonData.episodes = seasonData.episodes || [];
        var episodes = seasonData.episodes;

        episodes[epNo] = episodes[epNo] || {episodeNo: sNo};
        return episodes[epNo];
    }

    function getLinkById(streams, id) {
        var link = null;
        link = util.any(streams, function (stream) {
            if (stream.id === id) {
                link = stream;
                return link;
            }
        });
        return link;
    }

    function getWatchSeriesSearchTerm(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,| -|- /, " ");
        searchTerm = searchTerm.replace(/\d*$/, "").replaceAll(/\s\s+/, " ").trim();
        return searchTerm;
    }

    function getWorthyRows(rows) {
        rows = util.filter(rows, function (row) {
            return ($(row).attr("class").trim() === "download_link_gorillavid.in");
        });
        return rows;
    }

    function getPageId(str) {
        if (str && str != "") {
            var arr = str.split("Delete link http://gorillavid.in/");
            return arr[1].split("'")[0];
        }
    }

    function getSearchedSerie(serieTitle, serieItems) {
        if (serieItems.length == 0) {
            return null;
        }
        if (serieItems.length == 1) {
            if (serieItems[0].label === "More results...") return null;
            return serieItems[0].seo_url;
        }
        if (serieItems.length == 2) {
            if (serieItems[1].label === "More results...") return serieItems[0].seo_url;
        }
        for (var i = 0; i < serieItems.length; i++) {
            var serieItem = serieItems[i];
            var serieName = serieItem.value;
            if (util.isSameMovieName(serieName, serieTitle)) {
                return serieItem.seo_url;
            }
        }
    }

    function seriePageSuccessFunction(result) {
        if (bringe.page != "serie" || !result) return;
        var parser = new DOMParser(),
            doc = parser.parseFromString(result, "text/html"),
            myDoc = $(doc),
            seasonNo,
            episodeNo,
            episode,
            link,
            i, j;
        var seasons = myDoc.find("div[itemprop='season']");
        for (i = 0; i < seasons.length; i++) {
            var list = $(seasons[i]).find("ul.listings"),
                episodeList = list.find("li[itemprop='episode']");
            seasonNo = parseInt(list.attr("id").replace("listing_", ""));
            if (seasonNo > 0) {
                for (j = 0; j < episodeList.length; j++) {
                    episode = $(episodeList[j]);
                    episodeNo = parseInt(episode.find("meta[itemprop='episodenumber']").attr("content"));
                    link = episode.find("meta[itemprop='url']").attr("content");
                    if (episodeNo > 0) {
                        var episodeData = getEpisodeData(seasonNo, episodeNo);
                        episodeData.link = link;
                    }
                }
            }
        }
    }

    function streamLinkSuccessFunction(episode, index, callback, result) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(result, "text/html"),
            myDoc = $(doc),
            link,
            obj = {},
            script = $(myDoc.find("#player_code script")[2]).text(),
            arr = script.split("src: '")[1];
        if (arr && arr != '') {
            link = arr.split("'")[0];
            if (link && link != '') {
                episode.streams = episode.streams || [];
                obj = {src: link, res: "-", label: "-", source: "watchseries", id: index + '', origin: 'gorillavid'};
                episode.streams.push(obj);
                callback(true, {site: "watchseries"});
            }
        }
    }

    function getEpisodeBySelector(selector) {
        var id = selector.id,
            seasonNo = selector.seasonNo,
            episodeNo = selector.episodeNo;
        var episodeData = getEpisodeData(seasonNo, episodeNo);
        if (episodeData && episodeData.streams) {
            return getLinkById(episodeData.streams, id);
        }
    }

    function getStreamLinks(obj) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episodeData = getEpisodeData(seasonNo, episodeNo);
        return episodeData && episodeData.streams;
    }

    function loadEpisode(obj, callback) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episode = getEpisodeData(seasonNo, episodeNo),
            link = episode.link;
        function episodeSuccessFunction(result) {
            if (bringe.page != "serie") return;
            var parser = new DOMParser(),
                doc = parser.parseFromString(result, "text/html"),
                myDoc = $(doc),
                rows = myDoc.find("table#myTable tr"),
                row, i;
            episode.streams = [];
            rows = getWorthyRows(rows);
            for (i = 0; i < rows.length; i++) {
                var page = {};
                row = $(rows[i]);
                page.linkId = $(row).attr("id").replace("link_", "");
                page.redirector = $(row).find("td a.buttonlink").attr("href");
                page.pageId = $(row).find("td.deletelinks a").attr("onclick") + "";
                page.pageId = getPageId(page.pageId);
                if (page.pageId && page.pageId != '') {
                    var link = "http://gorillavid.in/" + page.pageId;
                    util.sendAjax(link, "POST", {id: page.pageId, op: 'download1', method_free: 'Free Download'}, util.getProxy(streamLinkSuccessFunction, [episode, i+1, callback]), util.getProxy(callback, [false, {site: "watchseries"}]));
                }
            }
        }
        if (link) {
            util.sendAjax(link, "GET", {}, episodeSuccessFunction, util.getProxy(callback, [false, {site: "watchseries"}]));
        }
    }

    function loadSerie(obj, callback) {
        var serieName = obj.title,
            searchName = getWatchSeriesSearchTerm(serieName),
            link = base_url + '/show/search-shows-json';

        function searchSuccessFunction(result) {
            if (bringe.page != "serie") return;
            try {
                result = JSON.parse(result);
            } catch (e) {
            }
            var seo_url = getSearchedSerie(serieName, result);
            if (seo_url) {
                var link = base_url + '/serie/' + seo_url;
                util.sendAjax(link, "GET", {}, seriePageSuccessFunction, util.getProxy(callback, [false, {site: "watchseries"}]));
            }
        }
        util.sendAjax(link, "POST", {term: searchName}, searchSuccessFunction, util.getProxy(callback, [false, {site: "watchseries"}]));
    }

    return {
        loadSerie: loadSerie,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
