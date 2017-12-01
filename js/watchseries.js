_define('watchseries', [window, 'util', 'bringe'], function (window, util, bringe) {
    var base_url = 'http://itswatchseries.to',
        episodeCallback;

    function failEpisodeFunction(name, seasonNo, episodeNo, error) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "watchseries", status: false, name: name, seasonNo: seasonNo, episodeNo: episodeNo});
    }

    function successEpisodeFunction(name, seasonNo, episodeNo, complete) {
        if (bringe.page != "serie") return;
        episodeCallback({
            site: "watchseries",
            status: true,
            name: name,
            seasonNo: seasonNo,
            episodeNo: episodeNo,
            complete: complete
        });
    }

    function ignoreFunction(ignore) {

    }

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
        episodeCallback = callback;
        var name = obj.title,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episode = getEpisodeData(seasonNo, episodeNo),
            link = episode.link,
            promises = [];
        if (!link) {
            failEpisodeFunction(name, seasonNo, episodeNo, 'Link not Found');
        }
        util.ajaxPromise(link).then(function (response) {
            if (bringe.page != "serie") return;
            var doc = util.getDocFromHTML(response),
                rows = doc.find("table#myTable tr"),
                success = false;
            episode.streams = [];
            rows = getWorthyRows(rows);
            util.each(rows, function (row) {
                row = $(row);
                var page = {};
                page.linkId = $(row).attr("id").replace("link_", "");
                page.redirector = $(row).find("td a.buttonlink").attr("href");
                page.pageId = $(row).find("td.deletelinks a").attr("onclick") + "";
                page.pageId = getPageId(page.pageId);
                if (!page.pageId || page.pageId == '') return;
                var link = "http://gorillavid.in/" + page.pageId;
                promises.push(util.ajaxPromise(link, 'POST', {
                    id: page.pageId,
                    op: 'download1',
                    method_free: 'Free Download'
                }));
            });
            Promise.all(promises).then(function() {
                if (success) {
                    successEpisodeFunction(name, seasonNo, episodeNo, true);
                } else {
                    failEpisodeFunction(name, seasonNo, episodeNo);
                }
            }).catch(function () {
                if (success) {
                    successEpisodeFunction(name, seasonNo, episodeNo, true);
                } else {
                    failEpisodeFunction(name, seasonNo, episodeNo);
                }
            });
            util.each(promises, function (promise, i) {
                promise.then(function (result) {
                    var doc = util.getDocFromHTML(result),
                        script = $(doc.find("#player_code script")[2]).text(),
                        arr = script.split("src: '")[1];
                    if (!arr || arr == '') return;
                    var link = arr.split("'")[0];
                    if (!link || link == '') return;
                    episode.streams = episode.streams || [];
                    obj = {
                        src: link,
                        res: "-",
                        label: "-",
                        source: "watchseries",
                        id: (i + 1) + '',
                        origin: 'gorillavid'
                    };
                    episode.streams.push(obj);
                    success = true;
                    successEpisodeFunction(name, seasonNo, episodeNo);
                }).catch(function (error) {
                    ignoreFunction(error);
                });
            });
        }).catch(function (error) {
            failEpisodeFunction(name, seasonNo, episodeNo, error);
        });
    }

    function loadSerie(obj, callback) {
        var serieName = obj.title,
            searchName = getWatchSeriesSearchTerm(serieName),
            link = base_url + '/show/search-shows-json';
        util.ajaxPromise(link, "POST", {term: searchName}).then(function (result) {
            if (bringe.page != "serie") return;
            try {
                result = JSON.parse(result);
            } catch (e) {
            }
            var seo_url = getSearchedSerie(serieName, result);
            if (!seo_url) {
                throw Error('Search Failed');
            }
            var link = base_url + '/serie/' + seo_url;
            return util.ajaxPromise(link);
        }).then(function (response) {
            if (bringe.page != "serie" || !response) return;
            var myDoc = util.getDocFromHTML(response),
                seasonNo,
                episodeNo,
                episode,
                link,
                seasons = myDoc.find("div[itemprop='season']");
            util.eachDomObj(seasons, function (season) {
                var list = season.find("ul.listings"),
                    episodeList = list.find("li[itemprop='episode']");
                seasonNo = parseInt(list.attr("id").replace("listing_", ""));
                if (seasonNo > 0) {
                    util.eachDomObj(episodeList, function (episode) {
                        episodeNo = parseInt(episode.find("meta[itemprop='episodenumber']").attr("content"));
                        link = episode.find("meta[itemprop='url']").attr("content");
                        if (episodeNo > 0) {
                            var episodeData = getEpisodeData(seasonNo, episodeNo);
                            episodeData.link = link;
                        }
                    });
                }
            });
        }).catch(function (error) {
            callback(false, {site: "watchseries"}, error);
        });
    }

    return {
        loadSerie: loadSerie,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
