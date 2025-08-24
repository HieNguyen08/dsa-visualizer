# Sequence Diagram: Assessment and Quiz System

```mermaid
sequenceDiagram
    participant S as Sinh viên
    participant UI as Bộ điều khiển UI
    participant QS as Dịch vụ Đánh giá
    participant QG as Bộ tạo Câu hỏi
    participant DB as Cơ sở dữ liệu
    participant AS as Hệ thống Phân tích

    autonumber

    rect rgb(230, 245, 255)
    Note over S,AS: Khởi tạo Bài kiểm tra
    S->>+UI: selectQuiz(quizId)
    UI->>+QS: loadQuiz(quizId)
    QS->>+DB: getQuizDetails(quizId)
    DB-->>-QS: quizMetadata
    
    alt Bài kiểm tra thích ứng
        QS->>+QG: generateAdaptiveQuiz(userId, algorithmType)
        QG->>+DB: getUserPerformanceHistory(userId)
        DB-->>-QG: performanceData
        QG->>+AS: analyzeDifficultyLevel(performanceData)
        AS-->>-QG: recommendedLevel
        QG-->>-QS: customQuizData
    else Bài kiểm tra tiêu chuẩn
        QS->>+DB: getStandardQuestions(quizId)
        DB-->>-QS: standardQuizData
    end
    
    QS-->>-UI: quizLoaded
    UI-->>-S: displayQuizInterface()
    end

    rect rgb(245, 255, 230)
    Note over S,AS: Bắt đầu Phiên thi
    S->>+UI: startQuiz()
    UI->>+QS: beginQuizSession(userId, quizId)
    QS->>+DB: createSession(userId, quizId, timestamp)
    DB-->>-QS: sessionId
    QS-->>-UI: sessionStarted
    UI-->>-S: displayFirstQuestion()
    end

    rect rgb(255, 245, 230)
    Note over S,AS: Vòng lặp Trả lời Câu hỏi
    loop Cho mỗi câu hỏi
        QS->>+UI: getNextQuestion()
        UI-->>-S: displayQuestion(question, options)
        
        S->>+UI: submitAnswer(answer, timeSpent)
        UI->>+QS: validateAnswer(questionId, answer, timeSpent)
        
        par Đánh giá câu trả lời
            QS->>+AS: analyzeAnswer(answer, correctAnswer, timeSpent)
            AS-->>-QS: detailedFeedback
        and Cập nhật thống kê
            QS->>+DB: updateQuestionStats(questionId, correct, timeSpent)
            DB-->>-QS: statsUpdated
        end
        
        QS-->>-UI: answerResult(correct, explanation, feedback)
        UI-->>-S: showFeedback(result, explanation)
        
        opt Cần giải thích thêm
            S->>+UI: requestDetailedExplanation()
            UI->>+QS: getDetailedExplanation(questionId, userAnswer)
            QS->>+QG: generateExplanation(questionId, misconception)
            QG-->>-QS: detailedExplanation
            QS-->>-UI: explanation
            UI-->>-S: displayExplanation()
        end
        
        opt Điều chỉnh độ khó thích ứng
            QS->>+AS: adjustDifficulty(currentPerformance)
            AS-->>-QS: nextQuestionLevel
        end
    end
    end

    rect rgb(255, 230, 245)
    Note over S,AS: Hoàn thành và Phân tích
    QS->>+AS: calculateFinalScore(answers, timeSpent, difficulty)
    AS-->>-QS: scoreDetails
    
    par Lưu kết quả
        QS->>+DB: saveQuizResult(sessionId, score, answers, analytics)
        DB-->>-QS: resultSaved
    and Cập nhật hồ sơ học tập
        QS->>+DB: updateLearningProfile(userId, performance)
        DB-->>-QS: profileUpdated
    end
    
    QS->>+AS: generatePerformanceAnalysis(userResults, classResults)
    AS-->>-QS: analysisReport
    QS-->>-UI: finalResults(score, analysis, recommendations)
    UI-->>-S: displayResults()
    end

    rect rgb(230, 255, 240)
    Note over S,AS: Khuyến nghị Cải thiện
    opt Đề xuất học tập tiếp theo
        AS->>+DB: getWeakAreas(userId, quizResults)
        DB-->>-AS: weaknessList
        AS->>+QG: generatePracticeRecommendations(weaknesses)
        QG-->>-AS: practiceTopics
        AS->>+UI: suggestImprovementPlan(practiceTopics)
        UI-->>-S: displayImprovementPlan()
    end
    end
```
