var windowId, movies,
    downloadIdList = [],
    cookie = {},
    searchFunction;
function util() {

    function getParameterByName(name, url) {
        if (isSet(name) && isSet(url)) {
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
        return null;
    }

    function removeParameterByName(name, url) {
        if (isSet(name) && isSet(url)) {
            var value = getParameterByName(name, url);
            if (isSet(value)) {
                var str = name + "=" + value;
                var start = url.indexOf(str);
                var end = start + str.length;
                if (end === url.length || url[end] === "#") {
                    url = url.substr(0, start - 1) + url.substr(end);
                } else {
                    url = url.substr(0, start) + url.substr(end + 1);
                }
            }
        }
        return url;
    }

    function setParameterByName(name, value, url) {
        if (isSet(name) && isSet(value) && isSet(url)) {
            var len = url.length;
            var paramString = name + "=" + value;
            url = removeParameterByName(name, url);
            var start = url.indexOf("?");
            if (start > -1) {
                if (len === start + 1) {
                    url += paramString;
                } else {
                    url = url.substr(0, start + 1) + paramString + "&" + url.substr(start + 1);
                }
            } else {
                var hashPos = url.indexOf("#");
                if (hashPos > -1) {
                    url = url.substr(0, hashPos) + "?" + paramString + url.substr(hashPos);
                } else {
                    url += "?" + paramString;
                }
            }
        }
        return url;
    }

    function getAllParams(url) {
        var vars = [], hash, obj;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash);
        }
        return vars;
    }

    function removeAllParams(url) {
        return url.split("?")[0] || "";
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

    function sendAjax(link, type, data, successFunction, errorFunction, headers) {
        headers = headers || {};
        $.ajax({
            url: link,
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

    return {
        getParameterByName: getParameterByName,
        setParameterByName: setParameterByName,
        removeParameterByName: removeParameterByName,
        getAllParams: getAllParams,
        removeAllParams: removeAllParams,
        isSet: isSet
    }
}
function downloadManager() {

    function addToDownloadIdList(id) {
        downloadIdList.push(id);
    }

    function getDownloadIdList() {
        return downloadIdList;
    }

    function addToDownload(link, name, ext) {
        chrome.downloads.setShelfEnabled(false);
        if (ext) {
            name += ext;
        }
        chrome.downloads.download({url: link, filename: "Bringe/" + name}, function (downloadId) {
            setTimeout(function () {
                chrome.downloads.setShelfEnabled(true);
            }, 200);
            addToDownloadIdList(downloadId);
        });
    }

    return {
        getDownloadIdList: getDownloadIdList,
        addToDownload: addToDownload
    }
}

function windowCreated(window) {
    windowId = window.id;
    chrome.windows.update(windowId, {state: "fullscreen"});
}
chrome.browserAction.onClicked.addListener(function (tab) {
    openWindow();
});
chrome.windows.onRemoved.addListener(function (winId) {
    if (winId == windowId)
        windowId = null;
});
function openWindow() {
    if (windowId) {
        chrome.windows.update(windowId, {focused: true});
    } else {
        chrome.windows.create({'url': 'html/window.html', 'type': 'popup', 'state': 'maximized'}, windowCreated);
    }
}
function closeWindow() {
    chrome.windows.remove(windowId);
    windowId = null;
}

function openLinkInBrowser(link) {
    chrome.tabs.create({'url': link});
}

function getMovies123Details(link, theCookie, id, callback) {
    cookie[id] = theCookie;
    $.ajax({
        url: link + "&cookiekey=" + theCookie.key + "&cookieval" + theCookie.val,
        method: 'GET',
        dataType: 'json',
        success: function (result) {
            callback(result);
        }
    })
}

function webListener() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
            if (details.url.indexOf("fmovies") != -1) {
                var refererSet = false;
                for (var i = 0; i < details.requestHeaders.length; i++) {
                    if (details.requestHeaders[i].name.toLowerCase() == "referer") {
                        details.requestHeaders[i].value = 'https://fmovies.is/film/';
                        refererSet = true;
                    }
                }
                if (!refererSet) {
                    details.requestHeaders.push(
                        {"name": "Referer", "value": "https://fmovies.se/film/"}
                        );
                }
                return {requestHeaders: details.requestHeaders};
            }
        },
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]
    );
}

function setSearchFunction(func) {
    searchFunction = func;
}

function sendQueryMessage(text) {
    if (searchFunction) {
        searchFunction(text);
    }
}
function omniboxListener() {
    chrome.omnibox.onInputEntered.addListener(
        function (text, disposition) {
            openWindow();
            if (text != "") {
                setTimeout(function () {
                    sendQueryMessage(text);
                }, 1000);
            }
        });
}
function shortcutListener() {
    chrome.commands.onCommand.addListener(function (command) {
        if (command === 'launch-bringe') {
            openWindow();
        }
    });
}
webListener();
omniboxListener();
shortcutListener();

function sendMessage(tabId, msg) {
    chrome.tabs.sendMessage(tabId, msg, function (response) {
    });
}