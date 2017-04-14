/**
 * Created by sagar.ja on 26/03/17.
 */
function watchseries() {
    var base_url = 'http://mywatchseries.to';
    function getWatchSeriesSearchTerm() {
        var searchTerm = thisSerie.title;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/,"").replace(/^the/, "").replaceAll(/,| -|- /," ");
        searchTerm = searchTerm.replace(/\d*$/,"").replaceAll(/\s\s+/," ").trim();
        return searchTerm;
    }
    function getSearchedSerie(serieItems) {
        if(serieItems.length == 0) {
            return null;
        }
        if(serieItems.length == 1) {
            if (serieItems[0].label === "More results...") return null;
            return serieItems[0];
        }
        if(serieItems.length == 2) {
            if (serieItems[1].label === "More results...") return serieItems[0];
        }
        for(var i=0; i<serieItems.length; i++) {
            var serieItem = serieItems[i];
            var serieName = serieItem.value;
            if(util().isSameMovieName(serieName, thisSerie.title)) {
                return serieItem;
            }
        }
        return null;
    }
    function getSeasonByNo(no) {
        var seasons = [],
            reqdSeason = null;
        if (thisSerie.websites.watchSeries && thisSerie.websites.watchSeries.seasons)
            seasons = thisSerie.websites.watchSeries.seasons;
        util().each(seasons, function (season) {
            if (season.seasonNo === no) {
                reqdSeason = season;
            }
        });
        return reqdSeason;
    }

    function getEpisodeByNo(season, no) {
        var episodes = season.episodes,
            reqdEpisode = null;
        util().each(episodes, function (episode) {
            if (episode.episodeNo === no) {
                reqdEpisode = episode;
            }
        });
        return reqdEpisode;
    }
    function getWorthyRows(rows) {
        rows = util().filter(rows, function (row) {
            if ($(row).attr("class").trim() === "download_link_gorillavid.in") {
                return true;
            }
            return false;
        });
        return rows;
    }
    function getPageId(str) {
        if (str && str!= "") {
            var arr = str.split("Delete link http://gorillavid.in/");
            return arr[1].split("'")[0];
        }
    }
    function searchSerie() {
        var link = base_url + '/show/search-shows-json';
        console.log("b");
        $.ajax({
            url: link,
            data: {
                term: getWatchSeriesSearchTerm()
            },
            method: 'POST',
            success: function (result) {
                if (page != "serie") return;
                if (typeof result != "object") {
                    try {
                        result = JSON.parse(result);
                    } catch (e) {
                        result = {};
                    }
                }
                thisSerie.websites = thisSerie.websites || {};
                thisSerie.websites.watchSeries = getSearchedSerie(result);
                getSeries();
            }
        });
    }
    function getSeries() {
        if (thisSerie.websites.watchSeries && thisSerie.websites.watchSeries.seo_url) {
            var link = base_url + '/serie/' + thisSerie.websites.watchSeries.seo_url;
            $.ajax({
                url: link,
                success: function (result) {
                    if (page != "serie") return;
                    var parser = new DOMParser(),
                        doc = parser.parseFromString(result, "text/html"),
                        myDoc = $(doc),
                        seasonsList = [],
                        seasonNo,
                        episodeNo,
                        link,
                        i, j;
                    var seasons = myDoc.find("div[itemprop='season']");
                    for (i=0; i < seasons.length; i++) {
                        var list = $(seasons[i]).find("ul.listings");
                        var episodeList = list.find("li[itemprop='episode']"),
                            episodesList = [];
                        seasonNo = parseInt(list.attr("id").replace("listing_",""));
                        if (seasonNo > 0) {
                            var oneSeason = {seasonNo: seasonNo};
                            for (j = 0; j < episodeList.length; j++) {
                                var episode = $(episodeList[j]);
                                episodeNo = parseInt(episode.find("meta[itemprop='episodenumber']").attr("content"));
                                link = episode.find("meta[itemprop='url']").attr("content");
                                if (episodeNo > 0) {
                                    var oneEpisode = {episodeNo: episodeNo, link: link};
                                    episodesList.push(oneEpisode);
                                }
                            }
                            oneSeason.episodes = episodesList;
                            seasonsList.push(oneSeason);
                        }
                    }
                    thisSerie.websites.watchSeries.seasons = seasonsList;
                }
            });
        }
    }
    function loadEpisodeLink(page, episode) {
        delete episode.streams;
        var link = "http://gorillavid.in/" + page.pageId;
        $.ajax({
            url: link,
            data: {
                id: page.pageId,
                op: 'download1',
                method_free: 'Free Download'
            },
            method: "POST",
            success: function (result) {
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    link;
                var script = myDoc.find("#player_code script").last().text();
                var arr = script.split('file: "')[1];
                if (arr && arr!= '') {
                    link = arr.split('"')[0];
                    episode.streams = episode.streams || [];
                    episode.streams.push(link);
                    console.log(link);
                    layout().showEpisodeStreamLink();
                }
            }
        });
    }
    function loadEpisode(episode) {
        var link  = episode.link;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    pageList = [],
                    i, j;
                var rows = myDoc.find("table#myTable tr");
                rows = getWorthyRows(rows);
                util().each(rows, function (row) {
                    var page = {};
                    page.linkId = $(row).attr("id").replace("link_", "");
                    page.redirector = $(row).find("td a.buttonlink").attr("href");
                    page.pageId = $(row).find("td.deletelinks a").attr("onclick") + "";
                    page.pageId = getPageId(page.pageId);
                    if (page.pageId && page.pageId != '') {
                        pageList.push(page);
                        loadEpisodeLink(page, episode);
                    }
                });
            }
        });
    }
    function getEpisode(seasonNo, episodeNo) {
        console.log(seasonNo, episodeNo);
        var season = getSeasonByNo(seasonNo);
        if (season) {
            var episode = getEpisodeByNo(season, episodeNo);
            if (episode) {
                loadEpisode(episode);
            }
        }
    }
    function fetchCurrentEpisode() {
        if (thisSerie.seasonNo && thisSerie.episodeNo) {
            var season = getSeasonByNo(thisSerie.seasonNo);
            if (season) {
                return getEpisodeByNo(season, thisSerie.episodeNo);
            }
        }
    }
    function getStreamLinks() {
        var episode = fetchCurrentEpisode();
        if (episode && episode.streams) {
            return episode.streams;
        }
    }
    function downloadEpisodeStreamLink(obj) {
        var id = obj.id;
        var episode = fetchCurrentEpisode();
        if (episode && episode.streams) {
            var link = episode.streams[id];
            var name = thisEpisode.title;
            downloads().addToDownload(link, name, ".mp4", function () {
                layout().closeWaiter();
                layout().shineDownloadButton();
            });
            return;
        }
        layout().closeWaiter();
    }
    function streamEpisodeStreamLink(obj) {
        var id = obj.id;
        var episode = fetchCurrentEpisode(thisSerie.seasonNo, thisSerie.episodeNo);
        if (episode && episode.streams) {
            var link = episode.streams[id];
            chrome.tabs.create({'url': link}, function(tab) {});
        }
    }
    return {
        searchSerie: searchSerie,
        getSeries: getSeries,
        getEpisode: getEpisode,
        getStreamLinks: getStreamLinks,
        downloadEpisodeStreamLink: downloadEpisodeStreamLink,
        streamEpisodeStreamLink: streamEpisodeStreamLink
    }
}