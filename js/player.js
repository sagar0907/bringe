/**
 * Created by sagar.ja on 06/05/17.
 */
_define('player', [window], function (window) {
    var vid = {};
    $(document).ready(function () {

        var bringePlayer = $("#bringePlayer");
        var video = $("#player")[0];
        vid.video = video;
        vid.source = $("source");
        var playpause = $("#playpause");
        var rewind = $("#rewind");
        var forward = $("#forward");
        var mutebutton = $('#mutebutton');
        var volumecontrol = $('#volumecontrol');
        var fullscr = $("#fullscr");
        var seekbar = $('#seekbar')[0];
        var seekGroup = $('#seekGroup');
        var seenRange = $('#seenRange');
        var loadedRange = $('#loadedRange');
        var volumeSet = $('#volumeSet');

        var playerPopup = $("#playerPopup");
        var playerPlay = $("#playerPlay");
        var playerLoader = $("#playerLoader");
        var playerNotification = $("#playerNotification");

        var playIcon = $('<i class="fa fa-play" aria-hidden="true"></i>');
        var pauseIcon = $('<i class="fa fa-pause" aria-hidden="true"></i>');
        var muteButton = $('<i class="fa fa-volume-up" aria-hidden="true"></i>');
        var unmuteButton = $('<i class="fa fa-volume-off" aria-hidden="true"></i>');
        var fullScreenButton = $('<i class="fa fa-expand" aria-hidden="true"></i>');
        var smallScreenButton = $('<i class="fa fa-compress" aria-hidden="true"></i>');

        video.ondurationchange = setupSeekbar;
        video.onfullscreenchange = screenChangeHandle;
        video.onwebkitfullscreenchange = screenChangeHandle;
        video.onprogress = progressHandler;
        video.onpause = playpauseHandler;
        video.onplay = playpauseHandler;
        video.onended = videoEndHandler;
        video.onvolumechange = volumeChangeHandler;
        video.ontimeupdate = timeUpdateHandler;
        video.onwaiting = stalledHandler;
        video.onplaying = hideVideoLoader;
        seekbar.onchange = seekVideo;
        volumecontrol[0].onchange = updateVolume;

        playpause.click(function () {
            playVideo();
        });
        rewind.click(function () {
            rewindVideo(10);
        });
        forward.click(function () {
            forwardVideo(10);
        });
        mutebutton.click(function () {
            muteOrUnmute();
        });
        fullscr.click(function () {
            fullscrVideo();
        });
        playerPopup.click(function () {
            playVideo();
        });

        function playpauseHandler() {
            if (video.paused) {
                playpause.html(playIcon);
                showPlayPopup();
                hideVideoLoader();
            } else {
                playpause.html(pauseIcon);
                hidePlayPopup();
                if (video.readyState > 3) {
                    hideVideoLoader();
                } else {
                    stalledHandler();
                }
            }
        }

        function videoEndHandler() {
            playpause.html(playIcon);
        }

        function showPlayPopup() {
            playerPlay.show();
        }

        function hidePlayPopup() {
            playerPlay.hide();
        }

        function stalledHandler() {
            playerLoader.show();
        }

        function hideVideoLoader() {
            playerLoader.hide();
        }

        function volumeChangeHandler() {
            if (video.muted) {
                mutebutton.html(unmuteButton);
            } else {
                mutebutton.html(muteButton);
            }
            volumecontrol.val(video.volume);
            volumeSet.css("width", (video.volume * 100) + "%");
        }

        function isFullScreen() {
            return (document.fullScreenElement || document.webkitFullscreenElement);
        }

        function playVideo() {
            if ((video.ended || video.paused)) {
                var p = video.play();
                if (p && (typeof Promise !== 'undefined') && (p instanceof Promise)) {
                    p.catch(function(){});
                }
            } else {
                video.pause();
            }
        }

        function rewindVideo(value) {
            video.currentTime -= value;
        }

        function updateVolume() {
            video.volume = volumecontrol.val();
            video.muted = false;
        }

        function muteOrUnmute() {
            video.muted = !video.muted;
        }

        function forwardVideo(value) {
            video.currentTime += value;
        }

        function fullscrVideo() {
            if (document.fullScreenElement) {
                document.exitFullscreen();
            } else if (document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            } else {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                }
            }
        }

        function screenChangeHandle() {
            if (document.fullScreenElement || document.webkitFullscreenElement) {
                fullscr.html(smallScreenButton);
                bringePlayer.addClass("fullScreen");
            } else {
                fullscr.html(fullScreenButton);
                bringePlayer.removeClass("fullScreen");
                clearTimeout(timer);
                $('html').css({cursor: 'default'});
                $("#playerControls").show();
            }
        }

        function formatUnit(t) {
            if (t > 9) {
                return t;
            }
            return "0" + t;
        }

        function formatTime(t) {
            if (t < 0) t = 0;
            if (!t && t !== 0) return "";
            var sec = Math.floor(t);
            if (sec > 59) {
                var min = Math.floor(sec / 60);
                sec = sec % 60;
            }
            if (min > 59) {
                var hr = Math.floor(min / 60);
                min = min % 60;
            }
            if (hr > 0) {
                return formatUnit(hr) + ":" + formatUnit(min) + ":" + formatUnit(sec);
            }
            if (min > 0) {
                return formatUnit(min) + ":" + formatUnit(sec);
            }
            return "0:" + formatUnit(sec);
        }

        function onTrackedVideoFrame(currentTime, duration) {
            $("#currentTime").html(currentTime);
            $("#duration").html(" / " + duration);
        }

        function setupSeekbar() {
            seekbar.max = video.duration;
            seekbar.value = video.currentTime;
            volumecontrol.val(video.volume);
            volumeSet.css("width", (video.volume * 100) + "%");
        }

        function seekVideo() {
            video.currentTime = seekbar.value;
        }

        function timeUpdateHandler() {
            seekbar.value = video.currentTime;
            seenRange.css("width", (video.currentTime / video.duration) * 100 + "%");
            onTrackedVideoFrame(formatTime(this.currentTime), formatTime(this.duration));
        }

        function progressHandler() {
            var range = 0;
            var bf = this.buffered;
            var time = this.currentTime;
            var length = bf.length;
            if (!length && range >= length) return;

            while (!(bf.start(range) <= time && time <= bf.end(range))) {
                range += 1;
                if (range >= length) return;
            }
            var loadEndPercentage = (bf.end(range) / this.duration) * 100;
            loadedRange.css("width", loadEndPercentage + "%");
        }

        function calcSliderPos(e) {
            var pos = ((e.offsetX - 2) / (seekbar.clientWidth - 4)) * video.duration;
            if (pos < 0) return 0;
            if (pos > video.duration) return video.duration;
            return pos;
        }

        seekGroup.mousemove(function (e) {
            var valueHover = calcSliderPos(e);
            var textPart = $('#peekTimeText');
            textPart.html(formatTime(valueHover));
            textPart.show();
            textPart.css("left", Math.min(Math.max(20, (e.offsetX - (textPart[0].offsetWidth / 2))), (e.target.clientWidth - 60)));
            textPart.css("top", -20);
        });
        seekGroup.mouseleave(function (e) {
            var textPart = $('#peekTimeText');
            textPart.hide();
        });

        var timer, justHidden;
        $(document).mousemove(function () {
            if (!justHidden && isFullScreen()) {
                justHidden = false;
                $('html').css({cursor: 'default'});
                $("#playerControls").show();
                clearTimeout(timer);
                timer = setTimeout(hideControls, 4000);
            }
        });
        $(document).click(function () {
            if (!justHidden && isFullScreen()) {
                justHidden = false;
                $('html').css({cursor: 'default'});
                $("#playerControls").show();
                clearTimeout(timer);
                timer = setTimeout(hideControls, 4000);
            }
        });
        function hideControls() {
            if (isFullScreen()) {
                $('html').css({cursor: 'none'});
                $("#playerControls").hide();
                justHidden = true;
                setTimeout(function () {
                    justHidden = false;
                }, 500);
            }
        }
    });

    function setupVideo(obj) {
        vid.src = obj.src || "https://r4---sn-np2a-cvhz.googlevideo.com/videoplayback?id=b4fe0bba2d927538&itag=37&source=webdrive&requiressl=yes&ttl=transient&pl=24&ei=AcANWbLVEMHrqAXA1rhA&mime=video/mp4&lmt=1471607177524821&ip=27.106.9.245&ipbits=0&expire=1494087745&sparams=ei,expire,id,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,pcm2cms,pl,requiressl,source,ttl&signature=211E3ADE91C5FA6759B42997DACBBA2CAE0949F3.11A8AE12A3389D6F82CF990E7334053B555DD796&key=cms1&app=explorer&cms_redirect=yes&mm=31&mn=sn-np2a-cvhz&ms=au&mt=1494074246&mv=m&pcm2cms=yes";
        vid.type = obj.type || "video/mp4";
        vid.poster = obj.poster;
        vid.source.attr("src", vid.src);
        vid.source.attr("type", vid.type);
        if (obj.poster) {
            $(vid.video).attr("poster", obj.poster);
        }
        vid.video.load();
    }

    function removeVideo() {
        delete vid.src;
        delete vid.type;
        delete vid.poster;
        vid.video.currentTime = 0;
        vid.source.attr("src", "");
        vid.source.attr("type", "");
        $(vid.video).attr("poster", "");
        $("#playerLoader").hide();
        $("#playerPlay").show();
        $("#playpause").html($('<i class="fa fa-play" aria-hidden="true"></i>'));
        $('#seenRange').css("width", "0");
        $("#loadedRange").css("width", "0");
        vid.video.load();
    }

    return {
        setupVideo: setupVideo,
        removeVideo: removeVideo
    }
});

