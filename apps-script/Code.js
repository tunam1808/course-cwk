/**
 * CWK Media — Tiếp nhận khách hàng tiềm năng (Google Apps Script Web App).
 *
 * Script gắn với bảng tính "CWK Media — Khách hàng tiềm năng".
 * - doPost: nhận số điện thoại từ 2 form trên website, kiểm tra, ghi vào Sheets, gửi Gmail thông báo.
 * - Không có đường nào để đọc danh sách khách từ bên ngoài.
 * - Không ghi số điện thoại vào log.
 * - Email lỗi không làm mất khách: dòng vẫn được lưu, cột "Email thông báo" ghi "Chưa gửi",
 *   trình kích hoạt retryEmails() chạy 10 phút/lần gửi lại.
 */

var SHEET_NAME = "Khách hàng";
var HEADERS = ["Mã khách", "Thời gian", "Số điện thoại", "Nguồn", "Trạng thái", "Ghi chú", "Email thông báo"];
var TZ = "Asia/Ho_Chi_Minh";
var SOURCES = { bang_gia: "Bảng giá", cuoi_trang: "Cuối trang" };
var MAX_BODY = 2000; // byte
var SAME_PHONE_WINDOW_S = 600; // cùng số gửi lại trong 10 phút: không tạo dòng mới
var REQUEST_TTL_S = 21600; // nhớ mã yêu cầu 6 giờ (chống gửi lặp)
var GLOBAL_LIMIT_PER_MIN = 30; // chống spam hàng loạt
var SUBJECT = "CWK Media — Có khách hàng mới cần tư vấn";

function doGet() {
  return json_({ ok: true, service: "cwk-lead" });
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? String(e.postData.contents) : "";
    if (!raw || raw.length > MAX_BODY) return json_({ ok: false, code: "bad_request" });

    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return json_({ ok: false, code: "bad_request" });
    }
    if (!data || typeof data !== "object") return json_({ ok: false, code: "bad_request" });

    // Bẫy bot: ô ẩn phải để trống
    if (data.website) return json_({ ok: true, id: "" });

    if (data.consent !== true) return json_({ ok: false, code: "no_consent" });

    var phone = normalizePhone_(data.phone);
    if (!phone) return json_({ ok: false, code: "invalid_phone" });

    var sourceKey = String(data.source || "");
    if (!SOURCES.hasOwnProperty(sourceKey)) return json_({ ok: false, code: "bad_request" });

    var requestId = String(data.requestId || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
    if (requestId.length < 8) return json_({ ok: false, code: "bad_request" });

    var cache = CacheService.getScriptCache();
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return json_({ ok: false, code: "busy" });

    var row, id, sheet;
    try {
      // Cùng một lần bấm gửi (mã yêu cầu đã có) → trả lại kết quả cũ, không ghi thêm
      var seen = cache.get("req:" + requestId);
      if (seen) return json_({ ok: true, id: seen, duplicate: true });

      // Cùng số vừa gửi gần đây → không tạo dòng trùng
      var phoneKey = "phone:" + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, phone));
      var recent = cache.get(phoneKey);
      if (recent) {
        cache.put("req:" + requestId, recent, REQUEST_TTL_S);
        return json_({ ok: true, id: recent, duplicate: true });
      }

      // Giới hạn tổng số lượt mỗi phút
      var minuteKey = "rate:" + Utilities.formatDate(new Date(), TZ, "yyyyMMddHHmm");
      var count = Number(cache.get(minuteKey) || 0);
      if (count >= GLOBAL_LIMIT_PER_MIN) return json_({ ok: false, code: "rate_limited" });
      cache.put(minuteKey, String(count + 1), 120);

      sheet = getSheet_();
      row = sheet.getLastRow() + 1;
      id = "KH-" + ("0000" + (row - 1)).slice(-4);
      var time = Utilities.formatDate(new Date(), TZ, "dd/MM/yyyy HH:mm:ss");
      var range = sheet.getRange(row, 1, 1, HEADERS.length);
      range.setNumberFormat("@"); // giữ số 0 đầu
      range.setValues([[id, time, phone, SOURCES[sourceKey], "Chưa liên hệ", "", "Đang gửi"]]);
      SpreadsheetApp.flush();

      cache.put("req:" + requestId, id, REQUEST_TTL_S);
      cache.put(phoneKey, id, SAME_PHONE_WINDOW_S);
    } finally {
      lock.releaseLock();
    }

    // Dữ liệu đã lưu. Email lỗi cũng không làm mất khách.
    sendNotice_(sheet, row);
    return json_({ ok: true, id: id });
  } catch (err) {
    console.error("doPost lỗi: " + (err && err.message ? err.message : err));
    return json_({ ok: false, code: "server_error" });
  }
}

/** Chạy định kỳ: gửi lại các thông báo chưa gửi được. */
function retryEmails() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return;
  var col = HEADERS.indexOf("Email thông báo") + 1;
  var values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    var v = String(values[i][0]);
    if (v === "Chưa gửi" || v === "Đang gửi") sendNotice_(sheet, i + 2);
  }
}

/**
 * Chạy MỘT LẦN trong trình soạn Apps Script để cấp quyền và cài đặt:
 * tạo tiêu đề, định dạng cột số điện thoại là văn bản, múi giờ Việt Nam, trình kích hoạt gửi lại email.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);
  var sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.getRange("C:C").setNumberFormat("@");
  var owner = Session.getEffectiveUser().getEmail();
  PropertiesService.getScriptProperties().setProperty("NOTIFY_EMAIL", owner);
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "retryEmails") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("retryEmails").timeBased().everyMinutes(10).create();
  console.log("Cài đặt xong. Thông báo gửi tới chủ bảng tính. Email còn lại hôm nay: " + MailApp.getRemainingDailyQuota());
}

function sendNotice_(sheet, row) {
  var col = HEADERS.indexOf("Email thông báo") + 1;
  var cell = sheet.getRange(row, col);
  try {
    var v = sheet.getRange(row, 1, 1, HEADERS.length).getDisplayValues()[0];
    var to = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") || Session.getEffectiveUser().getEmail();
    var url = sheet.getParent().getUrl() + "#gid=" + sheet.getSheetId();
    var text =
      "Có khách mới để lại số điện thoại trên website CWK Media.\n\n" +
      "Mã khách: " + v[0] + "\n" +
      "Số điện thoại: " + v[2] + "\n" +
      "Thời gian gửi: " + v[1] + "\n" +
      "Form khách dùng: " + v[3] + "\n" +
      "Trạng thái: " + v[4] + "\n\n" +
      "Mở bảng quản lý khách: " + url + "\n";
    var html =
      "<p>Có khách mới để lại số điện thoại trên website CWK Media.</p>" +
      "<table cellpadding='4' style='border-collapse:collapse'>" +
      "<tr><td>Mã khách</td><td><b>" + esc_(v[0]) + "</b></td></tr>" +
      "<tr><td>Số điện thoại</td><td><b>" + esc_(v[2]) + "</b></td></tr>" +
      "<tr><td>Thời gian gửi</td><td>" + esc_(v[1]) + "</td></tr>" +
      "<tr><td>Form khách dùng</td><td>" + esc_(v[3]) + "</td></tr>" +
      "<tr><td>Trạng thái</td><td>" + esc_(v[4]) + "</td></tr></table>" +
      "<p><a href='" + url + "'>Mở bảng quản lý khách</a></p>";
    MailApp.sendEmail({ to: to, subject: SUBJECT, body: text, htmlBody: html, name: "Website CWK Media" });
    cell.setValue("Đã gửi");
  } catch (err) {
    cell.setValue("Chưa gửi");
    console.error("Gửi email thông báo lỗi ở dòng " + row + ": " + (err && err.message ? err.message : err));
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(SHEET_NAME);
  }
  return sheet;
}

// Số di động Việt Nam: 0 + (3|5|7|8|9) + 8 số; nhận cả +84 / 84 và dấu cách, chấm, gạch
function normalizePhone_(v) {
  var s = String(v || "").slice(0, 30).replace(/[\s.\-()]/g, "");
  if (/^\+84/.test(s)) s = "0" + s.slice(3);
  else if (/^84\d{9}$/.test(s)) s = "0" + s.slice(2);
  return /^0(3|5|7|8|9)\d{8}$/.test(s) ? s : "";
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
