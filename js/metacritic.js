/**
 * Created by sagar.ja on 16/04/17.
 */
function metacritic() {
    function searchFailure() {

    }

    function searchSuccess(result) {
        console.log(result);
    }

    function searchSerie(q) {
        var url = 'http://www.metacritic.com/autosearch';
        util().sendAjax(url, "POST", {
            search_term: q,
            search_each: 5,
            sort_type: "popular"
        }, searchSuccess, searchFailure);
    }

    return {
        searchSerie: searchSerie
    }
}