/**
 * Created by sagar.ja on 12/02/17.
 */
var background = chrome.extension.getBackgroundPage();
var thisMovie,
    thisSerie,
    thisSeason,
    thisEpisode,
    serieLevel;
var download_active = true;
var page = "home";
var searchMovieDivObj = $('<div class="searchMovie">' +
    '<div class="searchMovieImage"> <img> </div>' +
    '<div class="searchMovieDetail"> <div class="searchMovieName"></div> <div class="searchMovieSubline"></div> </div> ' +
    '<div class="searchMovieRating">' +
    '<div class="searchMovieRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>');
var searchSerieDivObj = $('<div class="searchSerie">' +
    '<div class="searchSerieImage"> <img> </div>' +
    '<div class="searchSerieDetail"> <div class="searchSerieName"></div> <div class="searchSerieYear"></div> </div> ' +
    '<div class="searchSerieRating">' +
    '<div class="searchSerieRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>');
var seasonListDivObj = $('<div class="seasonListDiv">' +
    '<div class="seasonListImage"> <img> </div>' +
    '<div class="seasonListDetail">' +
    '<div class="seasonListName"></div> <div class="seasonListConsensus"></div> <div class="seasonListInfo"></div> </div> ' +
    '<div class="seasonListRating">' +
    '<div class="seasonListRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>');
var episodeListDivObj = $('<div class="episodeListDiv">' +
    '<div class="episodeListLeft">' +
    '<div class="episodeListNumber"></div>' +
    '<div class="episodeListDate"></div></div>' +
    '<div class="episodeListDetail">' +
    '<div class="episodeListName"></div> <div class="episodeListSynopsis"></div> </div> ' +
    '<div class="episodeListRating">' +
    '<div class="episodeListRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>');
var castMemberDivObj = $('<div class="col-lg-3 col-md-4 col-sm-6"><div class="cast-member"><div class="row">' +
    '<div class="cast-image"> <img></div><div class="cast-details">' +
    '<div class="cast-name"></div> <div class="cast-role"></div></div></div> </div></div>');
var movieInfoDivObj =$('<div class="movie-info-box row"> <div class="col-xs-4"> <div class="movie-info-label"></div>' +
    '</div> <div class="col-xs-8"> <div class="movie-info-value"></div> </div> </div>');
var downloadItemDivObj = $('<div class="download-item"> <div class="row"> <div class="download-file-icon"><img></div>' +
    '<div class="download-file-data"> <div class="download-file-name"></div> <div class="download-file-link"><a></a></div>' +
    '<div class="download-progress-detail"></div> <div class="download-progress-bar"><div class="download-complete-part"></div></div>' +
    '<div class="download-file-options"></div><div class="download-file-remove"></div> </div> </div> </div>');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function util() {

    function isSameMovieName(a, b) {
        a = a.trim().toLowerCase().replace(/\(.*\)/,"").replaceAll(" ","").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the","");
        b = b.trim().toLowerCase().replace(/\(.*\)/,"").replaceAll(" ","").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the","");
        return a==b;
    }
    function streamComparator(a, b) {
        if(a.res) {
            if(b.res) {
                if(a.res > b.res) {
                    return -1;
                }
                if(b.res > a.res) {
                    return 1;
                }
                return 0;
            } else {
                return -1;
            }
        } else {
            return 1;
        }
    }
    function getSearchTerm(searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/, "").replace(/^the/, "").replaceAll(/,| -|- /, " ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/, "").replaceAll(/\s\s+/, " ").trim().replaceAll(" ", "+");
        return searchTerm;
    }
    function extractFileName(loc) {
        var name = loc.split("/");
        return name[name.length - 1];
    }
    function getTimeInWords(ms) {
        var time = Math.round(ms/1000);
        if(time<60) return time + " sec";
        time = Math.round(time/60);
        if(time<60) return time + " min";
        time = Math.round(time/60);
        if(time<24) return time + " hour";
        time = Math.round(time/24);
        return time + " day";
    }
    function downloadComparator(a, b) {
        if(a.startTime < b.startTime) return 1;
        if(b.startTime < a.startTime) return -1;
        return 0;
    }

    function sendAjax(link, type, data, successFunction, errorFunction) {
        $.ajax({
            url: link,
            type: type,
            data: data,
            success: function (result) {
                successFunction(result);
            },
            error: function (result) {
                errorFunction(result);
            }
        });
    }

    function isSet(val) {
        switch (typeof val) {
            case "string":
                return val !== undefined && val !== "" && val !== null;
            case "object":
                return val !== null;
            case "number":
            case "boolean":
                return true;
            default:
                return false;
        }
    }

    function isFunction(reference) {
        return typeof reference === "function";
    }

    function isArray(item) {
        return Object.prototype.toString.call(item) === '[object Array]';
    }

    function each(obj, callback) {
        var i, key;
        if (obj) {
            if (obj.constructor === Array) {
                for (i=0; i < obj.length; i++) {
                    callback(obj[i], i, obj.length);
                }
            } else if (typeof obj === 'object') {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        callback(obj[key], key);
                    }
                }
            }
        }
    }

    function filter(arr, callback) {
        var array = [],
            i;
        if (arr) {
            for (i=0; i < arr.length; i++) {
                if (callback(arr[i])) array.push(arr[i]);
            }
        }
        return array;
    }

    function any(obj, callback) {
        if (!isSet(obj)) {
            return;
        }
        if (!isFunction(callback)) {
            callback = function (val, key) {
                return !!val;
            };
        }
        var i = 0,
            length = obj.length,
            returnValue;

        if (isArray(obj)) {
            for (; i < length; i++) {
                returnValue = callback.call(obj[i], obj[i], i);
                if (isSet(returnValue)) {
                    return returnValue;
                }
            }
        } else {
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    returnValue = callback.call(obj[i], obj[i], i);
                    if (isSet(returnValue)) {
                        return returnValue;
                    }
                }
            }
        }
    }

    function getProxy(target, args, scope) {
        scope = scope || null;
        args = args || [];
        return function () {
            var argsCopy = args.slice(0);
            if (arguments.length > 0) {
                Array.prototype.push.apply(argsCopy, Array.prototype.slice.call(arguments));
            }
            target.apply(scope, argsCopy);
        };
    }

    return {
        isSameMovieName: isSameMovieName,
        streamComparator: streamComparator,
        getSearchTerm: getSearchTerm,
        extractFileName: extractFileName,
        getTimeInWords: getTimeInWords,
        downloadComparator: downloadComparator,
        sendAjax: sendAjax,
        isFunction: isFunction,
        isSet: isSet,
        isArray: isArray,
        each: each,
        any: any,
        filter: filter,
        getProxy: getProxy
    }
}

function handleEvent() {

    function searchEntered() {
        layout().clearSearchList();
        layout().searching();
        var q = $("#search-input").val();
        if (q != "") {
            rottenTomatoes().searchMovie(q);
        }
    }
    return {
        searchEntered: searchEntered
    }
}

function google() {
    function getSeasonPart() {
        var seasonNo = thisSerie.seasonNo,
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
        var episodeNo = thisSerie.episodeNo,
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
        if (page != "movie" && page != "serie") return list;
        for (var i=0 ;i<links.length; i++) {
            if(links[i].href.match(/https?:\/\/subscene\.com\/subtitles\/.+\/english\/\d+$/)) {
                list.push(links[i].href);
            }
        }
        return list;
    }
    function searchSubtitle() {
        var link;
        if (page == "movie") {
            link = "https://www.google.co.in/search?q=" + thisMovie.name + "+" + thisMovie.year + "+english+-arabic+site:subscene.com/subtitles";
        } else if (page == "serie") {
            link = "https://www.google.co.in/search?q=" + thisSerie.title + "+" + getSeasonPart() + getEpisodePart() + "+english+-arabic+site:subscene.com/subtitles";
            var episode = subscene().getSubtitleEpisode();
            if (episode) {
                delete episode.links;
            }
        } else {
            return;
        }
        $.ajax({
            url: link,
            success: function (result) {
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc);
                var links = myDoc.find("a[onmousedown]");
                var subsceneLinks = getSubsceneLinks(links);
                for(var i = 0; i < subsceneLinks.length; i++) {
                    subscene().getSubtitleDownloadLink(subsceneLinks[i]);
                }
            }
        });
    }
    return {
        searchSubtitle: searchSubtitle
    }
}

function subscene() {
    function getSubtitleSeason() {
        var reqdSeason = null;
        var seasons;
        if (thisSerie.subtitles) {
            seasons = thisSerie.subtitles.seasons;
            util().each(seasons, function (season) {
                if (season.seasonNo == thisSerie.seasonNo) {
                    reqdSeason = season;
                }
            });
        }
        return reqdSeason;
    }
    function getSubtitleEpisode() {
        var reqdEpisode = null;
        var season = getSubtitleSeason();
        if (season) {
            var episodes = season.episodes || [];
            util().each(episodes, function (episode) {
                if (episode.episodeNo == thisSerie.episodeNo) {
                    reqdEpisode = episode;
                }
            });
        }
        return reqdEpisode;
    }
    function getSubtitleDownloadLink(subsenelink) {
        if (page != "movie" && page != "serie") return;
        $.ajax({
            url: subsenelink,
            success: function (result) {
                if (page != "movie" && page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    button = myDoc.find("#downloadButton"),
                    ratingBox = myDoc.find(".rating"),
                    rating = "-";
                if(button.length > 0) {
                    var link = "https://subscene.com" + button.attr("href");
                    if(ratingBox.length > 0) {
                        ratingBox = ratingBox.find("span");
                        if(ratingBox.length > 0)
                        rating = ratingBox.html();
                    }
                    if (page == "movie") {
                        thisMovie.subtitleLinks = thisMovie.subtitleLinks || [];
                        var len = thisMovie.subtitleLinks.length;
                        thisMovie.subtitleLinks.push({link: link, rating: rating, index: len});
                        layout().showSubtitleLink();
                    } else {
                        thisSerie.subtitles = thisSerie.subtitles || {};
                        thisSerie.subtitles.seasons = thisSerie.subtitles.seasons || [];
                        var season = getSubtitleSeason();
                        if (!season) {
                            season = {seasonNo: thisSerie.seasonNo};
                            thisSerie.subtitles.seasons.push(season);
                        }
                        season.episodes = season.episodes || [];
                        var episode = getSubtitleEpisode();
                        if (!episode) {
                            episode = {episodeNo: thisSerie.episodeNo, links: [{link: link, rating: rating, index: 0}]};
                            season.episodes.push(episode);
                        } else {
                            episode.links = episode.links || [];
                            var len = episode.links.length;
                            episode.links.push({link: link, rating: rating, index: len});
                        }
                        layout().showEpisodeSubtitleLink();
                    }
                }
            }
        });
    }
    function startSubtitleDownload(index) {
        if (page != "movie" && page != "serie") return;
        layout().openWaiter("Adding Subtitle to Downloads");
        if (page == "movie") {
            if (index) {
                downloads().addToDownload(thisMovie.subtitleLinks[index].link, thisMovie.name, ".zip", function () {
                    layout().closeWaiter();
                    layout().shineDownloadButton();
                });
            } else {
                downloads().addToDownload(thisMovie.subtitleLinks[0].link, thisMovie.name, ".zip", function () {
                    layout().closeWaiter();
                    layout().shineDownloadButton();
                });
            }
        } else {
            downloads().addToDownload(getSubtitleEpisode().links[index].link, thisSerie.title, ".zip", function () {
                layout().closeWaiter();
                layout().shineDownloadButton();
            });
        }
    }
    return {
        getSubtitleDownloadLink: getSubtitleDownloadLink,
        startSubtitleDownload: startSubtitleDownload,
        getSubtitleEpisode: getSubtitleEpisode
    }
}

$(document).ready(function () {

    background.setSearchFunction(function (text) {
        $("#search-input").val(text);
        handleEvent().searchEntered();
    });

    $(window).scroll(function() {
        if ($(this).scrollTop() > 80){
            $('.header-wrapper').addClass("sticky");
        }
        else{
            $('.header-wrapper').removeClass("sticky");
        }
    });

    $("#search-input").focus();

    $(".header-logo").click(function () {
        layout().goToHome();
    });
    $(".close-button").click(function () {
        background.closeWindow();
    });
    $(".reopen").click(function () {
        background.reopenWindow();
    });
    $("#searchForm")[0].onsubmit = function (evt) {
        handleEvent().searchEntered();
        return false;
    };
    $(".popup-close").click(function () {
        layout().closePopup();
    });
    $("#route-serie").click(function () {
        layout().showSerieLevel();
    });
    $("#route-season").click(function () {
        layout().showSeasonLevel();
    });
    $("#episodeStreamButton").find(".feeling-lucky").click(function (evt) {
        layout().openEpisodesStreamPopup();
    });
    $("#episodeSubtitleButton").find(".feeling-lucky").click(function (evt) {
        layout().openEpisodesSubtitlePopup();
    });
    $("#movieStreamButton").find(".feeling-lucky").click(function (evt) {
        layout().openStreamPopup();
    });
    $("#movieSubtitleButton").find(".feeling-lucky").click(function (evt) {
        layout().openSubtitlePopup();
    });
    $("#downloads-button").click(function (evt) {
        downloads().setupDownloadsSection();
    });

    $(".downloads-back").click(function (evt) {
        layout().goBackFromDownloads();
    });
});