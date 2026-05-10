export const mealPlans = {
standard: {
halfBoard: {
adult: 55,
child: 35,
characterMealsIncluded: 0,
},
fullBoard: {
adult: 75,
child: 45,
characterMealsIncluded: 0,
},
},

plus: {
halfBoard: {
adult: 65,
child: 40,
characterMealsIncluded: 0,
},
fullBoard: {
adult: 115,
child: 60,
characterMealsIncluded: 0,
},
},

extraPlus: {
fullBoard: {
adult: 150,
child: 80,
characterMealsIncluded: 1,
note: "Incluye 1 comida especial con personajes o princesas por estancia.",
},
},

premium: {
fullBoard: {
adult: 245,
child: 135,
characterMealsIncluded: "all",
note: "Incluye experiencias premium con personajes y princesas según disponibilidad.",
},
},
};

export const characterMeals = {
aubergePrincesses: {
adult: 100,
child: 50,
},

regalViewPrincesses: {
adult: 100,
child: 50,
},

royalBanquet: {
adult: 100,
child: 50,
},

tableDeLumiere: {
adult: 120,
child: 60,
},

princessBreakfast: {
adult: 60,
child: 40,
},
};
