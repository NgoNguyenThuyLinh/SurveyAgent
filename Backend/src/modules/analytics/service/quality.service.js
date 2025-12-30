const { Survey, SurveyResponse, Answer, Question, QuestionOption, SurveyTemplate } = require('../../../models');
const geminiService = require('../../llm/service/gemini.service');
const { Op } = require('sequelize');

class QualityService {

    /**
     * Main method to calculate the total Quality Score (0-100)
     */
    async calculateQualityScore(surveyId) {
        try {
            console.log(`[QualityService] Calculating score for Survey ID: ${surveyId}`);

            // Fetch survey data once
            const survey = await Survey.findByPk(surveyId, {
                include: [
                    {
                        model: SurveyResponse,
                        attributes: ['id', 'status', 'time_taken', 'created_at', 'feedback_rating']
                    },
                    {
                        model: SurveyTemplate,
                        as: 'template',
                        include: [{
                            model: Question,
                            as: 'Questions',
                            include: [{ model: QuestionOption, as: 'QuestionOptions' }]
                        }]
                    }
                ]
            });

            if (!survey) throw new Error('Survey not found');

            const responses = survey.SurveyResponses || [];
            const questions = survey.template?.Questions || [];

            // Calculate 6 Factors (Total 100)
            // A: Completion (15)
            // B: Time (15)
            // C: Design (20)
            // D: Text Quality (15)
            // E: AI Effectiveness (15)
            // F: User Feedback (20)

            const factorA = this._evaluateCompletion(responses);
            const factorB = this._evaluateTime(responses, questions.length);
            const factorC = await this._evaluateDesign(questions); // Async (Gemini)
            const factorD = await this._evaluateTextAnswers(surveyId); // Needs Answer data
            const factorE = await this._evaluateAiEffectiveness(questions);
            const factorF = this._evaluateUserFeedback(responses);

            const totalScore = Math.round(factorA.score + factorB.score + factorC.score + factorD.score + factorE.score + factorF.score);

            return {
                totalScore,
                factors: {
                    completion: factorA,
                    time: factorB,
                    design: factorC,
                    textQuality: factorD,
                    aiEffectiveness: factorE,
                    userFeedback: factorF
                },
                warnings: [
                    ...factorA.warnings,
                    ...factorB.warnings,
                    ...factorC.warnings,
                    ...factorD.warnings,
                    ...factorE.warnings,
                    ...factorF.warnings
                ]
            };

        } catch (error) {
            console.error('[QualityService] Error:', error);
            throw error;
        }
    }

    // (A) Completion Behavior (0-20)
    _evaluateCompletion(responses) {
        const total = responses.length;
        if (total === 0) return { score: 0, warnings: ['No data for completion analysis'] };

        const completed = responses.filter(r => r.status === 'completed').length;
        const rate = completed / total;

        // Score: Rate * 15 (Max 15)
        let score = Math.round(rate * 15);
        const warnings = [];
        if (rate < 0.5) warnings.push('Low completion rate (< 50%)');

        return { score, details: { rate: (rate * 100).toFixed(1) + '%' }, warnings };
    }

    // (B) Time Behavior (0-20)
    _evaluateTime(responses, questionCount) {
        const completed = responses.filter(r => r.status === 'completed' && r.time_taken);
        if (completed.length === 0) return { score: 0, warnings: ['No timing data'] };

        const avgTime = completed.reduce((sum, r) => sum + r.time_taken, 0) / completed.length;
        const avgPerQuestion = questionCount > 0 ? avgTime / questionCount : 0;

        // Ideal: 10-60s per question? 
        // Too fast (< 5s/q) -> bad. Too slow (> 120s/q) -> bad.
        let score = 15; // Max 15
        const warnings = [];

        if (avgPerQuestion < 5) {
            score -= 10;
            warnings.push('Respondents are answering too quickly (possible low quality)');
        } else if (avgPerQuestion > 120) {
            score -= 5;
            warnings.push('Survey takes too long per question');
        }

        return { score: Math.max(0, score), details: { avgTime: Math.round(avgTime) + 's', avgPerQuestion: Math.round(avgPerQuestion) + 's' }, warnings };
    }

    // (C) Question Design Quality (0-20) - Uses Gemini
    async _evaluateDesign(questions) {
        if (questions.length === 0) return { score: 20, warnings: [] };

        // Prepare prompt for Gemini
        const questionTexts = questions.map((q, i) => `Q${i + 1}: ${q.question_text} (${q.is_ai_generated ? 'AI' : 'Manual'})`).join('\n');
        const prompt = `Analyze these survey questions for design quality. 
        Check for: 
        1. Length/Complexity (> 150 chars is bad).
        2. Bias/Leading questions.
        3. Clarity.
        
        Return JSON: { "score": (0-20), "issues": ["issue 1", "issue 2"] }
        
        Questions:
        ${questionTexts}`;

        try {
            const analysis = await geminiService.generateInsights(prompt); // Reusing generateInsights for generic prompt
            // Note: generateInsights might return a string, need to parse if it's not JSON object
            // Assuming geminiService handles JSON parsing or returns text. 
            // For robustness, let's assume it returns an object or we parse it.

            // Mocking simple logic if Gemini fails or returns text
            if (typeof analysis === 'string') {
                // Fallback simple heuristic
                const longQuestions = questions.filter(q => q.question_text.length > 150);
                let score = 20 - (longQuestions.length * 2);
                return { score: Math.max(0, score), warnings: longQuestions.length > 0 ? ['Some questions are too long'] : [] };
            }

            return {
                score: analysis.score || 15,
                warnings: analysis.issues || []
            };

        } catch (e) {
            console.error('Gemini Design Analysis failed:', e);
            return { score: 15, warnings: ['AI Analysis unavailable'] };
        }
    }

    // (D) Text Answer Quality (0-20)
    async _evaluateTextAnswers(surveyId) {
        // Fetch text answers
        const answers = await Answer.findAll({
            include: [{
                model: SurveyResponse,
                where: { survey_id: surveyId }
            }],
            where: { text_answer: { [Op.ne]: null } }
        });

        if (answers.length === 0) return { score: 15, warnings: [] }; // No text answers = neutral/good

        const total = answers.length;
        const valid = answers.filter(a => {
            const t = a.text_answer.trim();
            if (t.length < 3) return false;
            // Simple spam check
            const unique = new Set(t.split('')).size;
            if (t.length > 5 && unique === 1) return false;
            return true;
        }).length;

        const validRate = valid / total;
        const score = Math.round(validRate * 15); // Max 15

        const warnings = [];
        if (validRate < 0.6) warnings.push('High rate of low-quality text answers');

        return { score, details: { validRate: (validRate * 100).toFixed(1) + '%' }, warnings };
    }

    // (E) AI Effectiveness (0-20)
    async _evaluateAiEffectiveness(questions) {
        const aiQuestions = questions.filter(q => q.is_ai_generated);
        const totalAi = aiQuestions.length;

        if (totalAi === 0) return { score: 10, details: { msg: 'No AI questions used' }, warnings: [] }; // Neutral score if no AI used

        // Simple scoring based on usage count (Since we don't have adoption rate for survey specific questions easily)
        // If > 0 AI questions, full points for "AI Adoption"
        return { score: 20, details: { aiCount: totalAi }, warnings: [] };
    }

    // (F) User Feedback (0-20)
    _evaluateUserFeedback(responses) {
        const ratedResponses = responses.filter(r => r.feedback_rating !== null && r.feedback_rating !== undefined);
        const totalRated = ratedResponses.length;

        if (totalRated === 0) {
            return { score: 0, details: { avgRating: 'N/A' }, warnings: ['No user feedback ratings received'] };
        }

        const sumRating = ratedResponses.reduce((sum, r) => sum + r.feedback_rating, 0);
        const avgRating = sumRating / totalRated;
        const positiveCount = ratedResponses.filter(r => r.feedback_rating >= 4).length;
        const positiveRate = (positiveCount / totalRated) * 100;

        // Mapping Logic:
        // 4.5 - 5.0 -> 20
        // 4.0 - 4.49 -> 16
        // 3.0 - 3.99 -> 10
        // 2.0 - 2.99 -> 5
        // < 2.0 -> 0

        let score = 0;
        if (avgRating >= 4.5) score = 20;
        else if (avgRating >= 4.0) score = 16;
        else if (avgRating >= 3.0) score = 10;
        else if (avgRating >= 2.0) score = 5;
        else score = 0;

        const warnings = [];
        if (avgRating < 3.0) warnings.push('User feedback is generally negative');
        if (totalRated < 5) warnings.push('Low sample size for user feedback');

        return {
            score,
            details: {
                avgRating: avgRating.toFixed(1),
                positiveRate: positiveRate.toFixed(1) + '%',
                count: totalRated
            },
            warnings
        };
    }
}

module.exports = new QualityService();
