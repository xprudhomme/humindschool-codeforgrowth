let fetch = require('node-fetch');

async function getApiResponse() {
    let apiresponse = await fetch("https://prod-dot-mcdonaldsfrance-storelocator.appspot.com/api/store/nearest?center=2.3589005999999997:48.8617257&dist=30000&limit=20&authToken=26938DBF9169A7F39C92BDCF1BA7A&db=prod", {"credentials":"omit","headers":{"accept":"application/json"},"referrer":"https://www.restaurants.mcdonalds.fr/","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"});
    console.log(apiresponse);
}

//getApiResponse();












function multiplyBy(x, multiplier) {
    let y = x * multiplier;
    return y;
}

let result = multiplyBy(2, 3);
