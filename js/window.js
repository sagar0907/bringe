var background = chrome.extension.getBackgroundPage();
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

_define('util', [window], function (window) {
    var eventsRegistered = {};

    function isSameMovieName(a, b) {
        a = a.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
        b = b.trim().toLowerCase().replace(/\(.*\)/, "").replaceAll(" ", "").replaceAll(/:|,|-|'|"|\(|\)/, "").replace("the", "");
        return a == b;
    }

    function streamComparator(a, b) {
        if (a.res) {
            if (b.res) {
                if (a.res > b.res) {
                    return -1;
                }
                if (b.res > a.res) {
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
        var time = Math.round(ms / 1000);
        if (time < 60) return time + " sec";
        time = Math.round(time / 60);
        if (time < 60) return time + " min";
        time = Math.round(time / 60);
        if (time < 24) return time + " hour";
        time = Math.round(time / 24);
        return time + " day";
    }

    function downloadComparator(a, b) {
        if (a.startTime < b.startTime) return 1;
        if (b.startTime < a.startTime) return -1;
        return 0;
    }

    function sendAjax(url, type, data, successFunction, errorFunction, headers) {
        type = type || "GET";
        data = data || {};
        headers = headers || {};
        $.ajax({
            url: url,
            type: type,
            data: data,
            headers: headers,
            success: function (result) {
                successFunction(result);
            },
            error: function (result) {
                errorFunction(result);
            }
        });
    }

    function ajaxPromise(url, type, data, headers, callbackArgument) {
        return new Promise(function (resolve, reject) {
            if (callbackArgument) {

            } else {
                sendAjax(url, type, data, resolve, reject, headers);
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
                for (i = 0; i < obj.length; i++) {
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

    function eachDomObj(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback($(list[i]), i, list.length);
        }
    }

    function filter(arr, callback) {
        var array = [],
            i;
        if (arr) {
            for (i = 0; i < arr.length; i++) {
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

    function getDocFromHTML(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        return $(doc);
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

    function fireEvent(eventName, args) {
        if (eventsRegistered[eventName]) {
            var func = getProxy(eventsRegistered[eventName], args);
            func();
        }
    }

    function listenEvent(eventName, func) {
        eventsRegistered[eventName] = func;
    }

    function removeEvent(eventName) {
        delete eventsRegistered[eventName];
    }

    return {
        isSameMovieName: isSameMovieName,
        streamComparator: streamComparator,
        getSearchTerm: getSearchTerm,
        extractFileName: extractFileName,
        getTimeInWords: getTimeInWords,
        downloadComparator: downloadComparator,
        sendAjax: sendAjax,
        ajaxPromise: ajaxPromise,
        isFunction: isFunction,
        isSet: isSet,
        isArray: isArray,
        each: each,
        eachDomObj: eachDomObj,
        any: any,
        filter: filter,
        getDocFromHTML: getDocFromHTML,
        getProxy: getProxy,
        fireEvent: fireEvent,
        listenEvent: listenEvent,
        removeEvent: removeEvent
    }
});

_define('bringe', [window], function (window) {
    var thisMovie = {}, thisSerie = {}, thisSeason = {}, thisEpisode = {}, serieLevel = {},
        page = 'home', searchResults = {};
    return {
        movie: thisMovie,
        serie: thisSerie,
        season: thisSeason,
        episode: thisEpisode,
        serieLevel: serieLevel,
        page: page,
        downloadActive: true,
        searchResults: searchResults
    }
});

_define('handler', [window, document, 'util', 'manager', 'layout', 'downloads'], function (window, document, util, manager, layout, downloads) {
    function documentReady() {
        background.setSearchFunction(function (text) {
            $("#search-input").val(text);
            manager.searchEntered();
        });

        $(window).scroll(function () {
            if ($(this).scrollTop() > 80) {
                $('.header-wrapper').addClass("sticky");
            }
            else {
                $('.header-wrapper').removeClass("sticky");
            }
        });

        $("#search-input").focus();

        $(".header-logo").click(function () {
            layout.goToHome();
        });
        $(".close-button").click(function () {
            background.closeWindow();
        });
        $(".reopen").click(function () {
            background.reopenWindow();
        });
        $("#searchForm")[0].onsubmit = function (evt) {
            manager.searchEntered();
            return false;
        };
        $(".popup-close").click(function () {
            layout.popup.closePopup();
        });
        $("#moviesResultsButton").click(function () {
            layout.setMovieListVisible();
        });
        $("#seriesResultsButton").click(function () {
            layout.setSerieListVisible();
        });
        $("#route-serie").click(function () {
            layout.showSerieLevel();
        });
        $("#route-season").click(function () {
            layout.showSeasonLevel();
        });
        $("#episodeStreamButton").find(".feeling-lucky").click(function (evt) {
            manager.openEpisodesStreamPopup();
        });
        $("#episodeSubtitleButton").find(".feeling-lucky").click(function (evt) {
            manager.openEpisodesSubtitlePopup();
        });
        $("#episodeTrailerButton").find(".feeling-lucky").click(function (evt) {
            manager.openSeasonTrailer();
        });

        $("#movieTrailerButton").find(".feeling-lucky").click(function (evt) {
            manager.openMovieTrailer();
        });
        $("#movieStreamButton").find(".feeling-lucky").click(function (evt) {
            manager.openMovieStreamPopup();
        });
        $("#movieSubtitleButton").find(".feeling-lucky").click(function (evt) {
            manager.openMovieSubtitlePopup();
        });
        $(".video-closer").click(function (evt) {
            manager.closeVideo();
        });
        $(".youtube-closer").click(function (evt) {
            manager.closeYoutube();
        });
        $("#downloads-button").click(function (evt) {
            layout.setupDownloadSection();
        });

        $(".downloads-back").click(function (evt) {
            layout.goBackFromDownloads();
        });

        $("#footerFB").click(function (evt) {
            chrome.tabs.create({'url': 'https://www.facebook.com/getBringe'}, function (tab) {
            });
        });

        $("#footerChrome").click(function (evt) {
            chrome.tabs.create({'url': 'https://goo.gl/xrh6u1'}, function (tab) {
            });
        });

        $("#footerGithub").click(function (evt) {
            chrome.tabs.create({'url': 'https://github.com/sagar0907/bringe'}, function (tab) {
            });
        });

        manager.fetchTrendingMovies();

        util.listenEvent("getMovie", manager.getMovie);
        util.listenEvent("getSerie", manager.getSerie);
        util.listenEvent("getSeason", manager.getSeason);
        util.listenEvent("getEpisode", manager.getEpisode);
        util.listenEvent("openMovieStream", manager.openMovieStreamLink);
        util.listenEvent("downloadMovieStream", manager.downloadMovieStreamLink);
        util.listenEvent("downloadMovieSubtitle", manager.downloadMovieSubtitle);
        util.listenEvent("openSerieStream", manager.openSerieStreamLink);
        util.listenEvent("downloadSerieStream", manager.downloadSerieStreamLink);
        util.listenEvent("downloadEpisodeSubtitle", manager.downloadEpisodeSubtitle);
        util.listenEvent("getTrendingMovies", manager.getTrendingMovie);
        util.listenEvent("searchOnGoogle", manager.searchOnGoogle);
    }

    return {
        documentReady: documentReady
    }
});

$(document).ready(function () {
    var handler = _require(['handler'])[0];
    handler.documentReady();
});