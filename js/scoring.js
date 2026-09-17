/**
 * OFFICIAL BSF HCM SCORING ALGORITHM ENGINE
 * Standard Formula:
 * 1. Total Typed Words = count of words typed
 * 2. Total Errors = character & word mismatches
 * 3. Free/Permissible Errors = floor(Total Typed Words * 0.05)
 * 4. Excess Errors = max(0, Total Errors - Free Errors)
 * 5. Penalty Words = Excess Errors * 10
 * 6. Net Words = max(0, Total Typed Words - Penalty Words)
 * 7. Net WPM = Net Words / Elapsed Minutes
 * 8. Gross WPM = Total Typed Words / Elapsed Minutes
 */

const ScoringEngine = {
    calculateScore: function (expectedText, typedText, durationSeconds, config = {}) {
        const freePct = config.freeErrorPct !== undefined ? config.freeErrorPct : CONFIG.DEFAULT_FREE_ERROR_PCT;
        const penaltyMultiplier = config.penaltyPerError !== undefined ? config.penaltyPerError : CONFIG.DEFAULT_PENALTY_PER_ERROR;

        const elapsedMinutes = Math.max(durationSeconds / 60, 0.001); // Prevent Division by zero

        // Word counting standard: Words separated by single or multiple whitespace characters
        const typedWordsArray = typedText.trim() === "" ? [] : typedText.trim().split(/\s+/);
        const expectedWordsArray = expectedText.trim() === "" ? [] : expectedText.trim().split(/\s+/);

        const totalTypedWords = typedWordsArray.length;
        const totalTypedChars = typedText.length;

        // Calculate Character level correctness
        let correctChars = 0;
        let incorrectChars = 0;

        const minLength = Math.min(expectedText.length, typedText.length);
        for (let i = 0; i < minLength; i++) {
            if (expectedText[i] === typedText[i]) {
                correctChars++;
            } else {
                incorrectChars++;
            }
        }
        // Account for missing or extra characters as errors
        incorrectChars += Math.abs(expectedText.length - typedText.length);

        // Word level error calculations for BSF evaluation
        let totalErrors = 0;
        const compareLength = Math.max(expectedWordsArray.length, typedWordsArray.length);
        
        for (let i = 0; i < typedWordsArray.length; i++) {
            if (i >= expectedWordsArray.length || typedWordsArray[i] !== expectedWordsArray[i]) {
                totalErrors++;
            }
        }

        // Apply BSF Rules
        const freeErrors = Math.floor(totalTypedWords * freePct);
        const excessErrors = Math.max(0, totalErrors - freeErrors);
        const penaltyWords = excessErrors * penaltyMultiplier;
        const netWords = Math.max(0, totalTypedWords - penaltyWords);

        const grossWpm = parseFloat((totalTypedWords / elapsedMinutes).toFixed(2));
        const netWpm = parseFloat((netWords / elapsedMinutes).toFixed(2));
        const accuracy = totalTypedChars > 0 ? parseFloat(((correctChars / totalTypedChars) * 100).toFixed(2)) : 0;

        return {
            totalTypedWords,
            totalTypedChars,
            correctChars,
            incorrectChars,
            totalErrors,
            freeErrors,
            excessErrors,
            penaltyWords,
            grossWpm,
            netWpm,
            accuracy,
            elapsedMinutes
        };
    },

    getPerformanceLabel: function (netWpm) {
        if (netWpm >= 50) return { text: "EXCELLENT (Passed)", class: "badge-success" };
        if (netWpm >= 35) return { text: "GOOD (BSF Qualified)", class: "badge-success" };
        if (netWpm >= 25) return { text: "AVERAGE (Borderline)", class: "badge-warning" };
        return { text: "NEEDS IMPROVEMENT (Failed)", class: "badge-danger" };
    }
};
