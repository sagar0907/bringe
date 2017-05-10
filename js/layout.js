function layout() {

    function hideAllSection() {
        $(".search-wrapper").hide();
        $(".results-wrapper").hide();
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
        page = "home";
        $("#search-input").val("");
        $("#search-input").focus();
        $(".search-wrapper").show();
        $(".results-wrapper").show();
    }

    function showDownloadSection() {
        $(".downloads-wrapper").show();
    }

    function showMoviePart() {
        page = "movie";
        $(".movie-wrapper").show();
    }

    function showSeriePart() {
        page = "serie";
        showActiveSerieLevel();
        $(".serie-wrapper").show();
    }

    function showActiveSerieLevel() {
        if (serieLevel === "serie") {
            showSerieLevel();
        } else if (serieLevel === "season") {
            showSeasonLevel();
        } else if (serieLevel === "episode") {
            showEpisodeLevel();
        }
    }

    function showSerieLevel() {
        page = "serie";
        serieLevel = "serie";
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
        page = "serie";
        serieLevel = "season";
        if (thisSerie && thisSerie.startYear) {
            $("#route-serie").html(thisSerie.title);
            $("#route-serie").show();
        } else {
            $("#route-serie").html('');
            $("#route-serie").hide();
        }
        $("#route-season").html(thisSeason.title);
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
        page = "serie";
        serieLevel = "episode";
        if (thisSerie && thisSerie.startYear) {
            $("#route-serie").html(thisSerie.title);
            $("#route-serie").show();
        } else {
            $("#route-serie").html('');
            $("#route-serie").hide();
        }
        $("#route-season").html(thisSeason.title);
        $("#route-episode").html(thisEpisode.title);
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
        showHome();
    }

    function setupDownloadSection() {
        hideAllSection();
        clearAllDownloadData();
        placeDownloadSection();
        showDownloadSection();
    }

    function goBackFromDownloads() {
        if (page == "home") {
            hideAllSection();
            showHome();
        } else if (page == "movie") {
            hideAllSection();
            showMoviePart();
        } else if (page == "serie") {
            hideAllSection();
            showSeriePart();
        }
    }

    function clearAllMovieData() {
        thisMovie = null;
        var movieWrapper = $(".movie-wrapper");
        var movieDataSection = $(".movie-data-section");
        $(".movie-rating-box").hide();
        $("#movieStreamButton").hide();
        $("#movieTrailerButton").hide();
        $("#movieSubtitleButton").hide();
        movieWrapper.find(".cast-section").hide();
        movieWrapper.find(".synopsis-section").hide();
        movieWrapper.find(".movieInfo-section").hide();
        movieDataSection.hide();
        $(".movie-download-section").hide();
        movieWrapper.hide();
        movieWrapper.find(".cast-list").html("");
        $("#movie-synopsis").html("");
        $("#movie-reviews").html("");
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
        thisSerie = null;
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
        thisSeason = null;
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
        thisEpisode = null;
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
        wrapper.hide();
        wrapper.find(".cast-list").html("");
        $("#episode-synopsis").html("");
        $("#episodeInfoList").html("");
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
        downloads().getAndPlaceDownloadItemById(id, function (downloadItem) {
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
                        detail += downloads().getSizeInWords(downloadItem.bytesReceived - last) + "/s - ";
                    }
                    detail += downloads().getSizeInWords(downloadItem.bytesReceived) + " of " + downloads().getSizeInWords(downloadItem.totalBytes) + ", ";
                    if (downloadItem.paused) {
                        detail += "Paused ";
                    }
                    if (downloadItem.estimatedEndTime) {
                        var estimatedEndTime = new Date(downloadItem.estimatedEndTime);
                        var nowTime = new Date();
                        detail += util().getTimeInWords(estimatedEndTime.getTime() - nowTime.getTime()) + " left";
                    }
                    fileProgressDetail.html(detail);
                    var completePercentage = downloads().getCompletedPercentage(downloadItem.bytesReceived, downloadItem.totalBytes);
                    fileCompletePart.css("width", completePercentage + "%");
                    fileProgressBar.css("height", "3px");
                    if (downloadItem.paused == false && fileActionBox.find(".pause-button").length == 0) {
                        fileActionBox.html("");
                        fileActionBox.append(downloads().getPauseButton(downloadItem.id));
                        fileActionBox.append(downloads().getCancelButton(downloadItem.id));
                    } else if (downloadItem.paused && fileActionBox.find(".resume-button").length == 0) {
                        fileActionBox.html("");
                        fileActionBox.append(downloads().getResumeButton(downloadItem.id));
                        fileActionBox.append(downloads().getCancelButton(downloadItem.id));
                    }
                } else if (downloadItem.state == "interrupted" && fileActionBox.find(".retry-button").length == 0) {
                    fileActionBox.html("");
                    fileActionBox.append(downloads().getRetryButton(downloadItem));
                    fileProgressDetail.html("");
                    fileProgressBar.css("height", "0px");
                    fileRemoveBox.html("x");
                } else if (downloadItem.state == "complete" && fileActionBox.find(".open-button").length == 0) {
                    fileActionBox.html("");
                    fileProgressDetail.html("");
                    fileProgressBar.css("height", "0px");
                    fileActionBox.append(downloads().getOpenButton(downloadItem.id));
                    fileActionBox.append(downloads().getShowInFolderButton(downloadItem.id));
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
        window.download_active = true;
        chrome.downloads.search({filenameRegex: "Bringe", exists: true}, function (results) {
            var downloadList = [];
            for (var i = 0; i < results.length; i++) {
                var item = results[i];
                if (item.byExtensionId == "npppfccdplcbhbcnbdgchlnbfhmemfja") {
                    downloadList.push(item);
                }
            }
            downloadList.sort(util().downloadComparator);
            var downloadListBox = $("#download-list");
            for (var i = 0; i < downloadList.length; i++) {
                downloads().getAndPlaceDownloadItemById(downloadList[i].id, function (downloadItem) {
                    var downloadItemBox = downloadItemDivObj.clone();
                    downloadItemBox.find(".download-file-name").html(util().extractFileName(downloadItem.filename));
                    var fileLinkBox = downloadItemBox.find(".download-file-link");
                    var fileIconBox = downloadItemBox.find(".download-file-icon");
                    var fileRemoveBox = downloadItemBox.find(".download-file-remove");
                    fileLinkBox.html(downloadItem.finalUrl);
                    fileLinkBox.data("href", downloadItem.finalUrl);
                    downloadListBox.append(downloadItemBox);
                    downloads().getAndPlaceDownloadItemIcon(downloadItem.id, fileIconBox, function (iconUrl, iconBox) {
                        iconBox.find("img").attr("src", iconUrl);
                    });
                    fileLinkBox.click(function (evt) {
                        var link = evt.target;
                        background.openLinkInBrowser($(link).data("href"));
                    });
                    fileRemoveBox.click(function () {
                        window.download_active = false;
                        chrome.downloads.erase({id: downloadItem.id}, function () {
                            placeDownloadSection();
                        });
                    });
                    resetDownloadItemBox(downloadItemBox, downloadItem.id);
                });
            }
        });
    }

    function placeMoviesList(movies) {
        var movie, i,
            moviesResultsList = $("#moviesResultsList");
        moviesResultsList.html("");
        moviesResultsList.append($('<div class="searchTypeTitle">Movies</div>'));
        for (i = 0; i < movies.length; i++) {
            movie = movies[i];
            if (!movie.meterScore) {
                continue;
            }
            var searchMovieDiv = searchMovieDivObj.clone();
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
            util().fireEvent("getMovie", [movieIndex]);
        });
    }

    function placeSeriesList(series) {
        var serie, i,
            seriesResultsList = $("#seriesResultsList");
        seriesResultsList.html("");
        seriesResultsList.append($('<div class="searchTypeTitle">Series</div>'));
        for (i = 0; i < series.length; i++) {
            serie = series[i];
            var searchSerieDiv = searchSerieDivObj.clone();
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
            if (serie.meterValue) {
                searchSerieDiv.find(".searchSerieRatingValue").html(serie.meterValue);
            } else {
                searchSerieDiv.find(".searchSerieRating").remove();
            }
            seriesResultsList.append(searchSerieDiv);
        }
        $(".searchSerie").click(function (e) {
            var serieId = $(this).attr("id");
            var serieIndex = serieId.split("_")[1];
            util().fireEvent("getSerie", [serieIndex]);
        });
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
        searchResults.movies = null;
        searchResults.series = null;
        $("#moviesResultsList").html("");
        $("#seriesResultsList").html("");
    }

    function showRTMovie() {
        var wrapper = $(".movie-wrapper"),
            watching = thisMovie,
            infoList;
        removeRottenLoader();
        var castList = wrapper.find(".cast-list"),
            i;
        for (i = 0; i < watching.cast.length; i++) {
            var person = watching.cast[i];
            var castMemberDiv = castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#movie-synopsis").html(watching.movieSynopsis);
        infoList = $("#movieInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }

        $(".movie-poster").find("img").attr("src", thisMovie.image);
        $(".movie-data-section").find(".movie-name").html(thisMovie.name);
        $(".movie-data-section").find(".movie-year").html('(' + thisMovie.year + ')');
        if (thisMovie.meterScore) {
            $("#movie-rotten-rating").html(thisMovie.meterScore + "%");
            $("#rotten-movie-rating-box").show();
        }
        if (watching.audienceScore) {
            $(".movie-data-section").find("#movie-audience-rating").html(thisMovie.audienceScore);
            $("#audience-movie-rating-box").show();
        }
        $(".movieInfo-section").show();
        $(".movie-data-section").show();
        $(".movie-download-section").show();
        $(".synopsis-section").show();
    }

    function showRTSerie() {
        var wrapper = $(".serie-level"),
            watching = thisSerie,
            infoList,
            dataSection = $(".serie-data-section");
        removeRottenLoader();
        $("#link-route").show();

        dataSection.find(".serie-name").html(thisSerie.title);
        var year = thisSerie.startYear;
        if (thisSerie.endYear) {
            year += ' - ' + thisSerie.endYear;
        }
        $(".serie-poster").find("img").attr("src", thisSerie.image);
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
            var castMemberDiv = castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#serie-synopsis").html(watching.synopsis);
        infoList = $("#serieInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        dataSection.show();
        $(".serieInfo-section").show();
        var seasonsList = wrapper.find(".seasons-list");
        for (i = watching.seasons.length - 1; i >= 0; i--) {
            var season = watching.seasons[i];
            var seasonListDiv = seasonListDivObj.clone();
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
            util().fireEvent("getSeason", [seasonIndex]);
        });
        wrapper.find(".seasons-section").show();
    }

    function showRTSeasonData() {
        var wrapper = $(".season-level"),
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
            var castMemberDiv = castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#season-synopsis").html(watching.synopsis);
        infoList = $("#seasonInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        dataSection.show();
        $(".seasonInfo-section").show();
    }

    function showRTEpisodesList() {
        var wrapper = $(".season-level"),
            watching = thisSeason,
            episodesList = wrapper.find(".episodes-list");
        for (var i = 0; i < watching.episodes.length; i++) {
            var episode = watching.episodes[i];
            var episodeListDiv = episodeListDivObj.clone();
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
            util().fireEvent("getEpisode", [episodeIndex]);
        });
        wrapper.find(".episodes-section").show();
    }

    function showRTEpisodeData() {
        var wrapper = $(".episode-level"),
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
            var castMemberDiv = castMemberDivObj.clone();
            castMemberDiv.find("img").attr("src", person.image);
            castMemberDiv.find(".cast-name").html(person.name);
            castMemberDiv.find(".cast-role").html(person.role);
            castList.append(castMemberDiv);
        }
        if (watching.cast.length) {
            wrapper.find(".cast-section").show();
        } else {
            wrapper.find(".cast-section").hide();
        }
        $("#episode-synopsis").html(watching.synopsis);
        infoList = $("#episodeInfoList");
        wrapper.find(".synopsis-section").show();
        var infos = watching.infoList;
        for (i = 0; i < infos.length; i++) {
            var serieInfoDiv = movieInfoDivObj.clone();
            serieInfoDiv.find(".movie-info-label").html(infos[i].label);
            serieInfoDiv.find(".movie-info-value").html(infos[i].value);
            infoList.append(serieInfoDiv);
        }
        dataSection.show();
        $("#episode-download-section").show();
        $(".episodeInfo-section").show();
        $(".episodeSynopsis-section").show();
    }

    function placeImdbMovieRating() {
        if (thisMovie.imdbRating) {
            $("#movie-imdb-rating").html(thisMovie.imdbRating);
            $("#imdb-movie-rating-box").show();
        }
        if (thisMovie.metaRating) {
            $("#movie-metacritic-rating").html(thisMovie.metaRating);
            $("#metacritic-movie-rating-box").show();
        }
    }

    function placeImdbSerieRating() {
        if (thisSerie.ratings.imdbRating) {
            $("#serie-imdb-rating").html(thisSerie.ratings.imdbRating);
            $("#imdb-serie-rating-box").show();
        }
        if (thisSerie.ratings.metaRating) {
            $("#serie-metacritic-rating").html(thisSerie.ratings.metaRating);
            $("#metacritic-serie-rating-box").show();
        }
    }

    function placeGoogleMovieData() {
        if (thisMovie.reviews) {
            var reviewsDiv = $("#movie-reviews");
            util().each(thisMovie.reviews, function(review) {
                var reviewDiv = reviewDivObj.clone();
                reviewDiv.find(".review-text").html(review.text);
                if (review.source.name) {
                    reviewDiv.find(".review-source-person").html(review.source.name);
                }
                if (review.source.sourceSite) {
                    reviewDiv.find(".review-source-website").html('(' + review.source.sourceSite + ')');
                }
                reviewsDiv.append(reviewDiv);
            });
        }
        if (thisMovie.metaRating) {
            $("#movie-metacritic-rating").html(thisMovie.metaRating);
            $("#metacritic-movie-rating-box").show();
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
        var buffer = $('<div class="rotten-buffer"><i class="fa fa-spinner fa-spin"></i></div>');
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
        //thead.append('<tr> <td>Source</td> <td>Quality</td> <td>Format</td> </tr>');
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
                util().fireEvent("downloadSerieStream", [{id: id, source: source}]);
            });
            streamButton.click(function (evt) {
                closePopup();
                var obj = $(this),
                    line = obj.parent(),
                    source = line.attr("data-id"),
                    tds = line.find("td"),
                    id = $(tds[0]).attr("data-id");
                util().fireEvent("openSerieStream", [{id: id, source: source}]);
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
        //thead.append('<tr> <td>Source</td> <td>Quality</td> <td>Format</td> </tr>');
        var tbody = table.find("tbody");
        var linksObj = movie.streamLinkDetails;
        for (var i = 0; i < linksObj.length; i++) {
            var linkObj = linksObj[i];
            var ext = linkObj.type;
            var serverId = linkObj.id.split("*")[0];
            var row = $('<tr class="' + linkObj.id + '"> <td>#' + serverId + '</td> <td>' + linkObj.label + '</td> <td class="movieStream">Stream</td> <td class="movieDownload">Download</td> </tr>');
            tbody.append(row);
            var stream = row.find(".movieStream");
            var download = row.find(".movieDownload");
            stream.click(function (evt) {
                closePopup();
                var obj = $(this).parent(),
                    id = obj.attr("class"),
                    tds = obj.find("td"),
                    label = $(tds[1]).html();
                util().fireEvent("openMovieStream", [{id: id, label: label}]);
            });
            download.click(function (evt) {
                closePopup();
                var obj = $(this).parent(),
                    id = obj.attr("class"),
                    tds = obj.find("td"),
                    label = $(tds[1]).html();
                util().fireEvent("downloadMovieStream", [{id: id, label: label}]);
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
                util().fireEvent("downloadMovieSubtitle", [parseInt(id)]);
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
                    util().fireEvent("downloadEpisodeSubtitle", [parseInt(id)]);
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
        var buffer = $('<div class="search-buffer"><i class="fa fa-spinner fa-spin"></i></div>');
        $("#searchResultsList").append(buffer);
    }

    function removeSearchBuffer() {
        $("#searchResultsList").find(".search-buffer").remove();
    }

    function showSearchResultText(text) {
        removeSearchResultText();
        var status = $('<div class="search-result-text">' + text + '</div>');
        $("#searchResultsList").append(status);
    }

    function removeSearchResultText() {
        $("#searchResultsList").find(".search-result-text").remove();
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
        placeMoviesList: placeMoviesList,
        placeSeriesList: placeSeriesList,
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
}
