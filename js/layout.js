_define('layout', [window, 'util', 'bringe'], function (window, util, bringe) {

    var iconMap = {
        facebook: "fa-facebook-square",
        twitter: "fa-twitter-square",
        google: "fa-google-plus-square",
        instagram: "fa-instagram",
        snapchat: "fa-snapchat-square",
        youtube: "fa-youtube-square",
        tumblr: "fa-tumblr-square"
    };
    var globalDivs = {
        trendingMovieObj: $('<div class="trending-movie-box"> <div class="tr-movie-img"> <img> </div>' +
            '<div class="tr-bottom"> <div class="tr-details"><div class="tr-name"></div></div> </div> <div class="tr-rate-box">' +
            '<div class="tr-rate"></div><i class="fa fa-heart" aria-hidden="true"></i> </div> </div>'),
        searchMovieDivObj: $('<div class="searchMovie">' +
            '<div class="searchMovieImage"> <img> </div>' +
            '<div class="searchMovieDetail"> <div class="searchMovieName"></div> <div class="searchMovieSubline"></div> </div> ' +
            '<div class="searchMovieRating">' +
            '<div class="searchMovieRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>'),
        searchSerieDivObj: $('<div class="searchSerie">' +
            '<div class="searchSerieImage"> <img> </div>' +
            '<div class="searchSerieDetail"> <div class="searchSerieName"></div> <div class="searchSerieYear"></div> </div> ' +
            '<div class="searchSerieRating">' +
            '<div class="searchSerieRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>'),
        seasonListDivObj: $('<div class="seasonListDiv">' +
            '<div class="seasonListImage"> <img> </div>' +
            '<div class="seasonListDetail">' +
            '<div class="seasonListName"></div> <div class="seasonListConsensus"></div> <div class="seasonListInfo"></div> </div> ' +
            '<div class="seasonListRating">' +
            '<div class="seasonListRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>'),
        episodeListDivObj: $('<div class="episodeListDiv">' +
            '<div class="episodeListLeft">' +
            '<div class="episodeListNumber"></div>' +
            '<div class="episodeListDate"></div></div>' +
            '<div class="episodeListDetail">' +
            '<div class="episodeListName"></div> <div class="episodeListSynopsis"></div> </div> ' +
            '<div class="episodeListRating">' +
            '<div class="episodeListRatingValue"></div> <i class="fa fa-heart" aria-hidden="true"></i> </div> </div>'),
        castMemberDivObj: $('<div class="col-lg-3 col-md-4 col-sm-6"><div class="cast-member"><div class="row">' +
            '<div class="cast-image"> <img></div><div class="cast-details">' +
            '<div class="cast-name"></div> <div class="cast-role"></div></div></div> </div></div>'),
        watchItemDivObj: $('<div class="watch-item"><div class="watch-box"><img></div></div>'),
        movieInfoDivObj: $('<div class="movie-info-box row"> <div class="col-xs-4"> <div class="movie-info-label"></div>' +
            '</div> <div class="col-xs-8"> <div class="movie-info-value"></div> </div> </div>'),
        reviewDivObj: $('<div class="movie-review"> <div class="review-text"> </div>' +
            '<div class="review-source"><div class="review-source-person"> </div>' +
            '<div class="review-source-website"> </div></div> </div>'),
        downloadItemDivObj: $('<div class="download-item"> <div class="row"> <div class="download-file-icon"><img></div>' +
            '<div class="download-file-data"> <div class="download-file-name"></div> <div class="download-file-link"><a></a></div>' +
            '<div class="download-progress-detail"></div> <div class="download-progress-bar"><div class="download-complete-part"></div></div>' +
            '<div class="download-file-options"></div><div class="download-file-remove"></div> </div> </div> </div>')
    };
    function hideAllSection() {
        $(".search-wrapper").hide();
        $(".results-wrapper").hide();
        $(".trending-wrapper").hide();
        $(".movie-wrapper").hide();
        $(".serie-wrapper").hide();
        $(".downloads-wrapper").hide();
    }

    function clearAllData(except) {
        clearAllMovieData();
        clearAllTVData();
        clearSearchList();
        clearAllDownloadData();
    }

    function showHome() {
        bringe.page = "home";
        $("#search-input").val("");
        $("#search-input").focus();
        $(".search-wrapper").show();
        $(".trending-wrapper").show();
        $(".results-wrapper").show();
    }

    function hideTrending() {
        $(".trending-wrapper").hide();
    }

    function showDownloadSection() {
        $(".downloads-wrapper").show();
    }

    function showMoviePart() {
        bringe.page = "movie";
        $(".movie-wrapper").show();
    }

    function showSeriePart() {
        bringe.page = "serie";
        showActiveSerieLevel();
        $(".serie-wrapper").show();
    }

    function showActiveSerieLevel() {
        if (bringe.serieLevel === "serie") {
            showSerieLevel();
        } else if (bringe.serieLevel === "season") {
            showSeasonLevel();
        } else if (bringe.serieLevel === "episode") {
            showEpisodeLevel();
        }
    }

    function showSerieLevel() {
        bringe.page = "serie";
        bringe.serieLevel = "serie";
        $("#route-serie").html("");
        $("#route-season").html("");
        $("#route-episode").html("");
        $("#route-serie").hide();
        $("#route-season").hide();
        $("#route-episode").hide();
        $(".serie-wrapper").show();
        $(".season-level").hide();
        $(".episode-level").hide();
        $(".serie-level").show();
    }

    function showSeasonLevel() {
        bringe.page = "serie";
        bringe.serieLevel = "season";
        if (bringe.serie && bringe.serie.onlySeason) {
            $("#route-serie").html('');
            $("#route-serie").hide();
        } else {
            $("#route-serie").html(bringe.serie.title);
            $("#route-serie").show();
        }
        $("#route-season").html(bringe.season.title);
        $("#route-episode").html("");
        $("#route-episode").hide();
        $("#route-season").show();
        $("#route-episode").hide();
        $(".serie-wrapper").show();
        $(".serie-level").hide();
        $(".episode-level").hide();
        $(".season-level").show();
    }

    function showEpisodeLevel() {
        bringe.page = "serie";
        bringe.serieLevel = "episode";
        if (bringe.serie && bringe.serie.onlySeason) {
            $("#route-serie").html('');
            $("#route-serie").hide();
        } else {
            $("#route-serie").html(bringe.serie.title);
            $("#route-serie").show();
        }
        $("#route-season").html(bringe.season.title);
        $("#route-episode").html(bringe.episode.title);
        $("#route-season").show();
        $("#route-episode").show();
        $(".serie-wrapper").show();
        $(".serie-level").hide();
        $(".season-level").hide();
        $(".episode-level").show();
    }

    function goToHome() {
        hideAllSection();
        clearAllData();
        removeSearchResultText();
        showHome();
    }

    function setupDownloadSection() {
        hideAllSection();
        clearAllDownloadData();
        placeDownloadSection();
        showDownloadSection();
    }

    function goBackFromDownloads() {
        if (bringe.page == "home") {
            hideAllSection();
            showHome();
        } else if (bringe.page == "movie") {
            hideAllSection();
            showMoviePart();
        } else if (bringe.page == "serie") {
            hideAllSection();
            showSeriePart();
        }
    }

    function clearAllMovieData() {
        bringe.movie = {};
        var movieWrapper = $(".movie-wrapper");
        var movieDataSection = $(".movie-data-section");
        $(".movie-rating-box").hide();
        $("#movie-reviews-header").hide();
        $("#movie-social-header").hide();
        $("#movieStreamButton").hide();
        $("#movieTrailerButton").hide();
        $("#movieSubtitleButton").hide();
        movieWrapper.find(".cast-section").hide();
        movieWrapper.find(".watch-section").hide();
        movieWrapper.find(".synopsis-section").hide();
        movieWrapper.find(".movieInfo-section").hide();
        movieDataSection.hide();
        $(".movie-download-section").hide();
        movieWrapper.hide();
        movieWrapper.find(".cast-list").html("");
        movieWrapper.find("#movie-watch-list").html("");
        $("#movie-synopsis").html("");
        $("#movie-reviews").html("");
        $("#movieSocialList").html("");
        $("#movieInfoList").html("");
        $(".movie-poster").find("img").attr("src", "");
        $(".movieLoader").remove();
        movieDataSection.find(".movie-name").html("");
        movieDataSection.find(".movie-year").html("");
        movieDataSection.find(".movie-rating").html("");
    }

    function clearAllTVData() {
        $("#link-route").hide();
        clearAllSerieData();
        clearAllSeasonData();
        clearAllEpisodeData();
    }

    function clearAllSerieData() {
        bringe.serie = {};
        var wrapper = $(".serie-level");
        var serieDataSection = $(".serie-data-section");
        wrapper.find(".serie-rating-box").hide();
        wrapper.find(".cast-section").hide();
        wrapper.find(".seasons-section").hide();
        wrapper.find(".synopsis-section").hide();
        wrapper.find(".serie-data-section").hide();
        wrapper.find(".serieInfo-section").hide();
        wrapper.hide();
        wrapper.find(".cast-list").html("");
        wrapper.find(".seasons-list").html("");
        $("#serie-synopsis").html("");
        $("#serieInfoList").html("");
        $(".serie-poster").find("img").attr("src", "");
        $(".serieLoader").remove();
        serieDataSection.find(".serie-name").html("");
        serieDataSection.find(".serie-year").html("");
        serieDataSection.find(".serie-rating").html("");
    }

    function clearAllSeasonData() {
        bringe.season = null;
        var wrapper = $(".season-level");
        var serieDataSection = $(".season-data-section");
        wrapper.find(".season-rating-box").hide();
        wrapper.find(".cast-section").hide();
        wrapper.find(".episodes-section").hide();
        wrapper.find(".synopsis-section").hide();
        wrapper.find(".season-data-section").hide();
        wrapper.find(".seasonInfo-section").hide();
        wrapper.hide();
        wrapper.find(".cast-list").html("");
        wrapper.find(".episodes-list").html("");
        $("#season-synopsis").html("");
        $("#seasonInfoList").html("");
        $(".season-poster").find("img").attr("src", "");
        $(".seasonLoader").remove();
        serieDataSection.find(".season-name").html("");
        serieDataSection.find(".season-year").html("");
        serieDataSection.find(".season-rating").html("");
    }

    function clearAllEpisodeData() {
        bringe.episode = null;
        var wrapper = $(".episode-level");
        var serieDataSection = $(".episode-data-section");
        $("#episodeStreamButton").hide();
        $("#episodeTrailerButton").hide();
        $("#episodeSubtitleButton").hide();
        wrapper.find(".episode-rating-box").hide();
        wrapper.find(".cast-section").hide();
        wrapper.find(".synopsis-section").hide();
        wrapper.find(".episode-data-section").hide();
        wrapper.find("#episode-download-section").hide();
        wrapper.find(".episodeInfo-section").hide();
        wrapper.find(".episodeSynopsis-section").hide();
        wrapper.find(".watch-section").hide();
        wrapper.hide();
        wrapper.find(".cast-list").html("");
        $("#episode-synopsis").html("");
        $("#episodeInfoList").html("");
        $("#episode-watch-list").html("");
        $(".episode-poster").find("img").attr("src", "");
        $(".episodeLoader").remove();
        serieDataSection.find(".episode-name").html("");
        serieDataSection.find(".episode-year").html("");
        serieDataSection.find(".episode-rating").html("");
    }

    function clearAllDownloadData() {
        $("#download-list").html("");
    }

    function resetDownloadItemBox(downloadItemBox, id) {
        var downloads = _require(['downloads'])[0];
        downloads.getAndPlaceDownloadItemById(id, function (downloadItem) {
            if (downloadItem.exists) {
                var fileProgressBar = downloadItemBox.find(".download-progress-bar");
                var fileCompletePart = fileProgressBar.find(".download-complete-part");
                var fileProgressDetail = downloadItemBox.find(".download-progress-detail");
                var fileActionBox = downloadItemBox.find(".download-file-options");
                var fileRemoveBox = downloadItemBox.find(".download-file-remove");
                var detail = "";
                if (downloadItem.state == "in_progress") {
                    var last = fileProgressDetail.data("completed");
                    fileProgressDetail.data("completed", downloadItem.bytesReceived);
                    if (last && !downloadItem.paused) {
                        detail += downloads.getSizeInWords(downloadItem.bytesReceived - last) + "/s - ";
                    }
                    detail += downloads.getSizeInWords(downloadItem.bytesReceived) + " of " + downloads.getSizeInWords(downloadItem.totalBytes) + ", ";
                    if (downloadItem.paused) {
                        detail += "Paused ";
                    }
                    if (downloadItem.estimatedEndTime) {
                        var estimatedEndTime = new Date(downloadItem.estimatedEndTime);
                        var nowTime = new Date();
                        detail += util.getTimeInWords(estimatedEndTime.getTime() - nowTime.getTime()) + " left";
                    }
                    fileProgressDetail.html(detail);
                    var completePercentage = downloads.getCompletedPercentage(downloadItem.bytesReceived, downloadItem.totalBytes);
                    fileCompletePart.css("width", completePercentage + "%");
                    fileProgressBar.css("height", "3px");
                    if (downloadItem.paused == false && fileActionBox.find(".pause-button").length == 0) {
                        fileActionBox.html("");
                        fileActionBox.append(downloads.getPauseButton(downloadItem.id));
                        fileActionBox.append(downloads.getCancelButton(downloadItem.id));
                    } else if (downloadItem.paused && fileActionBox.find(".resume-button").length == 0) {
                        fileActionBox.html("");
                        fileActionBox.append(downloads.getResumeButton(downloadItem.id));
                        fileActionBox.append(downloads.getCancelButton(downloadItem.id));
                    }
                } else if (downloadItem.state == "interrupted" && fileActionBox.find(".retry-button").length == 0) {
                    fileActionBox.html("");
                    fileActionBox.append(downloads.getRetryButton(downloadItem));
                    fileProgressDetail.html("");
                    fileProgressBar.css("height", "0px");
                    fileRemoveBox.html("x");
                } else if (downloadItem.state == "complete" && fileActionBox.find(".open-button").length == 0) {
                    fileActionBox.html("");
                    fileProgressDetail.html("");
                    fileProgressBar.css("height", "0px");
                    fileActionBox.append(downloads.getOpenButton(downloadItem.id));
                    fileActionBox.append(downloads.getShowInFolderButton(downloadItem.id));
                    fileRemoveBox.html("x");
                }
                setTimeout(function () {
                    resetDownloadItemBox(downloadItemBox, id)
                }, 1000);
            } else {
                downloadItemBox.remove();
            }
        });
    }

    function placeDownloadSection() {
        $("#download-list").html("");
        bringe.downloadActive = true;
        chrome.downloads.search({filenameRegex: "Bringe", exists: true}, function (results) {
            var downloadList = [], i;
            for (i = 0; i < results.length; i++) {
                var item = results[i];
                if (item.byExtensionId == "kjkmhkicphnkbfgafbigdklljcmogmpg") {
                    downloadList.push(item);
                }
            }
            downloadList.sort(util.downloadComparator);
            var downloadListBox = $("#download-list");
            var downloads = _require(['downloads'])[0];
            for (i = 0; i < downloadList.length; i++) {
                downloads.getAndPlaceDownloadItemById(downloadList[i].id, function (downloadItem) {
                    var downloadItemBox = globalDivs.downloadItemDivObj.clone();
                    downloadItemBox.find(".download-file-name").html(util.extractFileName(downloadItem.filename));
                    var fileLinkBox = downloadItemBox.find(".download-file-link");
                    var fileIconBox = downloadItemBox.find(".download-file-icon");
                    var fileRemoveBox = downloadItemBox.find(".download-file-remove");
                    fileLinkBox.html(downloadItem.finalUrl);
                    fileLinkBox.data("href", downloadItem.finalUrl);
                    downloadListBox.append(downloadItemBox);
                    downloads.getAndPlaceDownloadItemIcon(downloadItem.id, fileIconBox, function (iconUrl, iconBox) {
                        iconBox.find("img").attr("src", iconUrl);
                    });
                    fileLinkBox.click(function (evt) {
                        var link = evt.target;
                        background.openLinkInBrowser($(link).data("href"));
                    });
                    fileRemoveBox.click(function () {
                        bringe.downloadActive = false;
                        chrome.downloads.erase({id: downloadItem.id}, function () {
                            placeDownloadSection();
                        });
                    });
                    resetDownloadItemBox(downloadItemBox, downloadItem.id);
                });
            }
        });
    }

    function showTrendingMovies(movies) {
        var trendingList = $("#trendingList"),
            trendingMovieDiv;
        util.each(movies, function (movie, i) {
            if (i < 15) {
                trendingMovieDiv = globalDivs.trendingMovieObj.clone();
                trendingMovieDiv.find('.tr-movie-img img').attr("src", movie.posters.primary);
                trendingMovieDiv.find('.tr-name').html(movie.title);
                trendingMovieDiv.find('.tr-rate').html(movie.tomatoScore);
                trendingMovieDiv.attr("data-index", i);
                trendingMovieDiv.click(function () {
                    var box = $(this);
                    util.fireEvent("getTrendingMovies", [box.attr("data-index")]);
                });
                trendingList.append(trendingMovieDiv);
            }
        });
    }

    function placeMoviesList(movies) {
        var movie, i,
            resultOptionBar = $(".resultOptionBar"),
            moviesResultsList = $("#moviesResultsList");
        moviesResultsList.html("");
        resultOptionBar.find('#moviesResultsButton').show();
        for (i = 0; i < movies.length; i++) {
            movie = movies[i];
            if (!movie.meterScore) {
                continue;
            }
            var searchMovieDiv = globalDivs.searchMovieDivObj.clone();
            searchMovieDiv.attr("id", "movieIndex_" + i);
            if (movie.image) {
                movie.image = movie.image.replace("https", "http");
                searchMovieDiv.find(".searchMovieImage").find("img").attr("src", movie.image);
            }
            if (movie.name) {
                if (movie.year) {
                    searchMovieDiv.find(".searchMovieName").html(movie.name + " (" + movie.year + ")");
                } else {
                    searchMovieDiv.find(".searchMovieName").html(movie.name);
                }
            }
            if (movie.subline) {
                searchMovieDiv.find(".searchMovieSubline").html(movie.subline);
            }
            if (movie.meterScore) {
                searchMovieDiv.find(".searchMovieRatingValue").html(movie.meterScore);
            } else {
                searchMovieDiv.find(".searchMovieRating").remove();
            }
            moviesResultsList.append(searchMovieDiv);
        }
        $(".searchMovie").click(function (e) {
            var movieId = $(this).attr("id");
            var movieIndex = movieId.split("_")[1];
            util.fireEvent("getMovie", [movieIndex]);
        });
    }

    function placeSeriesList(series) {
        var serie, i,
            resultOptionBar = $(".resultOptionBar"),
            seriesResultsList = $("#seriesResultsList");
        seriesResultsList.html("");
        resultOptionBar.find('#seriesResultsButton').show();
        for (i = 0; i < series.length; i++) {
            serie = series[i];
            var searchSerieDiv = globalDivs.searchSerieDivObj.clone();
            searchSerieDiv.attr("id", "serieIndex_" + i);
            if (serie.image) {
                serie.image = serie.image.replace("https", "http");
                searchSerieDiv.find(".searchSerieImage").find("img").attr("src", serie.image);
            }
            if (serie.title) {
                searchSerieDiv.find(".searchSerieName").html(serie.title);
            }
            if (serie.startYear) {
                var yearPart = serie.startYear;
                if (serie.endYear) {
                    yearPart += " - " + serie.endYear;
                }
                serie.year = yearPart;
                searchSerieDiv.find(".searchSerieYear").html('(' + yearPart + ')');
            }
            if (serie.meterScore) {
                searchSerieDiv.find(".searchSerieRatingValue").html(serie.meterScore);
            } else {
                searchSerieDiv.find(".searchSerieRating").remove();
            }
            seriesResultsList.append(searchSerieDiv);
        }
        $(".searchSerie").click(function (e) {
            var serieId = $(this).attr("id");
            var serieIndex = serieId.split("_")[1];
            util.fireEvent("getSerie", [serieIndex]);
        });
    }

    function setMovieListVisible() {
        $("#seriesResultsButton").removeClass("activeTab");
        $("#moviesResultsButton").addClass("activeTab");
        $("#seriesResultsList").hide();
        $("#moviesResultsList").show();
    }
    function setSerieListVisible() {
        $("#moviesResultsButton").removeClass("activeTab");
        $("#seriesResultsButton").addClass("activeTab");
        $("#moviesResultsList").hide();
        $("#seriesResultsList").show();
    }

    function showMovieStreamLink() {
        $("#movieStreamButton").show();
        $(".movieLoader").remove();
    }

    function showMovieTrailerLink() {
        $("#movieTrailerButton").show();
    }

    function showEpisodeTrailerLink() {
        $("#episodeTrailerButton").show();
    }

    function showEpisodeStreamLink() {
        $("#episodeStreamButton").show();
    }

    function clearSearchList() {
        bringe.searchResults.movies = null;
        bringe.searchResults.series = null;
        $(".searchResultList").html("");
        $(".searchResultList").hide();
        $('.resultOptionButton').hide();
        $(".resultOptionButton").removeClass("activeTab");
    }

    function showRTMovie() {
        var wrapper = $(".movie-wrapper"),
            infoList,
            thisMovie = bringe.movie;
        removeRottenLoader();
        var castList = wrapper.find(".cast-list"),
            movieDataSection = $(".movie-data-section"),
            i;
        for (i = 0; i < thisMovie.cast.length; i++) {
            var person = thisMovie.cast[i];
            var castMemberDiv = globalDivs.castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (thisMovie.cast.length) {
            wrapper.find(".cast-section").show();
            castList.find(".cast-member").click(function (evt) {
                var obj = $(this);
                var name = obj.find(".cast-name").html();
                util.fireEvent("searchOnGoogle", [name]);
            });
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#movie-synopsis").html(thisMovie.synopsis);
        infoList = $("#movieInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = thisMovie.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = globalDivs.movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        if (thisMovie.images && thisMovie.images.thumbnail || thisMovie.images.coverImage) {
            if (thisMovie.images.image) {
                $(".movie-poster").find("img").attr("src", thisMovie.images.image);
            } else {
                $(".movie-poster").find("img").attr("src", thisMovie.images.thumbnail);
            }
        }
        movieDataSection.find(".movie-name").html(thisMovie.title);
        movieDataSection.find(".movie-year").html('(' + thisMovie.year + ')');
        if (thisMovie.ratings && thisMovie.ratings.meterScore) {
            $("#movie-rotten-rating").html(thisMovie.ratings.meterScore + "%");
            $("#rotten-movie-rating-box").show();
        }
        if (thisMovie.ratings && thisMovie.ratings.audienceScore) {
            $(".movie-data-section").find("#movie-audience-rating").html(thisMovie.ratings.audienceScore);
            $("#audience-movie-rating-box").show();
        }
        $(".movieInfo-section").show();
        movieDataSection.show();
        $(".movie-download-section").show();
        $(".synopsis-section").show();
    }

    function showRTSerie() {
        var wrapper = $(".serie-level"),
            watching = bringe.serie,
            infoList,
            dataSection = $(".serie-data-section"),
            thisSerie = bringe.serie;
        removeRottenLoader();
        $("#link-route").show();

        dataSection.find(".serie-name").html(thisSerie.title);
        var year = thisSerie.startYear;
        if (thisSerie.endYear) {
            year += ' - ' + thisSerie.endYear;
        }
        var image = thisSerie.image || thisSerie.thumbnail;
        $(".serie-poster").find("img").attr("src", image);
        dataSection.find(".serie-year").html('(' + year + ')');
        if (thisSerie.ratings.rotten) {
            $("#serie-rotten-rating").html(thisSerie.ratings.rotten + "%");
            $("#rotten-serie-rating-box").show();
        } else {
            $("#serie-rotten-rating").html("");
            $("#rotten-serie-rating-box").hide();
        }
        if (thisSerie.ratings.audienceScore) {
            $("#serie-audience-rating").html(thisSerie.ratings.audienceScore);
            $("#audience-serie-rating-box").show();
        } else {
            $("#serie-rotten-rating").html("");
            $("#rotten-serie-rating-box").hide();
        }
        var castList = wrapper.find(".cast-list"),
            i;
        for (i = 0; i < watching.cast.length; i++) {
            var person = watching.cast[i];
            var castMemberDiv = globalDivs.castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
            wrapper.find(".cast-section").show();
            castList.find(".cast-member").click(function (evt) {
                var obj = $(this);
                var name = obj.find(".cast-name").html();
                util.fireEvent("searchOnGoogle", [name]);
            });
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#serie-synopsis").html(watching.synopsis);
        infoList = $("#serieInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = globalDivs.movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        dataSection.show();
        $(".serieInfo-section").show();
        var seasonsList = wrapper.find(".seasons-list");
        for (i = watching.seasons.length - 1; i >= 0; i--) {
            var season = watching.seasons[i];
            var seasonListDiv = globalDivs.seasonListDivObj.clone();
            seasonListDiv.attr("id", "season_" + i);
            seasonListDiv.find(".seasonListImage").find("img").attr("src", season.image);
            seasonListDiv.find(".seasonListName").html(season.title);
            seasonListDiv.find(".seasonListConsensus").html(season.consensus);
            seasonListDiv.find(".seasonListInfo").html(season.info);
            if (season.ratings && season.ratings.rotten) {
                seasonListDiv.find(".seasonListRatingValue").html(season.ratings.rotten.slice(0, -1));
            } else {
                seasonListDiv.find(".seasonListRating").hide();
            }
            seasonsList.append(seasonListDiv);
        }
        $(".seasonListDiv").click(function (e) {
            var seasonId = $(this).attr("id");
            var seasonIndex = seasonId.split("_")[1];
            util.fireEvent("getSeason", [seasonIndex]);
        });
        wrapper.find(".seasons-section").show();
    }

    function showRTSeasonData() {
        var wrapper = $(".season-level"),
            thisSeason = bringe.season,
            watching = thisSeason,
            infoList,
            castList = wrapper.find(".cast-list"),
            dataSection = $(".season-data-section"),
            i;
        removeRottenLoader();
        $("#link-route").show();
        $(".season-poster").find("img").attr("src", thisSeason.image);
        dataSection.find(".season-name").html(thisSeason.title);
        if (thisSeason.info) {
            dataSection.find(".season-year").html('(' + thisSeason.info + ')');
        } else {
            dataSection.find(".season-year").html('');
        }
        if (thisSeason.ratings && thisSeason.ratings.rotten) {
            $("#season-rotten-rating").html(thisSeason.ratings.rotten);
            $("#rotten-season-rating-box").show();
        } else {
            $("#season-rotten-rating").html("");
            $("#rotten-season-rating-box").hide();
        }
        if (thisSeason.ratings && thisSeason.ratings.audienceScore) {
            $("#season-audience-rating").html(thisSeason.ratings.audienceScore);
            $("#audience-season-rating-box").show();
        } else {
            $("#season-audience-rating").html("");
            $("#audience-season-rating-box").hide();
        }
        for (i = 0; i < watching.cast.length; i++) {
            var person = watching.cast[i];
            var castMemberDiv = globalDivs.castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
            wrapper.find(".cast-section").show();
            castList.find(".cast-member").click(function (evt) {
                var obj = $(this);
                var name = obj.find(".cast-name").html();
                util.fireEvent("searchOnGoogle", [name]);
            });
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#season-synopsis").html(watching.synopsis);
        infoList = $("#seasonInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = globalDivs.movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        dataSection.show();
        $(".seasonInfo-section").show();
    }

    function showRTEpisodesList() {
        var wrapper = $(".season-level"),
            watching = bringe.season,
            episodesList = wrapper.find(".episodes-list");
        for (var i = 0; i < watching.episodes.length; i++) {
            var episode = watching.episodes[i];
            var episodeListDiv = globalDivs.episodeListDivObj.clone();
            episodeListDiv.attr("id", "episode_" + i);
            episodeListDiv.find(".episodeListName").html(episode.title);
            episodeListDiv.find(".episodeListNumber").html(episode.episodeNo);
            episodeListDiv.find(".episodeListDate").html(episode.date);
            episodeListDiv.find(".episodeListSynopsis").html(episode.synopsis);
            if (episode.ratings && episode.ratings.rotten) {
                episodeListDiv.find(".episodeListRatingValue").html(episode.ratings.rotten);
            } else {
                episodeListDiv.find(".episodeListRating").hide();
            }
            episodesList.append(episodeListDiv);
        }
        $(".episodeListDiv").click(function (e) {
            var episodeId = $(this).attr("id");
            var episodeIndex = episodeId.split("_")[1];
            util.fireEvent("getEpisode", [episodeIndex]);
        });
        wrapper.find(".episodes-section").show();
    }

    function showRTEpisodeData() {
        var wrapper = $(".episode-level"),
            thisEpisode = bringe.episode,
            watching = thisEpisode,
            infoList,
            castList = wrapper.find(".cast-list"),
            dataSection = $(".episode-data-section"),
            i;
        removeRottenLoader();
        $("#link-route").show();
        $(".episode-poster img").attr("src", watching.image);
        dataSection.find(".episode-name").html(thisEpisode.title);
        if (thisEpisode.date) {
            dataSection.find(".episode-year").html('(' + thisEpisode.date + ')');
        }
        if (thisEpisode.ratings && thisEpisode.ratings.rotten) {
            $("#episode-rotten-rating").html(thisEpisode.ratings.rotten + "%");
            $("#rotten-episode-rating-box").show();
        } else {
            $("#episode-rotten-rating").html("");
            $("#rotten-episode-rating-box").hide();
        }
        if (thisEpisode.ratings && thisEpisode.ratings.audienceScore) {
            $("#episode-audience-rating").html(thisEpisode.ratings.audienceScore);
            $("#audience-episode-rating-box").show();
        } else {
            $("#episode-audience-rating").html("");
            $("#audience-episode-rating-box").hide();
        }
        if (thisEpisode.ratings.imdb) {
            $("#episode-imdb-rating").html(thisEpisode.ratings.imdb);
            $("#imdb-episode-rating-box").show();
        } else {
            $("#episode-imdb-rating").html("");
            $("#imdb-episode-rating-box").hide();
        }
        for (i = 0; i < watching.cast.length; i++) {
            var person = watching.cast[i];
            var castMemberDiv = globalDivs.castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
            wrapper.find(".cast-section").show();
            castList.find(".cast-member").click(function (evt) {
                var obj = $(this);
                var name = obj.find(".cast-name").html();
                util.fireEvent("searchOnGoogle", [name]);
            });
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#episode-synopsis").html(watching.synopsis);
        infoList = $("#episodeInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = globalDivs.movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        dataSection.show();
        $("#episode-download-section").show();
        $(".episodeInfo-section").show();
        $(".episodeSynopsis-section").show();
        showExternalEpisodeStreaming();
    }

    function placeImdbMovieRating() {
        if (bringe.movie.ratings && bringe.movie.ratings.imdbRating) {
            $("#movie-imdb-rating").html(bringe.movie.ratings.imdbRating);
            $("#imdb-movie-rating-box").show();
        }
        if (bringe.movie.ratings && bringe.movie.ratings.metaRating) {
            $("#movie-metacritic-rating").html(bringe.movie.ratings.metaRating);
            $("#metacritic-movie-rating-box").show();
        }
    }

    function placeImdbSerieRating() {
        if (bringe.serie.ratings.imdbRating) {
            $("#serie-imdb-rating").html(bringe.serie.ratings.imdbRating);
            $("#imdb-serie-rating-box").show();
        }
        if (bringe.serie.ratings.metaRating) {
            $("#serie-metacritic-rating").html(bringe.serie.ratings.metaRating);
            $("#metacritic-serie-rating-box").show();
        }
    }

    function placeGoogleMovieData() {
        if (bringe.movie.reviews) {
            $("#movie-reviews-header").show();
            var reviewsDiv = $("#movie-reviews");
            util.each(bringe.movie.reviews, function (review) {
                var reviewDiv = globalDivs.reviewDivObj.clone();
                reviewDiv.find(".review-text").html(review.text);
                if (review.source.name) {
                    reviewDiv.find(".review-source-person").html("-" + review.source.name);
                }
                if (review.source.sourceSite) {
                    reviewDiv.find(".review-source-website").html('(' + review.source.sourceSite + ')');
                }
                reviewsDiv.append(reviewDiv);
            });
        }
        if (bringe.movie.social) {
            $("#movie-social-header").show();
            var socialList = $("#movieSocialList");
            util.each(bringe.movie.social, function(social) {
                var socialDiv = $('<div class="socialBox"><div class="socialImg"><i class="fa fa-fw" aria-hidden="true"></i></div>');
                socialDiv.attr("data-href", social.link);
                socialDiv.find("i").addClass(iconMap[social.site]);
                socialList.append(socialDiv);
                socialDiv.click(function (evt) {
                    background.openLinkInBrowser(this.getAttribute("data-href"));
                });
            });
        }
    }

    function showExternalMovieStreaming() {
        var extStreams = bringe.movie && bringe.movie.externalStreams;
        if (extStreams && extStreams.length > 0) {
            $(".movie-wrapper .watch-section").show();
            var list = $("#movie-watch-list");
            for (var i = 0; i < extStreams.length; i++) {
                var stream = extStreams[i];
                var watchItem = globalDivs.watchItemDivObj.clone();
                watchItem.find("img").attr("src", stream.image);
                watchItem.find(".watch-box").attr("data-href", stream.link);
                list.append(watchItem);
            }
            list.find(".watch-box").click(function () {
                background.openLinkInBrowser(this.getAttribute("data-href"));
            });
        }
    }

    function showExternalEpisodeStreaming() {
        var websites = bringe.serie && bringe.serie.websites,
            seasonNo = bringe.season.seasonNo;
        if (websites && websites.watchit && websites.watchit.seasons && websites.watchit.seasons[seasonNo + ''] && websites.watchit.seasons[seasonNo + ''].externalStreams && websites.watchit.seasons[seasonNo + ''].externalStreams.length > 0) {
            var externalStreams = websites.watchit.seasons[seasonNo + ''].externalStreams;
            $(".serie-wrapper .watch-section").show();
            var list = $("#episode-watch-list");
            for (var i = 0; i < externalStreams.length; i++) {
                var stream = externalStreams[i];
                var watchItem = globalDivs.watchItemDivObj.clone();
                watchItem.find("img").attr("src", stream.image);
                watchItem.find(".watch-box").attr("data-href", stream.link);
                list.append(watchItem);
            }
            list.find(".watch-box").click(function () {
                background.openLinkInBrowser(this.getAttribute("data-href"));
            });
        }
    }

    function showSubtitleLink() {
        $("#movieSubtitleButton").show();
    }

    function showEpisodeSubtitleLink() {
        $("#episodeSubtitleButton").show();
    }

    function clearPopup() {
        var popupBox = $(".popup-box");
        var table = popupBox.find("table");
        popupBox.find(".popup-header").html("");
        table.find("thead").html("");
        table.find("tbody").html("");
    }

    function openPopup() {
        $(".popup-wrapper").show();
        $("body").addClass("stop-scrolling");
    }

    function closePopup() {
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

    function openEpisodesStreamPopup(streamLinks) {
        clearPopup();
        var popupBox = $(".popup-box");
        popupBox.find(".popup-header").html("Episode Links");
        var table = popupBox.find("table");
        var thead = table.find("thead");
        var tbody = table.find("tbody");
        for (var i = 0; i < streamLinks.length; i++) {
            var link = streamLinks[i];
            var row = $('<tr data-id="' + link.source + '"> <td data-id="' + link.id + '">Server ' + (i+1) + '</td> <td class="streamQuality">' + link.label + '</td> <td class="streamEpisode">Stream Episode</td> <td class="downloadEpisode">Download</td> </tr>');
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
        openPopup();
    }

    function openMovieStreamPopup(movie) {
        clearPopup();
        var popupBox = $(".popup-box");
        popupBox.find(".popup-header").html("Stream Movie");
        var table = popupBox.find("table");
        var thead = table.find("thead");
        var tbody = table.find("tbody");
        var linksObj = movie.streamLinkDetails;
        for (var i = 0; i < linksObj.length; i++) {
            var linkObj = linksObj[i];
            var row = $('<tr data-id="' + linkObj.source + '"> <td data-id="' + linkObj.id + '">Server ' + (i+1) + '</td> <td>' + linkObj.label + '</td> <td class="movieStream">Stream</td> <td class="movieDownload">Download</td> </tr>');
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
        openPopup();
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

    function shineDownloadButton() {
        $("#downloads-button").addClass("shine");
        setTimeout(function () {
            $("#downloads-button").removeClass("shine");
        }, 500);
    }

    function searching() {
        removeSearchBuffer();
        removeSearchResultText();
        var buffer = $('<div class="search-buffer"><img class="fa-spin" src="../images/bringe-48.png"></div>');
        $(".search-result-wrapper").append(buffer);
    }

    function removeSearchBuffer() {
        $(".search-result-wrapper").find(".search-buffer").remove();
    }

    function showSearchResultText(text) {
        removeSearchResultText();
        var status = $('<div class="search-result-text">' + text + '</div>');
        $(".search-result-wrapper").append(status);
    }

    function removeSearchResultText() {
        $(".search-result-wrapper").find(".search-result-text").remove();
    }

    function findingMovieLink() {
        var loader = $('<div class="movieLoader"><i class="fa fa-spinner fa-spin"></i></div>');
        $(".movieActionButtons").append(loader);
    }

    function couldnotFetchMovieLink() {
        $(".movieLoader").remove();
    }

    function movieLoadComplete() {
        $(".movieLoader").remove();
    }

    return {
        hideAllSection: hideAllSection,
        goToHome: goToHome,
        hideTrending: hideTrending,
        showTrendingMovies: showTrendingMovies,
        placeMoviesList: placeMoviesList,
        placeSeriesList: placeSeriesList,
        setMovieListVisible: setMovieListVisible,
        setSerieListVisible: setSerieListVisible,
        placeDownloadSection: placeDownloadSection,
        showMovieStreamLink: showMovieStreamLink,
        showEpisodeStreamLink: showEpisodeStreamLink,
        showMovieTrailerLink: showMovieTrailerLink,
        showEpisodeTrailerLink: showEpisodeTrailerLink,
        clearSearchList: clearSearchList,
        showRTMovie: showRTMovie,
        showRTSerie: showRTSerie,
        showRTSeasonData: showRTSeasonData,
        showRTEpisodeData: showRTEpisodeData,
        showRTEpisodesList: showRTEpisodesList,
        showMoviePart: showMoviePart,
        showSeriePart: showSeriePart,
        showSerieLevel: showSerieLevel,
        showSeasonLevel: showSeasonLevel,
        showEpisodeLevel: showEpisodeLevel,
        clearAllSerieData: clearAllSerieData,
        clearAllSeasonData: clearAllSeasonData,
        clearAllEpisodeData: clearAllEpisodeData,
        placeImdbMovieRating: placeImdbMovieRating,
        placeImdbSerieRating: placeImdbSerieRating,
        placeGoogleMovieData: placeGoogleMovieData,
        showExternalMovieStreaming: showExternalMovieStreaming,
        showExternalEpisodeStreaming: showExternalEpisodeStreaming,
        showSubtitleLink: showSubtitleLink,
        showEpisodeSubtitleLink: showEpisodeSubtitleLink,
        goBackFromDownloads: goBackFromDownloads,
        setupDownloadSection: setupDownloadSection,
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
        closeTrailerPopup: closeTrailerPopup,
        shineDownloadButton: shineDownloadButton,
        showSearchResultText: showSearchResultText,
        searching: searching,
        removeSearchBuffer: removeSearchBuffer,
        findingMovieLink: findingMovieLink,
        couldnotFetchMovieLink: couldnotFetchMovieLink,
        movieLoadComplete: movieLoadComplete
    }
});
