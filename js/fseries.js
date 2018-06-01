_define('fseries', [window, 'util', 'bringe'], function (window, util, bringe) {
    var episodeCallback,
        base_url = "https://www5.fmovies.io";

    function failEpisodeFunction(name, seasonNo, episodeNo, error) {
        if (bringe.page != "serie") return;
        episodeCallback({site: "fseries", status: false, name: name, seasonNo: seasonNo, episodeNo: episodeNo});
    }

    function successEpisodeFunction(name, seasonNo, episodeNo, complete) {
        if (bringe.page != "serie") return;
        episodeCallback({
            site: "fseries",
            status: true,
            name: name,
            seasonNo: seasonNo,
            episodeNo: episodeNo,
            complete: complete
        });
    }

    function getSeasonData(sNo) {
        bringe.serie.websites.fmovies = bringe.serie.websites.fmovies || {};
        var fmovies = bringe.serie.websites.fmovies;
        fmovies.seasons = fmovies.seasons || [];
        var seasons = fmovies.seasons;
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

    var isSameNameFunctions = function () {
        function isSameMovieName1(a, b) {
            a = a.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "");
            b = b.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "");
            return a == b;
        }

        function isSameMovieName2(a, b) {
            a = a.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            b = b.trim().toLowerCase().replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            return a == b;
        }

        function isSameMovieName3(a, b) {
            a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
            return a == b;
        }

        return [isSameMovieName1, isSameMovieName2, isSameMovieName3];
    }();

    function getSeasonSearchTerm(serieName, seasonNo) {
        var searchTerm = serieName;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(".", "").replace(/^the/, "").replaceAll(/,| -|- |'/, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").trim().replaceAll(/\s+/, "+");
        searchTerm += "+" + seasonNo;
        return searchTerm;
    }

    function getSearchedSeason(movieItems) {
        if (movieItems.length == 1) {
            return $(movieItems.find("a")[0]);
        }
        var title = bringe.serie.title,
            seasonNo = bringe.season.seasonNo,
            movieNames = [];
        for (var itemIndex = 0; itemIndex < movieItems.length; itemIndex++) {
            movieItems[itemIndex] = $(movieItems[itemIndex].find("a")[0]);
            movieNames.push(movieItems[itemIndex] && movieItems[itemIndex].attr(title));
        }
        var movieItem = util.any(isSameNameFunctions, function (isSameNameFunction) {
            return util.any(movieNames, function (movieName, itemIndex) {
                if (isSameNameFunction(movieName, title + " - Season " + seasonNo)) {
                    return movieItems[itemIndex];
                }
            });
        });
        if (movieItem) return movieItem;
        if (seasonNo == 1) {
            return util.any(isSameNameFunctions, function (isSameNameFunction) {
                return util.any(movieNames, function (movieName, itemIndex) {
                    if (isSameNameFunction(movieName, title)) {
                        return movieItems[itemIndex];
                    }
                });
            });
        }
    }

    function getEpisodeNoFromLink(link) {
        var regx = /-episode-(.+)-/;
        var matches = regx.exec(link),
            episodeId;
        try {
            episodeId = parseInt(matches[1]);
        } catch (ex) {
        }
        return episodeId;
    }

    function retrieveDataFromLink(link, seasonNo, episodeNo) {
        if (link && episodeNo) {
            var episodeData = getEpisodeData(seasonNo, episodeNo);
            episodeData.link = link;
            return true;
        }
        return false;
    }

    function getEpisodeBySelector(selector) {
        var id = selector.id,
            seasonNo = selector.seasonNo,
            episodeNo = selector.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            return getLinkById(episode.streams, id);
        }
    }

    function getStreamLinks(obj) {
        var seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo;
        var episode = getEpisodeData(seasonNo, episodeNo);
        if (episode && episode.streams) {
            return episode.streams;
        } else {
            return null;
        }
    }

    function playerPageSuccessFunction(name, seasonNo, episodeNo, result) {
        if (bringe.page != "serie") return;
        var myDoc = util.getDocFromHTML(result),
            script = $(myDoc.find('.videocontent script')[0]),
            regx = /playerInstance.setup\({sources:\[{file:'(.+?)',label:'autoP'/;
        script = script.html().replaceAll(' ', '').replaceAll('\n', '');
        var matches = script && regx.exec(script);
        var url = matches && matches[1];
        if (!url) {
            failEpisodeFunction(name, seasonNo, episodeNo);
        } else {
            var episodeData = getEpisodeData(seasonNo, episodeNo);
            episodeData.streams = episodeData.streams || [];
            episodeData.streams.push({
                file: url,
                src: url,
                res: '-',
                label: '-',
                source: 'fseries',
                origin: 'fmovies',
                id: 'fm-1*-'
            });
            successEpisodeFunction(name, seasonNo, episodeNo, true);
        }
    }

    function loadEpisode(obj, func) {
        episodeCallback = func;
        var name = obj.title,
            seasonNo = obj.seasonNo,
            episodeNo = obj.episodeNo,
            episodeData = getEpisodeData(seasonNo, episodeNo),
            link = episodeData.link;
        episodeData.streams = [];
        if (bringe.page != "serie") return;
        if (!link) {
            failEpisodeFunction(name, seasonNo, episodeNo);
            return;
        }
        var promise = util.ajaxPromise(link);

        promise.then(function (result) {
            if (bringe.page != "serie") return;
            var myDoc = util.getDocFromHTML(result),
                script = $(myDoc.find('body script')[10]),
                regx = /var link_server_f2 = "\/\/(.+)";/;
            script = script && script.html();
            var matches = script && regx.exec(script);
            var url = matches && matches[1];
            if (!url) {
                failEpisodeFunction(name, seasonNo, episodeNo);
            } else {
                url = "https://" + url;
                var promise = util.ajaxPromise(url);
                promise.then(function (result) {
                    playerPageSuccessFunction(name, seasonNo, episodeNo, result);
                }).catch(function (error) {
                    failEpisodeFunction(name, seasonNo, episodeNo);
                })
            }
        }).catch(function (error) {
            failEpisodeFunction(name, seasonNo, episodeNo);
        });
    }

    function loadSeason(obj, callback) {
        var serieName = obj.title,
            seasonNo = obj.seasonNo,
            searchName = getSeasonSearchTerm(serieName, seasonNo),
            link = base_url + '/search.html?keyword=' + searchName;
        util.ajaxPromise(link).then(function (result) {
            if (bringe.page != "serie") return;
            var myDoc = util.getDocFromHTML(result);
            var movieItems = myDoc.find("article.col2 ul li"),
                movieItem = getSearchedSeason(movieItems),
                seasonLink = movieItem && movieItem.attr("href");
            if (!seasonLink) {
                throw Error('No matching season found');
            }
            return util.ajaxPromise(base_url + seasonLink);
        }).then(function (result) {
            if (bringe.page != "serie") return;
            var success = false,
                myDoc = util.getDocFromHTML(result),
                episodes = myDoc.find(".eps .server ul li a");
            getSeasonData(seasonNo).episodes = [];
            util.eachDomObj(episodes, function (episode) {
                var link = episode.attr("href");
                link = base_url + link;
                var episodeNo = getEpisodeNoFromLink(link);
                success = retrieveDataFromLink(link, seasonNo, episodeNo) || success;
            });
            callback(success, {site: "fseries"});
        }).catch(function (error) {
            callback(false, {site: "fseries"}, error);
        });
    }

    return {
        loadSeason: loadSeason,
        loadEpisode: loadEpisode,
        getStreamLinks: getStreamLinks,
        getEpisodeBySelector: getEpisodeBySelector
    }
});
