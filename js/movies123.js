/**
 * Created by sagar.ja on 21/02/17.
 */
function movies123() {
    var callback;
    var base_url = "http://123movies.org";
    function failFunction() {
        if (page != "movie") return;
        callback({site:"movies123", status: false});
    }
    function successFunction(linkDetails) {
        if (page != "movie") return;
        callback({site:"movies123", status: true, linkDetails: linkDetails});
    }
    function movies123Helper() {
        var superString = 'n1sqcua67bcq9826avrbi6m49vd7shxkn985mhodk06twz87wwxtp3dqiicks2dfyud213k6ygiomq01s94e4tr9v0k887bkyud213k6ygiomq01s94e4tr9v0k887bkqocxzw39esdyfhvtkpzq9n4e7at4kc6k8sxom08bl4dukp16h09oplu7zov4m5f8';
        var first, second, cookie={};
        function encode64(a) {
            var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                i = 0,
                cur, prev, byteNum, result = [];
            while (i < a.length) {
                cur = a.charCodeAt(i);
                byteNum = i % 3;
                switch (byteNum) {
                    case 0:
                        result.push(b.charAt(cur >> 2));
                        break;
                    case 1:
                        result.push(b.charAt((prev & 3) << 4 | (cur >> 4)));
                        break;
                    case 2:
                        result.push(b.charAt((prev & 0x0f) << 2 | (cur >> 6)));
                        result.push(b.charAt(cur & 0x3f));
                        break
                }
                prev = cur;
                i++
            }
            if (byteNum == 0) {
                result.push(b.charAt((prev & 3) << 4));
                result.push("==");
            } else if (byteNum == 1) {
                result.push(b.charAt((prev & 0x0f) << 2));
                result.push("=");
            }
            return result.join("");
        }

        function jav(a) {
            var b = a + '',
                code = b.charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) {
                var c = code;
                if (b.length === 1) {
                    return code;
                }
                var d = b.charCodeAt(1);
                return ((c - 0xD800) * 0x400) + (d - 0xDC00) + 0x10000
            }
            if (0xDC00 <= code && code <= 0xDFFF) {
                return code;
            }
            return code;
        }
        function getMerged() {
            var a = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var b = 16;
            var c = '';
            for (var i = 0; i < b; i++) {
                var d = Math.floor(Math.random() * a.length);
                c += a.substring(d, d + 1);
            }
            return c;
        }
        function cookieFunction() {
            var aa = getMerged();
            var bb = md5(second + superString.substring(46, 58));
            cookie.key = bb;
            cookie.val = aa;
            return aa;
        }
        function uncensored(a, b) {
            var c = "";
            var i;
            for (i = 0; i < a.length; i++) {
                var d = a.substr(i, 1);
                var e = b.substr(i % b.length - 1, 1);
                d = Math.floor(jav(d) + jav(e));
                d = String.fromCharCode(d);
                c = c + d;
            }
            return encode64(c);
        }
        function loadEpisode(a, b) {
            first = a;
            second = b;
            var aa = cookieFunction();
            var c = uncensored(second + superString.substring(8, 40), aa);
            var link = base_url + 'ajax/v2_get_sources/' + second + '?hash=' + encodeURIComponent(c);
            background.getMovies123Details(link, cookie, second, function (result) {
                if(result && result.playlist && result.playlist[0] && result.playlist[0].sources && result.playlist[0].sources.length > 0) {
                    var sources = result.playlist[0].sources,
                        sourceList = [];
                    for(var i=0; i < sources.length; i++) {
                        var source = sources[i];
                        source.src = source.file;
                        source.res = parseInt(source.label);
                        source.source = "123movies";
                        source.id = a;
                        thisMovie.streamLinkDetails = thisMovie.streamLinkDetails || [];
                        sourceList.push(source);
                    }
                    successFunction(sourceList);
                } else {
                    failFunction();
                }
            });
        }
        function getDetailFromPair(pair) {
            loadEpisode(pair.first, pair.second);
        }
        return {
            getDetailFromPair: getDetailFromPair
        }
    }

    function getMovies123SearchTerm() {
        var searchTerm = thisMovie.name;
        searchTerm = searchTerm.trim().toLowerCase().replace(/\(.*\)/,"").replace(/^the/, "").replaceAll(/,| -|- /," ");
        searchTerm = searchTerm.replace("part", "");
        searchTerm = searchTerm.replace(/\d*$/,"").replaceAll(/\s\s+/," ").trim().replaceAll(" ", "+");
        return searchTerm;
    }

    function getMovies123SearchedMovie(movieItems) {
        if(movieItems.length == 1) {
            return movieItems;
        }
        for(var i=0; i<movieItems.length; i++) {
            var movieItem = movieItems[i];
            var movieName = $(movieItem).find(".ss-title").text();
            if(util().isSameMovieName(movieName, thisMovie.name)) {
                return movieItem;
            }
        }
        failFunction();
    }

    function extractPairFromFunc(loadFunc) {
        var rem = loadFunc.replace("loadEpisode(", "").replace(")", "");
        rem = rem.split(",");
        rem[0] = parseInt(rem[0]);
        rem[1] = parseInt(rem[1]);
        if(rem[0]<12 || rem[0]>15) {
            return {first: rem[0], second: rem[1]};
        }
        return null;
    }
    function getMovies123Pairs(servers) {
        var pairs = [];
        for(var i=0; i<servers.length; i++) {
            var server = servers[i];
            var link = $(server).find("a.btn-eps");
            var loadFunc = link.attr("onclick");
            var pair = extractPairFromFunc(loadFunc);
            if(pair) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

    function getMovies123MovieLinks(pairs) {
        for(var i=0;i<pairs.length;i++) {
            var pair = pairs[i];
            movies123Helper().getDetailFromPair(pair);
        }
    }

    function episodesSuccessFunction(result) {
        if (page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            servers = myDoc.find(".le-server");
        if (servers.length > 0) {
            var pairs = getMovies123Pairs(servers);
            if (pairs.length > 0) {
                getMovies123MovieLinks(pairs);
                return;
            }
        }
        failFunction();
    }

    function moviePageSuccessFunction(result) {
        if (page != "movie") return;
        var doc = new DOMParser().parseFromString(result, "text/html"),
            myDoc = $(doc),
            movies123MovieId = myDoc.find("input[name='movie_id']").attr("value"),
            movies123FetchLink = base_url + "/ajax/v2_get_episodes/" + movies123MovieId;
        util().sendAjax(movies123FetchLink, "GET", {}, episodesSuccessFunction, failFunction);
    }

    function searchSuccessFunction(result) {
        if (page != "movie") return;
        result = JSON.parse(result);
        if(result.status == 1 && result.message == "Success") {
            var content = result.content;
            var doc = new DOMParser().parseFromString(content, "text/html"),
                myDoc = $(doc);
            var movieItems = myDoc.find("li:not(.ss-bottom)");
            if (movieItems.length > 0) {
                var movieItem = getMovies123SearchedMovie(movieItems);
                if (movieItem) {
                    var movies123MoviePageLink = $(movieItem).find(".ss-title").attr("href") + "watching.html";
                    util().sendAjax(movies123MoviePageLink, "GET", {}, moviePageSuccessFunction, failFunction);
                    return;
                }
            }
        }
        failFunction();
    }
    function loadMovies123(func) {
        callback = func;
        var salt = "x6a4moj7q8xq6dk5";
        var searchName = getMovies123SearchTerm();
        var link = base_url + '/ajax/search.php';
        util().sendAjax(link, "POST", {keyword: searchName, token: md5(searchName + salt)}, searchSuccessFunction, failFunction);
    }
    return {
        loadMovies123: loadMovies123
    }
}