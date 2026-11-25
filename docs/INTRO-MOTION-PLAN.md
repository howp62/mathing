# 첫 화면 소개 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 선택한 한 도형 변환 방식으로 15초 소개·건너뛰기와 같은 크기의 가입/로그인 버튼을 제공한다.

**Architecture:** 서버 페이지는 기존 완성 연결 그림과 인증 이동을 유지한다. 작은 클라이언트 구성 요소가 소개 시작·종료·건너뛰기·동작 줄이기를 처리하고, 첫 화면 전용 CSS가 15초 동안 도형을 변환한다.

**Tech Stack:** 기존 Next.js·React·TypeScript·SVG·CSS. 새 앱 패키지 없음.

**Spec:** `docs/INTRO-MOTION.md` (사용자 선택과 추가 요청 반영)

## Global Constraints

- 기존 종이 노트형·문구·목적지·사용자 관점 규칙 유지. 운영 DB 접근 없음.
- 모션 15초, 초기·중간 동작 줄이기는 즉시 정적 완성. 자바스크립트 없이도 첫 행동 가능.
- 가입·로그인은 동일 너비·높이·글자 크기. 로그인 색상만 보조 구분.
- 커밋·푸시·배포는 별도 요청 전 수행하지 않음.

## Review Focus

- 건너뛰기 버튼이 사라져도 초점을 잃지 않기.
- 자동 종료 시 사용자가 가리키던 가입·로그인 초점 유지.
- 중간에 동작 줄이기를 켜면 재생·타이머 종료.
- 스크립트가 없거나 화면 감지가 없어도 그림과 이동 가능.
- 390px·짧은 화면에서 그림·컨트롤·같은 크기 버튼이 겹치거나 넘치지 않기.

## Task 1: 소개 상태와 그림

Files: `components/LandingIntro.tsx`, `app/page.tsx`, 첫 화면 CSS.

- [x] 임시 ReactDOM 시험에서 새 기능 부재를 확인하고, 15초 종료·건너뛰기·초점·동작 줄이기의 실패를 재현한다.
- [x] `LandingIntro({children}: {children: ReactNode})`를 구현한다. 정적 완성 그림을 기본으로 하고 정상 환경에서만 15초 소개를 시작한다.
- [x] 15초 CSS 도형 변환과 남은 시간·건너뛰기·진행선을 구현한다. 원본의 글자·음악·이미지는 넣지 않는다.
- [x] 임시 시험을 다시 돌려 모든 동작 통과를 확인한다.

## Task 2: 같은 크기 버튼과 확인

Files: `app/page.tsx`, `app/globals.css`, `docs/PRD.md`, `tasks/todo.md`.

- [x] 가입·로그인 공통 버튼 스타일을 적용하고 기존 문구·목적지를 대조한다.
- [x] 타입 검사, 기존 TOTP·추천·가입 회귀·그림 보존 검사, 보안 소스 점검을 수행한다.
- [x] 민감 자료 없는 임시 개발 서버와 브라우저 연결로 390px 확인을 시도한다(호스트 연결 불가, 실제 확인 미완료).
- [x] 독립 검토와 결과·미확인을 기록한다.

진행 기록은 `tasks/todo.md`의 이번 작업 항목에 남긴다. 기존 미커밋 작업 기록을 보존한다.
