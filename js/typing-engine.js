/**
 * HIGH-PERFORMANCE CLIENT-SIDE TYPING ENGINE
 * Zero Network Latency - Client Executed Timer and Event Processing
 */

class TypingEngine {
    constructor(config) {
        this.passageText = config.passageText || "";
        this.durationSeconds = config.durationSeconds || 600;
        this.mode = config.mode || "screen"; // 'screen' or 'page'
        this.onTick = config.onTick || function () {};
        this.onComplete = config.onComplete || function () {};
        this.onAntiCheatTrigger = config.onAntiCheatTrigger || function () {};

        this.typedText = "";
        this.timeRemaining = this.durationSeconds;
        this.timerId = null;
        this.isActive = false;
        this.isFinished = false;
        this.startTime = null;
        this.suspiciousEvents = [];
    }

    start() {
        if (this.isActive || this.isFinished) return;
        this.isActive = true;
        this.startTime = new Date();
        
        // Setup Precise Timer Interval
        this.timerId = setInterval(() => {
            this.timeRemaining--;
            this.onTick(this.timeRemaining);

            if (this.timeRemaining <= 0) {
                this.stop();
            }
        }, 1000);

        this.bindAntiCheat();
    }

    handleInput(text) {
        if (!this.isActive && !this.isFinished) {
            this.start(); // Auto start timer on first character typed
        }
        if (this.isFinished) return;

        this.typedText = text;
    }

    stop() {
        if (this.isFinished) return;
        clearInterval(this.timerId);
        this.isActive = false;
        this.isFinished = true;
        
        const elapsedTime = Math.max(1, this.durationSeconds - this.timeRemaining);
        const score = ScoringEngine.calculateScore(this.passageText, this.typedText, elapsedTime);
        
        this.onComplete({
            score: score,
            typedText: this.typedText,
            elapsedSeconds: elapsedTime,
            suspiciousEvents: this.suspiciousEvents
        });
    }

    bindAntiCheat() {
        // Anti-Cheat 1: Tab Visibility Change Detection
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.isActive) {
                const log = `Tab switched out at ${new Date().toISOString()}`;
                this.suspiciousEvents.push(log);
                this.onAntiCheatTrigger("WARNING: Tab switching is strictly monitored during official exams.");
            }
        });
    }
}
