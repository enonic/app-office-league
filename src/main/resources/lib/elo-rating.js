/**
 * @file Elo rating system calculations.
 *
 * Calculates changes in rating points following the Elo rating system.
 * @see {@link https://en.wikipedia.org/wiki/Elo_rating_system|Elo rating system}
 */

/**
 * Returns the new rating for the player after winning or losing to the opponent(s) with the given rating.
 * @param {number} rating Player's old rating.
 * @param {number} opponentRating The rating of the opposing player(s).
 * @param {number} score Game score (WIN = 1.0, DRAW = 0.5, LOSS = 0.0).
 * @param {number} kFactor Elo rating K-factor.
 * @returns {number} Player's new rating.
 */
exports.calculateNewRating = function (rating, opponentRating, score, kFactor) {
    var expectedScore = exports.calculateExpectedScore(rating, opponentRating);
    return rating + calculateRatingDelta(rating, score, expectedScore, kFactor);
};

/**
 * Returns the rating increment (positive or negative) for the player after winning or losing to the opponent(s) with the given rating.
 * @param {number} rating Player's old rating.
 * @param {number} opponentRating The rating of the opposing player(s).
 * @param {number} score Game score (WIN = 1.0, DRAW = 0.5, LOSS = 0.0).
 * @param {number} kFactor Elo rating K-factor.
 * @returns {number} Player's rating delta.
 */
exports.calculateNewRatingDelta = function (rating, opponentRating, score, kFactor) {
    var expectedScore = exports.calculateExpectedScore(rating, opponentRating);
    return calculateRatingDelta(rating, score, expectedScore, kFactor);
};

/**
 * Calculates the expected score based on two players' ratings.
 * In a 2-vs-2 game, the rating and opponent rating will be the average of the players on each team.
 * @param {number} rating Player(s) rating.
 * @param {number} opponentRating The rating of the opposing player(s).
 * @returns {number} Expected score (value between 0 and 1).
 */
exports.calculateExpectedScore = function (rating, opponentRating) {
    return 1.0 / (1.0 + Math.pow(10.0, (opponentRating - rating) / 400.0));
};

/**
 * Calculates the rating delta for the player based on the old rating, the game score, the expected game score
 * and the k-factor.
 * @param {number} rating Player's old rating.
 * @param {number} score Game score (WIN = 1.0, DRAW = 0.5, LOSS = 0.0).
 * @param {number} expectedScore Expected game score (based on participant ratings).
 * @param {number} kFactor K-factor.
 * @returns {number} Player's rating delta.
 */
var calculateRatingDelta = function (rating, score, expectedScore, kFactor) {
    return parseInt(roundWithSign(kFactor * (score - expectedScore)), 10);
};

var roundWithSign = function (value) {
    var rounded = Math.ceil(Math.abs(value));
    return value >= 0 ? rounded : -rounded;
};
