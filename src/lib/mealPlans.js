export function calculateUpgrade({
currentAdult,
currentChild,
newAdult,
newChild,
adults,
children,
nights,
}) {

const adultDifference =
(newAdult - currentAdult) *
adults *
nights;

const childDifference =
(newChild - currentChild) *
children *
nights;

return adultDifference + childDifference;
}

export function calculateCharacterMeal({
adultPrice,
childPrice,
adults,
children,
}) {

return (
adultPrice * adults +
childPrice * children
);
}
