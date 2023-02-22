let songs = [];
let songs_with_ratings = [];
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
            songs_with_ratings.push({title: song.title, rating: 1200})
        }
        
    }

    if(album.title)
        albumName = album.title
    sortSongs();
})

async function sortSongs(){
    // await quickSort(songs, 0, songs.length - 1);
    await allComp();
    songs = songs_with_ratings.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0)).map(e => e.title);
    done();
}

async function allComp(){
    for (let i = 0; i<songs_with_ratings.length - 1; i++){
        for (let j = i+1; j<songs_with_ratings.length ; j++){
            let a = songs_with_ratings[i].title
            let b = songs_with_ratings[j].title
            $("#levi").text(a);
            $("#desni").text(b);
            while(!val)
                await sleep(100);
            let v = val;
            val = 0;
            cnt++;
            if (v == -1){
                new_rating = elo([songs_with_ratings[i].rating, songs_with_ratings[j].rating]);
                songs_with_ratings[i].rating = new_rating[0];
                songs_with_ratings[j].rating = new_rating[1];
            }else{
                new_rating = elo([songs_with_ratings[j].rating, songs_with_ratings[i].rating]);
                songs_with_ratings[j].rating = new_rating[0];
                songs_with_ratings[i].rating = new_rating[1];
            }
            console.log([...songs_with_ratings].sort((a,b) => a.rating > b.rating ? -1 : a.rating > b.rating ? 1 : 0));
            $('#rating_debug').text([...songs_with_ratings].sort((a,b) => a.rating > b.rating ? -1 : a.rating > b.rating ? 1 : 0)
                                .map(e => e.title + '    ' + e.rating.toFixed(2) )
                                .join("\n") + "\n\nNum comparisons: " + cnt)
        }
        
    }
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

const elo = ([...ratings], kFactor = 128, selfRating) => {
    const [a, b] = ratings;
    const expectedScore = (self, opponent) => 1 / (1 + 10 ** ((opponent - self) / 400));
    const newRating = (rating, i) =>
      (selfRating || rating) + kFactor * (i - expectedScore(i ? a : b, i ? b : a));
    if (ratings.length === 2) {
      return [newRating(a, 1), newRating(b, 0)];
    }
    for (let i = 0, len = ratings.length; i < len; i++) {
      let j = i;
      while (j < len - 1) {
        j++;
        [ratings[i], ratings[j]] = elo([ratings[i], ratings[j]], kFactor);
      }
    }
    return ratings;
  };