_define('popup-layout', [window, 'util', 'bringe'], function (window, util, bringe) {
    var popupStatus = false;
    var popupName,
        seasonNo,
        episodeNo;
    function getPopupData() {
        return {status: popupStatus, name: popupName, seasonNo: seasonNo, episodeNo: episodeNo};
    }
    function openPopup(name, sNo, eNo) {
        popupStatus = true;
        popupName = name;
        seasonNo = sNo;
        episodeNo = eNo;
        $(".popup-wrapper").show();
        $("body").addClass("stop-scrolling");
    }
    function clearPopup() {
        var popupBox = $(".popup-box");
        var table = popupBox.find("table");
        popupBox.find(".popup-header").html("");
        table.find("thead").html("");
        table.find("tbody").html("");
        popupBox.find(".popup-fetching").hide();
    }
    function closePopup() {
        popupStatus = false;
        popupName = null;
        $(".popup-wrapper").hide();
        $("body").removeClass("stop-scrolling");
        clearPopup();
    }
    function openWaiter(text) {
        $(".waiter-text").find("p").html(text);
        $(".waiter-wrapper").show();
        $("body").addClass("stop-scrolling");
    }

    function closeWaiter() {
        $(".waiter-wrapper").hide();
        $(".waiter-text").find("p").html("");
        $("body").removeClass("stop-scrolling");
    }

    function showRottenLoader(obj) {
        $('.rotten-buffer').remove();
        var buffer = $('<div class="rotten-buffer"><img class="fa-spin" src="../images/bringe-48.png"></div>');
        obj.append(buffer);
    }

    function removeRottenLoader() {
        $('.rotten-buffer').remove();
    }

    function openMovieStreamPopup(movie) {
        clearPopup();
        var popupBox = $(".popup-box");
        popupBox.find(".popup-header").html("Bringe the Movie");
        var table = popupBox.find("table");
        var thead = table.find("thead");
        var tbody = table.find("tbody");
        var linksObj = movie.streamLinkDetails;
        for (var i = 0; i < linksObj.length; i++) {
            var linkObj = linksObj[i],
                row;
            if (linkObj.type == 'iframe') {
                row = $('<tr data-id="' + linkObj.source + '"> <td data-id="' + linkObj.id + '">Link ' + (i + 1) + '</td> <td>' + linkObj.origin + '</td> <td>' + linkObj.label + '</td> <td class="movieStream">Launch</td> <td class="movieDownload"></td> </tr>');
            } else {
                row = $('<tr data-id="' + linkObj.source + '"> <td data-id="' + linkObj.id + '">Link ' + (i + 1) + '</td> <td>' + linkObj.origin + '</td> <td>' + linkObj.label + '</td> <td class="movieStream">Stream</td> <td class="movieDownload">Download</td> </tr>');
            }
            tbody.append(row);
            var stream = row.find(".movieStream");
            var download = row.find(".movieDownload");
            stream.click(function (evt) {
                closePopup();
                var line = $(this).parent(),
                    source = line.attr("data-id"),
                    tds = line.find("td"),
                    id = $(tds[0]).attr("data-id");
                util.fireEvent("openMovieStream", [{id: id, source: source}]);
            });
            download.click(function (evt) {
                closePopup();
                var line = $(this).parent(),
                    source = line.attr("data-id"),
                    tds = line.find("td"),
                    id = $(tds[0]).attr("data-id");
                util.fireEvent("downloadMovieStream", [{id: id, source: source}]);
            });
        }
        if (movie.movieRespones && movie.movieRespones.complete) {
            popupBox.find(".popup-fetching").hide();
        } else {
            popupBox.find(".popup-fetching").show();
        }
        openPopup(movie.title);
    }

    function openMovieSubtitlePopup(movie) {
        clearPopup();
        var popupBox = $(".popup-box");
        popupBox.find(".popup-header").html("Download Subtitle");
        var table = popupBox.find("table");
        var thead = table.find("thead");
        thead.append('<tr> <td>Source</td> <td>Rating</td> <td>Format</td> </tr>');
        var tbody = table.find("tbody");
        var linksObj = movie.subtitleLinks;
        for (var i = 0; i < linksObj.length; i++) {
            var linkObj = linksObj[i];
            var ext = "srt";
            var row = $('<tr class="' + linkObj.index + '"> <td><img src="../images/subscene.gif"/></td> <td>' + linkObj.rating + '</td> <td>' + ext + '</td> </tr>');
            tbody.append(row);
            row.click(function (evt) {
                closePopup();
                var obj = $(this);
                var id = obj.attr("class");
                util.fireEvent("downloadMovieSubtitle", [parseInt(id)]);
            });
        }
        openPopup();
    }
    function openEpisodesStreamPopup(serie, streamLinks) {
        clearPopup();
        var popupBox = $(".popup-box");
        popupBox.find(".popup-header").html("Bringe the Episode");
        var table = popupBox.find("table");
        var thead = table.find("thead");
        var tbody = table.find("tbody");
        for (var i = 0; i < streamLinks.length; i++) {
            var link = streamLinks[i],
                row;
            if (link.type == 'iframe') {
                row = $('<tr data-id="' + link.source + '"> <td data-id="' + link.id + '">Link ' + (i + 1) + '</td> <td class="streamOrigin">' + (link.origin || link.source) + '</td> <td class="streamQuality">' + link.label + '</td> <td class="streamEpisode">Launch</td> <td class="downloadEpisode"></td> </tr>');
            } else {
                row = $('<tr data-id="' + link.source + '"> <td data-id="' + link.id + '">Link ' + (i + 1) + '</td> <td class="streamOrigin">' + (link.origin || link.source) + '</td> <td class="streamQuality">' + link.label + '</td> <td class="streamEpisode">Stream</td> <td class="downloadEpisode">Download</td> </tr>');
            }
            tbody.append(row);
            var downloadButton = row.find(".downloadEpisode");
            var streamButton = row.find(".streamEpisode");
            downloadButton.click(function (evt) {
                closePopup();
                var obj = $(this),
                    line = obj.parent(),
                    source = line.attr("data-id"),
                    tds = line.find("td"),
                    id = $(tds[0]).attr("data-id");
                util.fireEvent("downloadSerieStream", [{id: id, source: source}]);
            });
            streamButton.click(function (evt) {
                closePopup();
                var line = $(this).parent(),
                    source = line.attr("data-id"),
                    tds = line.find("td"),
                    id = $(tds[0]).attr("data-id");
                util.fireEvent("openSerieStream", [{id: id, source: source}]);
            });
        }
        if (serie.episodeResponses && serie.episodeResponses.complete) {
            popupBox.find(".popup-fetching").hide();
        } else {
            popupBox.find(".popup-fetching").show();
        }
        openPopup(serie.title, serie.seasonNo, serie.episodeNo);
    }

    function openEpisodeSubtitlePopup(episode) {
        clearPopup();
        var popupBox = $(".popup-box");
        popupBox.find(".popup-header").html("Download Subtitle");
        var table = popupBox.find("table");
        var thead = table.find("thead");
        thead.append('<tr> <td>Source</td> <td>Rating</td> <td>Format</td> </tr>');
        var tbody = table.find("tbody");
        var linksObj = episode.links;
        if (linksObj) {
            for (var i = 0; i < linksObj.length; i++) {
                var linkObj = linksObj[i];
                var ext = "srt";
                var row = $('<tr class="' + linkObj.index + '"> <td><img src="../images/subscene.gif"/></td> <td>' + linkObj.rating + '</td> <td>' + ext + '</td> </tr>');
                tbody.append(row);
                row.click(function (evt) {
                    closePopup();
                    var obj = $(this);
                    var id = obj.attr("class");
                    util.fireEvent("downloadEpisodeSubtitle", [parseInt(id)]);
                });
            }
            openPopup();
        }
    }

    function openVideoPopup() {
        $(".video-wrapper").show();
    }
    function closeVideoPopup() {
        $(".video-wrapper").hide();
    }
    function openTrailerPopup() {
        $(".youtube-wrapper").show();
    }
    function closeTrailerPopup() {
        $(".youtube-wrapper").hide();
    }

    return {
        getPopupData: getPopupData,
        closePopup: closePopup,
        openWaiter: openWaiter,
        closeWaiter: closeWaiter,
        showRottenLoader: showRottenLoader,
        removeRottenLoader: removeRottenLoader,
        openMovieStreamPopup: openMovieStreamPopup,
        openMovieSubtitlePopup: openMovieSubtitlePopup,
        openEpisodesStreamPopup: openEpisodesStreamPopup,
        openEpisodesSubtitlePopup: openEpisodeSubtitlePopup,
        openVideoPopup: openVideoPopup,
        closeVideoPopup: closeVideoPopup,
        openTrailerPopup: openTrailerPopup,
        closeTrailerPopup: closeTrailerPopup
    }
});