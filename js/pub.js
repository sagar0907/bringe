/**
 * Created by sagar.ja on 28/01/17.
 */
function playMovie() {
    var playButton = document.getElementsByClassName("cover");
    if(playButton) {
        playButton[0].click();
    } else {
        setTimeout(playMovie, 200);
    }
}
function removeBS() {
    if(window.location.href.indexOf("https://fmovies.se/film") != -1) {
        $("body").hide();
    }
}
function setupFMovies() {
    if(window.location.href.indexOf("https://fmovies.se/film") != -1) {
        setTimeout(playMovie, 200);
    }
}

function getMovieDetails(url) {
    $.ajax({
        url: url,
        success: function (result) {
            var json = JSON.parse(result);
            if (json.data) {
                var data = json.data,
                    maxLabel = 0,
                    best = data.length - 1;
                for (var i = 0; i < data.length; i++) {
                    var obj = data[i];
                    var label = obj.label;
                    var no = label.match(/\d+/);
                    no = parseInt(no);
                    if(no > maxLabel) {
                        maxLabel = no;
                        best = i;
                    }
                }
                window.location.replace(data[best].file);
            }
        }
    });
}

(function(){
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.type == "linkToMovieDetails") {
                getMovieDetails(request.url);
            }
        });
})();

removeBS();
setTimeout(removeBS, 200);
document.addEventListener("DOMContentLoaded", function(event) {
    setupFMovies();
});
window.onbeforeunload = function(){
    chrome.runtime.sendMessage({type: "clear"});
};
