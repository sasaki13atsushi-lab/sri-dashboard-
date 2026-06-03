import { useState, useRef, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, ComposedChart, Line } from "recharts";
import { fetchWithSupermetrics, chatWithAgent, extractText, getApiKey, setApiKey, hasApiKey } from "./api.js";

const C = { pri: "#0f1923", acc: "#e85d3a", acc2: "#2d9cdb", acc3: "#27ae60", acc4: "#f2994a", acc5: "#9b59b6", mut: "#6b7b8d", bg: "#f4f5f7", card: "#fff", bor: "#e2e6ea", dan: "#e74c3c", warn: "#f39c12", suc: "#27ae60" };
const PIE_C = ["#e85d3a", "#2d9cdb", "#27ae60", "#f2994a", "#9b59b6", "#1a2332"];
const BASE = "https://www.sri-net.co.jp";
function pL(p) { const m = { "/": "\u30C8\u30C3\u30D7", "/about-sri": "SRI\u306B\u3064\u3044\u3066", "/about-sri/": "SRI\u306B\u3064\u3044\u3066", "/about_us": "\u4F1A\u793E\u6982\u8981", "/about_us/": "\u4F1A\u793E\u6982\u8981", "/buntan": "\u6587\u62C5", "/buntan/": "\u6587\u62C5", "/storage": "\u66F8\u985E\u4FDD\u7BA1", "/storage/": "\u66F8\u985E\u4FDD\u7BA1", "/inquiry/": "\u554F\u3044\u5408\u308F\u305B", "/consulting/": "\u30B3\u30F3\u30B5\u30EB", "/erasure/": "\u6D88\u53BB\u30B5\u30FC\u30D3\u30B9", "/message/": "\u30E1\u30C3\u30BB\u30FC\u30B8", "/solution/business/": "\u30BD\u30EA\u30E5\u30FC\u30B7\u30E7\u30F3", "/services/scanning/": "\u30B9\u30AD\u30E3\u30CB\u30F3\u30B0" }; if (m[p]) return m[p]; if (p && p.includes("document-arrangement")) return "\u6587\u66F8\u6574\u7406\u30B3\u30E9\u30E0"; if (p && p.includes("resume-management")) return "\u5C65\u6B74\u66F8\u7BA1\u7406\u30B3\u30E9\u30E0"; if (p && p.includes("contract-management")) return "\u5951\u7D04\u7BA1\u7406\u30B3\u30E9\u30E0"; return (p && p.length > 16) ? p.slice(0, 16) + "\u2026" : (p || ""); }
function priC(l) { return l === "\u6700\u512A\u5148" ? C.dan : l === "\u9AD8" ? C.warn : C.acc2; }

const TRAFFIC = [{ channel: "オーガニック検索", sessions: 657, engagement: 0.5951, bounce: 0.4049 }, { channel: "ダイレクト", sessions: 434, engagement: 0.3041, bounce: 0.6959 }, { channel: "リファラル", sessions: 94, engagement: 0.6702, bounce: 0.3298 }, { channel: "メール", sessions: 8, engagement: 0.625, bounce: 0.375 }, { channel: "AI", sessions: 6, engagement: 0.8333, bounce: 0.1667 }];
const PAGES = [{ path: "/", views: 338, sessions: 238, engagement: 0.6807, bounce: 0.3193, duration: 194 }, { path: "/column/resume-management/", views: 160, sessions: 158, engagement: 0.4304, bounce: 0.5696, duration: 100 }, { path: "/solution/business/", views: 117, sessions: 16, engagement: 0.875, bounce: 0.125, duration: 447 }, { path: "/column/document-arrangement_idea_classification/", views: 103, sessions: 101, engagement: 0.604, bounce: 0.396, duration: 73 }, { path: "/about-sri/", views: 83, sessions: 76, engagement: 0.75, bounce: 0.25, duration: 142 }, { path: "/message/", views: 78, sessions: 32, engagement: 0.9063, bounce: 0.0938, duration: 369 }, { path: "/solution/", views: 74, sessions: 20, engagement: 1.0, bounce: 0.0, duration: 241 }, { path: "/buntan/", views: 70, sessions: 59, engagement: 0.6441, bounce: 0.3559, duration: 206 }, { path: "/storage/", views: 69, sessions: 44, engagement: 0.8409, bounce: 0.1591, duration: 170 }, { path: "/erasure/", views: 62, sessions: 40, engagement: 0.725, bounce: 0.275, duration: 192 }, { path: "/case_study/", views: 56, sessions: 34, engagement: 0.8529, bounce: 0.1471, duration: 121 }, { path: "/inquiry_useronly/", views: 56, sessions: 34, engagement: 0.8235, bounce: 0.1765, duration: 118 }, { path: "/contract/", views: 51, sessions: 10, engagement: 0.8, bounce: 0.2, duration: 698 }, { path: "/history/", views: 48, sessions: 32, engagement: 0.6875, bounce: 0.3125, duration: 186 }, { path: "/vision/", views: 44, sessions: 16, engagement: 0.8125, bounce: 0.1875, duration: 159 }, { path: "/column/", views: 43, sessions: 24, engagement: 0.875, bounce: 0.125, duration: 300 }, { path: "/buntan_home/", views: 38, sessions: 21, engagement: 0.9524, bounce: 0.0476, duration: 266 }, { path: "/inquiry/", views: 37, sessions: 31, engagement: 0.7742, bounce: 0.2258, duration: 72 }];
const USERS = [{ type: "新規", sessions: 818, engagement: 0.4474, vps: 1.48, duration: 107 }, { type: "リピーター", sessions: 347, engagement: 0.6657, vps: 5.58, duration: 696 }];
const QUERIES = [{ query: "株式会社sri", clicks: 15, imp: 36, ctr: 0.4167, pos: 1.17 }, { query: "sri", clicks: 14, imp: 672, ctr: 0.0208, pos: 3.42 }, { query: "buntan", clicks: 12, imp: 64, ctr: 0.1875, pos: 3.30 }, { query: "株式会社ｓｒｉ", clicks: 8, imp: 13, ctr: 0.6154, pos: 1.15 }, { query: "sri 新潟", clicks: 5, imp: 8, ctr: 0.625, pos: 1.0 }, { query: "会社 書類整理アイデア", clicks: 5, imp: 106, ctr: 0.0472, pos: 4.42 }, { query: "書類整理 おすすめ", clicks: 4, imp: 81, ctr: 0.0494, pos: 4.93 }, { query: "書類整理 アイデア", clicks: 4, imp: 96, ctr: 0.0417, pos: 6.25 }, { query: "hubble api連携", clicks: 3, imp: 5, ctr: 0.6, pos: 1.2 }, { query: "たまって箱", clicks: 3, imp: 7, ctr: 0.4286, pos: 1.0 }, { query: "保管", clicks: 2, imp: 1381, ctr: 0.0014, pos: 4.39 }, { query: "文書管理台帳", clicks: 2, imp: 52, ctr: 0.0385, pos: 18.10 }];
const DEVICES = [{ device: "PC", clicks: 276, imp: 15366, ctr: 0.018 }, { device: "モバイル", clicks: 124, imp: 11446, ctr: 0.0108 }, { device: "タブレット", clicks: 3, imp: 302, ctr: 0.0099 }];
const QP = { "sri": "/", "\u682A\u5F0F\u4F1A\u793Esri": "/about_us", "buntan": "/buntan", "\u4F1A\u793E \u66F8\u985E\u6574\u7406\u30A2\u30A4\u30C7\u30A2": "/column/document-arrangement_idea_classification", "\u66F8\u985E\u6574\u7406 \u30A2\u30A4\u30C7\u30A2": "/column/document-arrangement_idea_classification", "\u66F8\u985E\u6574\u7406 \u304A\u3059\u3059\u3081": "/column/document-arrangement_idea_classification", "\u66F8\u985E \u6574\u7406\u65B9\u6CD5": "/column/document-arrangement_idea_classification", "\u4FDD\u7BA1": "/storage/", "\u5C65\u6B74\u66F8 \u4FDD\u7BA1\u671F\u9593": "/column/resume-management", "\u6587\u66F8\u7BA1\u7406\u53F0\u5E33": "/column/document-arrangement_idea_classification", "\u4F1A\u793E \u66F8\u985E\u6574\u7406 \u30A2\u30A4\u30C7\u30A2": "/column/document-arrangement_idea_classification", "\u6574\u7406 \u6574\u9813 \u9055\u3044": "/2013/02/01/166/" };

// ===== IMPROVEMENTS (detailed) =====
function buildImprovementsFrom(pagesData, queriesData) {
  const items = [];
  const p50 = pagesData.filter(function(p) { return p.sessions > 50; });
  const avgB = p50.reduce(function(s, p) { return s + p.bounce * p.sessions; }, 0) / p50.reduce(function(s, p) { return s + p.sessions; }, 0);
  const avgE = p50.reduce(function(s, p) { return s + p.engagement * p.sessions; }, 0) / p50.reduce(function(s, p) { return s + p.sessions; }, 0);
  const avgD = p50.reduce(function(s, p) { return s + p.duration * p.sessions; }, 0) / p50.reduce(function(s, p) { return s + p.sessions; }, 0);

  // Page improvements
  const sorted = pagesData.slice().filter(function(p) { return p.bounce > 0.4 && p.sessions > 50; }).sort(function(a, b) { return b.bounce - a.bounce; });
  sorted.slice(0, 4).forEach(function(p) {
    const b = (p.bounce * 100).toFixed(1), ab = (avgB * 100).toFixed(1), e = (p.engagement * 100).toFixed(1), ae = (avgE * 100).toFixed(1);
    const dd = p.duration - avgD, name = pL(p.path);
    const issues = [
      "\u76F4\u5E30\u7387: " + b + "% \u2015 \u30B5\u30A4\u30C8\u5E73\u5747" + ab + "%\u306B\u5BFE\u3057\u3066" + (p.bounce * 100 - avgB * 100).toFixed(1) + "pt\u9AD8\u304F\u3001\u8A2A\u554F\u8005\u306E" + b + "%\u304C\u4ED6\u30DA\u30FC\u30B8\u3092\u898B\u305A\u306B\u96E2\u8131",
      "\u30A8\u30F3\u30B2\u30FC\u30B8\u30E1\u30F3\u30C8\u7387: " + e + "% \u2015 \u30B5\u30A4\u30C8\u5E73\u5747" + ae + "%\u3092\u4E0B\u56DE\u308A\u3001\u30B3\u30F3\u30C6\u30F3\u30C4\u304C\u30E6\u30FC\u30B6\u30FC\u306E\u671F\u5F85\u306B\u5408\u3063\u3066\u3044\u306A\u3044\u53EF\u80FD\u6027",
      "\u5E73\u5747\u6EDE\u5728: " + p.duration + "\u79D2 \u2015 \u30B5\u30A4\u30C8\u5E73\u5747" + avgD.toFixed(0) + "\u79D2\u3068\u6BD4\u8F03\u3057\u3066" + (dd > 0 ? dd.toFixed(0) + "\u79D2\u9577\u3044" : Math.abs(dd).toFixed(0) + "\u79D2\u77ED\u3044") + (p.duration < 60 ? "\u3002\u8A18\u4E8B\u3092\u8AAD\u307E\u305A\u306B\u96E2\u8131\u3057\u3066\u3044\u308B\u53EF\u80FD\u6027\u304C\u9AD8\u3044" : ""),
      "\u30BB\u30C3\u30B7\u30E7\u30F3: " + p.sessions + "\uFF08" + p.views + "PV\uFF09\u2015 \u5341\u5206\u306A\u30C8\u30E9\u30D5\u30A3\u30C3\u30AF\u304C\u3042\u308B\u305F\u3081\u6539\u5584\u306E\u30A4\u30F3\u30D1\u30AF\u30C8\u5927",
    ];
    let actions = [];
    if (p.path.includes("contract-management")) {
      actions = [
        "\u8A18\u4E8B\u5192\u982D\uFF08\u7B2C1\u6BB5\u843D\u306E\u524D\uFF09\u306B\u300C\u3053\u306E\u8A18\u4E8B\u306E\u30DD\u30A4\u30F3\u30C8\u300D\u30B5\u30DE\u30EA\u30FC\u30DC\u30C3\u30AF\u30B9\u3092\u65B0\u898F\u8FFD\u52A0\u3057\u3001\u7D50\u8AD6\u3092\u5148\u306B\u63D0\u793A",
        "\u8A18\u4E8B\u672B\u5C3E\uFF08\u6700\u7D42\u6BB5\u843D\u306E\u76F4\u5F8C\uFF09\u306B\u300CSRI\u306E\u5951\u7D04\u7BA1\u7406\u30B5\u30FC\u30D3\u30B9\u306E\u8A73\u7D30\u306F\u3053\u3061\u3089 \u2192 /contract\u300DCTA\u30D0\u30CA\u30FC\u3092\u65B0\u898F\u8A2D\u7F6E",
        "\u8A18\u4E8B\u4E2D\u76E4\uFF08H2\u898B\u51FA\u3057\u306E\u9593\uFF09\u306B\u95A2\u9023\u30B3\u30E9\u30E0\u300C\u6587\u66F8\u7BA1\u7406\u53F0\u5E33\u306E\u4F5C\u308A\u65B9\u300D\u300C\u5C65\u6B74\u66F8\u306E\u4FDD\u7BA1\u671F\u9593\u300D\u3078\u306E\u30EA\u30F3\u30AF\u30AB\u30FC\u30C9\u30923\u679A\u8A2D\u7F6E",
        "Bing Webmaster Tools\u3067\u672C\u30DA\u30FC\u30B8\u306E\u30B9\u30CB\u30DA\u30C3\u30C8\u8868\u793A\u3092\u78BA\u8A8D\u3057\u3001\u691C\u7D22\u610F\u56F3\u3068\u306E\u30DF\u30B9\u30DE\u30C3\u30C1\u304C\u306A\u3044\u304B\u691C\u8A3C",
      ];
    } else if (p.path.includes("resume-management")) {
      actions = [
        "\u8A18\u4E8B\u5192\u982D\uFF08\u30BF\u30A4\u30C8\u30EB\u76F4\u4E0B\uFF09\u306B\u300C\u5C65\u6B74\u66F8\u306E\u4FDD\u7BA1\u671F\u9593\u306F\u9000\u8077\u5F8C3\u5E74\uFF08\u52B4\u57FA\u6CD5\uFF09\u3001\u96C7\u7528\u4FDD\u96BA4\u5E74\u300D\u3068\u7D50\u8AD6\u3092\u660E\u8A18",
        "\u8A18\u4E8B\u672B\u5C3E\u306B\u300C\u5C65\u6B74\u66F8\u30FB\u4EBA\u4E8B\u66F8\u985E\u306E\u5B89\u5168\u306A\u4FDD\u7BA1\u306A\u3089SRI \u2192 /storage/\u300DCTA\u30D0\u30CA\u30FC\u3092\u65B0\u898F\u8A2D\u7F6E",
        "\u8A18\u4E8B\u4E2D\u76E4\u306B\u95A2\u9023\u30B3\u30E9\u30E0\u300C\u5951\u7D04\u7BA1\u7406\u306E\u57FA\u672C\u300D\u300C\u6587\u66F8\u6574\u7406\u306E\u30A2\u30A4\u30C7\u30A2\u300D\u3078\u306E\u30EA\u30F3\u30AF\u30AB\u30FC\u30C9\u3092\u8A2D\u7F6E",
        "title\u30BF\u30B0\u3092\u300C\u5C65\u6B74\u66F8\u306E\u4FDD\u7BA1\u671F\u9593\u306F\u4F55\u5E74\uFF1F\u6CD5\u5F8B\u5225\u306E\u4E00\u89A7\u3068\u7BA1\u7406\u65B9\u6CD5\u300D\u306B\u5909\u66F4",
      ];
    } else if (p.path.includes("document-arrangement")) {
      actions = [
        "\u8A18\u4E8B\u672B\u5C3E\uFF08\u307E\u3068\u3081\u30BB\u30AF\u30B7\u30E7\u30F3\u306E\u5F8C\uFF09\u306B\u300CSRI\u306E\u6587\u66F8\u7BA1\u7406\u30B5\u30FC\u30D3\u30B9\u306E\u8A73\u7D30 \u2192 /buntan\u300DCTA\u30D0\u30CA\u30FC\u3092\u65B0\u898F\u8A2D\u7F6E",
        "\u30B5\u30A4\u30C9\u30D0\u30FC\u307E\u305F\u306F\u8A18\u4E8B\u53F3\u30AB\u30E9\u30E0\u306B\u300C\u95A2\u9023\u30B3\u30E9\u30E0\uFF1A\u5C65\u6B74\u66F8\u306E\u4FDD\u7BA1\u671F\u9593\u300D\u300C\u5951\u7D04\u7BA1\u7406\u306E\u57FA\u672C\u300D\u3078\u306E\u30EA\u30F3\u30AF\u30AB\u30FC\u30C9\u3092\u8FFD\u52A0",
        "\u8A18\u4E8B\u672C\u6587\u30925,000\u5B57\u4EE5\u4E0A\u306B\u62E1\u5145\u3002\u5177\u4F53\u7684\u306A\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8\u3084\u4E8B\u4F8B\u5199\u771F\u3092\u8FFD\u52A0",
        "/buntan\u3001/storage\u3001/consulting\u306E\u5404\u30DA\u30FC\u30B8\u304B\u3089\u672C\u30B3\u30E9\u30E0\u3078\u306E\u5185\u90E8\u30EA\u30F3\u30AF\u30925\u672C\u4EE5\u4E0A\u8FFD\u52A0",
      ];
    } else {
      actions = [
        "\u30DA\u30FC\u30B8\u5192\u982D\uFF08\u30D5\u30A1\u30FC\u30B9\u30C8\u30D3\u30E5\u30FC\u76F4\u4E0B\uFF09\u306B\u300C\u8CC7\u6599DL\u300D\u300C\u304A\u554F\u3044\u5408\u308F\u305B\u300D\u306ECTA\u3092\u76EE\u7ACB\u3064\u4F4D\u7F6E\u306B\u8A2D\u7F6E",
        "\u95A2\u9023\u30B5\u30FC\u30D3\u30B9\uFF08/buntan\u3001/storage\uFF09\u3078\u306E\u30EA\u30F3\u30AF\u30AB\u30FC\u30C9\u3092\u30B3\u30F3\u30C6\u30F3\u30C4\u4E0B\u90E8\u306B3\u679A\u8A2D\u7F6E",
        "\u30DA\u30FC\u30B8\u4E0B\u90E8\u306B\u300C\u304A\u3059\u3059\u3081\u30B3\u30F3\u30C6\u30F3\u30C4\u300D\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8FFD\u52A0\u3057\u56DE\u904A\u4FC3\u9032",
      ];
    }
    items.push({ pri: p.bounce > 0.7 ? "\u6700\u512A\u5148" : p.bounce > 0.45 ? "\u9AD8" : "\u4E2D", title: name + " \u306E\u76F4\u5E30\u7387\u6539\u5584", url: BASE + p.path, metric: "\u76F4\u5E30\u7387 " + b + "%\uFF08" + p.sessions + "\u30BB\u30C3\u30B7\u30E7\u30F3\uFF09", issues: issues, actions: actions, effect: "\u76F4\u5E30\u7387 " + (p.bounce * 100).toFixed(0) + "% \u2192 " + Math.max(25, p.bounce * 100 - 25).toFixed(0) + "%\u4EE5\u4E0B" });
  });

  // CTR improvements
  queriesData.filter(function(q) { return q.imp > 100 && (q.ctr * 100) < 3; }).sort(function(a, b) { return b.imp - a.imp; }).slice(0, 4).forEach(function(q) {
    const page = QP[q.query], url = page ? BASE + page : BASE, pot = Math.round(q.imp * 0.03);
    const issues = [
      "\u8868\u793A\u56DE\u6570: \u6708\u9593" + q.imp.toLocaleString() + "\u56DE \u2015 \u691C\u7D22\u7D50\u679C\u306B\u306F\u983B\u7E41\u306B\u8868\u793A\u3055\u308C\u3066\u3044\u308B\u304C\u30AF\u30EA\u30C3\u30AF\u3055\u308C\u3066\u3044\u306A\u3044",
      "CTR: " + (q.ctr * 100).toFixed(2) + "% \u2015 \u76EE\u6A193%\u3068\u306E\u5DEE\u304C" + (3 - q.ctr * 100).toFixed(1) + "pt\u3002\u30BF\u30A4\u30C8\u30EB\u3084\u8AAC\u660E\u6587\u304C\u30E6\u30FC\u30B6\u30FC\u306E\u691C\u7D22\u610F\u56F3\u306B\u5408\u3063\u3066\u3044\u306A\u3044\u53EF\u80FD\u6027",
      "\u63B2\u8F09\u9806\u4F4D: " + q.pos.toFixed(1) + "\u4F4D \u2015 " + (q.pos < 5 ? "\u4E0A\u4F4D\u8868\u793A\u306A\u306E\u306B\u30AF\u30EA\u30C3\u30AF\u3055\u308C\u3066\u3044\u306A\u3044\u306E\u306F\u30BF\u30A4\u30C8\u30EB\u30FB\u8AAC\u660E\u6587\u306E\u8A34\u6C42\u529B\u4E0D\u8DB3" : "\u9806\u4F4D\u304C\u4F4E\u304F\u8868\u793A\u4F4D\u7F6E\u304C\u4E0D\u5229"),
      "\u6A5F\u4F1A\u640D\u5931: CTR3%\u9054\u6210\u6642\u3068\u306E\u5DEE\u5206\u3067\u6708\u9593\u7D04" + (pot - q.clicks) + "\u30AF\u30EA\u30C3\u30AF\u3092\u53D6\u308A\u3053\u307C\u3057",
    ];
    let actions = [];
    if (page && page.includes("document-arrangement")) {
      actions = [
        "\u6587\u66F8\u6574\u7406\u30B3\u30E9\u30E0\u306Etitle\u30BF\u30B0\u3092\u300C\u4F1A\u793E\u306E\u66F8\u985E\u6574\u7406\u30A2\u30A4\u30C7\u30A210\u9078\uFF5C\u30D7\u30ED\u304C\u6559\u3048\u308B\u5206\u985E\u30FB\u53CE\u7D0D\u8853\u300D\u306B\u5909\u66F4",
        "meta description\u3092\u300C\u66F8\u985E\u304C\u3042\u3075\u308C\u308B\u30AA\u30D5\u30A3\u30B9\u3092\u5373\u6539\u5584\u3002\u5C0E\u5165300\u793E\u4EE5\u4E0A\u306ESRI\u304C\u5B9F\u8DF5\u3059\u308B\u6574\u7406\u30FB\u5206\u985E\u30FB\u4FDD\u7BA1\u306E\u5177\u4F53\u7684\u65B9\u6CD5\u300D\u306B\u5909\u66F4",
        "\u8A18\u4E8B\u5185FAQ\u30BB\u30AF\u30B7\u30E7\u30F3\u306BFAQ\u69CB\u9020\u5316\u30C7\u30FC\u30BF\uFF08schema.org/FAQPage\uFF09\u3092\u5B9F\u88C5\u3057\u30EA\u30C3\u30C1\u30B9\u30CB\u30DA\u30C3\u30C8\u7372\u5F97",
      ];
    } else if (page && page.includes("storage")) {
      actions = [
        "/storage/ \u306Etitle\u3092\u300C\u66F8\u985E\u4FDD\u7BA1\u30B5\u30FC\u30D3\u30B9\u306E\u8CBB\u7528\u30FB\u65B9\u6CD5\u3092\u6BD4\u8F03\uFF5C\u6708\u984D\u25CB\u5186\u304B\u3089\u300D\u306B\u5909\u66F4",
        "meta description\u306B\u300C\u5C0E\u5165\u4F01\u696D300\u793E\u4EE5\u4E0A\u300D\u300C\u6700\u77ED\u5373\u65E5\u96C6\u8377\u300D\u7B49\u306E\u5177\u4F53\u7684\u6570\u5B57\u3092\u8FFD\u52A0",
        "\u30DA\u30FC\u30B8\u5192\u982D\u306B\u300C\u66F8\u985E\u4FDD\u7BA1\u3068\u306F\uFF1F\u300D\u30BB\u30AF\u30B7\u30E7\u30F3\u3092\u8FFD\u52A0\u3057\u300C\u4FDD\u7BA1\u300D\u691C\u7D22\u30E6\u30FC\u30B6\u30FC\u306E\u610F\u56F3\u306B\u5BFE\u5FDC",
      ];
    } else if (page && page.includes("resume")) {
      actions = [
        "\u5C65\u6B74\u66F8\u7BA1\u7406\u30B3\u30E9\u30E0\u306Etitle\u3092\u300C\u5C65\u6B74\u66F8\u306E\u4FDD\u7BA1\u671F\u9593\u306F\u4F55\u5E74\uFF1F\u6CD5\u5F8B\u5225\u4E00\u89A7\u3068\u5B89\u5168\u306A\u7BA1\u7406\u65B9\u6CD5\u300D\u306B\u5909\u66F4",
        "meta description\u306B\u300C\u52B4\u57FA\u6CD53\u5E74\u30FB\u96C7\u7528\u4FDD\u96BA4\u5E74\u300D\u7B49\u5177\u4F53\u7684\u6570\u5B57\u3092\u542B\u3081CTR\u6539\u5584",
        "\u8A18\u4E8B\u306BFAQ\u30BB\u30AF\u30B7\u30E7\u30F3\u8FFD\u52A0\uFF0BFAQ\u69CB\u9020\u5316\u30C7\u30FC\u30BF\u5B9F\u88C5\u3067\u30EA\u30C3\u30C1\u30B9\u30CB\u30DA\u30C3\u30C8\u8868\u793A\u3092\u72D9\u3046",
      ];
    } else {
      actions = [
        "\u5BFE\u8C61\u30DA\u30FC\u30B8\u306Etitle\u306B\u300C" + q.query + "\u300D\u3092\u542B\u3080\u5F62\u306B\u5909\u66F4\u3057\u691C\u7D22\u610F\u56F3\u3068\u306E\u4E00\u81F4\u5EA6\u3092\u9AD8\u3081\u308B",
        "meta description\u306B\u5177\u4F53\u7684\u306A\u6570\u5B57\u3084\u30D9\u30CD\u30D5\u30A3\u30C3\u30C8\u3092\u8FFD\u52A0\uFF08\u4F8B\uFF1A\u300C\u5C0E\u5165300\u793E\u4EE5\u4E0A\u300D\u300C\u7121\u6599\u76F8\u8AC7\u53EF\u300D\uFF09",
        "\u8A18\u4E8B\u5185FAQ\u30BB\u30AF\u30B7\u30E7\u30F3\u3092\u4F5C\u6210\u3057FAQ\u69CB\u9020\u5316\u30C7\u30FC\u30BF\uFF08schema.org\uFF09\u3092\u5B9F\u88C5",
      ];
    }
    items.push({ pri: q.imp > 500 ? "\u6700\u512A\u5148" : "\u9AD8", title: "\u300C" + q.query + "\u300D\u306ECTR\u6539\u5584", url: url, metric: q.imp.toLocaleString() + "\u8868\u793A \u2192 " + q.clicks + "\u30AF\u30EA\u30C3\u30AF\uFF08CTR " + (q.ctr * 100).toFixed(2) + "%\uFF09", issues: issues, actions: actions, effect: "CTR \u2192 3%\u4EE5\u4E0A\uFF08\u6708\u9593+" + (pot - q.clicks) + "\u30AF\u30EA\u30C3\u30AF\uFF09" });
  });

  // Position improvements
  queriesData.filter(function(q) { return q.pos > 10 && q.imp > 50; }).sort(function(a, b) { return b.imp - a.imp; }).slice(0, 2).forEach(function(q) {
    const page = QP[q.query], url = page ? BASE + page : BASE;
    const issues = [
      "\u63B2\u8F09\u9806\u4F4D: " + q.pos.toFixed(1) + "\u4F4D \u2015 \u691C\u7D22\u7D50\u679C\u306E2\u30DA\u30FC\u30B8\u76EE\u4EE5\u964D\u3067\u30E6\u30FC\u30B6\u30FC\u306E\u76EE\u306B\u5C4A\u304D\u306B\u304F\u3044",
      "\u8868\u793A\u56DE\u6570: \u6708\u9593" + q.imp + "\u56DE \u2015 \u691C\u7D22\u30DC\u30EA\u30E5\u30FC\u30E0\u306F\u3042\u308B\u305F\u3081\u9806\u4F4D\u6539\u5584\u3067\u5927\u5E45\u306A\u30AF\u30EA\u30C3\u30AF\u5897\u304C\u898B\u8FBC\u3081\u308B",
      "CTR: " + (q.ctr * 100).toFixed(2) + "% \u2015 10\u4F4D\u4EE5\u5185\u306B\u5165\u308C\u3070CTR\u304C5\u500D\u4EE5\u4E0A\u306B\u306A\u308B\u53EF\u80FD\u6027",
    ];
    const pName = page ? pL(page) : "\u8A72\u5F53\u30DA\u30FC\u30B8";
    let actions = [
      pName + "\u306E\u8A18\u4E8B\u672C\u6587\u30925,000\u5B57\u4EE5\u4E0A\u306B\u62E1\u5145\u3002\u7AF6\u5408\u4E0A\u4F4D\u8A18\u4E8B\u3092\u5206\u6790\u3057\u4E0D\u8DB3\u30C8\u30D4\u30C3\u30AF\u3092\u8FFD\u52A0",
      "H1\u30BF\u30B0\u306B\u300C" + q.query + "\u300D\u3092\u542B\u3080\u5F62\u306B\u5909\u66F4\u3002H2\u898B\u51FA\u3057\u3082\u691C\u7D22\u610F\u56F3\u306B\u5408\u308F\u305B\u3066\u518D\u69CB\u6210",
      "/buntan\u3001/storage\u3001/consulting\u304B\u3089\u672C\u30DA\u30FC\u30B8\u3078\u306E\u5185\u90E8\u30EA\u30F3\u30AF\u30925\u672C\u4EE5\u4E0A\u8FFD\u52A0\u3057\u30DA\u30FC\u30B8\u6A29\u5A01\u6027\u3092\u5411\u4E0A",
      "\u5177\u4F53\u7684\u306A\u4E8B\u4F8B\u30FB\u5199\u771F\u30FB\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8\u3092\u8FFD\u52A0\u3057\u30B3\u30F3\u30C6\u30F3\u30C4\u306E\u72EC\u81EA\u6027\u3092\u5F37\u5316",
    ];
    items.push({ pri: "\u9AD8", title: "\u300C" + q.query + "\u300D\u306E\u9806\u4F4D\u6539\u5584", url: url, metric: "\u63B2\u8F09\u9806\u4F4D " + q.pos.toFixed(1) + "\u4F4D\uFF08" + q.imp + "\u8868\u793A\uFF09", issues: issues, actions: actions, effect: "\u9806\u4F4D \u2192 10\u4F4D\u4EE5\u5185" });
  });

  items.sort(function(a, b) { return ({ "\u6700\u512A\u5148": 0, "\u9AD8": 1, "\u4E2D": 2 }[a.pri] || 3) - ({ "\u6700\u512A\u5148": 0, "\u9AD8": 1, "\u4E2D": 2 }[b.pri] || 3); });
  return items.slice(0, 10);
}

// ===== Components =====
function KPI({ label, value, sub, color }) { return (<div style={{ background: C.card, borderRadius: 10, padding: "14px 18px", borderLeft: "4px solid " + color, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}><div style={{ fontSize: 11, color: C.mut, fontWeight: 500 }}>{label}</div><div style={{ fontSize: 22, fontWeight: 700, color: C.pri, marginTop: 2 }}>{value}</div>{sub && <div style={{ fontSize: 10, color: C.mut, marginTop: 1 }}>{sub}</div>}</div>); }
function CTip({ active, payload, label }) { if (!active || !payload || !payload.length) return null; return (<div style={{ background: "#fff", border: "1px solid " + C.bor, borderRadius: 6, padding: "6px 10px", fontSize: 10 }}><div style={{ fontWeight: 700, marginBottom: 3 }}>{label}</div>{payload.map(function(p, i) { return <div key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong></div>; })}</div>); }
function Md({ text }) { const ls = (text || "").split("\n"), es = []; let li = []; function fl() { if (li.length) { es.push(<ul key={"u" + es.length} style={{ margin: "5px 0", paddingLeft: 18 }}>{li.map(function(l, i) { return <li key={i} style={{ marginBottom: 2 }}>{l}</li>; })}</ul>); li = []; } } function il(t) { return t.split(/(\*\*[^*]+\*\*)/g).map(function(p, i) { return p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p; }); } ls.forEach(function(l, i) { const t = l.trim(); if (t.startsWith("## ")) { fl(); es.push(<div key={i} style={{ fontWeight: 700, fontSize: 13, marginTop: 10, marginBottom: 3, borderBottom: "1px solid " + C.bor, paddingBottom: 2 }}>{t.slice(3)}</div>); } else if (t.startsWith("- ") || t.startsWith("* ")) { li.push(il(t.slice(2))); } else if (/^\d+\.\s/.test(t)) { li.push(il(t.replace(/^\d+\.\s/, ""))); } else if (t === "") { fl(); } else { fl(); es.push(<p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }}>{il(t)}</p>); } }); fl(); return <div>{es}</div>; }

// ===== Chat =====
const DATA_CTX = ["SRI\u30B5\u30A4\u30C8\u5206\u6790\u30A8\u30AD\u30B9\u30D1\u30FC\u30C8\u3002\u5B9F\u30C7\u30FC\u30BF\u306B\u57FA\u3065\u304D\u65E5\u672C\u8A9E\u3067\u5177\u4F53\u7684\u306B\u56DE\u7B54\u3002", "", "GA4(30\u65E5): \u30BB\u30C3\u30B7\u30E7\u30F34,339 / PV11,172 / \u30A8\u30F3\u30B2\u30FC\u30B851% / \u76F4\u5E3049%", "\u65B0\u898F3,065s(1.63p,119\u79D2) / \u30EA\u30D4\u30FC\u30BF\u30FC1,127s(5.4p,704\u79D2)", "\u691C\u7D222,506 / \u30C0\u30A4\u30EC\u30AF\u30C81,456 / \u30EA\u30D5\u30A1\u30E9\u30EB331", "\u5951\u7D04\u7BA1\u7406\u30B3\u30E9\u30E0:\u76F4\u5E3283%\u2190\u6700\u5927\u8AB2\u984C / \u5C65\u6B74\u66F8\u30B3\u30E9\u30E0:\u76F4\u5E3252% / \u6587\u66F8\u6574\u7406\u30B3\u30E9\u30E0:\u76F4\u5E3242%", "", "GSC(30\u65E5): \u30AF\u30EA\u30C3\u30AF1,673 / \u8868\u793A112,023 / CTR1.5%", "\u300C\u4FDD\u7BA1\u300D5,694imp\u21925clk / \u300C\u6574\u7406\u6574\u9813\u9055\u3044\u300D720imp\u21924clk / \u300C\u5C65\u6B74\u66F8\u4FDD\u7BA1\u671F\u9593\u300D393imp\u21925clk"].join("\n");

function Chat({ isOpen, onClose, dataCtx }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "SRI\u30B5\u30A4\u30C8\u306E\u30C7\u30FC\u30BF\u3092\u628A\u63E1\u3057\u3066\u3044\u307E\u3059\u3002\n\n\u8CEA\u554F\u4F8B:\n- \u76F4\u5E30\u7387\u304C\u9AD8\u3044\u30DA\u30FC\u30B8\u306E\u6539\u5584\u7B56\u306F\uFF1F\n- SEO\u3067\u512A\u5148\u3059\u3079\u304D\u65BD\u7B56\u306F\uFF1F\n- \u5951\u7D04\u7BA1\u7406\u30B3\u30E9\u30E0\u3092\u3069\u3046\u6539\u5584\u3059\u3079\u304D\uFF1F" }]);
  const [inp, setInp] = useState(""); const [ld, setLd] = useState(false); const ref = useRef(null);
  useEffect(function() { if (ref.current) ref.current.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  function send() {
    if (!inp.trim() || ld) return; const u = inp.trim(); setInp("");
    setMsgs(function(p) { return p.concat([{ role: "user", content: u }]); }); setLd(true);
    var apiMsgs = msgs.slice(1).map(function(m) { return { role: m.role, content: m.content }; }).concat([{ role: "user", content: u }]);
    chatWithAgent(dataCtx || DATA_CTX, apiMsgs).then(function(d) {
      setMsgs(function(p) { return p.concat([{ role: "assistant", content: (d.content || []).map(function(b) { return b.text || ""; }).filter(Boolean).join("\n") || "\u30A8\u30E9\u30FC" }]); });
    }).catch(function() {
      setMsgs(function(p) { return p.concat([{ role: "assistant", content: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002" }]); });
    }).finally(function() { setLd(false); });
  }
  if (!isOpen) return null;
  return (<div style={{ position: "fixed", top: 0, right: 0, width: 400, height: "100vh", background: "#f8f9fb", borderLeft: "1px solid " + C.bor, zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
    <div style={{ padding: "12px 16px", background: C.pri, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}><span style={{ fontSize: 13, fontWeight: 700 }}>{"\u6539\u5584\u30A2\u30C9\u30D0\u30A4\u30B6\u30FC"}</span><button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 16, cursor: "pointer" }}>x</button></div>
    <div style={{ flex: 1, overflow: "auto", padding: 12 }}>{msgs.map(function(m, i) { return (<div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}><div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: 12, fontSize: 12, lineHeight: 1.6, background: m.role === "user" ? C.pri : "#fff", color: m.role === "user" ? "#fff" : C.pri, border: m.role === "user" ? "none" : "1px solid " + C.bor }}>{m.role === "assistant" ? <Md text={m.content} /> : m.content}</div></div>); })}{ld && <div style={{ fontSize: 12, color: C.mut, padding: 8 }}>{"\u5206\u6790\u4E2D..."}</div>}<div ref={ref} /></div>
    <div style={{ padding: "8px 12px", borderTop: "1px solid " + C.bor, background: "#fff", flexShrink: 0 }}><div style={{ display: "flex", gap: 6 }}><input value={inp} onChange={function(e) { setInp(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") send(); }} placeholder={"\u6539\u5584\u306B\u3064\u3044\u3066\u8CEA\u554F..."} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid " + C.bor, fontSize: 12, fontFamily: "inherit", outline: "none" }} /><button onClick={send} disabled={ld || !inp.trim()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: (ld || !inp.trim()) ? C.bor : C.acc, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{"\u9001\u4FE1"}</button></div></div>
  </div>);
}

// ===== Data Fetch =====
const GA4A = "324825300", GSCA = "sc-domain:sri-net.co.jp";
const RANGE_OPTS = [{ id: "last_7_days", l: "7\u65E5" }, { id: "last_14_days", l: "14\u65E5" }, { id: "last_30_days", l: "30\u65E5" }, { id: "last_90_days", l: "90\u65E5" }];

async function fetchGA4GSC(rt) {
  const dp = "date_range_type:" + rt;
  const sys = "Data extraction. Call Supermetrics, return ONLY valid JSON. After data_query always call get_async_query_results.";
  var results = { traffic: null, pages: null, users: null, queries: null, devices: null };
  try {
    var g = await fetchWithSupermetrics(sys, 'Queries:\n1.data_query(ds_id="GAWA",ds_accounts="' + GA4A + '",' + dp + ',timezone="Asia/Tokyo",fields="sessionDefaultChannelGrouping,sessions,engagementRate,bounceRate",max_rows=10) then get results\n2.data_query(ds_id="GAWA",ds_accounts="' + GA4A + '",' + dp + ',timezone="Asia/Tokyo",fields="pagePath,screenPageViews,sessions,engagementRate,bounceRate,averageSessionDuration",max_rows=20) then get results\n3.data_query(ds_id="GAWA",ds_accounts="' + GA4A + '",' + dp + ',timezone="Asia/Tokyo",fields="newVsReturning,sessions,engagementRate,bounceRate,screenPageViewsPerSession,averageSessionDuration",max_rows=5) then get results\nReturn:{"traffic":[{"channel":"..","sessions":0,"engagement":0,"bounce":0}],"pages":[{"path":"..","views":0,"sessions":0,"engagement":0,"bounce":0,"duration":0}],"users":[{"type":"..","sessions":0,"engagement":0,"bounce":0,"vps":0,"duration":0}]}');
    var gt = extractText(g).replace(/```json\s?|```/g, "").trim();
    var gm = gt.match(/\{[\s\S]*\}/);
    if (gm) { var gd = JSON.parse(gm[0]); results.traffic = gd.traffic; results.pages = gd.pages; results.users = gd.users; }
  } catch (e) { console.error("GA4 fetch error", e); }
  try {
    var s = await fetchWithSupermetrics(sys, 'Queries:\n1.data_query(ds_id="GW",ds_accounts="' + GSCA + '",' + dp + ',timezone="Asia/Tokyo",fields="query,clicks,impressions,ctr,position",max_rows=25,settings={"report_type":"STANDARD"}) then get results\n2.data_query(ds_id="GW",ds_accounts="' + GSCA + '",' + dp + ',timezone="Asia/Tokyo",fields="device,clicks,impressions,ctr,position",max_rows=5,settings={"report_type":"STANDARD"}) then get results\nReturn:{"queries":[{"query":"..","clicks":0,"imp":0,"ctr":0,"pos":0}],"devices":[{"device":"..","clicks":0,"imp":0,"ctr":0}]}');
    var st = extractText(s).replace(/```json\s?|```/g, "").trim();
    var sm = st.match(/\{[\s\S]*\}/);
    if (sm) { var sd = JSON.parse(sm[0]); results.queries = sd.queries; results.devices = sd.devices; }
  } catch (e) { console.error("GSC fetch error", e); }
  return results;
}

// ===== Verification Results (updated via GitHub push) =====
var VERIFY_RESULTS = {
  "\u5C65\u6B74\u66F8\u7BA1\u7406\u30B3\u30E9\u30E0 \u306E\u76F4\u5E30\u7387\u6539\u5584": {
    date: "2026/06/03",
    report: "## \u691C\u8A3C\u7D50\u679C\u30B5\u30DE\u30EA\u30FC\n\n**\u5224\u5B9A: \u73FE\u72B6\u7DAD\u6301\uFF08\u6539\u5584\u672A\u5B9F\u65BD\u307E\u305F\u306F\u52B9\u679C\u672A\u767A\u73FE\uFF09**\n\n## \u5BFE\u8C61\u671F\u9593\n\n- **\u30D9\u30FC\u30B9\u30E9\u30A4\u30F3:** 2026/05/04 \u301C 2026/06/03\uFF0830\u65E5\u9593\uFF09\n- **\u6BD4\u8F03\u5BFE\u8C61:** 2026/05/27 \u301C 2026/06/03\uFF087\u65E5\u9593\uFF09\n- **\u691C\u8A3C\u65E5:** 2026/06/03\n\n## \u6307\u6A19\u306E\u6BD4\u8F03\n\n**GA4\u30C7\u30FC\u30BF\uFF08/column/resume-management/\uFF09**\n\n- **\u76F4\u5E30\u7387:** 52.0%\uFF085/4\u301C6/3\uFF09\u2192 57.0%\uFF085/27\u301C6/3\uFF09\u2026 +5.0pt \u60AA\u5316\n- **\u30A8\u30F3\u30B2\u30FC\u30B8\u30E1\u30F3\u30C8\u7387:** 48.0% \u2192 43.0% \u2026 -5.0pt \u60AA\u5316\n- **\u5E73\u5747\u6EDE\u5728\u6642\u9593:** 117\u79D2 \u2192 100\u79D2 \u2026 -17\u79D2\n- **\u30BB\u30C3\u30B7\u30E7\u30F3\u6570:** 227\uFF0830\u65E5\uFF09/ 158\uFF087\u65E5\uFF09\u2026 \u65E5\u5E73\u5747 7.6 \u2192 22.6\uFF08\u30C8\u30E9\u30D5\u30A3\u30C3\u30AF\u81EA\u4F53\u306F\u589E\u52A0\u50BE\u5411\uFF09\n- **PV/\u30BB\u30C3\u30B7\u30E7\u30F3:** 1.04 \u2192 1.01 \u2026 \u307B\u307C\u5909\u5316\u306A\u3057\n\n**Search Console\u30C7\u30FC\u30BF\uFF085/27\u301C6/3\uFF09**\n\n- \u76F4\u8FD17\u65E5\u9593\u306E\u4E0A\u4F4D30\u30AF\u30A8\u30EA\u00D7\u30DA\u30FC\u30B8\u306B\u5C65\u6B74\u66F8\u95A2\u9023\u30AF\u30A8\u30EA\u304C\u51FA\u73FE\u305B\u305A\n- \u300C\u5C65\u6B74\u66F8 \u4FDD\u7BA1\u671F\u9593\u300D\u7B49\u306E\u30AD\u30FC\u30EF\u30FC\u30C9\u304B\u3089\u306E\u6D41\u5165\u304C\u4F4E\u8FF7\n\n## \u5206\u6790\u30B3\u30E1\u30F3\u30C8\n\n**1. \u30C8\u30E9\u30D5\u30A3\u30C3\u30AF\u306F\u589E\u52A0\u50BE\u5411:**\n\u65E5\u5E73\u5747\u30BB\u30C3\u30B7\u30E7\u30F3\u304C7.6\u21922.6\u3068\u589E\u3048\u3066\u3044\u308B\u304C\u3001\u76F4\u5E30\u7387\u306F\u60AA\u5316\u3002\u6D41\u5165\u304C\u5897\u3048\u305F\u5206\u3001\u691C\u7D22\u610F\u56F3\u3068\u306E\u30DF\u30B9\u30DE\u30C3\u30C1\u304C\u62E1\u5927\u3057\u3066\u3044\u308B\u53EF\u80FD\u6027\u3002\n\n**2. \u6539\u5584\u65BD\u7B56\u304C\u672A\u5B9F\u65BD\u306E\u5834\u5408:**\n- \u8A18\u4E8B\u5192\u982D\u306B\u4FDD\u7BA1\u671F\u9593\u306E\u7D50\u8AD6\u3092\u660E\u8A18\uFF08\u9000\u8077\u5F8C3\u5E74/\u96C7\u7528\u4FDD\u96BA4\u5E74\uFF09\n- \u8A18\u4E8B\u672B\u5C3E\u306B /storage/ \u3078\u306ECTA\u30D0\u30CA\u30FC\u3092\u8A2D\u7F6E\n- title\u30BF\u30B0\u3092\u300C\u5C65\u6B74\u66F8\u306E\u4FDD\u7BA1\u671F\u9593\u306F\u4F55\u5E74\uFF1F\u300D\u306B\u5909\u66F4\n\n**3. \u6B21\u56DE\u306E\u691C\u8A3C:**\n\u65BD\u7B56\u5B9F\u65BD\u5F8C\u30012\u301C4\u9031\u9593\u5F8C\u306B\u518D\u691C\u8A3C\u3092\u63A8\u5968\u3002\u305D\u306E\u969B\u306F\u300C\u65BD\u7B56\u5B9F\u65BD\u65E5\u4EE5\u964D\u306E\u671F\u9593\u300D\u3068\u300C\u65BD\u7B56\u5B9F\u65BD\u524D\u306E\u540C\u671F\u9593\u300D\u3092\u6BD4\u8F03\u3057\u307E\u3059\u3002"
  }
};

// ===== Main =====
export default function App() {
  const [tab, setTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [expImp, setExpImp] = useState(null);
  const [apiKeyInp, setApiKeyInp] = useState(getApiKey());
  const [isSetup, setIsSetup] = useState(hasApiKey());
  const [showVerify, setShowVerify] = useState(null);

  // Persisted executed tasks
  const [executedTasks, setExecutedTasks] = useState(function() {
    try { return JSON.parse(localStorage.getItem("sri_executed_tasks") || "{}"); } catch { return {}; }
  });

  function executeTask(impTitle) {
    var updated = Object.assign({}, executedTasks);
    updated[impTitle] = { date: new Date().toISOString(), status: "executing" };
    setExecutedTasks(updated);
    localStorage.setItem("sri_executed_tasks", JSON.stringify(updated));
  }

  function isExecuted(impTitle) {
    return !!executedTasks[impTitle];
  }

  function getExecutionDate(impTitle) {
    var t = executedTasks[impTitle];
    if (!t) return null;
    return new Date(t.date).toLocaleDateString("ja-JP");
  }

  function hasVerifyResult(impTitle) {
    return !!VERIFY_RESULTS[impTitle];
  }
  const [rangeType, setRangeType] = useState("last_30_days");
  const [loading, setLoading] = useState(false);
  const [lastUp, setLastUp] = useState(null);
  const [err, setErr] = useState(null);
  const [liveTraffic, setLiveTraffic] = useState(null);
  const [livePages, setLivePages] = useState(null);
  const [liveUsers, setLiveUsers] = useState(null);
  const [liveQueries, setLiveQueries] = useState(null);
  const [liveDevices, setLiveDevices] = useState(null);

  // Use live data if available, fallback to embedded
  const traffic = liveTraffic || TRAFFIC;
  const pages = livePages || PAGES;
  const users = liveUsers || USERS;
  const queries = liveQueries || QUERIES;
  const devices = liveDevices || DEVICES;

  const doRefresh = useCallback(async function() {
    setLoading(true); setErr(null);
    try {
      var r = await fetchGA4GSC(rangeType);
      if (r.traffic) setLiveTraffic(r.traffic);
      if (r.pages) setLivePages(r.pages);
      if (r.users) setLiveUsers(r.users);
      if (r.queries) setLiveQueries(r.queries);
      if (r.devices) setLiveDevices(r.devices);
      if (!r.traffic && !r.queries) setErr("\u30C7\u30FC\u30BF\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u57CB\u3081\u8FBC\u307F\u30C7\u30FC\u30BF\u3092\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002");
      else setLastUp(new Date());
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }, [rangeType]);

  const improvements = buildImprovementsFrom(pages, queries);
  const totS = traffic.reduce(function(s, t) { return s + t.sessions; }, 0);
  const totPV = pages.reduce(function(s, p) { return s + (p.views || 0); }, 0);
  const totClk = queries.reduce(function(s, q) { return s + (q.clicks || 0); }, 0);
  const totImp = queries.reduce(function(s, q) { return s + (q.imp || q.impressions || 0); }, 0);
  const tabs = [{ id: "overview", l: "\u6982\u8981" }, { id: "ga4", l: "GA4" }, { id: "gsc", l: "\u691C\u7D22" }, { id: "improve", l: "\u6539\u5584\u30DD\u30A4\u30F3\u30C8" }];

  // Build dynamic chat context
  var chatCtx = DATA_CTX;
  if (liveTraffic || livePages) {
    chatCtx = "SRI\u30B5\u30A4\u30C8\u5206\u6790\u30A8\u30AD\u30B9\u30D1\u30FC\u30C8\u3002\u65E5\u672C\u8A9E\u3067\u5177\u4F53\u7684\u306B\u56DE\u7B54\u3002\n";
    if (traffic) chatCtx += "\n\u30C1\u30E3\u30CD\u30EB:" + traffic.map(function(t) { return t.channel + ":" + t.sessions + "s"; }).join(",");
    if (pages) chatCtx += "\n\u30DA\u30FC\u30B8:" + pages.slice(0, 10).map(function(p) { return pL(p.path) + ":" + (p.views || 0) + "PV,\u76F4\u5E30" + ((p.bounce || 0) * 100).toFixed(0) + "%"; }).join("; ");
    if (queries) chatCtx += "\nGSC:" + queries.slice(0, 10).map(function(q) { return q.query + ":" + q.clicks + "clk," + (q.imp || q.impressions || 0) + "imp"; }).join("; ");
  }

  // Setup screen
  if (!isSetup) {
    return (<div style={{ fontFamily: "'Noto Sans JP', sans-serif", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: C.card, borderRadius: 16, padding: 40, maxWidth: 480, width: "90%", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{"\uD83D\uDCCA"}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>SRI Web Analytics</h1>
        <p style={{ fontSize: 13, color: C.mut, marginBottom: 24 }}>{"\u521D\u56DE\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\uFF1AAnthropic API\u30AD\u30FC\u3092\u5165\u529B"}</p>
        <input value={apiKeyInp} onChange={function(e) { setApiKeyInp(e.target.value); }} placeholder="sk-ant-api03-..." style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid " + C.bor, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        <button onClick={function() { if (apiKeyInp.startsWith("sk-")) { setApiKey(apiKeyInp); setIsSetup(true); } }} disabled={!apiKeyInp.startsWith("sk-")} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: apiKeyInp.startsWith("sk-") ? C.acc : C.bor, color: "#fff", fontSize: 15, fontWeight: 700, cursor: apiKeyInp.startsWith("sk-") ? "pointer" : "default", fontFamily: "inherit" }}>{"\u59CB\u3081\u308B \u2192"}</button>
      </div>
    </div>);
  }

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", background: C.bg, minHeight: "100vh", color: C.pri }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1b2d4a 100%)", color: "#fff", padding: "18px 28px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(232,93,58,0.85)", borderRadius: 8, fontWeight: 600 }}>GA4 + Search Console</span>
              <span style={{ fontSize: 10, opacity: 0.4 }}>2026/06/03 (7日間)</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>www.sri-net.co.jp</h1>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ padding: "2px 8px", background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>{"\u6700\u7D42\u66F4\u65B0: 2026/06/03 21:30"}</span>
              <span style={{ opacity: 0.5 }}>{"\u76F4\u8FD17\u65E5\u9593\u306E\u30C7\u30FC\u30BF"}</span>
            </div>
          </div>
          <button onClick={function() { setChatOpen(true); }} style={{ padding: "7px 16px", background: "rgba(232,93,58,0.9)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{"\u6539\u5584\u3092\u76F8\u8AC7"}</button>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 12 }}>{tabs.map(function(t) { return <button key={t.id} onClick={function() { setTab(t.id); }} style={{ padding: "5px 14px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: "7px 7px 0 0", cursor: "pointer", fontFamily: "inherit", background: tab === t.id ? C.bg : "rgba(255,255,255,0.06)", color: tab === t.id ? C.pri : "rgba(255,255,255,0.6)" }}>{t.l}</button>; })}</div>
      </div>

      <div style={{ padding: "16px 28px 60px", maxWidth: chatOpen ? "calc(100% - 400px)" : "100%", transition: "max-width 0.3s" }}>
        {tab === "overview" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
            <KPI label={"\u30BB\u30C3\u30B7\u30E7\u30F3"} value={totS.toLocaleString()} sub="GA4" color={C.acc} />
            <KPI label="PV" value={totPV.toLocaleString()} sub={"PV/S: " + (totPV / totS).toFixed(1)} color={C.acc2} />
            <KPI label={"\u691C\u7D22\u30AF\u30EA\u30C3\u30AF"} value={totClk.toLocaleString()} sub="GSC" color={C.acc3} />
            <KPI label={"\u691C\u7D22\u8868\u793A"} value={totImp.toLocaleString()} sub={"CTR " + (totClk / totImp * 100).toFixed(1) + "%"} color={C.acc5} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div style={{ background: C.card, borderRadius: 10, padding: 16 }}><h3 style={{ fontSize: 12, fontWeight: 700, margin: "0 0 6px" }}>{"\u30C1\u30E3\u30CD\u30EB\u5225"}</h3><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={TRAFFIC.map(function(t) { return { name: t.channel, value: t.sessions }; })} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={3} dataKey="value">{TRAFFIC.map(function(_, i) { return <Cell key={i} fill={PIE_C[i]} />; })}</Pie><Tooltip formatter={function(v) { return v + "s"; }} /><Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} /></PieChart></ResponsiveContainer></div>
            <div style={{ background: C.card, borderRadius: 10, padding: 16 }}><h3 style={{ fontSize: 12, fontWeight: 700, margin: "0 0 6px" }}>{"\u30E6\u30FC\u30B6\u30FC"}</h3>{USERS.map(function(u) { return (<div key={u.type} style={{ padding: 10, background: C.bg, borderRadius: 6, marginBottom: 5 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 11 }}>{u.type}</span><span style={{ fontSize: 17, fontWeight: 800 }}>{u.sessions.toLocaleString()}</span></div><div style={{ fontSize: 10, color: C.mut, marginTop: 2 }}>{u.vps}p/s | {u.duration}{"\u79D2"}</div></div>); })}</div>
          </div>
          {improvements.length > 0 && (<div style={{ background: C.card, borderRadius: 10, padding: 16 }}><h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>{"\u6700\u91CD\u8981\u6539\u5584\u30DD\u30A4\u30F3\u30C8"}</h3>{improvements.slice(0, 3).map(function(imp, i) { return (<div key={i} style={{ padding: "10px 14px", background: C.bg, borderRadius: 8, marginBottom: 6, borderLeft: "4px solid " + priC(imp.pri) }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 6, fontWeight: 700, background: priC(imp.pri) + "18", color: priC(imp.pri) }}>{imp.pri}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{imp.title}</span></div><div style={{ fontSize: 11, color: C.mut, marginTop: 3 }}>{imp.metric}</div></div>); })}<button onClick={function() { setTab("improve"); }} style={{ marginTop: 6, fontSize: 11, color: C.acc2, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>{"\u5168\u6539\u5584\u30DD\u30A4\u30F3\u30C8\u3092\u898B\u308B \u2192"}</button></div>)}
        </div>)}

        {tab === "ga4" && (<div><div style={{ background: C.card, borderRadius: 10, padding: 16, marginBottom: 14 }}><ResponsiveContainer width="100%" height={300}><ComposedChart data={PAGES.slice(0, 12).map(function(p) { return { label: pL(p.path), sessions: p.sessions, bounce: +(p.bounce * 100).toFixed(1) }; })} margin={{ left: 5, bottom: 50 }}><CartesianGrid strokeDasharray="3 3" stroke={C.bor} /><XAxis dataKey="label" tick={{ fontSize: 9, angle: -30, textAnchor: "end" }} height={60} /><YAxis yAxisId="l" tick={{ fontSize: 10 }} /><YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" /><Tooltip content={<CTip />} /><Bar yAxisId="l" dataKey="sessions" fill={C.acc2} radius={[3, 3, 0, 0]} barSize={18} name={"\u30BB\u30C3\u30B7\u30E7\u30F3"} /><Line yAxisId="r" type="monotone" dataKey="bounce" stroke={C.dan} strokeWidth={2} dot={{ r: 2 }} name={"\u76F4\u5E30\u7387"} /><Legend wrapperStyle={{ fontSize: 10 }} /></ComposedChart></ResponsiveContainer></div></div>)}

        {tab === "gsc" && (<div><div style={{ background: C.card, borderRadius: 10, padding: 14, overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}><thead><tr style={{ borderBottom: "2px solid " + C.bor }}>{["\u30AF\u30A8\u30EA", "\u30AF\u30EA\u30C3\u30AF", "\u8868\u793A", "CTR", "\u9806\u4F4D"].map(function(h) { return <th key={h} style={{ textAlign: "left", padding: "5px 8px", fontWeight: 600, color: C.mut, fontSize: 10 }}>{h}</th>; })}</tr></thead><tbody>{QUERIES.map(function(q, i) { return (<tr key={i} style={{ borderBottom: "1px solid " + C.bor, background: (q.ctr * 100) < 3 && q.imp > 100 ? "#fef5f4" : "transparent" }}><td style={{ padding: "5px 8px", fontWeight: 600 }}>{q.query}</td><td style={{ padding: "5px 8px", fontWeight: 700 }}>{q.clicks}</td><td style={{ padding: "5px 8px" }}>{q.imp.toLocaleString()}</td><td style={{ padding: "5px 8px", color: (q.ctr * 100) < 3 ? C.dan : C.pri, fontWeight: 600 }}>{(q.ctr * 100).toFixed(1)}%</td><td style={{ padding: "5px 8px", color: q.pos > 10 ? C.dan : C.suc }}>{q.pos.toFixed(1)}</td></tr>); })}</tbody></table></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>{DEVICES.map(function(d, i) { return (<div key={i} style={{ background: C.card, borderRadius: 10, padding: 14, textAlign: "center" }}><div style={{ fontSize: 18 }}>{i === 0 ? "\uD83D\uDDA5" : i === 1 ? "\uD83D\uDCF1" : "\uD83D\uDCDF"}</div><div style={{ fontSize: 11, fontWeight: 700 }}>{d.device}</div><div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{d.clicks}</div><div style={{ fontSize: 10, color: C.mut }}>CTR {(d.ctr * 100).toFixed(1)}%</div></div>); })}</div></div>)}

        {tab === "improve" && (<div>
          <div style={{ marginBottom: 12 }}><h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{"\u6539\u5584\u30DD\u30A4\u30F3\u30C8\uFF08" + improvements.length + "\u4EF6\uFF09"}</h2><div style={{ fontSize: 11, color: C.mut, marginTop: 2 }}>{"\u30C7\u30FC\u30BF\u306B\u57FA\u3065\u304F\u6539\u5584\u63D0\u6848 | \u52B9\u679C\u6E2C\u5B9A\u306F\u30C1\u30E3\u30C3\u30C8\u3067\u4F9D\u983C"}</div></div>
          {improvements.map(function(imp, i) {
            const isExp = expImp === i;
            return (<div key={i} style={{ background: C.card, borderRadius: 10, marginBottom: 8, borderLeft: "4px solid " + priC(imp.pri) }}>
              <div onClick={function() { setExpImp(isExp ? null : i); }} style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: priC(imp.pri), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 700 }}>{imp.title}</span><span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 6, fontWeight: 700, background: priC(imp.pri) + "18", color: priC(imp.pri) }}>{imp.pri}</span></div><div style={{ fontSize: 11, color: C.mut, marginTop: 2 }}>{imp.metric}</div></div>
                <span style={{ fontSize: 14, color: C.mut, transform: isExp ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>{"\u25BC"}</span>
              </div>
              {isExp && (<div style={{ padding: "0 16px 14px", borderTop: "1px solid " + C.bor }}>
                <div style={{ padding: "10px 12px", background: "#eef6ff", borderRadius: 8, margin: "10px 0 8px", fontSize: 12 }}>
                  <strong style={{ color: C.acc2 }}>{"\u5BFE\u8C61\u30DA\u30FC\u30B8\uFF1A"}</strong>
                  <a href={imp.url} target="_blank" rel="noreferrer" style={{ color: C.acc2, wordBreak: "break-all", textDecoration: "underline" }}>{imp.url}</a>
                </div>
                <div style={{ padding: "10px 12px", background: "#fef5f4", borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                  <strong style={{ color: C.dan, display: "block", marginBottom: 6 }}>{"\u73FE\u72B6\u8AB2\u984C"}</strong>
                  {imp.issues.map(function(issue, j) { return <div key={j} style={{ display: "flex", gap: 6, padding: "3px 0", lineHeight: 1.5 }}><span style={{ color: C.dan, flexShrink: 0 }}>{"\u2022"}</span><span>{issue}</span></div>; })}
                </div>
                <div style={{ padding: "10px 12px", background: C.bg, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                  <strong style={{ color: C.acc2, display: "block", marginBottom: 6 }}>{"\u5177\u4F53\u7684\u30A2\u30AF\u30B7\u30E7\u30F3"}</strong>
                  {imp.actions.map(function(act, j) { return <div key={j} style={{ display: "flex", gap: 6, padding: "3px 0", lineHeight: 1.5 }}><span style={{ color: C.acc2, fontWeight: 700, flexShrink: 0 }}>{(j + 1) + "."}</span><span>{act}</span></div>; })}
                </div>
                <div style={{ padding: "10px 12px", background: "#f0faf0", borderRadius: 8, marginBottom: 8, fontSize: 12 }}><strong style={{ color: C.suc }}>{"\u898B\u8FBC\u307F\u52B9\u679C\uFF1A"}</strong> {imp.effect}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {!isExecuted(imp.title) ? (
                    <button onClick={function() { executeTask(imp.title); }} style={{ fontSize: 12, padding: "8px 20px", borderRadius: 8, border: "none", background: C.acc, color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{"\u25B6 \u5B9F\u884C\u3059\u308B"}</button>
                  ) : (
                    <span style={{ fontSize: 11, padding: "8px 16px", borderRadius: 8, background: "#e8f5e9", color: C.suc, fontWeight: 700 }}>{"\u2713 \u5B9F\u884C\u4E2D\uFF08" + getExecutionDate(imp.title) + " \u958B\u59CB\uFF09"}</span>
                  )}
                  <button
                    onClick={function() { if (hasVerifyResult(imp.title)) setShowVerify(imp.title); }}
                    disabled={!hasVerifyResult(imp.title)}
                    style={{
                      fontSize: 12, padding: "8px 20px", borderRadius: 8, fontWeight: 700, fontFamily: "inherit",
                      border: "2px solid " + (hasVerifyResult(imp.title) ? C.acc5 : "#ccc"),
                      background: hasVerifyResult(imp.title) ? "transparent" : "#f0f0f0",
                      color: hasVerifyResult(imp.title) ? C.acc5 : "#aaa",
                      cursor: hasVerifyResult(imp.title) ? "pointer" : "default",
                    }}
                  >{hasVerifyResult(imp.title) ? "\uD83D\uDCCA \u52B9\u679C\u691C\u8A3C\u3092\u898B\u308B" : "\uD83D\uDCCA \u52B9\u679C\u691C\u8A3C\uFF08\u6E96\u5099\u4E2D\uFF09"}</button>
                  <button onClick={function() { setChatOpen(true); }} style={{ fontSize: 11, padding: "8px 12px", borderRadius: 8, border: "1px solid " + C.acc2, background: "transparent", color: C.acc2, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>{"\u8A73\u3057\u304F\u805E\u304F"}</button>
                </div>
              </div>)}
            </div>);
          })}
        </div>)}
      </div>
      <Chat isOpen={chatOpen} onClose={function() { setChatOpen(false); }} dataCtx={chatCtx} />
      {showVerify && VERIFY_RESULTS[showVerify] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={function() { setShowVerify(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 600, maxWidth: "90vw", maxHeight: "80vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} onClick={function(e) { e.stopPropagation(); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: C.acc5 }}>{"\uD83D\uDCCA \u52B9\u679C\u691C\u8A3C\u30EC\u30DD\u30FC\u30C8"}</h3>
              <button onClick={function() { setShowVerify(null); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.mut }}>x</button>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{showVerify}</div>
            {VERIFY_RESULTS[showVerify].date && <div style={{ fontSize: 11, color: C.mut, marginBottom: 12 }}>{"\u691C\u8A3C\u65E5: " + VERIFY_RESULTS[showVerify].date}</div>}
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              <Md text={VERIFY_RESULTS[showVerify].report} />
            </div>
          </div>
        </div>
      )}
      {!chatOpen && <button onClick={function() { setChatOpen(true); }} style={{ position: "fixed", bottom: 18, right: 18, width: 48, height: 48, borderRadius: "50%", background: C.acc, border: "none", color: "#fff", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 16px rgba(232,93,58,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90 }}>{"\uD83D\uDCAC"}</button>}
    </div>
  );
}
