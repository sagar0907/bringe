_define('download-layout', [window, 'util', 'bringe'], function (window, util, bringe) {

    var globalDivs = {
        downloadItemDivObj: $('<div class="download-item"> <div class="row"> <div class="download-file-icon"><img></div>' +
            '<div class="download-file-data"> <div class="download-file-name"></div> <div class="download-file-link"><a></a></div>' +
            '<div class="download-progress-detail"></div> <div class="download-progress-bar"><div class="download-complete-part"></div></div>' +
            '<div class="download-file-options"></div><div class="download-file-remove"></div> </div> </div> </div>')
    };
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
    return {
        placeDownloadSection: placeDownloadSection
    }
});
