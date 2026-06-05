# 맞공! (maj.gong) 🎯

> 과목별 문제를 풀고 점수를 쌓아 실력을 겨루는 학습 경쟁 플랫폼

---

## 📌 프로젝트 개요

**맞공(maj.gong)** 은 사용자가 로그인 후 과목·범위·난이도·문제 수를 설정해 문제를 풀고, 점수를 기반으로 순위를 경쟁하는 웹 학습 서비스입니다.

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 역할 |
|------|------|
| React + Vite | UI 개발 및 빌드 |
| TypeScript (.tsx / .ts) | 정적 타입 검사 |
| React Router v6 | 페이지 라우팅 |
| CSSProperties StyleSheet 패턴 | 컴포넌트 하단 `styles` 객체로 스타일 관리 (React Native StyleSheet 방식) |
| Zustand | 전역 상태 관리 (로그인 상태, 유저 정보 등) |
| React Query (TanStack Query) | API 데이터 fetching 및 캐싱 |

### Backend
| 기술 | 역할 |
|------|------|
| Spring Boot (Java) | REST API 서버 |
| Spring Security | 인증/인가 처리 |
| JWT | 토큰 기반 인증 |
| OAuth2 (Google, Naver) | 소셜 로그인 |
| JPA / Hibernate | ORM (Oracle DB 연동) |

### Database
| 기술 | 역할 |
|------|------|
| Oracle Database Free | 메인 데이터베이스 |

### 배포
| 기술 | 역할 |
|------|------|
| Vercel | 프론트엔드 배포 |
| Oracle Cloud Free Tier | 백엔드 서버 + DB 호스팅 |

---

## 📁 프로젝트 구조

```
majgong/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx                 # 로그인 및 OAuth2
│   │   │   ├── Register.tsx              # 회원가입 및 닉네임 중복검사
│   │   │   ├── Main.tsx                  # 유저 메인 및 등급 대시보드
│   │   │   ├── QuizSetting.tsx           # 과목/범위/난이도 설정
│   │   │   ├── QuizPlay.tsx              # 퀴즈 풀이, 그만풀기 및 채점
│   │   │   ├── Ranking.tsx               # 명예의 전당 랭킹
│   │   │   ├── ExamRangeManagement.tsx   # [관리자] 시험 범위 아코디언 및 관리
│   │   │   └── RangeCreate.tsx           # [관리자] 범위 추가
│   │   │   └── ProblemCreate.tsx         # [관리자] 문제 추가
│   │   ├── components/     # 재사용 UI 컴포넌트 (.tsx)
│   │   ├── store/          # Zustand 전역 상태 (인증 정보 등)
│   │   ├── api/            # React Query API 클라이언트 (.ts)
│   │   └── hooks/          # 커스텀 훅 (.ts)
│   └── ...
│
└── backend/                # Spring Boot
    ├── src/main/java/
    │   ├── controller/     # API 컨트롤러 (Auth, Problem, Ranking, Score)
    │   ├── service/        # 비즈니스 서비스 레이어 (Auth, Quiz, Ranking, Score)
    │   ├── repository/     # Spring Data JPA Repository
    │   ├── entity/         # DB 엔티티 (User, Subject, ProblemRange, Problem, ProblemOption, QuizScore)
    │   └── config/         # Security, JWT, OAuth2, RateLimit 설정
    └── ...
```

---

## 🗄️ 주요 DB 테이블

| 테이블 | 엔티티 명 | 설명 |
|--------|-----------|------|
| `MAJGONG_USER` | `User` | 회원 정보 (이름, 이메일, 패스워드, 로그인 타입, 등급, 누적 점수, 권한, 로그인 실패 횟수, 계정 잠금 시각) |
| `SUBJECT` | `Subject` | 과목 정보 (수학, 영어 등 과목 이름 및 영문 폴더명) |
| `PROBLEM_RANGE` | `ProblemRange` | 시험 범위/단원 정보 (과목에 소속, 이름 및 영문 폴더명) |
| `PROBLEM` | `Problem` | 문제 정보 (문제 내용, 정답, 이미지 경로, 문제 형식, 난이도, 소속 단원) |
| `PROBLEM_OPTION` | `ProblemOption` | 객관식 문제의 보기 항목 (1개 문제당 최대 5개 보기 매핑) |
| `QUIZ_SCORE` | `QuizScore` | 유저별 퀴즈 풀이 이력 및 획득 점수 (정답 수, 오답 수, 점수, 연습/실전 모드 구분) |

---

## 📱 주요 페이지 및 기능

### 1. 로그인 및 회원가입 페이지
- **자체 회원가입 & 로그인**: ID/PW 입력 및 암호화(BCrypt) 처리
  - **닉네임 중복 검사**: 무조건 "중복확인" 버튼을 눌러 승인받은 경우에만 가입 가능
- **소셜 로그인**: Google / Naver OAuth2 연동 및 JWT 자동 발급
- **로그인 시도 제한 (보안)**: 로그인 실패를 5회 연속 할 경우 계정이 **1시간 동안 잠금**되어 로그인이 정지됩니다. (잠금 상태에서 시도 시 남은 시간 분/초 단위 안내)

### 2. 메인 페이지
- 내 퀴즈 성적 요약 및 등급 확인 (입문 ➔ 초급 ➔ 중급 ➔ 고급 ➔ 마스터 ➔ 전설)
- 퀴즈 설정 / 랭킹 확인 / 관리자용 범위 관리(관리자 계정 `majgong@manager.com` 로그인 시에만 노출)

### 3. 문제 설정 페이지
- **과목 및 범위 선택**: DB의 과목 리스트 및 해당 과목 하위 단원(범위) 동적 드롭다운 로드
- **난이도 선택**: 상 / 중 / 하 / 혼합 (세로 배열 레이아웃)
- **문제 형식 선택**: 객관식 / 주관식 / 혼합 (세로 배열 레이아웃)
- **문제 수 선택**: 10문제 / 20문제 / 30문제 / 50문제
- **연습문제 / 실전문제 유형 선택**:
  - 연습문제 점수: `1점 × 맞은 문제 수` (문제당 정/오답 즉각 피드백 배너 및 해설 정답 제공)
  - 실전문제 점수: `5점 × (맞은 문제 수 - 틀린 문제 수)` (중간 피드백 없음, 시간 제한 및 점수 랭킹 반영)

### 4. 퀴즈 풀이 및 결과 페이지
- **디지털 타이머**: 풀이 소요 시간 누적 및 실시간 노출
- **그만풀기 기능**: 진행 중 "그만풀기" 버튼을 누르면 컨펌 창 확인 후 **현재까지 채점된 점수만 반영하여 결과페이지로 이동 및 제출**
- **결과 대시보드**: 난이도 정보, 푼 문제 수 대비 **실제 푼 문제 기준 정확도(%)**, 정/오답 개수, 타이머 정보 및 서버 점수 연동 성공 상태 표기

### 5. 시험 범위 및 문제 관리 페이지 (관리자 전용)
- **과목별 단원 아코디언**: 단원을 확장하여 단원별 등록된 문제들을 순서대로 아코디언 펼침 형태로 실시간 조회
- **범위/단원 관리**: 단원 이름 및 영문 폴더명 추가/수정/삭제 (단원 삭제 시 소속 문제 연쇄 Cascade 삭제 처리)
- **문제 관리**: 등록된 문제 내용, 정답, 보기 리스트, 이미지 경로, 난이도 등 모달 팝업 형태로 즉각 수정 및 삭제 기능 지원

### 6. 범위 및 문제 추가 페이지 (관리자 전용)
- **범위 추가**: 과목 미선택 상태에서도 진입해 수동 선택 후 범위 신규 생성 가능
- **문제 추가**: 문제 유형(객관/주관), 난이도, 내용, 정답, 보기 5개 생성
  - **이미지 첨부**: Drag & Drop 이미지 파일 업로드 시 폴더 구조에 맞게 물리 경로 자동 할당 매핑 기능 제공

### 7. 순위표 페이지
- 전체 맞공 유저들의 누적 총점 및 등급 기준 상위 100명 명예의 전당 랭킹 출력
- 돌아가기 버튼


---

## 🔐 인증 방식

- 자체 로그인: ID/PW → Spring Security + BCrypt + JWT
- 소셜 로그인: Google / Naver OAuth2 → JWT 발급

---

## 🚀 실행 방법

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 환경변수 설정 (.env / application.yml)
```
# Oracle DB
ORACLE_URL=jdbc:oracle:thin:@localhost:1521/FREEPDB1
ORACLE_USERNAME=your_username
ORACLE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Naver OAuth2
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```
