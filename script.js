let userLevel = 30;
let recents = [];
let recentsMaxSize = 5;
const maxIterationsBeforeBreak = 100000;
let blacklist = [];
let items = [];

document.getElementById("generate-button").addEventListener("click", () => {
    console.log("Generate button clicked");
    generate();
});
document.getElementById("minus-button").addEventListener("click", () => {
    console.log("Minus button clicked");
    changeLevel(-1);
});
document.getElementById("plus-button").addEventListener("click", () => {
    console.log("Plus button clicked");
    changeLevel(1);
});
document.getElementById("remove-button").addEventListener("click", () => {
    console.log("Remove button clicked");
    removeItem();
});

function changeLevel(change) {
    // validate argument, since only 1 weapon is available at lv1 we
    // don't allow the user to set it that low
    if (userLevel >= 30 || userLevel <= 2) {
        return;
    }
    userLevel += change;
    document.getElementById("level-text").innerText = userLevel;
    console.log("User level changed to: ", userLevel);

    if (userLevel <= 6) {
        recentsMaxSize = 1;
    } else {
        recentsMaxSize = 5;
    }

    // Clear recents
    recents = [];

    // Trigger a new item generation after the level is changed
    generate();
}

function generate() {
    if (items.length === 0) {
        console.error("Items data is not loaded");
        return;
    }

    let item = getRandomItem();
    let iterations = 0;

    while (
        item.level > userLevel ||
        blacklist.includes(item.main) ||
        recents.includes(item.main)
    ) {
        item = getRandomItem();
        // console.log(
        //     `item level is ${item.level} and user level is ${userLevel}`
        // );

        iterations++;
        if (iterations > maxIterationsBeforeBreak) break;
    }

    console.log(`iterations: ${iterations}, recents: ${recents}`);

    recents.push(item.main);
    if (recents.length > recentsMaxSize) {
        recents.shift();
    }

    document.getElementById("item-name").innerText = item.main;
    document.getElementById("main-image").src = `sprites/main/${item.main}.png`;
    document.getElementById("sub-image").src = `sprites/sub/${item.sub}.png`;
    document.getElementById(
        "special-image"
    ).src = `sprites/special/${item.special}.png`;

    console.log("Generated item: ", item);
}

function getRandomItem() {
    return items[Math.floor(Math.random() * items.length)];
}

function removeItem() {
    const itemName = document.getElementById("item-name").innerText;
    blacklist.push(itemName);
    generate();
}

// Fetch items.json
fetch("./items.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText
            );
        }
        return response.json();
    })
    .then((data) => {
        console.log("Data fetched successfully:", data);
        items = data; // Directly assign the fetched array to items

        if (!Array.isArray(items)) {
            throw new Error("Items data is not an array");
        }

        // Initial generation
        generate();
    })
    .catch((error) => console.error("Error loading items.json:", error));
