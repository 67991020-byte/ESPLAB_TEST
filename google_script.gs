function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  
  // 1. กรณีรับค่าจาก ESP32 (มีพารามิเตอร์ temp หรือ hum ส่งมา)
  if (e.parameter.temp || e.parameter.hum) {
    var temp = e.parameter.temp;
    var hum = e.parameter.hum;
    var heatIndex = e.parameter.hi;
    var ledStatus = e.parameter.led;
    
    // บันทึกลงในแถวใหม่
    sheet.appendRow([new Date(), temp, hum, heatIndex, ledStatus]);
    
    // จำกัดจำนวนผลลัพธ์ให้เหลือแค่ 10 รายการล่าสุด
    var lastRow = sheet.getLastRow();
    if (lastRow > 11) { // 10 ข้อมูล + 1 หัวข้อ (Header)
      var rowsToDelete = lastRow - 11;
      sheet.deleteRows(2, rowsToDelete); // ลบแถวที่ 2 เป็นต้นไป (แถวข้อมูลเก่าสุด)
    }
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }
  
  // 2. กรณี Web Dashboard เรียกข้อมูลไปโชว์ (ไม่มีพารามิเตอร์ส่งมา)
  var data = sheet.getDataRange().getValues();
  var results = [];
  
  // วนลูปเริ่มที่แถว 1 (ข้ามหัวข้อแถว 0)
  for (var i = 1; i < data.length; i++) {
    results.push({
      time: data[i][0],
      temp: data[i][1],
      hum: data[i][2],
      hi: data[i][3],
      status: data[i][4]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}

