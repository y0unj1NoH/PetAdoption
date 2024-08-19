# PetAdoption

유기견, 유기묘 입양 사이트

## 기획 의도 (미완)

## API 분석 (미완)

- 유기동물 조회 쿼리
- bgnde, endde
  const bgnde = 20240803;
  const endde = 20240803;
  저 날짜 들 사이에 happenDt인 애들을 보여주는 것 같다
  bgnde가 없으면 그전 happenDt까지 보여주고, endde없으면 그냥 오늘 날짜까지 보여주고
  둘다 최근 날짜를 먼저 보여줌

둘다 없으면 모든 날짜 다보여주는데 딱 한달전까지만 보여주는듯 20240713

// 시도 - 시군구 - 품종 검색하면 해당 검색에 따른 아이들을 알려주는
// 그런거 다 제쳐두고 공고 모집 얼마 안남은 애들 알려주는
// 오늘 들어온 주인 찾는 아이들을 알려주는

// 안락사 위기 강아지는 날짜 어떻게 찾아야하지?
// bgnde, endde는 어떻게 활용해야 하는거지? 둘 숫자를 바꾸면
// 상태가 보호중, 종료(반환), 종료(입양), 종료(자연사) 일수도 있음
// 보호중인것 -> protect나 notice하면 될듯

### API 데이터 예시

```js
{
"age": "2014(년생)",
"careAddr": "경기도 남양주시 경강로163번길 32-27 (이패동)",
"careNm": "남양주시동물보호센터",
"careTel": "031-590-2785",
"chargeNm": "한예주",
"colorCd": "갈색",
"desertionNo": "441399202402235",
"filename": "http://www.animal.go.kr/files/shelter/2024/08/202408121608810_s.jpg",
"happenDt": "20240812",
"happenPlace": "진접읍 내각1로 89번길 2-4",
"kindCd": "[개] 믹스견",
"neuterYn": "Y",
"noticeEdt": "20240811",
"noticeNo": "경기-남양주-2024-00763",
"noticeSdt": "20240811",
"officetel": "031-590-2324",
"orgNm": "경기도 남양주시",
"popfile": "http://www.animal.go.kr/files/shelter/2024/08/202408121608810.jpg",
"processState": "보호중",
"sexCd": "M",
"specialMark": "동물인수제 겁이 있지만 사람의 손길을 피하지 않음",
"weight": "6.1(Kg)"
}
```

## 설계 (미완)

1. 시도 셀렉트 추가하기와 축종 셀렉트 추가하기
2. 선택된 시도를 통해서 시군구 셀렉트 추가하기
3. 2번과 병렬로 선택된 축종을 통해 품종 셀렉트 추가하기

## 개발 회고 (미완)

**v1.**

**v2.**

**추가 구현해야 할 사항**

- sec1 안락사 위기 동물 서치하기
- 페이지네이션: 현재 page는 버튼 색깔 바꾸기
- 반응형 그리드
- css 정리
- 로컬 스토리지 추가
- 인터렉티브 넣기

## **개발 이슈**

### 1. API 인코딩키를 searchParams.set()으로 넣으면 불필요한 인코딩이 일어나는 문제가 발생

```js
// u%2FNiNxG25ZXH5OjWVgExHHBp%2BRTAlQfFsSF4IaIgUUvr%2FZy0XxbESRXVymFI4%2BZEL1wc%2FlRBIf7CuGwrcYGl0w%3D%3D
console.log(API_KEY);
// u%252FNiNxG25ZXH5OjWVgExHHBp%252BRTAlQfFsSF4IaIgUUvr%252FZy0XxbESRXVymFI4%252BZEL1wc%252FlRBIf7CuGwrcYGl0w%253D%253D
console.log(url.searchParams.get("serviceKey"));
```

**해결 방법**

1. 인코딩 키가 한번 더 인코딩 되기 때문에, 대신 디코딩 키쓰기
2. 아래 코드처럼 url.searchParams.set("serviceKey", decodeURIComponent(API_KEY));으로 쓰기

```js
const fetchSigungu = async (sido) => {
  try {
    let url = new URL(`http://apis.data.go.kr/1543061/abandonmentPublicSrvc`);

    url.searchParams.set("serviceKey", decodeURIComponent(API_KEY));
  } catch (e) {
    console.error(e);
  }
};
```

3. URL()에 바로 넣기

```js
let url = new URL(
  `http://apis.data.go.kr/1543061/abandonmentPublicSrvc?_type=json&serviceKey=${API_KEY}`
);
```

### 2. await 사용과 미사용 차이

- 없으면 프로미스가 반환되고, 있으면, 내가 쿼리한 값만 반환됨, 값이 없으면 undefined가 나오는거같음

```js
const search = async () => {
  console.log($sido.value, $sigungu.value, $upKind.value, $kind.value);
  const data = await fetchAbandonmentPublic(
    $sido.value,
    $sigungu.value,
    $upKind.value,
    $kind.value
  );

  console.log("search", data);
};
```

### 3. text-overflow: ellipsis; 적용 안되는 이슈

- 카드 안의 주소 텍스트가 말줄임이 안되었다. 적용하려는 텍스트가 display: flex로 적용되어 있으면 말줄임이 적용되지 않는다.

```css
overflow: hidden;
text-overflow: ellipsis;
```

### 4. 1차원 배열 벗기기

- 배열 객체에서 filter를 통해 길이가 1인 [{}] 값을 가져왔는데, 안에 있는 객체만 뽑아올 수 없는지 고민하였다.
- 생각해보니 arr[0]으로 인덱스로 벗기는 게 제일 간편해 보인다. 다른 방법이 더 있을까?

### 5. innerText innerHTML 속도

- textContent > innerText > innerHTML 이라고 한다.
- textContent는 한번 공부해야 할 것 같다.

### 6. is not defined at HTMLAnchorElement.onclick

- 순전한 오타 실수였다. defined 오류가 나오면 오타부터 찾자.
- 번외로 modal의 컨텐츠가 안보이는 문제가 있었는데, 그건 앞에 레거시 modal 섹션을 남겨놔서 앞 모달 섹션이 open으로 적용된 것이었다..;

### 7. 부모 엘리먼트에서 자식 엘리먼트 바로 접근하기

- 순전히 뇌피셜로, $parent.child1 이런식으로 접근이 되길 바랬지만, 그딴 건 없었다.
- 오히려 부모를 통해 자식을 잡으려면 쿼리셀렉터를 두 번 써야하기 때문에, 코드가 더 길어진다.
- 그냥 바로 자식 id로 접근하는 게 베스트인 것 같다. 다른 좋은 방법이 있을까?

### 8. 이벤트 리스너의 콜백함수 반응 안함

- 문법 오류였다... 이벤트 객체를 안써서 저렇게 해도 될 줄 알았다...ㅎ

```js
$searchBtn.addEventListener("click", fetchAndDisplayCards(2, 1)); // error
$searchBtn.addEventListener("click", () => fetchAndDisplayCards(2, 1)); // good~
```

[참고 자료] https://velog.io/@jwons44/8-1%EA%B0%95.-Handling-Events%EC%9D%B8%EC%9E%90%EC%A0%84%EB%8B%AC%ED%95%98%EA%B8%B0

### 9. 표 html

- 표 잘 몰라서 한 번 보고 가야할 듯.

### 10. pointer-events

- 모달창 구글링하다가 본 속성인데, 잘 몰라서 공부해야 한다.

### 11. 무한 스크롤 중 값이 없어서 fetch 중 뜬 오류

- //common.js:373 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'map')
- 이 에러가 뜬 게 맞는지 잘 기억은 안나는데, 어쨋든 값이 없는데 fetch하면 문제가 있었다.
- type 2,3으로 나눠, type 2(검색 버튼 클릭)에는 totalCount를 초기화하고, type 3(무한스크롤)에서 불러온 데이터 길이를 추합하여, 토탈 값과 비교하여, 데이터가 남아있을 때만 fetch를 하게 개선하였다.

### 12. 카카오맵 API 오류

1. TypeError: Cannot read properties of undefined (reading 'maps')

- 도메인 등록을 안하면 오류가 났다.
  [참고 자료] https://velog.io/@planethoon/%EC%B9%B4%EC%B9%B4%EC%98%A4-%EB%A7%B5-api-%EC%82%AC%EC%9A%A9-%EB%8F%84%EC%A4%91-TypeError-Cannot-read-properties-of-undefined-reading-maps

2. TypeError: kakao.maps.LatLng is not a constructor

- 로딩이 끝나지 않았는데, constructor를 쓰려고 하면 발생한다.
- kakao.maps의 정적 메서드인 load를 사용하여 스크립트 로딩이 끝났을 때 객체에 접근하면 된다.
  [참고 자료] https://mingeesuh.tistory.com/entry/TypeError-kakaomapsLatLng-is-not-a-constructor
  https://apis.map.kakao.com/web/documentation/#load_load

3. TypeError: Cannot read properties of undefined (reading 'Geocoder')

- Geocoder를 쓰려면 추가로 라이브러리를 가져왔어야 하였다.
- 스크립트 태그 src 마지막에 `&libraries=services`를 붙여주자...^^

### 13. 반응형 그리드

- 카드가 화면을 줄이면 같이 안 줄어든다... 왜지
- 카드가 줄어들면 그 비율처럼 텍스트도 줄어들 수는 없을까?

### 14. 부모안에 자식이 왜 안들어가 있는wl?

- sec2안에 ul이 안들어가 있음
- 현재는 ul을 div로 바꿈.
