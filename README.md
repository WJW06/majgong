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
│   │   │   ├── Login.tsx
│   │   │   ├── Main.tsx
│   │   │   ├── QuizSetting.tsx
│   │   │   ├── QuizPlay.tsx
│   │   │   └── Ranking.tsx
│   │   ├── components/     # 재사용 컴포넌트 (.tsx)
│   │   ├── store/          # Zustand 전역 상태 (.ts)
│   │   ├── api/            # React Query API 호출 (.ts)
│   │   └── hooks/          # 커스텀 훅 (.ts)
│   └── ...
│
└── backend/                # Spring Boot
    ├── src/main/java/
    │   ├── controller/     # REST API 엔드포인트
    │   ├── service/        # 비즈니스 로직
    │   ├── repository/     # JPA Repository
    │   ├── entity/         # DB 엔티티
    │   └── config/         # Security, OAuth2 설정
    └── ...
```

---

## 🗄️ 주요 DB 테이블

| 테이블 | 설명 |
|--------|------|
| `USERS` | 회원 정보 (이름, 이메일, 로그인 방식, 등급) |
| `PROBLEM` | 문제 (과목, 범위, 난이도, 정답, 보기) |
| `SCORE` | 풀이 결과 (유저, 맞은 수, 틀린 수, 점수, 타입) |
| `RANKING` | 순위 집계 |

---

## 📱 주요 페이지 및 기능

### 1. 로그인 페이지
- 맞공 자체 회원가입 / 로그인
- Google OAuth2 로그인
- Naver OAuth2 로그인

### 2. 메인 페이지
- 내 점수 및 등급 확인 (이름, 총점, 등급)
- 문제 풀기 / 순위표 / 문의하기 버튼

### 3. 문제 설정 페이지 (문제 풀기 클릭 시)
- 과목 선택 (드롭다운)
- 범위 선택 (드롭다운, 과목에 따라 동적 변경)
- 난이도 선택: 상 / 중 / 하
- 문제 수 선택
- 연습문제 / 실전문제 선택
  - 연습문제 점수: `1점 × 문제 개수`
  - 실전문제 점수: `5점 × 문제 개수 - 틀린 수`

### 4. 순위표 페이지
- 전체 유저 순위 목록 (이름, 등급, 순위)
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
