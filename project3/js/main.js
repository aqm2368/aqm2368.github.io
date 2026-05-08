let prefix = "aqm2368-amiibo-";


let filter = document.querySelector("#filter");
let filterToggle = document.querySelector("#filter-toggle");
filterToggle.addEventListener("click", openFilter);

let searchPrefix = "searchQuery";
let searchQuery = document.querySelector("#search-query");
let searchBackground = document.querySelector("#search-background");

if(!localStorage.getItem(prefix + searchPrefix))
{
    localStorage.setItem(prefix + searchPrefix, "");
    searchBackground.textContent = "Search...";
}
else {
    searchQuery.value = localStorage.getItem(prefix + searchPrefix);
    searchBackground.textContent = "";
}

searchQuery.addEventListener("mousedown", () => {
    searchQuery.value = searchQuery.value.trim();
    searchBackground.textContent = "";
    if(localStorage.getItem(prefix + searchPrefix) === searchQuery.value)
    {
        return;
    }
})
searchQuery.addEventListener("blur", () => {
    console.log("Blurring");
    searchQuery.value = searchQuery.value.trim();
    localStorage.setItem(prefix + searchPrefix, searchQuery.value);

    if(localStorage.getItem(prefix + searchPrefix) === "")
    {
        console.log("Blur set");
        searchBackground.textContent = "Search...";
        return;
    }
})
searchQuery.addEventListener("keydown", (e) => {
    searchQuery.value = searchQuery.value.trim();
    if (e.key === "Enter" && searchQuery.value !== "") {
        localStorage.setItem(prefix + searchPrefix, searchQuery.value);
        window.location.href = `${window.location.href.substring(0, window.location.href.lastIndexOf('/'))}/results.html?${encodeURIComponent(searchQuery.value)}`;
    }
})

function openFilter() {
    if (filter.style.display === "flex") {
        filter.style.display = "none";
        return;
    }

    filter.style.display = "flex";

    const targetWidth = filter.scrollWidth;
    const targetHeight = filter.scrollHeight;

    let startTime = null;
    const duration = 300;

    function animation(timestamp) {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);

        const eased = lerp(0, 1, easeIn(t, 5));

        filter.style.margin = `${(targetHeight - targetHeight * eased) / 2}px ${(targetWidth - targetWidth * eased) / 2}px`

        filter.style.width = `${targetWidth * eased}px`;
        filter.style.height = `${targetHeight * eased}px`;

        if (t < 1) {
            requestAnimationFrame(animation);
        }
        else{
            filter.style.margin = "0px";
        }
    }

    filter.style.width = "0px";
    filter.style.height = "0px";
    filter.style.margin = `${targetHeight / 2}px ${targetWidth / 2}px`;

    requestAnimationFrame(animation);
}

function lerp(a=0, b=1, t=0.5) {
    t = Math.max(Math.min(t, 1), 0);
    return a + (b - a) * t;
}

function easeIn(t = 0.5, strength = 3) {
    return 1 - (1 - Math.pow(t, 1 / strength));
}

function loadList(list) {
    for(li of list.children) {

    }
}

export function setSearch() {
    searchQuery.value = localStorage.getItem(prefix + searchPrefix);
}