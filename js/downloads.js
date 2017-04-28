/**
 * Created by sagar.ja on 21/02/17.
 */

function downloads() {
    function setupDownloadsSection() {
        layout().setupDownloadSection();
    }
    function addToDownload(link, name, ext, callback) {
        chrome.downloads.setShelfEnabled(false);
        if(ext) {
            name += ext;
        }
        chrome.downloads.download({url: link, filename: "Bringe/" + name}, function (downloadId) {
            if (callback) {
                setTimeout(function() {
                    callback();
                }, 400);
            }
            setTimeout(function() {
                chrome.downloads.setShelfEnabled(true);
            }, 400);
        });
    }
    function reStartDownload(link, name) {
        addToDownload(link, name, "", function () {
            layout().placeDownloadSection();
        });
    }
    function getAndPlaceDownloadItemById(id, callback) {
        chrome.downloads.search({id: id}, function (results) {
            if(results.length > 0) {
                callback(results[0]);
            } else {
                return null;
            }
        });
    }
    function getAndPlaceDownloadItemIcon(id, iconBox, callback) {
        chrome.downloads.getFileIcon(id, function (iconUrl) {
            if(iconUrl) {
                callback(iconUrl, iconBox);
            } else {
                return null;
            }
        });
    }
    function getPauseButton(id) {
        var button = $('<div class="download-action-button pause-button">Pause</div>');
        button.click(function () {
            chrome.downloads.pause(id, function () {
                //reShowDownloadItem(id);
                //layout().placeDownloadSection();
            })
        });
        return button;
    }
    function getResumeButton(id) {
        var button = $('<div class="download-action-button resume-button">Resume</div>');
        button.click(function () {
            chrome.downloads.resume(id, function () {
                //reShowDownloadItem(id);
                //layout().placeDownloadSection();
            })
        });
        return button;
    }
    function getCancelButton(id) {
        var button = $('<div class="download-action-button cancel-button">Cancel</div>');
        button.click(function () {
            chrome.downloads.cancel(id, function () {
                //reShowDownloadItem(id);
                //layout().placeDownloadSection();
            })
        });
        return button;
    }
    function getRetryButton(item) {
        var button = $('<div class="download-action-button retry-button">Retry</div>');
        button.click(function () {
            if(download_active) {
                download_active = false;
                chrome.downloads.erase({id: item.id}, function (){
                });
                reStartDownload(item.url, util().extractFileName(item.filename))
            }
        });
        return button;
    }
    function getOpenButton(id) {
        var button = $('<div class="download-action-button open-button">Open File</div>');
        button.click(function () {
            chrome.downloads.open(id);
        });
        return button;
    }
    function getShowInFolderButton(id) {
        var button = $('<div class="download-action-button show-button">Show In Folder</div>');
        button.click(function () {
            chrome.downloads.show(id);
        });
        return button;
    }
    function getCompletedPercentage(completed, total) {
        return (completed/total)*100;
    }
    function getSizeInWords(bytes) {
        if(bytes<1024) {
            return bytes + "B";
        }
        var kb = Math.floor(bytes/1024);
        bytes = bytes % 1024;
        if (kb<10) {
            return kb + "." + Math.floor((bytes*100)/1024) + "kB";
        }
        if (kb<100) {
            return kb + "." + Math.floor((bytes*10)/1024) + "kB";
        }
        if (kb<1024) {
            return kb + "kB";
        }
        var mb = Math.floor(kb/1024);
        kb = kb % 1024;
        if (mb<10) {
            return mb + "." + Math.floor((kb*100)/1024) + "MB";
        }
        if (mb<100) {
            return mb + "." + Math.floor((kb*10)/1024) + "MB";
        }
        if (mb<1024) {
            return mb + "MB";
        }
        var gb = Math.floor(mb/1024);
        mb = mb % 1024;
        if (gb<10) {
            return gb + "." + Math.floor((mb*100)/1024) + "GB";
        }
        if (gb<100) {
            return gb + "." + Math.floor((mb*10)/1024) + "GB";
        }
        if (gb<1024) {
            return gb + "GB";
        }
    }
    return {
        addToDownload: addToDownload,
        setupDownloadsSection: setupDownloadsSection,
        getAndPlaceDownloadItemById : getAndPlaceDownloadItemById,
        getAndPlaceDownloadItemIcon: getAndPlaceDownloadItemIcon,
        getPauseButton: getPauseButton,
        getResumeButton: getResumeButton,
        getCancelButton: getCancelButton,
        getRetryButton: getRetryButton,
        getOpenButton: getOpenButton,
        getShowInFolderButton: getShowInFolderButton,
        getCompletedPercentage: getCompletedPercentage,
        getSizeInWords: getSizeInWords
    }
}