const foodOptions = [
    {
        name: "FitBowl Valentine's Protein Set",
        price: 62.90,
        rating: 4.8,
        reviews: 1280,
        sugar: 8,
        protein: 35,
        calories: 520,
        halal: true,
        vegetarian: false,
        promotion: "RM10 Valentine's promotion",
        deliveryTime: 25,
        distance: 3.2,
        branch: "KLCC",
        open: true,
        valentines: true,
        experience: "Special Valentine's packaging",

        orderUrl: "https://example.com"
    },

    {
        name: "Healthy Kitchen Valentine's Set",
        price: 49.90,
        rating: 4.6,
        reviews: 890,
        sugar: 10,
        protein: 28,
        calories: 480,
        halal: true,
        vegetarian: true,
        promotion: "Free Valentine's dessert",
        deliveryTime: 28,
        distance: 4.5,
        branch: "Bukit Bintang",
        open: true,
        valentines: true,
        experience: "Valentine's special set",

        orderUrl: "https://example.com"
    },

    {
        name: "Green Garden Romantic Dinner",
        price: 68.00,
        rating: 4.9,
        reviews: 2140,
        sugar: 9,
        protein: 25,
        calories: 510,
        halal: true,
        vegetarian: true,
        promotion: "Free Valentine's drink",
        deliveryTime: 30,
        distance: 2.8,
        branch: "Bangsar",
        open: true,
        valentines: true,
        experience: "Romantic Valentine's ambience",

        orderUrl: "https://example.com"
    }
];


const groceryOptions = [
    {
        name: "FreshMart Online",
        product: "Mineral Water",
        quantityAvailable: 20,
        price: 8.90,
        rating: 4.7,
        stock: true,
        promotion: "10% grocery voucher",
        deliveryTime: 35,
        distance: 4.1,
        open: true,
        deliveryAvailable: true,
        orderUrl: "https://example.com"
    },

    {
        name: "DailyFresh Market",
        product: "Mineral Water",
        quantityAvailable: 15,
        price: 7.90,
        rating: 4.5,
        stock: true,
        promotion: "Free delivery",
        deliveryTime: 40,
        distance: 2.5,
        open: true,
        deliveryAvailable: true,
        orderUrl: "https://example.com"
    },

    {
        name: "ValueGrocer",
        product: "Mineral Water",
        quantityAvailable: 30,
        price: 6.90,
        rating: 4.4,
        stock: true,
        promotion: "RM3 off grocery order",
        deliveryTime: 45,
        distance: 5.2,
        open: true,
        deliveryAvailable: true,
        orderUrl: "https://example.com"
    }
];


const serviceOptions = [
    {
        name: "QuickFix Services",
        price: 35,
        rating: 4.8,
        earliestSlot: "Today, 6:00 PM",
        distance: 3.5,
        promotion: "RM5 service discount",
        open: true
    },

    {
        name: "FastHome Repair",
        price: 30,
        rating: 4.6,
        earliestSlot: "Today, 7:00 PM",
        distance: 2.1,
        promotion: "No booking fee",
        open: true
    },   
        {
        name: "HomePro Repair",
        price: 38,
        rating: 4.7,
        earliestSlot: "Today, 5:30 PM",
        distance: 4.2,
        promotion: "10% off first booking",
        open: true
    }
    

];

const matrixTrends = {
    food: {
        title: "🔥 Trending now",
        message: "Valentine's sets are currently popular."
    },
    grocery: {
        title: "📈 Current demand",
        message: "Mineral water has high demand today."
    },
    service: {
        title: "⚡ Availability trend",
        message: "Home repair slots are filling up quickly."
    }
};