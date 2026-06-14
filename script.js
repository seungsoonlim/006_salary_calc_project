let currentType = 'year';

// 탭 전환 함수 (월 실수령액 <-> 실업급여)
function switchTab(tab) {
    const btnSalary = document.getElementById('tab-salary');
    const btnUnemp = document.getElementById('tab-unemp');
    const sectSalary = document.getElementById('sect-salary');
    const sectUnemp = document.getElementById('sect-unemp');

    if (tab === 'salary') {
        btnSalary.classList.add('active');
        btnUnemp.classList.remove('active');
        sectSalary.classList.remove('hidden');
        sectUnemp.classList.add('hidden');
    } else {
        btnUnemp.classList.add('active');
        btnSalary.classList.remove('active');
        sectUnemp.classList.remove('hidden');
        sectSalary.classList.add('hidden');
    }
}

// 급여 기준 전환 함수 (연봉 <-> 월급)
function setSalaryType(type) {
    currentType = type;
    const btnYear = document.getElementById('btn-year');
    const btnMonth = document.getElementById('btn-month');
    const lblAmount = document.getElementById('lbl-amount');
    const inputAmount = document.getElementById('input-amount');

    if (type === 'year') {
        btnYear.classList.add('active');
        btnMonth.classList.remove('active');
        lblAmount.innerText = "연봉 입력";
        inputAmount.value = "3600";
    } else {
        btnMonth.classList.add('active');
        btnYear.classList.remove('active');
        lblAmount.innerText = "월급 입력";
        inputAmount.value = "300";
    }
}

// 숫자 원화 포맷 변경 함수
function formatWon(num) {
    return Math.round(num).toLocaleString() + '원';
}

// 1. 실수령액 계산 로직
function calcSalary() {
    const amountInput = parseFloat(document.getElementById('input-amount').value) * 10000;
    const nonTax = parseFloat(document.getElementById('input-non-tax').value) * 10000;
    
    if (isNaN(amountInput) || amountInput <= 0) {
        alert("금액을 정확히 입력해 주세요.");
        return;
    }

    let monthlyGross = currentType === 'year' ? (amountInput / 12) : amountInput;
    let taxBase = monthlyGross - nonTax;

    if (taxBase < 0) taxBase = 0;

    // 2026년 기준 4대보험 요율 적용
    const np = taxBase * 0.045;       // 국민연금 (4.5%)
    const hi = taxBase * 0.03545;     // 건강보험 (3.545%)
    const lti = hi * 0.1295;          // 장기요양 (건보의 12.95%)
    const ei = monthlyGross * 0.009;   // 고용보험 (0.9%)

    // 소득세 간이 보정 알고리즘
    let rawTax = 0;
    const annualTaxBase = taxBase * 12;
    if (annualTaxBase <= 14000000) rawTax = annualTaxBase * 0.06;
    else if (annualTaxBase <= 50000000) rawTax = 840000 + (annualTaxBase - 14000000) * 0.15;
    else rawTax = 6240000 + (annualTaxBase - 50000000) * 0.24;
    
    const monthlyTax = (rawTax / 12) * 0.45; 
    const localTax = monthlyTax * 0.1;
    const totalTax = monthlyTax + localTax;

    const totalDeduct = np + hi + lti + ei + totalTax;
    const netSalary = monthlyGross - totalDeduct;

    // 결과 데이터 화면 이식
    document.getElementById('res-total-salary').innerText = formatWon(netSalary);
    document.getElementById('res-tax').innerText = formatWon(totalTax);
    document.getElementById('res-np').innerText = formatWon(np);
    document.getElementById('res-hi').innerText = formatWon(hi);
    document.getElementById('res-lti').innerText = formatWon(lti);
    document.getElementById('res-ei').innerText = formatWon(ei);
    document.getElementById('res-deduct').innerText = formatWon(totalDeduct);

    // 결과 상자 부드럽게 노출
    document.getElementById('result-salary').style.display = 'block';
}

// 2. 실업급여 계산 로직
function calcUnemployment() {
    const age = parseInt(document.getElementById('unemp-age').value);
    const periodIdx = parseInt(document.getElementById('unemp-period').value);
    const prevWage = parseFloat(document.getElementById('unemp-wage').value) * 10000;

    if (isNaN(age) || isNaN(prevWage) || prevWage <= 0) {
        alert("나이와 월급을 정확히 입력해 주세요.");
        return;
    }

    const dailyWage = prevWage / 30;
    let dailyUnemp = dailyWage * 0.6;

    // 2026년 기준 상하한액 하드코딩 방어책
    const maxDaily = 66000; 
    const minDaily = 63104; 

    if (dailyUnemp > maxDaily) dailyUnemp = maxDaily;
    if (dailyUnemp < minDaily) dailyUnemp = minDaily;

    let days = 120;
    const isOldOrDisabled = age >= 50;

    if (periodIdx === 1) {
        days = 120;
    } else if (periodIdx === 3) {
        days = isOldOrDisabled ? 180 : 150;
    } else if (periodIdx === 5) {
        days = isOldOrDisabled ? 210 : 180;
    } else if (periodIdx === 10) {
        days = isOldOrDisabled ? 240 : 210;
    } else {
        days = isOldOrDisabled ? 270 : 240;
    }

    const totalUnemp = dailyUnemp * days;

    document.getElementById('res-total-unemp').innerText = formatWon(totalUnemp);
    document.getElementById('res-unemp-days').innerText = days + '일';
    document.getElementById('res-unemp-daily').innerText = formatWon(dailyUnemp);
    document.getElementById('res-unemp-month').innerText = formatWon(dailyUnemp * 30);

    // 결과 상자 부드럽게 노출
    document.getElementById('result-unemp').style.display = 'block';
}

// 🚨 [자동화 시스템] 사이트가 켜질 때 대제목과 푸터의 연도를 올해 년도로 자동 변경
window.onload = function() {
    const currentYear = new Date().getFullYear(); // 컴퓨터가 올해가 몇 년도인지 자동으로 계산
    document.getElementById('title-year').innerText = currentYear; // 대제목 맨 앞 연도 자동 변경
    document.getElementById('footer-year').innerText = currentYear; // 하단 푸터 연도 자동 변경
};
