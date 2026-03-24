package com.majgong.backend.config;

import com.majgong.backend.entity.*;
import com.majgong.backend.repository.ProblemRangeRepository;
import com.majgong.backend.repository.ProblemRepository;
import com.majgong.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SubjectRepository subjectRepository;
    private final ProblemRangeRepository problemRangeRepository;
    private final ProblemRepository problemRepository;

    @Override
    public void run(String... args) {
        try {
            initializeData();
            log.info("Mock data initialization completed successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize mock data. The application will continue starting.", e);
        }
    }

    @Transactional
    public void initializeData() {
        // Idempotent initialization: Find first or Create
        Subject math = findOrCreateSubject("수학");
        Subject english = findOrCreateSubject("영어");

        ProblemRange mathRange1 = findOrCreateRange("수와 연산", math);
        ProblemRange mathRange2 = findOrCreateRange("방정식과 부등식", math);
        ProblemRange engRange1 = findOrCreateRange("어휘 및 숙어", english);

        // --- Math Range 1 (수와 연산) ---
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "1 + 1은?", "2", Arrays.asList("1", "2", "3", "4"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "2 * 3은?", "6", Arrays.asList("5", "6", "7", "8"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "10 / 2는?", "5", Arrays.asList("2", "4", "5", "6"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "12 - 4는?", "8", Arrays.asList("7", "8", "9", "10"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "7 + 5는?", "12", Arrays.asList("11", "12", "13", "14"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "9 * 3은?", "27", Arrays.asList("24", "27", "30", "33"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "100 / 4는?", "25", Arrays.asList("20", "25", "30", "35"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "15 + 15는?", "30", Arrays.asList("25", "30", "35", "40"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "8 * 8은?", "64", Arrays.asList("56", "64", "72", "80"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "45 / 5는?", "9", Arrays.asList("7", "8", "9", "10"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "13 + 7은?", "20", Arrays.asList("10", "20", "30", "40"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "30 - 12는?", "18", Arrays.asList("16", "18", "20", "22"), ProblemFormat.MULTIPLE_CHOICE, null);
        
        // --- Math Range 2 (방정식과 부등식) ---
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "2x = 4 일 때 x는?", "2", Arrays.asList("1", "2", "3", "4"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "x + 5 = 10 일 때 x는?", "5", Arrays.asList("3", "4", "5", "6"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "3x = 9 일 때 x는?", "3", Arrays.asList("2", "3", "4", "5"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "x - 7 = 3 일 때 x는?", "10", Arrays.asList("7", "8", "9", "10"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "4x = 20 일 때 x는?", "5", Arrays.asList("4", "5", "6", "7"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "2x + 1 = 5 일 때 x는?", "2", Arrays.asList("1", "2", "3", "4"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "x / 2 = 8 일 때 x는?", "16", Arrays.asList("12", "14", "16", "18"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "5x = 25 일 때 x는?", "5", Arrays.asList("4", "5", "6", "7"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "x + 10 = 15 일 때 x는?", "5", Arrays.asList("3", "4", "5", "6"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "3x - 1 = 8 일 때 x는?", "3", Arrays.asList("2", "3", "4", "5"), ProblemFormat.MULTIPLE_CHOICE, null);

        // --- English Vocab (어휘 및 숙어) ---
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Apple' 의 뜻은?", "사과", Arrays.asList("사과", "바나나", "포도", "수박"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Book' 의 뜻은?", "책", Arrays.asList("공책", "책", "펜", "지우개"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Water' 의 뜻은?", "물", Arrays.asList("불", "물", "흙", "공기"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "이 과일의 이름은 무엇인가요?", "바나나", Arrays.asList("사과", "바나나", "포도", "수박"), ProblemFormat.MULTIPLE_CHOICE, "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80");
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Abandon' 의 뜻은?", "버리다", Arrays.asList("환영하다", "유지하다", "버리다", "발견하다"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Challenge' 의 뜻은?", "도전", Arrays.asList("포기", "결과", "도전", "실패"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Success' 의 뜻은?", "성공", Arrays.asList("성공", "실패", "노력", "희망"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Opportunity' 의 뜻은?", "기회", Arrays.asList("운", "기회", "위기", "선택"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Believe' 의 뜻은?", "믿다", Arrays.asList("믿다", "속이다", "잊다", "알다"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Compare' 의 뜻은?", "비교하다", Arrays.asList("비교하다", "차별하다", "통합하다", "해결하다"), ProblemFormat.MULTIPLE_CHOICE, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "'Discovery' 의 뜻은?", "발견", Arrays.asList("발견", "발명", "개발", "포기"), ProblemFormat.MULTIPLE_CHOICE, null);
        
        // --- Examples for SHORT_ANSWER ---
        createProblemIfMissing(mathRange1, Difficulty.MEDIUM, "10 + 20 은?", "30", Collections.emptyList(), ProblemFormat.SHORT_ANSWER, null);
        createProblemIfMissing(engRange1, Difficulty.MEDIUM, "이 동물의 이름은 영어로 무엇인가요? (소문자로 입력)", "dog", Collections.emptyList(), ProblemFormat.SHORT_ANSWER, "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80");
        createProblemIfMissing(mathRange2, Difficulty.MEDIUM, "x + 10 = 20 일 때 x는?", "10", Collections.emptyList(), ProblemFormat.SHORT_ANSWER, null);
    }

    private Subject findOrCreateSubject(String name) {
        List<Subject> subjects = subjectRepository.findByName(name);
        if (!subjects.isEmpty()) {
            return subjects.get(0);
        }
        Subject s = new Subject();
        s.setName(name);
        return subjectRepository.save(s);
    }

    private ProblemRange findOrCreateRange(String name, Subject subject) {
        List<ProblemRange> ranges = problemRangeRepository.findByNameAndSubjectId(name, subject.getId());
        if (!ranges.isEmpty()) {
            return ranges.get(0);
        }
        ProblemRange r = new ProblemRange();
        r.setName(name);
        r.setSubject(subject);
        return problemRangeRepository.save(r);
    }

    private void createProblemIfMissing(ProblemRange range, Difficulty difficulty, String question, String answer, List<String> optionsText, ProblemFormat format, String imageUrl) {
        if (problemRepository.existsByQuestion(question)) {
            return;
        }

        Problem p = new Problem();
        p.setProblemRange(range);
        p.setDifficulty(difficulty);
        p.setQuestion(question);
        p.setAnswer(answer);
        p.setFormat(format);
        p.setImageUrl(imageUrl);

        List<ProblemOption> options = optionsText.stream().map(text -> {
            ProblemOption opt = new ProblemOption();
            opt.setText(text);
            opt.setProblem(p);
            return opt;
        }).collect(Collectors.toList());

        p.getOptions().addAll(options);
        problemRepository.save(p);
    }
}
