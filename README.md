# Backend

## Getting Started

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open <http://localhost:3000>

## API 문서

### 인증

- /auth/login/kakao: [POST] - 카카오 로그인
- /auth/login/naver: [POST] - 네이버 로그인

### 사용자 프로필

- /users/me: [GET] - 사용자의 프로필 조회
- /users/me: [PUT] - 사용자의 프로필 수정

### 그룹

- /groups: [GET] - 그룹 목록 조회
- /groups: [POST] - 그룹 생성
- /groups/:groupId: [GET] - 그룹 상세 조회
- /groups/:groupId: [PUT] - 그룹 정보 수정
- /groups/:groupId: [DELETE] - 그룹 삭제

#### 그룹 멤버

- /groups/:groupId/members: [GET] - 그룹 멤버 목록 조회
- /groups/:groupId/members: [POST] - 그룹 멤버 추가
- /groups/:groupId/members: [DELETE] - 그룹 멤버 삭제
- /groups/:groupId/members/:userId: [DELETE] - 그룹 멤버 삭제

#### 그룹 초대 링크

- /groups/:groupId/invite: [POST] - 그룹 초대 링크 생성
- /groups/:groupId/invite: [DELETE] - 그룹 초대 링크 삭제

#### 초대 수락

- /groups/join: [POST] - 그룹 초대 수락

### 그룹 물품

- /items: [GET] - 물품 목록 조회
- /items/:itemId: [GET] - 물품 상세 조회
- /groups/:groupId/items: [POST] - 물품 등록
- /groups/:groupId/items: [DELETE] - 물품 삭제
- /groups/:groupId/items/:itemId: [PUT] - 물품 수정

### 물품 대여

- /items/:itemId/available-times: [GET] - 물품 대여 가능 시간 조회
- /items/:itemId/reservations: [POST] - 물품 대여 요청
- /items/:itemId/reservations: [DELETE] - 물품 대여 요청 취소
- /items/:itemId/reservations/:reservationId: [PUT] - 물품 대여 요청 수정

### 예약 내역

- /reservations: [GET] - 예약 내역 조회
- /reservations/:reservationId: [GET] - 예약 상세 조회
- /reservations/:reservationId: [PATCH] - 예약 상태 변경
