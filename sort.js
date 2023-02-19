let songs = [];
var queries = {};
let val = 0;
let cnt = 0;
let albumName = null;
function swap(arr, i, j){
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

$.each(document.location.search.substr(1).split('&'), function (c, q) {
    var i = q.split('=');
    queries[i[0].toString()] = i[1].toString();
});


$.get(`https://musicbrainz.org/ws/2/release/${queries.id}?inc=recordings&fmt=json`,(album) => {

    for(let i = 0; i < album.media.length; i++){

        for(let song of album.media[i].tracks)
        {
            songs.push(song.title);
        }
        
    }

    if(album.title)
        albumName = album.title
    sortSongs();
})

async function sortSongs(){
    await quickSort(songs, 0, songs.length - 1);
    done();
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function getComparison(a, b){
    if(a == b)
        return 0;
    cnt++;
    $("#levi").text(a);
    $("#desni").text(b);
    while(!val)
        await sleep(100);
    let v = val;
    val = 0;
    return v;
}

async function partition(items, left, right) {
    let pivot = items[right];
    let i = left - 1;
    for(let j = left; j <= right; j++)
    {
        console.log(j, right);
        console.log(songs);
        let value = await getComparison(songs[j], pivot);
        if(value < 0)
        {
            console.log("here");
            i++;
            swap(songs, i, j);
            console.log(songs);
        }
    }
    swap(songs, i+1, right);
    return i+1;
}

async function quickSort(items, left, right) {
    var index;
    if (left < right) {
        index = await partition(items, left, right); //index returned from partition
        await quickSort(items, left, index - 1);
        await quickSort(items, index + 1, right);
    }
    return items;
}

function done(){
    $("#levi").remove();
    $("#desni").remove();
    let i = 1;
    for(let song of songs)
    {
        $("#pesmi").append(`<b>${i}.</b> ${song}<br>`);
        i++;
    }
    $("#compr").append(`Number of comparisons: ${cnt}`);
    $("#kopiraj").css("display", "table");
}

$("#kopiraj").click(function(){
    let copyText = document.getElementById("pesmi").innerText;

    console.log(albumName)
    if(albumName)
        copyText = "My ranking of " + albumName + ":\n" + copyText;
    console.log(albumName)
    navigator.clipboard.writeText(copyText);

})