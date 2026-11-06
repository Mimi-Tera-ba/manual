/**
 * 私の「聞こえのトリセツ」自動生成メーカー ロジック (app.js)
 * - 1カラム広々入力 ＆ オンデマンドA4両面（表・裏2ページ）プレビューモーダル
 * - 右耳・左耳それぞれの補聴機器（補聴器・人工内耳・骨伝導・なし）＆ 聴力（dB）入力対応
 * - 裏面下部の「YYシステム・UDトーク等の音声認識アプリ案内」自動生成
 * - Googleフォーム（スプレッドシート）への見込み顧客（リード）情報自動送信 ＆ PDF出力
 */

document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_SPREADSHEET_WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbymezDjkaFatu0aVc6aUZZURQPj0pPC15YgNOaXr4wRSjYCxWLoTcHSzoyXGqDRohnEkw/exec";

  let currentMode = "work";
  let currentTheme = "orange";
  let currentFrame = "simple"; // 'simple' | 'cute' | 'stylish' | 'cafe'
  let currentPosition = "front";

  // シート本体（1ページ目・2ページ目）
  const sheetPage1 = document.getElementById("sheet-page-1");
  const sheetPage2 = document.getElementById("sheet-page-2");
  const previewModal = document.getElementById("preview-modal");

  // モード・フレーム・カラー・ポジションボタン
  const modeBtns = document.querySelectorAll("#mode-selector .mode-btn");
  const frameBtns = document.querySelectorAll("#frame-selector .frame-btn");
  const colorBtns = document.querySelectorAll("#color-selector .color-btn");
  const posBtns = document.querySelectorAll("#position-selector .pos-btn");

  // フォーム要素
  const inputName = document.getElementById("input-name");
  const inputAge = document.getElementById("input-age");
  const inputRole = document.getElementById("input-role");
  const inputAvatar = document.getElementById("input-avatar");
  const clearAvatarBtn = document.getElementById("clear-avatar-btn");
  const avatarFormPreviewWrap = document.getElementById("avatar-form-preview-wrap");
  const avatarFormPreview = document.getElementById("avatar-form-preview");
  const sheetAvatarImg = document.getElementById("sheet-avatar-img");
  let currentAvatarDataUrl = "";
  const dbRight = document.getElementById("db-right");
  const dbLeft = document.getElementById("db-left");
  const assistSystem = document.getElementById("assist-system");
  const levelUnaided = document.getElementById("level-unaided");
  const levelAided = document.getElementById("level-aided");
  const levelNote = document.getElementById("level-note");
  const emergencyCheck = document.getElementById("emergency-check");

  // STEP 6 編集テキストエリア
  const editSheetTitle = document.getElementById("edit-sheet-title");
  const editGreeting = document.getElementById("edit-greeting");
  const editHearingSummary = document.getElementById("edit-hearing-summary");
  const editRequestsText = document.getElementById("edit-requests-text");
  const editAppPromo = document.getElementById("edit-app-promo");
  const editClosing = document.getElementById("edit-closing");

  // プレビュー表示側DOM要素（表面・裏面）
  const sheetModePill = document.getElementById("sheet-mode-pill");
  const sheetTitleDisplay = document.getElementById("sheet-title-display");
  const sheetRoleDisplay = document.getElementById("sheet-role-display");
  const sheetNameDisplay = document.getElementById("sheet-name-display");
  const sheetBackName = document.getElementById("sheet-back-name");
  const sheetGreetingDisplay = document.getElementById("sheet-greeting-display");
  const sheetEarRight = document.getElementById("sheet-ear-right");
  const sheetEarLeft = document.getElementById("sheet-ear-left");
  const sheetDbRight = document.getElementById("sheet-db-right");
  const sheetDbLeft = document.getElementById("sheet-db-left");
  const sheetTypeDisplay = document.getElementById("sheet-type-display");
  const sheetAidedDisplay = document.getElementById("sheet-aided-display");
  const sheetUnaidedDisplay = document.getElementById("sheet-unaided-display");
  const sheetAssistRow = document.getElementById("sheet-assist-row");
  const sheetAssistDisplay = document.getElementById("sheet-assist-display");
  const sheetSummaryDisplay = document.getElementById("sheet-summary-display");
  const positionSvgWrap = document.getElementById("position-svg-wrap");
  const sheetPosTitle = document.getElementById("sheet-pos-title");
  const sheetPosDesc = document.getElementById("sheet-pos-desc");
  const sheetCommBadges = document.getElementById("sheet-comm-badges");
  const sheetDifficultList = document.getElementById("sheet-difficult-list");
  const sheetRequestsList = document.getElementById("sheet-requests-list");
  const sheetKnowledgeBox = document.getElementById("sheet-knowledge-box");
  const sheetKnowledgeList = document.getElementById("sheet-knowledge-list");
  const sheetEmergencyBox = document.getElementById("sheet-emergency-box");
  const sheetAppPromoText = document.getElementById("sheet-app-promo-text");
  const sheetAppsGrid = document.getElementById("sheet-apps-grid");
  const sheetClosingDisplay = document.getElementById("sheet-closing-display");

  // 操作ボタン
  const topPreviewBtn = document.getElementById("top-preview-btn");
  const midPreviewBtn = document.getElementById("mid-preview-btn");
  const bottomPreviewBtn = document.getElementById("bottom-preview-btn");
  const closePreviewBtn = document.getElementById("close-preview-btn");
  const aiRegenerateBtn = document.getElementById("ai-regenerate-btn");
  const topDownloadBtn = document.getElementById("top-download-btn");
  const mainDownloadBtn = document.getElementById("main-download-btn");
  const modalDownloadBtn = document.getElementById("modal-download-btn");

  // リード獲得フォーム要素
  const downloadSection = document.getElementById("download-section");
  const inputEmail = document.getElementById("input-email");
  const consentCheck = document.getElementById("consent-check");
  const emailError = document.getElementById("email-error");
  const consentError = document.getElementById("consent-error");
  const toastMsg = document.getElementById("toast-msg");

  // トースト表示
  let toastTimer = null;
  function showToast(text) {
    toastMsg.textContent = text;
    toastMsg.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove("show");
    }, 2600);
  }

  // チェックボックス群の選択値取得
  function getCheckedValues(containerId) {
    const checked = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
    return Array.from(checked).map((cb) => cb.value);
  }

  // ラジオボタンの選択値取得
  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "補聴器";
  }

  // dB数値から一般的な聞こえの目安ラベルを付与するヘルパー
  function formatDbLabel(dbStr) {
    const val = parseFloat(dbStr);
    if (isNaN(val) || dbStr === "") {
      return "聴力dB：未記入";
    }
    let grade = "";
    if (val < 25) grade = "正常範囲";
    else if (val < 40) grade = "軽度難聴";
    else if (val < 70) grade = "中等度難聴";
    else if (val < 90) grade = "高度難聴";
    else grade = "重度難聴";
    return `平均 ${val} dB（${grade}目安）`;
  }

  // 補聴機器名にアイコンを添えるヘルパー
  function formatDeviceWithIcon(devName) {
    if (devName === "補聴器") return "🦻 補聴器";
    if (devName === "人工内耳") return "⚡ 人工内耳";
    if (devName === "骨伝導・軟骨伝導機器") return "🎧 骨伝導・軟骨伝導機器";
    return "✖ 使っていない";
  }

  // 4つのフレーム＆イラストデザイン（ベクターSVGイラストパック）
  const FRAME_ILLUST_PACKS = {
    simple: {
      greetingIcon: "🌿",
      cornerSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
        <path d="M6 26 C6 14 14 6 26 6" fill="none" stroke="var(--th-main)" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
        <path d="M12 12 C12 7 18 7 18 12 C18 15 12 15 12 12 Z" fill="var(--th-main)" opacity="0.45"/>
      </svg>`,
      titleSvg: `<svg viewBox="0 0 44 28" width="38" height="24">
        <path d="M8 22 Q14 10 24 14 Q18 24 8 22 Z" fill="#22c55e" opacity="0.8"/>
        <path d="M22 18 Q28 6 38 10 Q32 20 22 18 Z" fill="var(--th-main)" opacity="0.85"/>
        <circle cx="38" cy="7" r="2.5" fill="#f59e0b"/>
      </svg>`,
      slots: {
        hearing: `<svg viewBox="0 0 60 26" width="54" height="24">
          <path d="M8 14 Q14 6 20 14 T32 14" fill="none" stroke="var(--th-main)" stroke-width="2" stroke-linecap="round"/>
          <circle cx="44" cy="13" r="6" fill="var(--th-soft)" stroke="var(--th-main)" stroke-width="1.8"/>
          <path d="M41 13 L43 15 L47 11" fill="none" stroke="var(--th-main)" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`,
        position: `<svg viewBox="0 0 50 26" width="46" height="24">
          <circle cx="18" cy="13" r="7" fill="var(--th-badge)" stroke="var(--th-main)" stroke-width="1.5"/>
          <circle cx="34" cy="13" r="7" fill="var(--th-soft)" stroke="var(--th-main)" stroke-width="1.5"/>
        </svg>`,
        comm: `<svg viewBox="0 0 56 26" width="50" height="24">
          <rect x="8" y="5" width="22" height="14" rx="7" fill="var(--th-badge)" stroke="var(--th-main)" stroke-width="1.5"/>
          <rect x="26" y="8" width="22" height="14" rx="7" fill="#ffffff" stroke="var(--th-main)" stroke-width="1.5"/>
        </svg>`,
        difficult: `<svg viewBox="0 0 50 26" width="46" height="24">
          <path d="M14 18 Q25 6 36 18" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/>
        </svg>`,
        requests: `<svg viewBox="0 0 64 26" width="58" height="24">
          <path d="M12 18 Q18 8 28 12 Q22 22 12 18 Z" fill="#22c55e" opacity="0.75"/>
          <circle cx="44" cy="13" r="7" fill="var(--th-badge)" stroke="var(--th-main)" stroke-width="1.6"/>
          <path d="M41 13 Q44 16 47 13" fill="none" stroke="var(--th-dark)" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`,
        knowledge: `<svg viewBox="0 0 50 26" width="46" height="24">
          <circle cx="28" cy="12" r="7" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
          <line x1="28" y1="2" x2="28" y2="4" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="38" y1="6" x2="36" y2="8" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="18" y1="6" x2="20" y2="8" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`,
        apps: `<svg viewBox="0 0 56 26" width="50" height="24">
          <rect x="18" y="3" width="14" height="20" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/>
          <circle cx="25" cy="19" r="1.2" fill="#0284c7"/>
          <path d="M36 9 Q41 13 36 17 M40 6 Q47 13 40 20" fill="none" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`,
      },
    },
    cute: {
      greetingIcon: "🌸",
      cornerSvg: `<svg viewBox="0 0 36 36" width="32" height="32">
        <g transform="translate(18,18)">
          <circle cx="0" cy="-7" r="5" fill="#fbcfe8"/>
          <circle cx="6.6" cy="-2.1" r="5" fill="#fbcfe8"/>
          <circle cx="4.1" cy="5.6" r="5" fill="#fbcfe8"/>
          <circle cx="-4.1" cy="5.6" r="5" fill="#fbcfe8"/>
          <circle cx="-6.6" cy="-2.1" r="5" fill="#fbcfe8"/>
          <circle cx="0" cy="0" r="4" fill="#fde047"/>
        </g>
      </svg>`,
      titleSvg: `<svg viewBox="0 0 56 28" width="48" height="26">
        <!-- お花とキラキラ -->
        <g transform="translate(16,14)">
          <circle cx="0" cy="-6" r="4.5" fill="#f472b6"/>
          <circle cx="5.7" cy="-1.8" r="4.5" fill="#f472b6"/>
          <circle cx="3.5" cy="4.8" r="4.5" fill="#f472b6"/>
          <circle cx="-3.5" cy="4.8" r="4.5" fill="#f472b6"/>
          <circle cx="-5.7" cy="-1.8" r="4.5" fill="#f472b6"/>
          <circle cx="0" cy="0" r="3.5" fill="#fef08a"/>
        </g>
        <path d="M38 6 L40 12 L46 14 L40 16 L38 22 L36 16 L30 14 L36 12 Z" fill="#fbbf24"/>
      </svg>`,
      slots: {
        hearing: `<svg viewBox="0 0 64 26" width="58" height="24">
          <!-- かわいい小鳥と音符 -->
          <path d="M18 18 C14 18 12 14 15 10 C18 7 24 8 26 12 L31 10 L28 15 C28 18 23 18 18 18 Z" fill="#38bdf8"/>
          <circle cx="17" cy="12" r="1.2" fill="#0f172a"/>
          <text x="36" y="18" fill="#ec4899" font-size="14" font-weight="bold">♪</text>
          <text x="48" y="13" fill="#f59e0b" font-size="11" font-weight="bold">★</text>
        </svg>`,
        position: `<svg viewBox="0 0 56 26" width="50" height="24">
          <path d="M20 20 C20 20 11 14 11 9 C11 6 14 4 17 4 C19 4 20 6 20 6 C20 6 21 4 23 4 C26 4 29 6 29 9 C29 14 20 20 20 20 Z" fill="#f472b6"/>
          <path d="M40 7 L41.5 11.5 L46 13 L41.5 14.5 L40 19 L38.5 14.5 L34 13 L38.5 11.5 Z" fill="#fbbf24"/>
        </svg>`,
        comm: `<svg viewBox="0 0 60 26" width="54" height="24">
          <circle cx="18" cy="13" r="8" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
          <path d="M15 14 Q18 17 21 14" fill="none" stroke="#ec4899" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="15.5" cy="11" r="1" fill="#ec4899"/>
          <circle cx="20.5" cy="11" r="1" fill="#ec4899"/>
          <text x="32" y="18" fill="#f472b6" font-size="13" font-weight="bold">♥</text>
          <text x="45" y="15" fill="#fbbf24" font-size="12" font-weight="bold">✦</text>
        </svg>`,
        difficult: `<svg viewBox="0 0 56 26" width="50" height="24">
          <path d="M16 18 Q12 18 12 14 Q12 10 17 10 Q19 6 25 7 Q30 7 31 11 Q35 11 35 15 Q35 18 31 18 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2"/>
          <circle cx="44" cy="13" r="4" fill="#fda4af"/>
        </svg>`,
        requests: `<svg viewBox="0 0 68 26" width="62" height="24">
          <!-- リボンとお花 -->
          <polygon points="14,8 24,13 14,18" fill="#f472b6"/>
          <polygon points="34,8 24,13 34,18" fill="#f472b6"/>
          <circle cx="24" cy="13" r="3.5" fill="#fbbf24"/>
          <text x="42" y="18" fill="#ec4899" font-size="14">❀</text>
          <text x="54" y="15" fill="#f59e0b" font-size="12">✦</text>
        </svg>`,
        knowledge: `<svg viewBox="0 0 56 26" width="50" height="24">
          <path d="M22 6 L24 11 L29 13 L24 15 L22 20 L20 15 L15 13 L20 11 Z" fill="#fbbf24"/>
          <circle cx="40" cy="13" r="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        </svg>`,
        apps: `<svg viewBox="0 0 60 26" width="54" height="24">
          <rect x="14" y="4" width="13" height="18" rx="3.5" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
          <text x="33" y="17" fill="#0284c7" font-size="13" font-weight="bold">♪</text>
          <text x="45" y="15" fill="#ec4899" font-size="12" font-weight="bold">♥</text>
        </svg>`,
      },
    },
    stylish: {
      greetingIcon: "✨",
      cornerSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
        <polyline points="4,24 4,4 24,4" fill="none" stroke="var(--th-main)" stroke-width="3"/>
        <rect x="9" y="9" width="6" height="6" fill="var(--th-dark)" opacity="0.7"/>
      </svg>`,
      titleSvg: `<svg viewBox="0 0 52 26" width="44" height="22">
        <rect x="6" y="10" width="4" height="10" rx="2" fill="var(--th-main)"/>
        <rect x="14" y="4" width="4" height="22" rx="2" fill="var(--th-dark)"/>
        <rect x="22" y="8" width="4" height="14" rx="2" fill="var(--th-main)"/>
        <rect x="30" y="12" width="4" height="6" rx="2" fill="var(--th-dark)"/>
        <polygon points="44,6 50,13 44,20 38,13" fill="var(--th-main)"/>
      </svg>`,
      slots: {
        hearing: `<svg viewBox="0 0 64 26" width="58" height="24">
          <rect x="10" y="11" width="3" height="6" fill="var(--th-main)"/>
          <rect x="16" y="6" width="3" height="16" fill="var(--th-dark)"/>
          <rect x="22" y="9" width="3" height="10" fill="var(--th-main)"/>
          <rect x="28" y="4" width="3" height="20" fill="var(--th-dark)"/>
          <rect x="34" y="10" width="3" height="8" fill="var(--th-main)"/>
          <polygon points="48,6 55,13 48,20 41,13" fill="none" stroke="var(--th-main)" stroke-width="2"/>
        </svg>`,
        position: `<svg viewBox="0 0 56 26" width="50" height="24">
          <circle cx="20" cy="13" r="7" fill="none" stroke="var(--th-dark)" stroke-width="2"/>
          <circle cx="20" cy="13" r="2.5" fill="var(--th-main)"/>
          <path d="M32 13 L46 13 M41 8 L46 13 L41 18" fill="none" stroke="var(--th-main)" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        comm: `<svg viewBox="0 0 56 26" width="50" height="24">
          <polygon points="16,5 26,5 31,13 26,21 16,21 11,13" fill="var(--th-soft)" stroke="var(--th-dark)" stroke-width="1.6"/>
          <polygon points="34,5 44,5 49,13 44,21 34,21 29,13" fill="var(--th-badge)" stroke="var(--th-main)" stroke-width="1.6"/>
        </svg>`,
        difficult: `<svg viewBox="0 0 50 26" width="46" height="24">
          <polygon points="25,4 36,21 14,21" fill="#ffe4e6" stroke="#e11d48" stroke-width="1.8"/>
          <line x1="25" y1="10" x2="25" y2="15" stroke="#e11d48" stroke-width="2" stroke-linecap="round"/>
          <circle cx="25" cy="18" r="1.2" fill="#e11d48"/>
        </svg>`,
        requests: `<svg viewBox="0 0 64 26" width="58" height="24">
          <rect x="14" y="5" width="16" height="16" rx="3" fill="var(--th-main)"/>
          <path d="M18 13 L21 16 L27 10" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
          <rect x="36" y="5" width="16" height="16" rx="3" fill="var(--th-dark)"/>
          <path d="M40 13 L43 16 L49 10" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        </svg>`,
        knowledge: `<svg viewBox="0 0 50 26" width="46" height="24">
          <polygon points="25,3 33,13 25,23 17,13" fill="var(--th-badge)" stroke="var(--th-dark)" stroke-width="1.8"/>
        </svg>`,
        apps: `<svg viewBox="0 0 56 26" width="50" height="24">
          <rect x="12" y="4" width="14" height="18" rx="2" fill="#0284c7"/>
          <rect x="14" y="6" width="10" height="12" fill="#ffffff"/>
          <path d="M32 10 L44 10 M32 15 L40 15" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
      },
    },
    cafe: {
      greetingIcon: "☕",
      cornerSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
        <path d="M4 18 L18 4" stroke="var(--th-main)" stroke-width="4" stroke-linecap="round" opacity="0.45"/>
        <circle cx="10" cy="10" r="2.5" fill="var(--th-dark)"/>
      </svg>`,
      titleSvg: `<svg viewBox="0 0 54 28" width="46" height="24">
        <!-- コーヒーカップと湯気 -->
        <rect x="8" y="11" width="16" height="12" rx="3" fill="var(--th-main)"/>
        <path d="M24 13 H27 A3 3 0 0 1 27 19 H24" fill="none" stroke="var(--th-main)" stroke-width="2"/>
        <path d="M13 8 Q14 5 13 3 M19 8 Q20 5 19 3" fill="none" stroke="var(--th-dark)" stroke-width="1.5" stroke-linecap="round"/>
        <!-- 鉛筆 -->
        <polygon points="36,21 44,7 48,9 40,23" fill="#f59e0b"/>
        <polygon points="35,23 36,21 40,23" fill="#334155"/>
      </svg>`,
      slots: {
        hearing: `<svg viewBox="0 0 60 26" width="54" height="24">
          <!-- クリップとメモ -->
          <path d="M18 16 V8 A4 4 0 0 1 26 8 V18 A6 6 0 0 1 14 18 V10" fill="none" stroke="var(--th-dark)" stroke-width="1.8" stroke-linecap="round"/>
          <rect x="34" y="5" width="16" height="16" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
          <line x1="37" y1="10" x2="47" y2="10" stroke="#d97706" stroke-width="1.5"/>
          <line x1="37" y1="15" x2="44" y2="15" stroke="#d97706" stroke-width="1.5"/>
        </svg>`,
        position: `<svg viewBox="0 0 54 26" width="48" height="24">
          <rect x="14" y="9" width="16" height="12" rx="3" fill="var(--th-main)"/>
          <path d="M30 11 H33 A2.5 2.5 0 0 1 33 16 H30" fill="none" stroke="var(--th-main)" stroke-width="1.8"/>
          <line x1="11" y1="22" x2="33" y2="22" stroke="var(--th-dark)" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        comm: `<svg viewBox="0 0 58 26" width="52" height="24">
          <polygon points="16,20 26,6 30,9 20,23" fill="var(--th-main)"/>
          <circle cx="42" cy="13" r="6" fill="#fef3c7" stroke="var(--th-dark)" stroke-width="1.5"/>
        </svg>`,
        difficult: `<svg viewBox="0 0 50 26" width="46" height="24">
          <circle cx="26" cy="13" r="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
          <text x="26" y="16.5" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="bold">!</text>
        </svg>`,
        requests: `<svg viewBox="0 0 64 26" width="58" height="24">
          <!-- ピン留めと付箋 -->
          <rect x="16" y="5" width="18" height="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.4"/>
          <circle cx="25" cy="7" r="2.5" fill="#ef4444"/>
          <text x="42" y="18" fill="var(--th-dark)" font-size="13" font-weight="bold">✎</text>
        </svg>`,
        knowledge: `<svg viewBox="0 0 52 26" width="46" height="24">
          <rect x="16" y="5" width="18" height="16" rx="2" fill="#ffffff" stroke="var(--th-dark)" stroke-width="1.6"/>
          <line x1="25" y1="5" x2="25" y2="21" stroke="var(--th-dark)" stroke-width="1.4"/>
        </svg>`,
        apps: `<svg viewBox="0 0 56 26" width="50" height="24">
          <rect x="18" y="4" width="13" height="18" rx="2.5" fill="#ffffff" stroke="#0369a1" stroke-width="1.8"/>
          <circle cx="24.5" cy="19" r="1.2" fill="#0369a1"/>
          <text x="36" y="17" fill="#0369a1" font-size="12" font-weight="bold">♪</text>
        </svg>`,
      },
    },
  };

  // シートのクラス（カラーテーマ＆フレームスタイル）と各所イラストを更新する関数
  function applyFrameAndTheme() {
    sheetPage1.className = `a4-sheet theme-${currentTheme} frame-${currentFrame}`;
    sheetPage2.className = `a4-sheet theme-${currentTheme} frame-${currentFrame} page-break-before`;

    const pack = FRAME_ILLUST_PACKS[currentFrame] || FRAME_ILLUST_PACKS.simple;

    // 挨拶バブルのアイコン更新
    const greetingBubble = document.getElementById("greeting-icon-bubble");
    if (greetingBubble) {
      greetingBubble.textContent = pack.greetingIcon;
    }

    // タイトル横イラスト更新
    const titleSlot = document.querySelector('[data-slot="title"]');
    if (titleSlot) {
      titleSlot.innerHTML = pack.titleSvg;
    }

    // 四隅のコーナーイラスト更新（表面・裏面とも）
    document.querySelectorAll(".corner-deco").forEach((el) => {
      const corner = el.dataset.corner;
      let rot = "0deg";
      if (corner === "tr") rot = "90deg";
      if (corner === "br") rot = "180deg";
      if (corner === "bl") rot = "270deg";
      el.innerHTML = `<div style="transform:rotate(${rot}); display:flex;">${pack.cornerSvg}</div>`;
    });

    // 各ボックス右上のワンポイントイラスト更新
    document.querySelectorAll(".box-illust-slot").forEach((el) => {
      const slotName = el.dataset.slot;
      el.innerHTML = (pack.slots && pack.slots[slotName]) || "";
    });
  }

  // ベストポジション図解（笑顔の柔らかイラストSVG）
  function getPositionInfo(pos) {
    const map = {
      front: {
        title: "😊 正面（お顔・口元が見える位置）がベスト！",
        desc: "表情や口元の動きが見えると、言葉の意味がぐっと理解しやすくなります。",
        svg: `<svg viewBox="0 0 100 100" width="82" height="82">
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#fdba74" stroke-width="2.5"/>
          <!-- 相手（上・正面） -->
          <circle cx="50" cy="24" r="14" fill="#ffedd5" stroke="#ea5504" stroke-width="2"/>
          <circle cx="45" cy="22" r="1.6" fill="#9a3412"/>
          <circle cx="55" cy="22" r="1.6" fill="#9a3412"/>
          <path d="M46 27 Q50 31 54 27" fill="none" stroke="#ea5504" stroke-width="1.8" stroke-linecap="round"/>
          <!-- 矢印 -->
          <path d="M50 41 L50 51" stroke="#ea5504" stroke-width="3" stroke-linecap="round"/>
          <polygon points="50,54 45,47 55,47" fill="#ea5504"/>
          <!-- 本人（下・笑顔） -->
          <circle cx="50" cy="72" r="15" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="45" cy="69" r="1.6" fill="#334155"/>
          <circle cx="55" cy="69" r="1.6" fill="#334155"/>
          <path d="M45 74 Q50 78 55 74" fill="none" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/>
          <text x="50" y="95" text-anchor="middle" fill="#9a3412" font-size="8" font-weight="bold">正面から</text>
        </svg>`,
      },
      right: {
        title: "👉 私の【右側】から話しかけてください",
        desc: "右耳の方が音を聞き取りやすいため、右側に立つ・座っていただけると助かります。",
        svg: `<svg viewBox="0 0 100 100" width="82" height="82">
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#fdba74" stroke-width="2.5"/>
          <!-- 本人（左寄り・笑顔） -->
          <circle cx="32" cy="50" r="15" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="27" cy="48" r="1.6" fill="#334155"/>
          <circle cx="37" cy="48" r="1.6" fill="#334155"/>
          <path d="M27 53 Q32 57 37 53" fill="none" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/>
          <!-- 矢印 -->
          <path d="M61 50 L51 50" stroke="#ea5504" stroke-width="3" stroke-linecap="round"/>
          <polygon points="48,50 55,45 55,55" fill="#ea5504"/>
          <!-- 相手（右側） -->
          <circle cx="76" cy="50" r="13" fill="#ffedd5" stroke="#ea5504" stroke-width="2"/>
          <text x="76" y="53" text-anchor="middle" fill="#9a3412" font-size="8.5" font-weight="bold">右側</text>
        </svg>`,
      },
      left: {
        title: "👈 私の【左側】から話しかけてください",
        desc: "左耳の方が音を聞き取りやすいため、左側に立つ・座っていただけると助かります。",
        svg: `<svg viewBox="0 0 100 100" width="82" height="82">
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#fdba74" stroke-width="2.5"/>
          <!-- 本人（右寄り・笑顔） -->
          <circle cx="68" cy="50" r="15" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="63" cy="48" r="1.6" fill="#334155"/>
          <circle cx="73" cy="48" r="1.6" fill="#334155"/>
          <path d="M63 53 Q68 57 73 53" fill="none" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/>
          <!-- 矢印 -->
          <path d="M39 50 L49 50" stroke="#ea5504" stroke-width="3" stroke-linecap="round"/>
          <polygon points="52,50 45,45 45,55" fill="#ea5504"/>
          <!-- 相手（左側） -->
          <circle cx="24" cy="50" r="13" fill="#ffedd5" stroke="#ea5504" stroke-width="2"/>
          <text x="24" y="53" text-anchor="middle" fill="#9a3412" font-size="8.5" font-weight="bold">左側</text>
        </svg>`,
      },
      visual: {
        title: "👋 まずは視界に入って合図をお願いします！",
        desc: "声だけだと気づけないことがあるため、手を振る・肩トントンで合図をお願いします。",
        svg: `<svg viewBox="0 0 100 100" width="82" height="82">
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#fdba74" stroke-width="2.5"/>
          <rect x="20" y="15" width="60" height="22" rx="11" fill="#ffedd5" stroke="#ea5504" stroke-width="1.8"/>
          <text x="50" y="29" text-anchor="middle" fill="#9a3412" font-size="8.5" font-weight="bold">👋 合図・文字</text>
          <circle cx="50" cy="64" r="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="44" cy="61" r="1.7" fill="#334155"/>
          <circle cx="56" cy="61" r="1.7" fill="#334155"/>
          <path d="M44 67 Q50 72 56 67" fill="none" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`,
      },
    };
    return map[pos] || map.front;
  }

  // 音声認識アプリ（YY文字起こし・UDトーク等）のカタログ＆QRコード情報（URLテキスト非表示・QRコードのみ）
  const APP_CATALOG = {
    yy: {
      name: "📱 YY文字起こし",
      tag: "雑音に強い・高精度AI",
      desc: "騒がしい場所や会議でも高い精度で声をリアルタイム文字起こしできるアプリです。発言者の声を見える化し、スムーズな会話を実現します。",
      search: "",
      qrDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgAQMAAACxAfVuAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABcElEQVRIib2WQa7DIAxEHXXBkiNwk+RiVUOVi5GbcIQsWUT4z0Ba/e5j6CZ5qWQ82GNEDJZXLAl4msqiO98OGxhFglOnZSni90PkYQQ3PYMETS7JdEzHqpshRPSE/BKi20KRsri9TDocNpFzkTK7+qv8zZCFAsjos/9fSzfDz1pafabfhrgTIvoZVAncfsz+fTwHQkismW1YpoKi1UqRTeBKkfETxPfV15a8BWyR2YZVcJpoxKcRfDQ90YYVeop/axwJRU5siUULEfaP8gYQqYbCbzNyT1d0G3gKzxKPLJoX/2UCVwwepskkv3qOgv4UzQX1BLfhh+rpnxZwyywbFE6Ff7I/GN0CxvDIIjC0Bf0u/XiNICes0zb4mGa7MwyCbbnMDWFMJJqPDbzmEb4s14SNYgMjja3b2gSpX9yNCew3lm4q/lufQ2HGDRAW0NxGLaH2fucm9BQbGPudliILbyxtvlvAVjZdz9Q8NA6EBusP6avY4Xp9zO4AAAAASUVORK5CYII=",
    },
    udtalk: {
      name: "📱 UDトーク",
      tag: "定番・多人数＆翻訳対応",
      desc: "1対1の会話から会議、多言語翻訳まで幅広く使えるコミュニケーションアプリです。QRコードで簡単にトークルームを共有できます。",
      search: "",
      qrDataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgAQMAAACxAfVuAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABJUlEQVRIicWWsbGEMAxExRA4dAmU4s6OT2eUQgkOHTDo78pwzBXAonFwvEs03tXKZg9UdtRutmf/M5v5VYVwNZJ1t8mbffCRpNAdBJewzYDJDz3MvvNmtnegFXogvQBDDh89LuRHIwEMK8IMGf1sP/4UwLPK/fOu5yFbgiK4ED9sWhqOEFqhFjVCIG1Ds0EJs+OPcCNCgGcJjVQQNlhHX9EVzdBOf4ogpoCneMiBHJj9bcg0LuwToXTbRgpjNr3XcrWkgRyNGMwPt+F27SMd9MoZOVIsBSaDCl5BNFbMBfrhe0AHr0w2m47UY7kK4RqzUPASsMSWuhVlMF4CXyt+NVLCkKNN4Ycqh3yGQYsQRQqtv0OqDUw/bCUl7FY8d3Eo8jZ8oP4BGYpFUoegXLgAAAAASUVORK5CYII=",
    },
    voice_memo: {
      name: "🎙️ スマホ標準の音声入力・メモ",
      tag: "インストール不要",
      desc: "専用アプリがない時も、スマホの標準メモ帳を開いてキーボードの「マイク（音声入力）」で話して画面を見せていただくだけで確実に伝わります。",
      search: "💡 iPhone / Android 標準キーボードの「🎙️マイク」ボタンで即利用OK",
      qrDataUrl: "",
    },
  };

  // AI文章自動構成エンジン（STEP 1〜5の選択値からSTEP 6の文章を生成）
  function generateAiTexts() {
    const nameVal = inputName.value.trim() || "私";
    const rDev = getRadioValue("device-right");
    const lDev = getRadioValue("device-left");
    const rDb = dbRight.value.trim();
    const lDb = dbLeft.value.trim();
    const noteVal = levelNote.value.trim();

    const modeConfig = {
      work: {
        pill: "",
        title: "私の聞こえのトリセツ",
        greeting: `いつも業務でのサポートをありがとうございます。${nameVal}です。皆さんと円滑にコミュニケーションを取り、安心してお仕事を進めるために、私の「聞こえの特徴」と「少しお手伝いいただきたい配慮（裏面）」をまとめました。`,
        appPromo:
          "打ち合わせや雑談の際、「YY文字起こし」や「UDトーク」などの音声認識アプリを使っていただくと、話した言葉がリアルタイムで文字になり、会話が劇的にスムーズになります！ぜひ右のQRコードからスマートフォンにダウンロードしてご活用いただけますと幸いです。",
        closing:
          "ちょっとした視覚的な合図やチャット・音声認識アプリの併用があると、とてもスムーズに業務に取り組めます。何か気づいたことがあれば、いつでも気軽にお声がけください！",
      },
      school: {
        pill: "",
        title: "私の聞こえのトリセツ",
        greeting: `先生方、クラスの皆さん、いつもありがとうございます。${nameVal}です。授業やゼミ、グループワーク、休み時間の会話を楽しくスムーズに過ごすために、私の「聞こえの特徴」と「お願いしたい工夫（裏面）」をまとめました。`,
        appPromo:
          "グループワークや休み時間の会話では、「YY文字起こし」や「UDトーク」などの無料音声認識アプリを使うと、みんなの声がリアルタイムで文字になって一緒に会話を楽しめます！ぜひQRコードからスマートフォンにダウンロードして試していただけると嬉しいです。",
        closing:
          "聞き返してしまうこともありますが、皆さんとお話しするのは大好きです！少しだけ視覚的なサポートをいただけると嬉しいです。これからよろしくお願いします！",
      },
      daily: {
        pill: "",
        title: "私の聞こえのトリセツ",
        greeting: `はじめまして、${nameVal}です。私には少し聞こえにくさがあるため、皆さんと楽しく安心してお話しできるよう、私の「聞こえの特徴」と「伝わりやすい方法（裏面）」をまとめました。`,
        appPromo:
          "お話しする際、スマートフォンの無料音声認識アプリ（「YY文字起こし」や「UDトーク」など）を使っていただくと、話した言葉がその場で文字になって表示されるため、とてもスムーズにお話しできます！ぜひQRコードからスマートフォンにダウンロードして試していただけると嬉しいです。",
        closing:
          "ゆっくり口元を見せていただいたり、スマホの音声認識アプリやメモを使っていただけると、とても楽しくお話しできます。どうぞよろしくお願いいたします！",
      },
    };

    const cfg = modeConfig[currentMode] || modeConfig.work;
    if (sheetModePill) {
      sheetModePill.textContent = cfg.pill;
    }
    editSheetTitle.value = cfg.title;
    editGreeting.value = cfg.greeting;
    editAppPromo.value = cfg.appPromo;
    editClosing.value = cfg.closing;

    // 聞こえの特徴まとめ文の自動合成
    let devText = "";
    if (rDev === "使っていない" && lDev === "使っていない") {
      devText = "現在は補聴機器を使用していません。";
    } else if (rDev === lDev) {
      devText = `両耳に「${rDev}」を装用しています。`;
    } else {
      devText = `右耳は「${rDev}」、左耳は「${lDev}」を使用しています。`;
    }

    let dbText = "";
    if (rDb || lDb) {
      dbText = `聴力レベルは右耳が${rDb ? rDb + "dB" : "未測定"}、左耳が${
        lDb ? lDb + "dB" : "未測定"
      }です。`;
    }

    let summaryText = `${devText}${dbText}周囲の雑音や話す距離・向きによって聞き取りやすさが大きく変わるため、視覚的な情報（口元・文字・チャット等）を併用していただけると非常に助かります。`;
    if (noteVal) {
      summaryText += `\n（※補足：${noteVal}）`;
    }
    editHearingSummary.value = summaryText;

    // お願いアクション一覧
    const supportActions = getCheckedValues("support-actions-group");
    editRequestsText.value = supportActions.join("\n");

    renderPreview();
  }

  // A4 表面・裏面（2ページ）プレビューシートへ描画
  function renderPreview() {
    const nameVal = inputName.value.trim() || "氏名未入力";
    const rDev = getRadioValue("device-right");
    const lDev = getRadioValue("device-left");

    // 表面・裏面ヘッダー
    sheetTitleDisplay.textContent =
      editSheetTitle.value.trim() || "私の聞こえのトリセツ";
    sheetNameDisplay.textContent = nameVal;
    if (sheetBackName) {
      sheetBackName.textContent = "";
    }

    const roleVal = inputRole.value.trim();
    sheetRoleDisplay.textContent = roleVal;
    sheetRoleDisplay.style.display = roleVal ? "block" : "none";

    // 顔写真・イラストアイコンの表示制御
    if (currentAvatarDataUrl && sheetAvatarImg) {
      sheetAvatarImg.src = currentAvatarDataUrl;
      sheetAvatarImg.style.display = "block";
    } else if (sheetAvatarImg) {
      sheetAvatarImg.src = "";
      sheetAvatarImg.style.display = "none";
    }

    sheetGreetingDisplay.textContent = editGreeting.value.trim();

    // 右耳・左耳の機器＆dB表示
    sheetEarRight.textContent = formatDeviceWithIcon(rDev);
    sheetEarLeft.textContent = formatDeviceWithIcon(lDev);
    sheetDbRight.textContent = formatDbLabel(dbRight.value.trim());
    sheetDbLeft.textContent = formatDbLabel(dbLeft.value.trim());

    // 難聴のタイプ・装用時・外したとき・補聴援助システム
    const types = getCheckedValues("hearing-type-group");
    sheetTypeDisplay.textContent =
      types.length > 0 ? types.join(" ／ ") : "難聴・聞き取り困難";

    sheetAidedDisplay.textContent = levelAided.value;
    sheetUnaidedDisplay.textContent = levelUnaided.value;

    if (assistSystem.value.startsWith("使っている")) {
      sheetAssistRow.style.display = "grid";
      sheetAssistDisplay.textContent = assistSystem.value;
    } else {
      sheetAssistRow.style.display = "none";
    }

    sheetSummaryDisplay.textContent = editHearingSummary.value.trim();

    // ベストポジション図解
    const posInfo = getPositionInfo(currentPosition);
    positionSvgWrap.innerHTML = posInfo.svg;
    sheetPosTitle.textContent = posInfo.title;
    sheetPosDesc.textContent = posInfo.desc;

    // 伝わりやすいコミュニケーション手段バッジ
    const commMethods = getCheckedValues("comm-methods-group");
    sheetCommBadges.innerHTML = "";
    commMethods.forEach((m) => {
      const span = document.createElement("span");
      span.className = "comm-badge";
      span.textContent = m;
      sheetCommBadges.appendChild(span);
    });

    // 苦手な場面タグ
    const diffScenes = getCheckedValues("difficult-scenes-group");
    sheetDifficultList.innerHTML = "";
    diffScenes.forEach((scene) => {
      const span = document.createElement("span");
      span.className = "difficult-tag";
      span.textContent = "・" + scene;
      sheetDifficultList.appendChild(span);
    });

    // 【裏面】お願いしたい配慮リスト
    const reqLines = editRequestsText.value
      .split(/\r?\n/)
      .map((l) => l.replace(/^[・\-*✔\s]+/, "").trim())
      .filter((l) => l.length > 0);

    sheetRequestsList.innerHTML = "";
    reqLines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      sheetRequestsList.appendChild(li);
    });

    // 【裏面】誤解を防ぐための豆知識リスト
    const tips = getCheckedValues("knowledge-tips-group");
    sheetKnowledgeList.innerHTML = "";
    if (tips.length > 0) {
      sheetKnowledgeBox.style.display = "block";
      tips.forEach((tip) => {
        const li = document.createElement("li");
        li.textContent = tip;
        sheetKnowledgeList.appendChild(li);
      });
    } else {
      sheetKnowledgeBox.style.display = "none";
    }

    // 【裏面】緊急時バー
    sheetEmergencyBox.style.display = emergencyCheck.checked ? "block" : "none";

    // 【裏面下部】YY文字起こし・UDトーク等の音声認識アプリ案内（QRコード付き）
    sheetAppPromoText.textContent = editAppPromo.value.trim();
    const selectedApps = getCheckedValues("recommended-apps-group");
    sheetAppsGrid.innerHTML = "";
    selectedApps.forEach((appKey) => {
      const info = APP_CATALOG[appKey];
      if (!info) return;
      const card = document.createElement("div");
      card.className = "app-item-card";

      const qrHtml = info.qrDataUrl
        ? `<div class="app-qr-box">
             <img src="${info.qrDataUrl}" alt="${info.name} QRコード" class="app-qr-img">
             <span class="app-qr-caption">QRコード</span>
           </div>`
        : "";

      const searchHtml = info.search
        ? `<div class="app-search-hint">${info.search}</div>`
        : "";

      card.innerHTML = `
        <div class="app-item-main">
          <div class="app-item-head">
            <span class="app-item-name">${info.name}</span>
            <span class="app-item-tag">${info.tag}</span>
          </div>
          <p class="app-item-desc">${info.desc}</p>
          ${searchHtml}
        </div>
        ${qrHtml}
      `;
      sheetAppsGrid.appendChild(card);
    });

    // 結びのメッセージ
    sheetClosingDisplay.textContent = editClosing.value.trim();
  }

  // プレビューモーダルを開く・閉じる
  function openPreviewModal() {
    renderPreview();
    previewModal.classList.add("open");
    document.body.style.overflow = "hidden";
    previewModal.scrollTop = 0;
  }

  function closePreviewModal() {
    previewModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Googleスプレッドシート（GAS Webhook）へ見込み顧客データ＆回答を自動送信
  function submitLeadToGoogleForm() {
    const rDev = getRadioValue("device-right");
    const lDev = getRadioValue("device-left");
    const types = getCheckedValues("hearing-type-group");
    const diffScenes = getCheckedValues("difficult-scenes-group");
    const commMethods = getCheckedValues("comm-methods-group");

    const fullRecordSummary = [
      `【選択モード】${currentMode} / 【テーマ色】${currentTheme} / 【所属】${inputRole.value}`,
      `【右耳】${rDev} (${dbRight.value || "-"}dB) / 【左耳】${lDev} (${dbLeft.value || "-"}dB)`,
      `【難聴の種類】${types.join("、")}`,
      `【ベストポジション】${currentPosition}`,
      `【得意な手段】${commMethods.join("、")}`,
      `【苦手な場面】${diffScenes.join("、")}`,
      `【お願い事項】\n${editRequestsText.value}`,
    ].join("\n");

    const payload = {
      name: inputName.value.trim() || "匿名",
      age: inputAge.value,
      email: inputEmail.value.trim(),
      hearingTypes: types.join("、"),
      unaided: `${levelUnaided.value}（右:${dbRight.value || "-"}dB / 左:${dbLeft.value || "-"}dB）`,
      aided: levelAided.value + (levelNote.value ? `（補足: ${levelNote.value}）` : ""),
      deviceRight: rDev,
      deviceLeft: lDev,
      assistSystem: assistSystem.value.startsWith("使っている") ? "使っている" : "使っていない",
      difficultScenes: diffScenes.join("、"),
      commMethods: commMethods.join("、"),
      requests: fullRecordSummary,
    };

    try {
      fetch(GOOGLE_SPREADSHEET_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Webhook submit error:", e);
    }
  }

  // PDFダウンロード実行処理
  function handleDownloadPdf() {
    renderPreview();
    const emailVal = inputEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailError.style.display = "none";
    consentError.style.display = "none";

    if (!emailVal || !emailRegex.test(emailVal)) {
      closePreviewModal();
      emailError.style.display = "block";
      downloadSection.scrollIntoView({ behavior: "smooth", block: "center" });
      inputEmail.focus();
      showToast("📩 PDFダウンロードのため、STEP 7でメールアドレスをご入力ください");
      return;
    }

    if (!consentCheck.checked) {
      closePreviewModal();
      consentError.style.display = "block";
      downloadSection.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("⚠️ プライバシーポリシー・ご案内受け取りへの同意をお願いします");
      return;
    }

    submitLeadToGoogleForm();
    showToast("🎉 ご登録ありがとうございます！A4両面PDF保存画面を開きます...");

    setTimeout(() => {
      window.print();
    }, 350);
  }

  // イベント設定：モード切り替え
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      generateAiTexts();
      showToast("✨ モードに合わせてAI文章を切り替えました！");
    });
  });

  // イベント設定：フレーム＆イラストデザイン切り替え
  frameBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      frameBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFrame = btn.dataset.frame;
      applyFrameAndTheme();
      showToast("🖼️ フレーム＆イラストデザインを切り替えました！");
    });
  });

  // イベント設定：カラーテーマ切り替え
  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTheme = btn.dataset.theme;
      applyFrameAndTheme();
      showToast("🎨 シートのテーマカラーを変更しました！");
    });
  });

  // イベント設定：ベストポジション切り替え
  posBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      posBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPosition = btn.dataset.pos;
      renderPreview();
    });
  });

  // フォーム入力変更時にAIテキストを更新
  const autoSyncInputs = [
    inputName,
    inputAge,
    inputRole,
    dbRight,
    dbLeft,
    assistSystem,
    levelUnaided,
    levelAided,
    levelNote,
    emergencyCheck,
  ];

  autoSyncInputs.forEach((el) => {
    el.addEventListener("input", () => generateAiTexts());
    el.addEventListener("change", () => generateAiTexts());
  });

  document
    .querySelectorAll(
      '#device-right-group input, #device-left-group input, #hearing-type-group input, #comm-methods-group input, #difficult-scenes-group input, #support-actions-group input, #knowledge-tips-group input, #recommended-apps-group input'
    )
    .forEach((cb) => {
      cb.addEventListener("change", () => generateAiTexts());
    });

  // STEP 6の手動カスタマイズ欄
  const manualEditInputs = [
    editSheetTitle,
    editGreeting,
    editHearingSummary,
    editRequestsText,
    editAppPromo,
    editClosing,
  ];

  manualEditInputs.forEach((el) => {
    el.addEventListener("input", () => renderPreview());
  });

  // 顔写真・イラストアイコンのアップロード＆削除イベント
  if (inputAvatar) {
    inputAvatar.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentAvatarDataUrl = ev.target.result;
        if (avatarFormPreview) avatarFormPreview.src = currentAvatarDataUrl;
        if (avatarFormPreviewWrap) avatarFormPreviewWrap.style.display = "block";
        if (clearAvatarBtn) clearAvatarBtn.style.display = "inline-block";
        renderPreview();
        showToast("📷 顔写真・イラストをトリセツに反映しました！");
      };
      reader.readAsDataURL(file);
    });
  }

  if (clearAvatarBtn) {
    clearAvatarBtn.addEventListener("click", () => {
      currentAvatarDataUrl = "";
      if (inputAvatar) inputAvatar.value = "";
      if (avatarFormPreview) avatarFormPreview.src = "";
      if (avatarFormPreviewWrap) avatarFormPreviewWrap.style.display = "none";
      clearAvatarBtn.style.display = "none";
      renderPreview();
      showToast("🗑️ 画像を外しました");
    });
  }

  // プレビューボタン群
  topPreviewBtn.addEventListener("click", openPreviewModal);
  midPreviewBtn.addEventListener("click", openPreviewModal);
  bottomPreviewBtn.addEventListener("click", openPreviewModal);
  closePreviewBtn.addEventListener("click", closePreviewModal);

  // モーダル背景クリックやEscキーでも閉じられるように
  previewModal.addEventListener("click", (e) => {
    if (e.target === previewModal) closePreviewModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && previewModal.classList.contains("open")) {
      closePreviewModal();
    }
  });

  // AI再生成ボタン
  aiRegenerateBtn.addEventListener("click", () => {
    generateAiTexts();
    showToast("🪄 現在の選択内容からAI文章を再構成しました！");
  });

  // ダウンロードボタン群
  topDownloadBtn.addEventListener("click", handleDownloadPdf);
  mainDownloadBtn.addEventListener("click", handleDownloadPdf);
  modalDownloadBtn.addEventListener("click", handleDownloadPdf);

  // 初期描画
  applyFrameAndTheme();
  generateAiTexts();
});
