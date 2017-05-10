/**
 * Created by sagar.ja on 26/03/17.
 */
function watchseries() {
    var base_url = 'http://mywatchseries.to';

    thisSerie.websites.watchSeries = thisSerie.websites.watchSeries || {};
    var watchSeries = thisSerie.websites.watchSeries;

    function getSeasonByNo(no) {
        var seasons = [],
            reqdSeason = null;
        if (watchSeries.seasons)
            seasons = watchSeries.seasons;
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
    function getEpisode(seasonNo, episodeNo) {
        var season = getSeasonByNo(seasonNo);
        if (season) {
            return getEpisodeByNo(season, episodeNo);
        }
    }

    function getLinkById(streams, id) {
        var link = null;
        link = util().any(streams, function (stream) {
            if(stream.id === id) {
                link = stream;
                return link;
            }
        });
        return link;
    }

    function getWatchSeriesSearchTerm(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/,"").replace(/^the/, "").replaceAll(/,| -|- /," ");
        searchTerm = searchTerm.replace(/\d*$/,"").replaceAll(/\s\s+/," ").trim();
        return searchTerm;
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
    function getSearchedSerie(serieItems) {
        if(serieItems.length == 0) {
            return null;
        }
        if(serieItems.length == 1) {
            if (serieItems[0].label === "More results...") return null;
            return serieItems[0].seo_url;
        }
        if(serieItems.length == 2) {
            if (serieItems[1].label === "More results...") return serieItems[0].seo_url;
        }
        for(var i=0; i<serieItems.length; i++) {
            var serieItem = serieItems[i];
            var serieName = serieItem.value;
            if(util().isSameMovieName(serieName, thisSerie.title)) {
                return serieItem.seo_url;
            }
        }
        return null;
    }
    function getSeries() {
        if (watchSeries.seo_url) {
            var link = base_url + '/serie/' + watchSeries.seo_url;
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
                    watchSeries.seasons = seasonsList;
                }
            });
        }
    }
    function loadEpisodeLink(page, episode, id) {
        var link = "http://gorillavid.in/" + page.pageId,
            obj;
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
                    obj = {src: link, res: "-", label: "-", source: "watchseries", id: id};
                    episode.streams.push(obj);
                    layout().showEpisodeStreamLink();
                }
            }
        });
    }
    function fetchEpisode(episode) {
        var link  = episode.link;
        delete episode.streams;
        $.ajax({
            url: link,
            success: function (result) {
                if (page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc);
                var rows = myDoc.find("table#myTable tr"),
                    id = 1;
                rows = getWorthyRows(rows);
                util().each(rows, function (row) {
                    var page = {};
                    page.linkId = $(row).attr("id").replace("link_", "");
                    page.redirector = $(row).find("td a.buttonlink").attr("href");
                    page.pageId = $(row).find("td.deletelinks a").attr("onclick") + "";
                    page.pageId = getPageId(page.pageId);
                    if (page.pageId && page.pageId != '') {
                        loadEpisodeLink(page, episode, id + '');
                        id++;
                    }
                });
            }
        });
    }
    function loadSerie(obj, callback) {
        var serieName = obj.title;
        var link = base_url + '/show/search-shows-json';
        $.ajax({
            url: link,
            data: {
                term: getWatchSeriesSearchTerm(serieName)
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
                watchSeries.seo_url = getSearchedSerie(result);
                getSeries();
            }
        });
    }
    function loadEpisode(obj) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var season = getSeasonByNo(seasonNo);
        if (season) {
            var episode = getEpisodeByNo(season, episodeNo);
            if (episode) {
                fetchEpisode(episode);
            }
        }
    }
    function getStreamLinks(obj) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisode(seasonNo, episodeNo);
        if (episode && episode.streams) {
            return episode.streams;
        } else {
            return null;
        }
    }
    function downloadEpisodeStreamLink(obj) {
        var id = obj.id,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisode(seasonNo, episodeNo);
        if (episode && episode.streams) {
            var link = getLinkById(episode.streams, id);
            link = link.src;
            var name = thisEpisode.title;
            layout().openWaiter("Adding Episode to Downloads");
            downloads().addToDownload(link, name, ".mp4", function () {
                layout().closeWaiter();
                layout().shineDownloadButton();
            });
            return;
        }
        layout().closeWaiter();
    }
    function streamEpisodeStreamLink(obj) {
        var id = obj.id,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisode(seasonNo, episodeNo);
        if (episode && episode.streams) {
            var link = getLinkById(episode.streams, id);
            link = link.src;
            chrome.tabs.create({'url': link}, function(tab) {});
        }
    }
    function getEpisodeBySelector(selector) {
        var id = selector.id,
            seasonNo = selector.seasonNo,
            episodeNo = selector.episodeNo;
        var episode = getEpisode(seasonNo, episodeNo);
        if (episode && episode.streams) {
            return getLinkById(episode.streams, id);
        }
    }
    return {
        loadSerie: loadSerie,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector,
        downloadEpisodeStreamLink: downloadEpisodeStreamLink,
        streamEpisodeStreamLink: streamEpisodeStreamLink
    }
}