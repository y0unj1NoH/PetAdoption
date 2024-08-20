// const API_KEY = process.env.PUBLIC_API_KEY;
import { API_KEY } from "./config.js";
import { SIDO_LIST } from "./sido.js";

// const { kakao } = window;

let pageSize = 8;
let page = 1; //currentPage
let totalResults = 0;
let groupSize = 5;

let list1Data = [];
let list2Data = [];

const LIMIT = 8;
let page2 = 1;
let isLoading = false;
let totalResults2 = 0;
let currentResults2 = 0;

// SELECT 요소
const $sido = document.getElementById("sido");
const $sigungu = document.getElementById("sigungu");
const $upKind = document.getElementById("up-kind");
const $kind = document.getElementById("kind");

// SEC1 요소
const $listCon = document.getElementById("list-con");
const $listCon1 = document.getElementById("list-con1");
const $pagination = document.getElementById("pagination");

// SEC2 요소
const $listCon2 = document.getElementById("list-con2");
const $searchBtn = document.getElementById("search-btn");

// 모달 요소
const $modal = document.getElementById("modal");
const $closeBtn = document.getElementById("close-btn");
const $modalMap = document.getElementById("modal-map");

// 로딩 요소
const $loader = document.createElement("div");

const UP_KIND_CD = { 개: 417000, 고양이: 422400, 기타: 429900 };

// FETCH 관련 함수

// 시군구 데이터 fetch
const fetchSigungu = async sido => {
  try {
    let url = new URL(
      `http://apis.data.go.kr/1543061/abandonmentPublicSrvc?_type=json&serviceKey=${API_KEY}`
    );

    url.pathname += "/sigungu";
    url.searchParams.set("upr_cd", sido);

    const res = await fetch(url);
    const data = await res.json();

    return data.response.body.items.item;
  } catch (e) {
    console.error(e);
  }
};

// 보호소 데이터 fetch (현재 미사용)
const fetchShelter = async (sido, sigungu) => {
  try {
    let url = new URL(
      `http://apis.data.go.kr/1543061/abandonmentPublicSrvc?_type=json&serviceKey=${API_KEY}`
    );

    url.pathname += "/shelter";
    url.searchParams.set("upr_cd", sido);
    url.searchParams.set("org_cd", sigungu);

    const res = await fetch(url);
    const data = await res.json();

    return data.response.body.items.item;
  } catch (e) {
    console.error(e);
  }
};

// 축종 데이터 fetch
const fetchKind = async up_kind_cd => {
  try {
    let url = new URL(
      `http://apis.data.go.kr/1543061/abandonmentPublicSrvc?_type=json&serviceKey=${API_KEY}`
    );

    url.pathname += "/kind";
    url.searchParams.set("up_kind_cd", up_kind_cd);

    const res = await fetch(url);
    const data = await res.json();

    return data.response.body.items.item;
  } catch (e) {
    console.error(e);
  }
};

// 유기 동물 데이터 fetch
const fetchAbandonmentPublic = async (
  upr_cd,
  org_cd,
  up_kind,
  kind,
  endde,
  pageNo = 1
) => {
  try {
    let url = new URL(
      `http://apis.data.go.kr/1543061/abandonmentPublicSrvc?_type=json&serviceKey=${API_KEY}`
    );

    url.pathname += "/abandonmentPublic";
    if (upr_cd !== "none") url.searchParams.set("upr_cd", upr_cd);
    if (org_cd !== "none") url.searchParams.set("org_cd", org_cd);
    if (up_kind !== "none") url.searchParams.set("up_kind", up_kind);
    if (kind !== "none") url.searchParams.set("kind", kind);
    // sec1를 위한 공고 얼마 안남은 친구들만 서치할 수 있도록 파라미터 추가했는데
    // 진짜 안락사 얼마 안남은 애들은 어떻게 알아오지?
    if (endde != "none") url.searchParams.set("endde", endde);

    url.searchParams.set("state", "protect"); //상태
    url.searchParams.set("numOfRows", 8);
    url.searchParams.set("pageNo", pageNo);

    const res = await fetch(url);
    const data = await res.json();

    console.log(data.response.body);
    return data.response.body;
  } catch (e) {
    console.error(e);
  }
};

// SELECT 관련 함수

// 시도 select option 생성
const addSidoOption = () => {
  for (let key in SIDO_LIST) {
    const sidoText = `<option value="${SIDO_LIST[key]}" >${key}</option>`;
    $sido.insertAdjacentHTML("beforeend", sidoText);
  }
};

// 선택된 시도에 따른 시군구 select option 생성
const addSigunguOption = sigunguList => {
  $sigungu.innerHTML = `<option value="none">시/군/구 선택</option>`;

  const sigunguHtml = sigunguList
    .map(
      sigungu =>
        `<option value="${sigungu.orgCd}">${sigungu.orgdownNm}</option>`
    )
    .join("");
  $sigungu.insertAdjacentHTML("beforeend", sigunguHtml);
};

// 시도 선택 변경 이벤트 핸들러
const changeSido = async () => {
  if ($sido.value === "none") {
    $sigungu.innerHTML = `<option value="none">시/군/구 선택</option>`;
    return;
  }
  const result = await fetchSigungu($sido.value);
  addSigunguOption(result);
};

// 축종 select option 생성
const addUpKindOption = () => {
  for (let key in UP_KIND_CD) {
    const upKindText = `<option value="${UP_KIND_CD[key]}" >${key}</option>`;
    $upKind.insertAdjacentHTML("beforeend", upKindText);
  }
};

// 선택된 축종에 따른 품종 select option 생성
const addKindOption = kindList => {
  $kind.innerHTML = `<option value="none">품종 선택</option>`;

  const kindHtml = kindList
    .map(kind => `<option value="${kind.kindCd}">${kind.knm}</option>`)
    .join("");
  $kind.insertAdjacentHTML("beforeend", kindHtml);
};

// 축종 선택 변경 이벤트 핸들러
const changeUpKind = async () => {
  if ($upKind.value === "none") {
    $kind.innerHTML = `<option value="none">품종 선택</option>`;
    return;
  }

  const result = await fetchKind($upKind.value);
  addKindOption(result);
};

// 그리드 관련 함수

const createHtmlSec1 = card => {
  // sec2와 다르게 카드 내용 강조할 것 (디데이, 좀더 급한 입양에 필요한 데이터들)
  let urlToImage =
    card.popfile ||
    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
  let kindCd = card.kindCd.split("]")[1] || "비어있음";
  let sexCd =
    card.sexCd === "F"
      ? "fa-venus"
      : card.sexCd === "M" ? "fa-mars" : "fa-genderless";
  let noticeNo = card.noticeNo || "비어있음";
  let noticeEdt = card.noticeEdt || "비어있음";
  return `<li class="card" data-id=${card.desertionNo}>
          <div class="card-img">
            <img
              src=${urlToImage}
              alt="프로필 이미지"
            />
          </div>
          <a onClick="openModal('${noticeNo}')">자세히 보기</a>
        </li>`;

  // return `<li class="card" data-id=${card.desertionNo}>
  //         <div class="card-text">
  //           <span class="kindCd"
  //             >${kindCd}<i class="fa-solid ${sexCd} sexCd"></i
  //           ></span>
  //         <p class="noticeDt">
  //           ~${noticeEdt}<i class="fa-solid fa-hourglass-end"></i>
  //         </p>
  //       </div>
  //       <div class="card-img">
  //         <img
  //           src=${urlToImage}
  //           alt="프로필 이미지"
  //         />
  //       </div>

  //       <a onClick="openModal('${noticeNo}')">자세히 보기</a>
  //     </li>`;
};

const createHtmlSec2 = card => {
  let urlToImage =
    card.popfile ||
    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
  let kindCd = card.kindCd.split("]")[1] || "비어있음";
  let sexCd =
    card.sexCd === "F"
      ? "fa-venus"
      : card.sexCd === "M" ? "fa-mars" : "fa-genderless";
  let happenDt = card.happenDt || "비어있음";
  let noticeNo = card.noticeNo || "비어있음";
  let careAddr = card.careAddr || "비어있음";
  let noticeSdt = card.noticeSdt || "비어있음";
  let noticeEdt = card.noticeEdt || "비어있음";
  return `<li class="card" data-id=${card.desertionNo}>
          <div class="card-img">
            <img
              src=${urlToImage}
              alt="프로필 이미지"
            />
          </div>
          <div class="card-text">
            <div class="card-header">
              <span class="kindCd"
                >${kindCd}<i class="fa-solid ${sexCd} sexCd"></i
              ></span>
              <span class="happenDt">${happenDt}</span>
            </div>

            <p class="noticeNo">${noticeNo}</p>
            <p class="careAddr">
              <i class="fa-solid fa-location-dot"></i>${careAddr}
            </p>
            <p class="noticeDt">
              <i class="fa-regular fa-calendar"></i>${noticeSdt}~${noticeEdt}
            </p>
          </div>
          <a onClick="openModal('${noticeNo}')">자세히 보기</a>
        </li>`;
};

// 페이지네이션 onClick 이벤트 함수
window.movePage = pageNo => {
  page = pageNo;
  fetchAndDisplayCards(1, page);
};

const pagination = () => {
  let pageGroup = Math.ceil(page / groupSize);
  let lastPage = Math.min(
    Math.ceil(totalResults / pageSize),
    pageGroup * groupSize
  );
  let firstPage = (pageGroup - 1) * groupSize + 1;
  let totalPage = Math.ceil(totalResults / pageSize);
  let prevGroup = (pageGroup - 2) * groupSize + 1;
  let nextGroup = pageGroup * groupSize + 1;

  let paginationHtml = `<button class="next" ${pageGroup == 1
    ? "disabled"
    : ""} onClick='movePage(${prevGroup})'><<</button>`;

  paginationHtml += `<button class="next" ${pageGroup == 1
    ? "disabled"
    : ""} onClick='movePage(${page - 1})'><</button>`;

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHtml += `<button class='${i == page
      ? "on"
      : ""}' onClick='movePage(${i})'>${i}</button>`;
  }

  paginationHtml += `<button class="next" ${pageGroup * groupSize >= totalPage
    ? "disabled"
    : ""} onClick='movePage(${page + 1})'>></button>`;

  paginationHtml += `<button class="next" ${pageGroup * groupSize >= totalPage
    ? "disabled"
    : ""} onClick='movePage(${nextGroup})'>>></button>`;

  $pagination.innerHTML = paginationHtml;
};

const getFormattedDateTenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 10); // 10일 전으로 설정
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

// fetch => 렌더링 함수
const fetchAndDisplayCards = async (type, pageNo) => {
  // console.log($sido.value, $sigungu.value, $upKind.value, $kind.value);

  // 1: SEC1
  // 2: SEC2 검색 버튼 클릭 버전
  // 3: SEC2 스크롤 버전

  let endde = "none";
  if (type === 1) endde = getFormattedDateTenDaysAgo(); // 오늘 날짜 한달전으로 해놔야할듯
  const data = await fetchAbandonmentPublic(
    $sido.value,
    $sigungu.value,
    $upKind.value,
    $kind.value,
    endde,
    pageNo
  );

  const totalCount = data.totalCount;
  const items = data.items.item;
  const itemsLength = data.items.item.length;

  switch (type) {
    case 1:
      totalResults = totalCount;
      list1Data = [...items];
      $listCon.innerHTML = items
        .slice(0, 2)
        .map(item => createHtmlSec1(item))
        .join("");
      $listCon1.innerHTML = items
        .slice(2)
        .map(item => createHtmlSec1(item))
        .join("");
      pagination();
      break;
    case 2:
      totalResults2 = totalCount;
      currentResults2 = itemsLength;
      list2Data = [...items];

      $listCon2.innerHTML = ``;
      $listCon2.innerHTML = items.map(item => createHtmlSec2(item)).join("");
      break;
    case 3:
      currentResults2 += itemsLength;
      list2Data = [...list2Data, ...items]; // Merge new items with existing list
      $listCon2.innerHTML += items.map(item => createHtmlSec2(item)).join("");
      break;
  }
};

// 굳이 이걸 뺀 이유를 모르겠음 이것도 나중에 지워버리고 이벤트 리스너에 넣던가 해야지
const newLoading = () => {
  if (isLoading) return;
  isLoading = true;
  $loader.classList.add("show");
  console.log("스크롤");
  setTimeout(() => {
    fetchAndDisplayCards(3, ++page2);
    isLoading = false;
    $loader.classList.remove("show");
  }, 1000);
};

// 모달창 토글
const toggleModal = () => {
  $modal.classList.toggle("open");
};

// 모달창 데이터 렌더링
// 굉장히 지저분한테 코드 고칠 필요가 있음
window.openModal = noticeNo => {
  const filterData = [...list1Data, ...list2Data].filter(
    e => e.noticeNo === noticeNo
  )[0];
  console.log(filterData);

  let urlToImage =
    filterData.popfile ||
    "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

  let sexCd =
    filterData.sexCd === "F"
      ? "fa-venus"
      : filterData.sexCd === "M" ? "fa-mars" : "fa-genderless";

  document.getElementById("modal-img").innerHTML = `<img
              src=${urlToImage}
              alt="프로필 이미지"
            />`;
  document.getElementById("modal-text").innerHTML = `
          <p id="modal-noticeNo">${noticeNo}</p>
          <p id="modal-kindCd">
            ${filterData.kindCd}<i class="fa-solid ${sexCd} sexCd"></i>
          </p>
          <p id="modal-noticeDt">
            <i class="fa-regular fa-calendar"></i>${filterData.noticeSdt}~${filterData.noticeEdt}
          </p>`;

  document.getElementById("modal-happenDt").innerText = filterData.happenDt;
  document.getElementById("modal-happenPlace").innerText =
    filterData.happenPlace;
  document.getElementById("modal-colorCd").innerText = filterData.colorCd;
  document.getElementById("modal-age").innerText = filterData.age;
  document.getElementById("modal-weight").innerText = filterData.weight;
  document.getElementById("modal-processState").innerText =
    filterData.processState;
  document.getElementById("modal-neuterYn").innerText = filterData.neuterYn;
  document.getElementById("modal-specialMark").innerText =
    filterData.specialMark;
  document.getElementById("modal-careNm").innerText = filterData.careNm;
  document.getElementById("modal-careTel").innerText = filterData.careTel;
  document.getElementById("modal-careAddr").innerText = filterData.careAddr;
  document.getElementById("modal-chargeNm").innerText = filterData.chargeNm;
  document.getElementById("modal-officetel").innerText = filterData.officetel;

  let upKindCd = filterData.kindCd.split("]")[0].slice(1);
  let markerImgUrl =
    upKindCd === "개"
      ? "https://i.ibb.co/mNt1pcD/pomeranian.png"
      : upKindCd === "고양이"
        ? "https://i.ibb.co/LdzG4s8/munchkin.png"
        : "https://i.ibb.co/mtv4nrw/pets.png";

  // 카카오맵 API 추가
  kakao.maps.load(function() {
    let geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(filterData.careAddr, function(result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        let options = {
          //지도를 생성할 때 필요한 기본 옵션
          center: new kakao.maps.LatLng(result[0].y, result[0].x), //지도의 중심좌표.
          level: 3 //지도의 레벨(확대, 축소 정도)
        };

        let map = new kakao.maps.Map($modalMap, options); //지도 생성 및 객체 리턴

        let markerImage = new kakao.maps.MarkerImage(
          markerImgUrl,
          new kakao.maps.Size(31, 35), // 마커이미지의 크기입니다
          new kakao.maps.Point(13, 34) // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
        );

        // 결과값으로 받은 위치를 마커로 표시합니다
        let marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(result[0].y, result[0].x),
          image: markerImage
        });

        marker.setMap(map);
      }
    });
  });

  $modal.classList.toggle("open");
};

const init = function() {
  // 시도, 축종 SELECT init
  addSidoOption();
  addUpKindOption();

  // SEC1, SEC2 컨텐츠 init
  fetchAndDisplayCards(1, 1);
  fetchAndDisplayCards(2, 1);

  // 로딩중 (html로 빼는게 낫겟는데?)
  $loader.classList.add("loader");
  $loader.innerHTML = `<span></span><span></span><span></span>`;
  document.body.appendChild($loader);
};

init();

// 이벤트 리스너

// SELECT 이벤트 리스너
$sido.addEventListener("input", changeSido);
$upKind.addEventListener("input", changeUpKind);

// SEC1, SEC2 관련 이벤트 리스너
$searchBtn.addEventListener("click", () => fetchAndDisplayCards(2, 1));
$closeBtn.addEventListener("click", toggleModal);

// SEC2 스크롤 이벤트 리스너 : 이 함수 맘에 안듦
window.addEventListener("wheel", function(e) {
  if (currentResults2 >= totalResults2) {
    console.log(`${currentResults2}/${totalResults2}`, "No more data to fetch");
    return;
  }

  const { deltaY } = e;
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 20 && deltaY > 0) {
    newLoading();
  }
});
