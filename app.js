let selectedCategory = null;


/* CATEGORY SELECTION */

function selectCategory(category) {

    selectedCategory = category;
window.selectedCategory = category;

    const categoryNames = {
        food: "🍔 Food selected",
        grocery: "🛒 Groceries selected",
        service: "🔧 Service selected"
    };

    document.getElementById("selectedCategory").textContent =
        categoryNames[category];
}


/* PROCESS USER REQUEST */

/* =========================================================
   PROCESS USER REQUEST
   Connects the MatrixOps interface to the AI agent.
   ========================================================= */

 
async function processRequest() {
    const textRequest =
    document.getElementById("userRequest").value.trim();

const request =
    window.matrixUploadedImage
        ? textRequest +
          "\n\n[User uploaded an image: " +
          window.matrixUploadedImage.name +
          "]"
        : textRequest;

    if (!request) {
        alert("Please tell MatrixOps what you need.");
        return;
    }

    if (!selectedCategory) {
        alert("Please choose Food, Groceries or Services first.");
        return;
    }

    /* -----------------------------------------------------
       FOOD
       Send the user's natural-language request to the
       MatrixOps Food Agent.
       ----------------------------------------------------- */

    if (selectedCategory === "food") {

        console.log("MatrixOps Food Agent started.");

        const result = await runMatrixFoodAgent(request);

        console.log("MatrixOps Food Agent result:", result);

        /* Handle errors */

if (result.error) {

    alert(
        "MatrixOps could not complete the search: " +
        result.error
    );

    return;
}

/* -----------------------------------------------------
   REQUIREMENT NEGOTIATION
   ----------------------------------------------------- */

if (result.negotiation && result.negotiation.needed) {

    console.log(
        "MatrixOps negotiation triggered:",
        result.negotiation
    );

    showNegotiation(result.negotiation);

    return;
}

/* Show the agent's ranked Top 3 */

showResults(
    result.results,
    request
);

return;
}
    /* -----------------------------------------------------
   GROCERY AGENT
   ----------------------------------------------------- */

if (selectedCategory === "grocery") {

    console.log("MatrixOps Grocery Agent started.");

    const result =
        await runMatrixGroceryAgent(request);

    console.log(
        "MatrixOps Grocery Agent result:",
        result
    );

    if (result.error) {

        alert(
            "MatrixOps could not complete the grocery search: " +
            result.error
        );

        return;
    }

    showResults(
        result.results,
        request
    );

    return;
}


/* -----------------------------------------------------
   TEMPORARY SERVICE FALLBACK
   ----------------------------------------------------- */

if (selectedCategory === "service") {

    console.log("MatrixOps Service Agent started.");

    const result = await runMatrixServiceAgent(request);

    console.log(
        "MatrixOps Service Agent result:",
        result
    );

    if (result.error) {

        alert(
            "MatrixOps could not complete the service search: " +
            result.error
        );

        return;
    }

    showResults(
        result.results,
        request
    );

    return;
}
}


/* SHOW RESULTS */

/* =========================================================
   MATRIXOPS RESULT + CONFIRMATION FLOW
   User selects → reviews → confirms
   ========================================================= */

let selectedOption = null;

/* =========================================================
   SHOW RESULTS + USER SELECTION
   ========================================================= */

function showResults(options, request) {

    const resultsSection =
        document.getElementById("resultsSection");

    const resultContainer =
        document.getElementById("resultsContainer");

    const description =
        document.getElementById("resultDescription");

    resultsSection.classList.remove("hidden");

    description.textContent =
        "MatrixOps analyzed your request: \"" +
        request +
        "\"";

    resultContainer.innerHTML = "";

    const trend = matrixTrends[window.selectedCategory];

if (trend) {
    const trendBox = document.createElement("div");

    trendBox.style.cssText = `
        margin-bottom:20px;
        padding:16px;
        border-radius:12px;
        background:#171922;
        border:1px solid #30333d;
    `;

    trendBox.innerHTML = `
        <strong>${trend.title}</strong>
        <p style="margin:8px 0 0; color:#9ca3af;">
            ${trend.message}
        </p>
    `;

    resultContainer.appendChild(trendBox);
}

    options.forEach((option, index) => {

        const card = document.createElement("div");

        card.className = "result-card";

        card.innerHTML = `
            <h3>
                ${index === 0 ? "🥇 " : ""}
                ${option.name}
            </h3>

            <p>
                ${generateSummary(option)}
            </p>

            <div class="result-details">

                <span class="detail">
                    💰 RM${option.price}
                </span>

                <span class="detail">
                    ⭐ ${option.rating}
                </span>

                ${
                    option.deliveryTime
                    ? `<span class="detail">
                        🚚 ${option.deliveryTime} min
                       </span>`
                    : ""
                }

                ${
                    option.distance
                    ? `<span class="detail">
                        📍 ${option.distance} km
                       </span>`
                    : ""
                }

                ${
                    option.promotion
                    ? `<span class="detail">
                        🏷️ ${option.promotion}
                       </span>`
                    : ""
                }

            </div>
            ${
                option.reasons && option.reasons.length > 0
                ? `
                    <div style="
                        margin-top:18px;
                        padding:16px;
                        border-radius:12px;
                        background:#171922;
                        border:1px solid #30333d;
                    ">
                        <strong>
                            🧠 Why MatrixOps recommends this
                        </strong>

                        <div style="
                            margin-top:10px;
                            line-height:1.8;
                        ">
                            ${option.reasons
                                .map(reason => `✅ ${reason}`)
                                .join("<br>")}
                        </div>
                    </div>
                `
                : ""
            }
            <div style="
                margin-top:20px;
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    onclick="selectOption(${index})"
                    style="
                        padding:12px 18px;
                        border:none;
                        border-radius:10px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Select this option →
                </button>

            </div>
        `;

        resultContainer.appendChild(card);
    });

    // Save the options for later selection
    window.matrixOptions = options;
window.matrixRequest = request;

const multiPersonButton = document.createElement("button");

multiPersonButton.type = "button";
multiPersonButton.textContent = "👥 Decide for multiple people";
multiPersonButton.onclick = runMultiPersonDecision;

multiPersonButton.style.cssText = `
    margin-top:20px;
    margin-right:10px;
    padding:12px 18px;
    border:none;
    border-radius:10px;
    cursor:pointer;
    font-weight:600;
`;

resultContainer.appendChild(multiPersonButton);

const whatIfButton = document.createElement("button");

whatIfButton.type = "button";
whatIfButton.textContent = "🔄 Try another scenario";
whatIfButton.onclick = runWhatIf;

whatIfButton.style.cssText = `
    margin-top:20px;
    padding:12px 18px;
    border:none;
    border-radius:10px;
    cursor:pointer;
    font-weight:600;
`;

resultContainer.appendChild(whatIfButton);

resultsSection.scrollIntoView({ behavior: "smooth" });
}


/* =========================================================
   SELECT AN OPTION
   ========================================================= */

function selectOption(index) {

    const option = window.matrixOptions[index];

    if (!option) {
        return;
    }

    // Save selected option
    window.selectedMatrixOption = option;

    // Create confirmation area
    const resultContainer =
        document.getElementById("resultsContainer");

    const confirmation =
        document.createElement("div");

    confirmation.id = "confirmationPanel";

    confirmation.style.marginTop = "30px";
    confirmation.style.padding = "25px";
    confirmation.style.border = "1px solid #444";
    confirmation.style.borderRadius = "15px";

    confirmation.innerHTML = `

        <h2>✅ Option Selected</h2>

        <p>
            You selected <strong>${option.name}</strong>.
        </p>

        <p>
            MatrixOps is ready to finalize this choice.
        </p>

        <div style="
            display:flex;
            gap:12px;
            margin-top:20px;
            flex-wrap:wrap;
        ">

            <button
                onclick="changeRequirements()"
                style="
                    padding:12px 18px;
                    border:1px solid #555;
                    border-radius:10px;
                    cursor:pointer;
                    background:transparent;
                    color:inherit;
                "
            >
                ← Change requirements
            </button>

            <button
                onclick="finalizeBooking()"
                style="
                    padding:12px 18px;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                Finalize booking →
            </button>

        </div>
    `;

    resultContainer.appendChild(confirmation);

    confirmation.scrollIntoView({
        behavior: "smooth"
    });

    console.log(
        "MatrixOps selected option:",
        option
    );
}


/* =========================================================
   CHANGE REQUIREMENTS
   ========================================================= */

function changeRequirements() {

    const resultsSection =
        document.getElementById("resultsSection");

    // Hide previous results
    resultsSection.classList.add("hidden");

    // Go back to the chat box
    const input =
        document.getElementById("userRequest");

    input.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    // Focus the input
    setTimeout(() => {
        input.focus();
    }, 500);

    console.log(
        "MatrixOps: User is changing requirements."
    );
}


/* =========================================================
   FINALIZE BOOKING
   ========================================================= */

function finalizeBooking() {

    const option =
        window.selectedMatrixOption;

    if (!option) {
        alert("Please select an option first.");
        return;
    }

    alert(
        "MatrixOps has finalized your selection:\n\n" +
        option.name +
        "\nRM" +
        option.price +
        "\n\nNext step: proceed to the payment / booking page."
    );

    console.log(
        "MatrixOps finalized:",
        option
    );
}


/* =========================================================
   SELECT AN OPTION
   ========================================================= */

function selectOption(index) {

    const option = window.matrixOptions[index];

    if (!option) {
        return;
    }

    window.selectedMatrixOption = option;
    selectedOption = option;

    const resultContainer =
        document.getElementById("resultsContainer");

    resultContainer.innerHTML = "";

    const confirmation = document.createElement("div");

    confirmation.className = "confirmation-card";

    confirmation.style.padding = "28px";
    confirmation.style.border = "1px solid #3b82f6";
    confirmation.style.borderRadius = "18px";
    confirmation.style.background = "#101116";

    confirmation.innerHTML = `

        <h2>✅ Your Selected Option</h2>

        <h3 style="margin-top:20px;">
            ${option.name}
        </h3>

        <div class="result-details" style="margin-top:15px;">

            <span class="detail">
                💰 RM${option.price}
            </span>

            <span class="detail">
                ⭐ ${option.rating}
            </span>

            ${
                option.deliveryTime
                ? `<span class="detail">
                    🚚 ${option.deliveryTime} min
                </span>`
                : ""
            }

            ${
                option.distance
                ? `<span class="detail">
                    📍 ${option.distance} km
                </span>`
                : ""
            }

        </div>

        <h3 style="margin-top:28px;">
            MatrixOps requirement check
        </h3>

        <div style="margin-top:15px; line-height:2;">

            ${selectedCategory === "grocery" ? `

    ${option.quantityAvailable >= 2
        ? "✅ Requested quantity available"
        : "❌ Not enough stock"}

    <br>

    ${option.price <= 10
        ? "✅ Within budget"
        : "❌ Over budget"}

    <br>

    ${option.deliveryAvailable
        ? "✅ Delivery available"
        : "❌ Delivery unavailable"}

    <br>

    ${option.open
        ? "✅ Currently available"
        : "❌ Currently closed"}

    <br>

    ${option.promotion
        ? "🏷️ " + option.promotion
        : "ℹ️ No promotion available"}

` :
selectedCategory === "service"
    ? `
        ${option.price <= 40
            ? "✅ Within budget"
            : "❌ Over budget"}

        <br>

        ${option.rating >= 4
            ? "✅ Highly rated"
            : "⚠️ Lower rating"}

        <br>

        ${option.distance <= 5
            ? "✅ Within preferred distance"
            : "❌ Outside preferred distance"}

        <br>

        ${option.open
            ? "✅ Currently available"
            : "❌ Currently closed"}

        <br>

        ${option.promotion
            ? "🏷️ " + option.promotion
            : "ℹ️ No promotion available"}

        <br>

        ${option.earliestSlot
            ? "🕐 Earliest slot: " + option.earliestSlot
            : ""}
    `
    : `

    ${option.price <= 70
        ? "✅ Within budget"
        : "❌ Over budget"}

    <br>

    ${option.sugar <= 15
        ? "✅ Low sugar"
        : "❌ Sugar above target"}

    <br>

    ${option.protein >= 30
        ? "✅ High protein / fitness friendly"
        : "⚠️ Lower protein"}

    <br>

    ${option.valentines
        ? "✅ Valentine's option"
        : "⚠️ No Valentine's-specific package"}

    <br>

    ${option.open
        ? "✅ Currently available"
        : "❌ Currently closed"}

`}

        </div>

        <div style="
            margin-top:30px;
            display:flex;
            gap:12px;
            flex-wrap:wrap;
        ">

            <button
                onclick="changeRequirement()"
                style="
                    padding:13px 20px;
                    border-radius:10px;
                    border:1px solid #444;
                    background:#181a21;
                    color:white;
                    cursor:pointer;
                ">
                ✏️ Change requirement
            </button>

            <button
                onclick="confirmOrder()"
                style="
                    padding:13px 20px;
                    border-radius:10px;
                    border:none;
                    background:white;
                    color:black;
                    font-weight:bold;
                    cursor:pointer;
                ">
                Confirm & Continue →
            </button>

        </div>

    `;

    resultContainer.appendChild(confirmation);

    window.scrollTo({
        top: document.getElementById("resultsSection").offsetTop,
        behavior: "smooth"
    });
}


/* =========================================================
   CHANGE REQUIREMENT
   ========================================================= */

function changeRequirement() {

    const input =
        document.getElementById("userRequest");

    input.focus();

    input.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    input.style.border = "2px solid #3b82f6";

    setTimeout(() => {
        input.style.border = "";
    }, 2000);
}


/* =========================================================
   HUMAN CONFIRMATION
   ========================================================= */

function confirmOrder() {

    if (!selectedOption) {
        alert("Please select an option first.");
        return;
    }

    const resultContainer =
        document.getElementById("resultsContainer");

    resultContainer.innerHTML = `

        <div style="
            padding:30px;
            border:1px solid #30333d;
            border-radius:18px;
            background:#101116;
            text-align:center;
        ">

            <h2>🎉 Ready to Continue</h2>

            <p style="
                margin-top:15px;
                color:#9ca3af;
            ">
                MatrixOps has completed the discovery,
                comparison and optimization process.
            </p>

            <h3 style="margin-top:25px;">
                ${selectedOption.name}
            </h3>

            <p>
                RM${selectedOption.price}
            </p>

            <div style="
                margin-top:25px;
                padding:15px;
                border-radius:12px;
                background:#181a21;
            ">
                🔐 Human confirmation received
                <br>
                MatrixOps is ready to hand off
                to the ordering platform.
            </div>

            <button
                onclick="openDemoCheckout()"
                style="
                    margin-top:25px;
                    padding:14px 24px;
                    border-radius:10px;
                    border:none;
                    background:white;
                    color:black;
                    font-weight:bold;
                    cursor:pointer;
                ">
                Continue to Ordering →
            </button>

        </div>
    `;
}


/* =========================================================
   DEMO CHECKOUT / HANDOFF
   ========================================================= */

function openDemoCheckout() {

    const option = selectedOption;

    if (!option) {
        alert("No selected option found.");
        return;
    }

    const resultContainer =
        document.getElementById("resultsContainer");

    resultContainer.innerHTML = `
        <div style="
            padding:35px;
            border:1px solid #3b82f6;
            border-radius:18px;
            background:#101116;
            text-align:center;
        ">

            <h2>🛒 Continue to Ordering</h2>

            <p style="
                margin-top:15px;
                color:#9ca3af;
            ">
                Human confirmation completed.
                <br>
                MatrixOps is handing you off
                to the ordering platform.
            </p>

            <div style="
                margin:25px auto;
                padding:20px;
                max-width:500px;
                border-radius:12px;
                background:#181a21;
            ">

                <h3>${option.name}</h3>

                <p style="margin-top:10px;">
                    ${option.branch || "Selected location"}
                </p>

                <p style="
                    margin-top:15px;
                    font-size:20px;
                    font-weight:bold;
                ">
                    RM${Number(option.price).toFixed(2)}
                </p>

            </div>

            <div style="
                padding:15px;
                border-radius:12px;
                background:#181a21;
                color:#9ca3af;
            ">
                🔐 Payment remains under human control.
                <br>
                MatrixOps does not enter payment details.
            </div>

            <button
                onclick="changeRequirements()"
                style="
                    margin-top:25px;
                    padding:14px 24px;
                    border-radius:10px;
                    border:none;
                    background:white;
                    color:black;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Back to MatrixOps →
            </button>

        </div>
    `;

    console.log(
        "MatrixOps handoff completed:",
        option
    );
}


/* CREATE SHORT EXPLANATION */

function generateSummary(option) {

    if (selectedCategory === "food") {

        return `
            ${option.sugar}g sugar •
            ${option.protein}g protein •
            ${option.calories} kcal •
            ${option.branch} branch •
            ${option.experience}
        `;
    }

    if (selectedCategory === "grocery") {

        return `
            ${option.stock ? "In stock" : "Out of stock"} •
            ${option.deliveryTime} min delivery •
            ${option.promotion}
        `;
    }

    return `
        Earliest slot: ${option.earliestSlot} •
        ${option.promotion}
    `;
}


/* VOICE INPUT */

function startVoice() {

    if (!("webkitSpeechRecognition" in window)) {

        alert(
            "Voice input is not supported in this browser. Please use Google Chrome."
        );

        return;
    }

    const recognition =
        new webkitSpeechRecognition();

    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;

        document.getElementById("userRequest").value =
            transcript;
    };
}/* =========================================================
   MATRIXOPS WEBMCP TOOL
   Tool: search_food_options
   ========================================================= */

async function registerMatrixOpsTools() {
/* =========================================================
   MATRIXOPS WEBMCP — PREPARE FOOD ORDER
   Creates a structured order for human review.
   It does NOT charge the user or place a payment.
   ========================================================= */

if (document.modelContext) {

    document.modelContext.registerTool({

        name: "prepare_food_order",

        title: "Prepare Food Order",

        description:
            "Prepare a selected food option for ordering. " +
            "Use this after the user has selected a food option. " +
            "This tool creates an order summary for human review. " +
            "It does not make a payment or place a final order.",

        inputSchema: {

            type: "object",

            properties: {

                restaurant: {
                    type: "string",
                    description:
                        "Name of the selected restaurant."
                },

                item: {
                    type: "string",
                    description:
                        "Name of the selected food item."
                },

                price: {
                    type: "number",
                    description:
                        "Price of the selected food item in Malaysian Ringgit."
                },

                deliveryTime: {
                    type: "number",
                    description:
                        "Estimated delivery time in minutes."
                },

                deliveryType: {
                    type: "string",
                    enum: [
                        "delivery",
                        "pickup",
                        "dine-in"
                    ]
                }

            },

            required: [
                "restaurant",
                "item",
                "price"
            ]
        },

        annotations: {
            readOnlyHint: false
        },

        execute: async ({
            restaurant,
            item,
            price,
            deliveryTime,
            deliveryType
        }) => {

            const order = {

orderId:
    "MO-" + Date.now(),

                restaurant,
                item,
                price,
                deliveryTime:
                    deliveryTime || null,

                deliveryType:
                    deliveryType || "delivery",

                status:
                    "awaiting_human_confirmation",

                createdAt:
                    new Date().toISOString()
            };

            // Store the order in MatrixOps state
            window.matrixPendingOrder = order;

            console.log(
                "MatrixOps prepared order:",
                order
            );

            // Show the order review on the website
            showOrderReview(order);

            return JSON.stringify({

                success: true,

                status:
                    "awaiting_human_confirmation",

                message:
                    "Order prepared successfully. " +
                    "Human confirmation is required " +
                    "before final ordering or payment.",

                order

            });
        }

    });

}
    // Check whether WebMCP is available in this browser.
    if (!document.modelContext) {
        console.log(
            "WebMCP is not available. Make sure WebMCP Testing is enabled in Chrome."
        );
        return;
    }


    /*
     * SEARCH FOOD OPTIONS
     *
     * This tool allows an AI agent to search MatrixOps'
     * food database using structured requirements.
     */

    await document.modelContext.registerTool({

        name: "search_food_options",

        title: "Search Food Options",

        description:
            "Find food options in MatrixOps based on price, sugar, rating, dietary requirements, location and availability.",


        inputSchema: {

            type: "object",

            properties: {

                maxPrice: {
                    type: "number",
                    description:
                        "Maximum acceptable price in Malaysian Ringgit."
                },

                maxSugar: {
                    type: "number",
                    description:
                        "Maximum acceptable sugar amount in grams."
                },

                minRating: {
                    type: "number",
                    description:
                        "Minimum acceptable customer rating from 0 to 5."
                },

                halalOnly: {
                    type: "boolean",
                    description:
                        "Whether the food must be halal."
                },

                vegetarianOnly: {
                    type: "boolean",
                    description:
                        "Whether the food must be vegetarian."
                },

                maxDeliveryTime: {
                    type: "number",
                    description:
                        "Maximum acceptable delivery time in minutes."
                }

            }

        },


        annotations: {
            readOnlyHint: true
        },


        execute: async (input) => {

            /*
             * Start with all available food options.
             */

            let results = [...foodOptions];


            /*
             * PRICE FILTER
             */

            if (input.maxPrice !== undefined) {

                results = results.filter(
                    food => food.price <= input.maxPrice
                );

            }


            /*
             * SUGAR FILTER
             */

            if (input.maxSugar !== undefined) {

                results = results.filter(
                    food => food.sugar <= input.maxSugar
                );

            }


            /*
             * RATING FILTER
             */

            if (input.minRating !== undefined) {

                results = results.filter(
                    food => food.rating >= input.minRating
                );

            }


            /*
             * HALAL FILTER
             */

            if (input.halalOnly === true) {

                results = results.filter(
                    food => food.halal === true
                );

            }


            /*
             * VEGETARIAN FILTER
             */

            if (input.vegetarianOnly === true) {

                results = results.filter(
                    food => food.vegetarian === true
                );

            }


            /*
             * DELIVERY TIME FILTER
             */

            if (input.maxDeliveryTime !== undefined) {

                results = results.filter(
                    food => food.deliveryTime <= input.maxDeliveryTime
                );

            }


            /*
             * RETURN STRUCTURED RESULTS
             */

            return results.map(food => ({

                name: food.name,

                price: food.price,

                rating: food.rating,

                reviews: food.reviews,

                sugar: food.sugar,

                protein: food.protein,

                calories: food.calories,

                halal: food.halal,

                vegetarian: food.vegetarian,

                promotion: food.promotion,

                deliveryTime: food.deliveryTime,

                distance: food.distance,

                branch: food.branch,

                open: food.open,

                valentines: food.valentines,

                experience: food.experience

            }));

        }

    });


    console.log(
        "MatrixOps WebMCP tool registered: search_food_options"
    );    
    
    /*
     * =========================================================
     * SEARCH GROCERY OPTIONS
     *
     * WebMCP tool for finding grocery products.
     * =========================================================
     */

    await document.modelContext.registerTool({

        name: "search_grocery_options",

        title: "Search Grocery Options",

        description:
            "Find grocery products based on product name, price, quantity, stock, delivery availability and store rating.",

        inputSchema: {

            type: "object",

            properties: {

                product: {
                    type: "string",
                    description:
                        "Name of the grocery product the user wants."
                },

                maxPrice: {
                    type: "number",
                    description:
                        "Maximum acceptable price in Malaysian Ringgit."
                },

                minQuantity: {
                    type: "number",
                    description:
                        "Minimum quantity required."
                },

                deliveryRequired: {
                    type: "boolean",
                    description:
                        "Whether the user requires delivery."
                }

            }

        },

        annotations: {
            readOnlyHint: true
        },

        execute: async (input) => {

            let results = [...groceryOptions];

            /*
             * PRODUCT FILTER
             */

            if (input.product !== undefined) {

                const searchProduct =
                    input.product.toLowerCase();

                results = results.filter(
                    grocery =>
                        grocery.product
                            .toLowerCase()
                            .includes(searchProduct)
                );

            }

            /*
             * PRICE FILTER
             */

            if (input.maxPrice !== undefined) {

                results = results.filter(
                    grocery =>
                        grocery.price <= input.maxPrice
                );

            }

            /*
             * QUANTITY FILTER
             */

            if (input.minQuantity !== undefined) {

                results = results.filter(
                    grocery =>
                        grocery.quantityAvailable >=
                        input.minQuantity
                );

            }

            /*
             * STOCK FILTER
             */

            results = results.filter(
                grocery => grocery.stock === true
            );

            /*
             * DELIVERY FILTER
             */

            if (input.deliveryRequired === true) {

                results = results.filter(
                    grocery =>
                        grocery.deliveryAvailable === true
                );

            }

            /*
             * RETURN STRUCTURED RESULTS
             */

            return results.map(grocery => ({

                name: grocery.name,

                product: grocery.product,

                quantityAvailable:
                    grocery.quantityAvailable,

                price: grocery.price,

                rating: grocery.rating,

                stock: grocery.stock,

                promotion: grocery.promotion,

                deliveryTime:
                    grocery.deliveryTime,

                distance:
                    grocery.distance,

                open: grocery.open,

                deliveryAvailable:
                    grocery.deliveryAvailable,

                orderUrl:
                    grocery.orderUrl

            }));

        }

    });


    console.log(
        "MatrixOps WebMCP tool registered: search_grocery_options"
    );   
    
    /*
     * SEARCH SERVICE OPTIONS
     *
     * This tool allows an AI agent to search MatrixOps'
     * service database using structured requirements.
     */
    await document.modelContext.registerTool({

        name: "search_service_options",

        title: "Search Service Options",

        description:
            "Find service options in MatrixOps based on price, rating, availability and distance.",

        inputSchema: {
            type: "object",

            properties: {

                maxPrice: {
                    type: "number",
                    description:
                        "Maximum acceptable service price in Malaysian Ringgit."
                },

                minRating: {
                    type: "number",
                    description:
                        "Minimum acceptable customer rating from 0 to 5."
                },

                maxDistance: {
                    type: "number",
                    description:
                        "Maximum acceptable distance in kilometres."
                }

            }
        },

        annotations: {
            readOnlyHint: true
        },

        execute: async (input) => {

            let results = [...serviceOptions];

            /*
             * PRICE FILTER
             */
            if (input.maxPrice !== undefined) {

                results = results.filter(
                    service => service.price <= input.maxPrice
                );

            }

            /*
             * RATING FILTER
             */
            if (input.minRating !== undefined) {

                results = results.filter(
                    service => service.rating >= input.minRating
                );

            }

            /*
             * DISTANCE FILTER
             */
            if (input.maxDistance !== undefined) {

                results = results.filter(
                    service => service.distance <= input.maxDistance
                );

            }

            /*
             * RETURN STRUCTURED RESULTS
             */
            return results.map(service => ({

                name: service.name,

                price: service.price,

                rating: service.rating,

                earliestSlot: service.earliestSlot,

                distance: service.distance,

                promotion: service.promotion,

                open: service.open

            }));

        }

    });

    console.log(
        "MatrixOps WebMCP tool registered: search_service_options"
    );
}


/*
 * Register MatrixOps tools after the page loads.
 */

registerMatrixOpsTools();

/* =========================================================
   MATRIXOPS WEBMCP — COMPARE OPTIONS
   Compares selected options and returns structured trade-offs.
   Read-only: it does not change or purchase anything.
   ========================================================= */

async function registerComparisonTool() {

    if (!document.modelContext) {
        console.log(
            "WebMCP unavailable for compare_matrix_options."
        );
        return;
    }

    document.modelContext.registerTool({

        name: "compare_matrix_options",

        title: "Compare MatrixOps Options",

        description:
            "Compare 2 or more MatrixOps options and return structured trade-offs for price, rating, distance, availability and promotions.",

        inputSchema: {

            type: "object",

            properties: {

                category: {
                    type: "string",
                    enum: [
                        "food",
                        "grocery",
                        "service"
                    ],
                    description:
                        "MatrixOps category to compare."
                },

                optionNames: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    minItems: 2,
                    maxItems: 3,
                    description:
                        "Names of the options to compare."
                }

            },

            required: [
                "category",
                "optionNames"
            ]
        },

        annotations: {
            readOnlyHint: true
        },

        execute: async ({
            category,
            optionNames
        }) => {

            let sourceOptions = [];

            if (category === "food") {
                sourceOptions = foodOptions;
            }

            if (category === "grocery") {
                sourceOptions = groceryOptions;
            }

            if (category === "service") {
                sourceOptions = serviceOptions;
            }

            const selectedOptions =
                sourceOptions.filter(option =>
                    optionNames.includes(option.name)
                );

            if (selectedOptions.length < 2) {

                return JSON.stringify({
                    success: false,
                    error:
                        "At least 2 matching options are required for comparison."
                });

            }

            const comparison =
                selectedOptions.map(option => ({

                    name: option.name,

                    price:
                        option.price ?? null,

                    rating:
                        option.rating ?? null,

                    distance:
                        option.distance ?? null,

                    deliveryTime:
                        option.deliveryTime ?? null,

                    promotion:
                        option.promotion ?? null,

                    open:
                        option.open ?? null,

                    stock:
                        option.stock ?? null,

                    quantityAvailable:
                        option.quantityAvailable ?? null,

                    earliestSlot:
                        option.earliestSlot ?? null

                }));

            return JSON.stringify({

                success: true,

                category,

                comparedOptions:
                    comparison,

                tradeoffs: {

                    cheapest:
                        [...selectedOptions]
                            .sort((a, b) =>
                                a.price - b.price
                            )[0].name,

                    highestRated:
                        [...selectedOptions]
                            .sort((a, b) =>
                                b.rating - a.rating
                            )[0].name,

                    closest:
                        selectedOptions.some(
                            option =>
                                option.distance !== undefined
                        )
                        ? [...selectedOptions]
                            .sort((a, b) =>
                                a.distance - b.distance
                            )[0].name
                        : null,

                    fastestDelivery:
                        selectedOptions.some(
                            option =>
                                option.deliveryTime !== undefined
                        )
                        ? [...selectedOptions]
                            .sort((a, b) =>
                                a.deliveryTime - b.deliveryTime
                            )[0].name
                        : null
                },

                message:
                    "Options compared successfully. MatrixOps can use these trade-offs to support the user's decision."

            });
        }

    });

    console.log(
        "MatrixOps WebMCP tool registered: compare_matrix_options"
    );
}

registerComparisonTool();

// ============================================================
// MatrixOps Food Agent
// Converts natural-language requirements into structured
// preferences, calls the WebMCP food tool, and ranks results.
// ============================================================

async function runMatrixFoodAgent(userRequest) {
    console.log("MatrixOps Agent received:", userRequest);

    // --------------------------------------------------------
    // 1. Extract requirements from the user's natural language
    // --------------------------------------------------------

    const text = userRequest.toLowerCase();

    const requirements = {
        budget: null,
        lowSugar: false,
        halal: false,
        vegetarian: false,
        fastDelivery: false,
        fitness: false,
        event: null,
        priorities: []
    };

    // Budget
    const budgetMatch = text.match(
        /(?:under|below|max(?:imum)?|within)\s*(?:rm|ringgit)?\s*(\d+(?:\.\d+)?)/i
    );

    if (budgetMatch) {
        requirements.budget = Number(budgetMatch[1]);
    }

    // Dietary requirements
    requirements.lowSugar =
        text.includes("low sugar") ||
        text.includes("low-sugar") ||
        text.includes("less sugar") ||
        text.includes("strictly controls his sugar") ||
        text.includes("strictly controls sugar");

    requirements.halal =
        text.includes("halal");

    requirements.vegetarian =
        text.includes("vegetarian");

    // Fitness
    requirements.fitness =
        text.includes("gym") ||
        text.includes("fitness") ||
        text.includes("protein") ||
        text.includes("workout");

    // Delivery
    requirements.fastDelivery =
        text.includes("fast delivery") ||
        text.includes("quick delivery") ||
        text.includes("deliver quickly") ||
        text.includes("as soon as possible");

    // Event
    if (text.includes("valentine")) {
        requirements.event = "Valentine's";
    }

    // --------------------------------------------------------
    // 2. Determine priorities
    // --------------------------------------------------------

    if (requirements.lowSugar) {
        requirements.priorities.push("lowSugar");
    }

    if (requirements.halal) {
        requirements.priorities.push("halal");
    }

    if (requirements.fitness) {
        requirements.priorities.push("fitness");
    }

    if (requirements.fastDelivery) {
        requirements.priorities.push("fastDelivery");
    }

    if (requirements.budget !== null) {
        requirements.priorities.push("budget");
    }

    console.log("MatrixOps structured requirements:", requirements);

    // --------------------------------------------------------
    // 3. Call the WebMCP food discovery tool
    // --------------------------------------------------------

    let foodResults = [];

    try {
        const tools = await document.modelContext.getTools();

        const foodTool = tools.find(
            tool => tool.name === "search_food_options"
        );

        if (!foodTool) {
            throw new Error(
                "search_food_options WebMCP tool was not found."
            );
        }

        const toolArguments = {
            maxPrice: requirements.budget,
            maxSugar: requirements.lowSugar ? 15 : undefined,
            halalOnly: requirements.halal,
            vegetarianOnly: requirements.vegetarian,
            maxDeliveryTime: requirements.fastDelivery ? 45 : undefined
        };

        // Remove undefined values
        Object.keys(toolArguments).forEach(key => {
            if (toolArguments[key] === undefined) {
                delete toolArguments[key];
            }
        });

        console.log(
            "Calling WebMCP search_food_options:",
            toolArguments
        );

        let result;

try {
    // Agent / ChatGPT WebMCP path
    result = await document.modelContext.executeTool(
        foodTool.name,
        toolArguments
    );
} catch (agentError) {
    // Native Chrome WebMCP path
    result = await document.modelContext.executeTool(
        foodTool,
        JSON.stringify(toolArguments)
    );
}
        ;

        foodResults =
            typeof result === "string"
                ? JSON.parse(result)
                : result;

// --------------------------------------------------------
// Requirement negotiation
// If no options satisfy the current requirements,
// ask the user which requirement they want to relax.
// --------------------------------------------------------

if (
    foodResults.length === 0 &&
    requirements.budget !== null
) {

    console.log(
        "MatrixOps could not satisfy all requirements."
    );

const viableOptions =
    foodOptions.filter(food => {

        if (
            requirements.lowSugar &&
            food.sugar > 15
        ) {
            return false;
        }

        if (
            requirements.halal &&
            food.halal !== true
        ) {
            return false;
        }

        if (
            requirements.vegetarian &&
            food.vegetarian !== true
        ) {
            return false;
        }

        if (
            requirements.fastDelivery &&
            food.deliveryTime > 45
        ) {
            return false;
        }

        if (
            requirements.fitness &&
            food.protein < 30
        ) {
            return false;
        }

        return true;
    });

const suggestedBudget =
    viableOptions.length > 0
        ? Math.min(
            ...viableOptions.map(
                food => food.price
            )
        )
        : null;

    return {
        requirements,
        results: [],
        negotiation: {
    needed: true,

    suggestedBudget: suggestedBudget,

    message:
        "I couldn't satisfy all your requirements with the current constraints.",

    options: [
                {
                    id: "increaseBudget",
                    label: "💰 Increase budget",
                    description:
                        "Allow MatrixOps to consider slightly more expensive options."
                },
                {
                    id: "relaxSugar",
                    label: "🍬 Relax sugar requirement",
                    description:
                        "Allow options with slightly higher sugar."
                },
                {
                    id: "relaxFitness",
                    label: "💪 Relax protein requirement",
                    description:
                        "Allow options with lower protein."
                }
            ]
        }
    };
}

    } catch (error) {
        console.error("MatrixOps Agent error:", error);

        return {
            requirements,
            results: [],
            error: error.message
        };
    }

    // --------------------------------------------------------
    // 4. Score every option
    // --------------------------------------------------------

    const scoredResults = foodResults.map(food => {

        let score = 0;
        const reasons = [];
        const failedRequirements = [];

        // Budget
        if (requirements.budget !== null) {

            if (food.price <= requirements.budget) {
                score += 25;
                reasons.push("Within budget");
            } else {
                failedRequirements.push("Over budget");
            }
        }

        // Low sugar
        if (requirements.lowSugar) {

            if (food.sugar <= 15) {
                score += 25;
                reasons.push("Low sugar");
            } else {
                failedRequirements.push("Sugar above target");
            }
        }

        // Halal
        if (requirements.halal) {

            if (food.halal === true) {
                score += 20;
                reasons.push("Halal");
            } else {
                failedRequirements.push("Not halal");
            }
        }

        // Fitness / protein
        if (requirements.fitness) {

            if (food.protein >= 30) {
                score += 15;
                reasons.push("High protein");
            } else {
                failedRequirements.push("Lower protein");
            }
        }

        // Fast delivery
        if (requirements.fastDelivery) {

            if (food.deliveryTime <= 45) {
                score += 10;
                reasons.push("Fast delivery");
            } else {
                failedRequirements.push("Slower delivery");
            }
        }

        // Rating
        if (food.rating >= 4.5) {
            score += 5;
            reasons.push("Highly rated");
        }

        return {
            ...food,
            matrixScore: score,
            reasons,
            failedRequirements
        };
    });

    // --------------------------------------------------------
    // 5. Sort from best to worst
    // --------------------------------------------------------

    scoredResults.sort(
        (a, b) => b.matrixScore - a.matrixScore
    );

    // --------------------------------------------------------
    // 6. Return top 3
    // --------------------------------------------------------

    return {
        requirements,
        results: scoredResults.slice(0, 3)
    };
}

// ============================================================
// MatrixOps Grocery Agent
// Converts natural-language grocery requirements into structured
// preferences, calls the WebMCP grocery tool, and ranks results.
// ============================================================

async function runMatrixGroceryAgent(userRequest) {

    console.log("MatrixOps Grocery Agent received:", userRequest);

    // --------------------------------------------------------
    // 1. Extract requirements
    // --------------------------------------------------------

    const text = userRequest.toLowerCase();

    const requirements = {
        product: null,
        budget: null,
        quantity: 1,
        delivery: false,
        priorities: []
    };

    // Product
    if (text.includes("mineral water")) {
        requirements.product = "Mineral Water";
    } else if (text.includes("water")) {
        requirements.product = "Mineral Water";
    }

    // Budget
    const budgetMatch = text.match(
        /(?:under|below|max(?:imum)?|within)\s*(?:rm|ringgit)?\s*(\d+(?:\.\d+)?)/i
    );

    if (budgetMatch) {
        requirements.budget = Number(budgetMatch[1]);
    }

    // Quantity
    const quantityMatch = text.match(
        /(\d+)\s*(?:bottle|bottles|item|items|unit|units|pack|packs)/
    );

    if (quantityMatch) {
        requirements.quantity = Number(quantityMatch[1]);
    }

    // Delivery
    requirements.delivery =
        text.includes("delivery") ||
        text.includes("deliver") ||
        text.includes("delivered");

    // Priorities
    if (requirements.product) {
        requirements.priorities.push("product");
    }

    if (requirements.budget !== null) {
        requirements.priorities.push("budget");
    }

    if (requirements.quantity > 1) {
        requirements.priorities.push("quantity");
    }

    if (requirements.delivery) {
        requirements.priorities.push("delivery");
    }

    console.log(
        "MatrixOps Grocery structured requirements:",
        requirements
    );

    // --------------------------------------------------------
    // 2. Call Grocery WebMCP tool
    // --------------------------------------------------------

    let groceryResults = [];

    try {

        const tools =
            await document.modelContext.getTools();

        const groceryTool =
            tools.find(
                tool =>
                    tool.name === "search_grocery_options"
            );

        if (!groceryTool) {
            throw new Error(
                "search_grocery_options WebMCP tool was not found."
            );
        }

        const toolArguments = {
            product: requirements.product,
            maxPrice: requirements.budget,
            minQuantity: requirements.quantity,
            deliveryRequired: requirements.delivery
        };

        // Remove null values
        Object.keys(toolArguments).forEach(key => {

            if (
                toolArguments[key] === null ||
                toolArguments[key] === undefined
            ) {
                delete toolArguments[key];
            }

        });

        console.log(
            "Calling WebMCP search_grocery_options:",
            toolArguments
        );

        let result;

try {
    // Agent / ChatGPT WebMCP path
    result = await document.modelContext.executeTool(
        groceryTool.name,
        toolArguments
    );
} catch (agentError) {
    // Native Chrome WebMCP path
    result = await document.modelContext.executeTool(
        groceryTool,
        JSON.stringify(toolArguments)
    );
}
        groceryResults =
            typeof result === "string"
                ? JSON.parse(result)
                : result;

    } catch (error) {

        console.error(
            "MatrixOps Grocery Agent error:",
            error
        );

        return {
            requirements,
            results: [],
            error: error.message
        };
    }

    // --------------------------------------------------------
    // 3. Score grocery options
    // --------------------------------------------------------

    const scoredResults =
        groceryResults.map(grocery => {

            let score = 0;

            const reasons = [];

            // Budget
            if (requirements.budget !== null) {

                if (grocery.price <= requirements.budget) {

                    score += 30;

                    reasons.push("Within budget");

                }

            }

            // Quantity
            if (
                grocery.quantityAvailable >=
                requirements.quantity
            ) {

                score += 25;

                reasons.push("Enough stock");

            }

            // Delivery
            if (requirements.delivery) {

                if (
                    grocery.deliveryAvailable === true
                ) {

                    score += 20;

                    reasons.push("Delivery available");

                }

            }

            // Rating
            if (grocery.rating >= 4.5) {

                score += 15;

                reasons.push("Highly rated");

            }

            // Promotion
            if (grocery.promotion) {

                score += 10;

                reasons.push("Promotion available");

            }

            return {
                ...grocery,
                matrixScore: score,
                reasons
            };

        });

    // --------------------------------------------------------
    // 4. Sort from best to worst
    // --------------------------------------------------------

    scoredResults.sort(
        (a, b) =>
            b.matrixScore - a.matrixScore
    );

    // --------------------------------------------------------
    // 5. Return Top 3
    // --------------------------------------------------------

    return {

        requirements,

        results:
            scoredResults.slice(0, 3)

    };
}

// ============================================================
// MatrixOps Service Agent
// ============================================================

async function runMatrixServiceAgent(userRequest) {

    console.log(
        "MatrixOps Service Agent received:",
        userRequest
    );

    const text = userRequest.toLowerCase();

    const requirements = {
        budget: null,
        minRating: null,
        maxDistance: null,
        priorities: []
    };

    // -----------------------------
    // Extract budget
    // -----------------------------

    const budgetMatch = text.match(
        /(?:under|below|max(?:imum)?|within)\s*(?:rm|ringgit)?\s*(\d+(?:\.\d+)?)/i
    );

    if (budgetMatch) {
        requirements.budget = Number(budgetMatch[1]);
        requirements.priorities.push("budget");
    }

    // -----------------------------
    // Extract rating
    // -----------------------------

    const ratingMatch = text.match(
        /(?:rating|rated|reviews?|stars?)\s*(?:of|at least|above|over)?\s*(\d+(?:\.\d+)?)/i
    );

    if (ratingMatch) {

        requirements.minRating = Number(ratingMatch[1]);

        requirements.priorities.push("rating");

    } else if (
        text.includes("good reviews") ||
        text.includes("good rating") ||
        text.includes("highly rated")
    ) {

        requirements.minRating = 4;

        requirements.priorities.push("rating");
    }

    // -----------------------------
    // Extract distance
    // -----------------------------

    const distanceMatch = text.match(
        /(?:within|under|less than|up to)\s*(\d+(?:\.\d+)?)\s*(?:km|kilometers|kilometres)/i
    );

    if (distanceMatch) {

        requirements.maxDistance =
            Number(distanceMatch[1]);

        requirements.priorities.push("distance");
    }

    console.log(
        "MatrixOps Service structured requirements:",
        requirements
    );

    // -----------------------------
    // Call WebMCP tool
    // -----------------------------

    let serviceResults = [];

    try {

        const tools =
            await document.modelContext.getTools();

        const serviceTool =
            tools.find(
                tool =>
                    tool.name === "search_service_options"
            );

        if (!serviceTool) {

            throw new Error(
                "search_service_options WebMCP tool was not found."
            );
        }

        const toolArguments = {
            maxPrice: requirements.budget,
            minRating: requirements.minRating,
            maxDistance: requirements.maxDistance
        };

        Object.keys(toolArguments).forEach(key => {

            if (
                toolArguments[key] === null ||
                toolArguments[key] === undefined
            ) {
                delete toolArguments[key];
            }

        });

        console.log(
            "Calling WebMCP search_service_options:",
            toolArguments
        );

        let result;

try {
    // Agent / ChatGPT WebMCP path
    result = await document.modelContext.executeTool(
        serviceTool.name,
        toolArguments
    );
} catch (agentError) {
    // Native Chrome WebMCP path
    result = await document.modelContext.executeTool(
        serviceTool,
        JSON.stringify(toolArguments)
    );
}

serviceResults =
    typeof result === "string"
        ? JSON.parse(result)
        : result;

    } catch (error) {

        console.error(
            "MatrixOps Service Agent error:",
            error
        );

        return {
            requirements,
            results: [],
            error: error.message
        };
    }

    // -----------------------------
    // Rank results
    // -----------------------------

    const rankedResults =
        serviceResults.map(service => {

            let score = 0;
            const reasons = [];

            if (
                requirements.budget !== null &&
                service.price <= requirements.budget
            ) {

                score += 30;
                reasons.push("Within budget");

            }

            if (
                requirements.minRating !== null &&
                service.rating >= requirements.minRating
            ) {

                score += 25;
                reasons.push("Highly rated");

            }

            if (
                requirements.maxDistance !== null &&
                service.distance <= requirements.maxDistance
            ) {

                score += 25;
                reasons.push(
                    "Within preferred distance"
                );

            }

            if (service.open) {

                score += 10;
                reasons.push(
                    "Currently available"
                );

            }

            if (service.promotion) {

                score += 10;
                reasons.push(
                    "Has promotion"
                );

            }

            return {
                ...service,
                matrixScore: score,
                reasons
            };

        });

    rankedResults.sort(
        (a, b) =>
            b.matrixScore - a.matrixScore
    );

    console.log(
        "MatrixOps Service Agent result:",
        {
            requirements,
            results: rankedResults
        }
    );

    return {
        requirements,
        results:
            rankedResults.slice(0, 3)
    };
}
/* =========================================================
   MATRIXOPS ORDER REVIEW
   ========================================================= */

function showOrderReview(order) {

    const resultsSection =
        document.getElementById("resultsSection");

    const resultContainer =
        document.getElementById("resultsContainer");

    resultsSection.classList.remove("hidden");

    resultContainer.innerHTML = `

        <div style="
            padding:30px;
            border:1px solid #444;
            border-radius:18px;
            background:#101116;
        ">

            <h2>🛒 Order Ready for Review</h2>

            <p style="
                color:#9ca3af;
                margin-top:10px;
            ">
                MatrixOps prepared this order based on
                your selected option.
            </p>

            <div style="
                margin-top:25px;
                padding:20px;
                border-radius:14px;
                background:#181a21;
            ">

                <h3>${order.item}</h3>

                <p>
                    🏪 ${order.restaurant}
                </p>

                <p>
                    💰 RM${Number(order.price).toFixed(2)}
                </p>

                <p>
                    🚚 ${
                        order.deliveryTime
                        ? order.deliveryTime + " min"
                        : "Delivery time unavailable"
                    }
                </p>

                <p>
                    📦 ${order.deliveryType}
                </p>

<p style="
    margin-top:12px;
    color:#9ca3af;
    font-size:14px;
">

    🆔 Order ID: <strong>${order.orderId}</strong>
</p>

            </div>

            <div style="
                margin-top:25px;
                padding:15px;
                border-radius:12px;
                background:#22252d;
            ">

                🔐 <strong>Human confirmation required</strong>

                <br><br>

                MatrixOps will not place a final order
                or make a payment without your confirmation.

            </div>

            <div style="
                margin-top:25px;
                display:flex;
                gap:12px;
                flex-wrap:wrap;
            ">

                <button
                    onclick="cancelPendingOrder()"
                    style="
                        padding:13px 20px;
                        border-radius:10px;
                        border:1px solid #555;
                        background:#181a21;
                        color:white;
                        cursor:pointer;
                    "
                >
                    Cancel
                </button>

                <button
                    onclick="confirmPendingOrder()"
                    style="
                        padding:13px 20px;
                        border-radius:10px;
                        border:none;
                        background:white;
                        color:black;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    Confirm Order →
                </button>

            </div>

        </div>

    `;

    resultsSection.scrollIntoView({
        behavior: "smooth"
    });
}/* =========================================================
   HUMAN CONFIRMATION
   ========================================================= */

function confirmPendingOrder() {

    const order =
        window.matrixPendingOrder;

    if (!order) {

        alert(
            "There is no pending order."
        );

        return;
    }

    console.log(
        "Human confirmed order:",
        order
    );

    order.status =
        "human_confirmed";

    window.matrixPendingOrder =
        order;

    const resultContainer =
        document.getElementById("resultsContainer");

    resultContainer.innerHTML = `

        <div style="
            padding:30px;
            border:1px solid #444;
            border-radius:18px;
            background:#101116;
            text-align:center;
        ">

            <h2>✅ Human Confirmation Completed</h2>

            <p style="
                margin-top:15px;
                color:#9ca3af;
            ">

                ${order.item}

                <br>

                ${order.restaurant}

                <br><br>

                RM${Number(order.price).toFixed(2)}

            </p>

            <div style="
                margin-top:25px;
                padding:15px;
                border-radius:12px;
                background:#181a21;
            ">

                MatrixOps can now hand you
                to the restaurant's official
                ordering or payment page.

            </div>

            <button
                onclick="openRestaurantHandoff()"
                style="
                    margin-top:25px;
                    padding:14px 24px;
                    border-radius:10px;
                    border:none;
                    background:white;
                    color:black;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Continue to Ordering →
            </button>

        </div>

    `;
}


/* =========================================================
   CANCEL ORDER
   ========================================================= */

function cancelPendingOrder() {

    window.matrixPendingOrder = null;

    alert(
        "Order cancelled. You can search again."
    );

}


/* =========================================================
   ORDERING HANDOFF
   ========================================================= */

function openRestaurantHandoff() {

    const order =
        window.matrixPendingOrder;

    if (!order) {

        alert(
            "No confirmed order found."
        );

        return;
    }

    console.log(
        "MatrixOps ordering handoff:",
        order
    );

    const orderingUrl = order.orderingUrl;

if (!orderingUrl) {
    alert("Ordering page is not available for this option.");
    return;
}

console.log("Opening ordering page:", orderingUrl);

window.open(orderingUrl, "_blank");

}

// ============================================================
// MATRIXOPS IMAGE UPLOAD
// Shows the uploaded image and prepares it for MatrixOps.
// ============================================================

function handleImageUpload(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Store image information for MatrixOps
window.matrixUploadedImage = {
    name: file.name,
    type: file.type,
    url: URL.createObjectURL(file)
};
    
const imagePreview =
        document.getElementById("imagePreview");

    const imageStatus =
        document.getElementById("imageStatus");

    const imageUrl =
        URL.createObjectURL(file);

    imagePreview.innerHTML = `
        <div style="
            padding:16px;
            border-radius:12px;
            background:#181a21;
            border:1px solid #30333d;
        ">

            <div style="
                color:#9ca3af;
                font-size:14px;
                margin-bottom:10px;
            ">
                📷 Image uploaded
            </div>

            <img
                src="${imageUrl}"
                alt="Uploaded food or product"
                style="
                    max-width:100%;
                    max-height:280px;
                    border-radius:10px;
                    display:block;
                "
            >

            <div style="
                margin-top:10px;
                color:#9ca3af;
                font-size:13px;
            ">
                ${file.name}
            </div>

        </div>
    `;

    imagePreview.style.display = "block";

    imageStatus.textContent =
        "✓ Ready for MatrixOps";

    console.log(
        "MatrixOps image uploaded:",
        file.name
    );
}

// ============================================================
// MATRIXOPS REQUIREMENT NEGOTIATION
// Helps users resolve conflicting requirements.
// ============================================================

function showNegotiation(negotiation) {

    window.matrixNegotiationBudget =
        negotiation.suggestedBudget;

    const resultsSection =
        document.getElementById("resultsSection");

    const resultContainer =
        document.getElementById("resultsContainer");

    const description =
        document.getElementById("resultDescription");

    // Show the results section
    resultsSection.classList.remove("hidden");

    // Update description
    description.textContent =
        "MatrixOps found a conflict between your requirements.";

    // Show negotiation UI
    resultContainer.innerHTML = `

        <div style="
            padding:24px;
            border-radius:16px;
            background:#181a21;
            border:1px solid #30333d;
        ">

            <h3 style="
                margin-top:0;
                font-size:22px;
            ">
                ⚠️ MatrixOps needs a decision
            </h3>

            <p style="
                color:#b7bac4;
                line-height:1.6;
            ">
                ${negotiation.message}
            </p>

            <p style="
                margin-top:20px;
                font-weight:600;
            ">
                Which requirement would you rather relax?
            </p>

            <div style="
                display:flex;
                flex-direction:column;
                gap:12px;
                margin-top:15px;
            ">

                ${negotiation.options.map(option => `

                    <button
                        type="button"
                        onclick="handleNegotiation('${option.id}')"
                        style="
                            text-align:left;
                            padding:16px;
                            border-radius:12px;
                            border:1px solid #30333d;
                            background:#111318;
                            color:white;
                            cursor:pointer;
                        "
                    >

                        <div style="
                            font-size:16px;
                            font-weight:600;
                        ">
                            ${option.label}
                        </div>

                        <div style="
                            margin-top:6px;
                            color:#9ca3af;
                            font-size:13px;
                        ">
                            ${option.description}
                        </div>

                    </button>

                `).join("")}

            </div>

        </div>
    `;

    // Scroll to negotiation
    resultsSection.scrollIntoView({
        behavior: "smooth"
    });
}

// ============================================================
// MATRIXOPS NEGOTIATION ACTIONS
// Lets the user relax one requirement and rerun the agent.
// ============================================================

async function handleNegotiation(choice) {

    const textarea =
        document.getElementById("userRequest");

    let request =
        textarea.value.trim();

    if (!request) {
        return;
    }

    // --------------------------------------------------------
    // Increase budget
    // --------------------------------------------------------

    if (choice === "increaseBudget") {

        const budgetMatch = request.match(
            /(?:under|below|max(?:imum)?|within)\s*(?:rm|ringgit)?\s*(\d+(?:\.\d+)?)/i
        );

        // Use the cheapest viable option found
        // during negotiation.
        const newBudget =
            window.matrixNegotiationBudget;

        if (
            budgetMatch &&
            newBudget !== null &&
            newBudget !== undefined
        ) {

            request =
                request.replace(
                    budgetMatch[0],
                    "under RM" +
                    Number(newBudget).toFixed(2)
                );
        }
    }

    // --------------------------------------------------------
    // Relax sugar
    // --------------------------------------------------------

    if (choice === "relaxSugar") {

        request =
            request
                .replace(
                    /strictly controls (his )?sugar/gi,
                    ""
                )
                .replace(
                    /low[- ]sugar/gi,
                    ""
                )
                .replace(
                    /less sugar/gi,
                    ""
                )
                .replace(/\s+/g, " ")
                .trim();
    }

    // --------------------------------------------------------
    // Relax protein / fitness
    // --------------------------------------------------------

    if (choice === "relaxFitness") {

        request =
            request
                .replace(
                    /high protein/gi,
                    ""
                )
                .replace(
                    /protein/gi,
                    ""
                )
                .replace(
                    /gym/gi,
                    ""
                )
                .replace(
                    /fitness/gi,
                    ""
                )
                .replace(
                    /workout/gi,
                    ""
                )
                .replace(/\s+/g, " ")
                .trim();
    }

    // Update the textbox
    textarea.value = request;

    console.log(
        "MatrixOps negotiation choice:",
        choice
    );

    console.log(
        "MatrixOps updated request:",
        request
    );

    // Run MatrixOps again
    await processRequest();
}
function runWhatIf() {
    const currentRequest = window.matrixRequest || "";

    const newBudget = prompt(
        "What if you can spend more?\nEnter your new budget (RM):",
        "80"
    );

    if (!newBudget) return;

    const budget = Number(newBudget);

    if (isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    const updatedRequest = currentRequest.replace(
        /(?:under|below|max(?:imum)?|within)\s*(?:rm|ringgit)?\s*(\d+(?:\.\d+)?)/i,
        "under RM" + budget.toFixed(2)
    );

    document.getElementById("userRequest").value =
        updatedRequest;

    console.log(
        "MatrixOps What-If Simulation:",
        updatedRequest
    );

    processRequest();
}
   let matrixLanguage = "en";

function setLanguage(language) {
    matrixLanguage = language;

    const findButton = document.querySelector(".find-button");
    const requestBox = document.getElementById("userRequest");
    const selectedCategory = document.getElementById("selectedCategory");

    if (language === "en") {
        findButton.textContent = "Find the best option →";
        requestBox.placeholder =
            "Example: Find me a Valentine's dinner under RM70...";
        selectedCategory.textContent = "No category selected";
    }

    if (language === "bm") {
        findButton.textContent = "Cari pilihan terbaik →";
        requestBox.placeholder =
            "Contoh: Cari makan malam Valentine's bawah RM70...";
        selectedCategory.textContent = "Tiada kategori dipilih";
    }

    if (language === "zh") {
        findButton.textContent = "寻找最佳选择 →";
        requestBox.placeholder =
            "例如：帮我找 RM70 以下的情人节晚餐...";
        selectedCategory.textContent = "尚未选择类别";
    }

    console.log("MatrixOps language:", language);
}
function runMultiPersonDecision() {

    const options = window.matrixOptions || [];

    if (options.length < 2) {
        alert("MatrixOps needs at least 2 options to compare.");
        return;
    }

    const person1 = prompt(
        "Person 1 priorities:\nExample: high protein, low sugar",
        "high protein"
    );

    if (!person1) return;

    const person2 = prompt(
        "Person 2 priorities:\nExample: vegetarian, cheap",
        "vegetarian"
    );

    if (!person2) return;

    function calculateScore(option, priorities) {

        const text = priorities.toLowerCase();
        let score = option.rating || 0;

        if (
            text.includes("protein") &&
            option.protein >= 30
        ) {
            score += 5;
        }

        if (
            text.includes("sugar") &&
            text.includes("low") &&
            option.sugar <= 10
        ) {
            score += 5;
        }

        if (
            text.includes("vegetarian") &&
            option.vegetarian === true
        ) {
            score += 5;
        }

        if (
            text.includes("cheap") ||
            text.includes("budget")
        ) {
            if (option.price <= 50) {
                score += 5;
            }
        }

        if (
            text.includes("fast") ||
            text.includes("quick")
        ) {
            if (option.deliveryTime <= 30) {
                score += 5;
            }
        }

        return score;
    }

    const scoredOptions = options.map(option => {

        const score1 =
    Math.min(100, calculateScore(option, person1) * 10);

const score2 =
    Math.min(100, calculateScore(option, person2) * 10);

        return {
            option,
            score1,
            score2,
            totalScore: score1 + score2
        };
    });

    scoredOptions.sort(
        (a, b) => b.totalScore - a.totalScore
    );

    const winner = scoredOptions[0];

    const compromiseReasons = [];

if (winner.option.rating >= 4.5) {
    compromiseReasons.push(
        `Strong overall rating (${winner.option.rating}⭐) benefits both people.`
    );
}

if (winner.option.protein >= 30) {
    compromiseReasons.push(
        `High protein (${winner.option.protein}g) supports the fitness preference.`
    );
}

if (winner.option.sugar <= 10) {
    compromiseReasons.push(
        `Lower sugar (${winner.option.sugar}g) supports the health preference.`
    );
}

if (winner.option.vegetarian === true) {
    compromiseReasons.push(
        "Vegetarian-friendly, making it suitable for different dietary preferences."
    );
}

if (winner.option.price <= 70) {
    compromiseReasons.push(
        `Still within the available budget at RM${winner.option.price}.`
    );
}

if (winner.option.deliveryTime <= 30) {
    compromiseReasons.push(
        `Fast delivery (${winner.option.deliveryTime} min) adds convenience for both people.`
    );
}

    const resultsSection =
        document.getElementById("resultsSection");

    const resultContainer =
        document.getElementById("resultsContainer");

    resultsSection.classList.remove("hidden");

    resultContainer.innerHTML = `
        <div style="
            padding:20px;
            border-radius:12px;
            background:#171922;
            border:1px solid #30333d;
        ">

            <h3>👥 Best compromise for both people</h3>

            <h2 style="margin-top:15px;">
                🏆 ${winner.option.name}
            </h2>

            <div style="
                margin-top:15px;
                padding:14px;
                border-radius:10px;
                background:#101116;
            ">

                <strong>⚖️ MatrixOps decision</strong>

                <p style="margin-top:10px;">
                   Person 1 fit:
<strong>${winner.score1.toFixed(0)}/100</strong>
                </p>

                <p>
                    Person 2 fit:
<strong>${winner.score2.toFixed(0)}/100</strong>
                </p>

                <p>
                    Overall compromise score:
<strong>${(winner.totalScore / 2).toFixed(0)}/100</strong>
                </p>

            </div>

            <div style="
                margin-top:16px;
                padding:14px;
                border-radius:10px;
                background:#101116;
            ">

               <strong>💡 Why this is the best compromise</strong>

<div style="
    margin-top:10px;
    color:#9ca3af;
    line-height:1.7;
">
    ${compromiseReasons
        .map(reason => `✅ ${reason}`)
        .join("<br>")}
</div>

<p style="
    margin-top:14px;
    color:#9ca3af;
    line-height:1.6;
">
    MatrixOps chose this option because it achieved
    the strongest combined fit across both people's
    priorities, rather than maximizing only one person's preference.
</p>

            </div>

        </div>
    `;

    resultsSection.scrollIntoView({
        behavior: "smooth"
    });

    console.log(
        "MatrixOps multi-person decision:",
        winner
    );
}