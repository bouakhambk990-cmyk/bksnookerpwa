/**
 * ຕູ້ຄິດໄລ່ຫວຍ — Google Apps Script backend
 * ວິທີຕິດຕັ້ງລະອຽດຢູ່ໃນ README.md (ຫົວຂໍ້ "ເຊື່ອມຕໍ່ Google Sheet + ຜູ້ໃຊ້")
 *
 * ໜ້າທີ່ຂອງໄຟລ໌ນີ້:
 *  - ເກັບ/ກວດ ລາຍຊື່ຜູ້ໃຊ້ ແລະ ວັນໝົດອາຍຸ (ຊີດ "Users")
 *  - ຮັບລາຍການເລກ+ລາຄາຈາກໜ້າເວັບ ແລ້ວຂຽນຕໍ່ທ້າຍລົງໃນຊີດຫລັກຂອງທ່ານ
 */

// ⚠️ ປ່ຽນຄ່ານີ້ໃຫ້ຄືກັນກັບ CONFIG.SHARED_TOKEN ໃນ index.html ທຸກຄັ້ງ
var TOKEN = 'CHANGE_THIS_SECRET_TOKEN';

var USERS_SHEET_NAME = 'Users';

function doGet(e){
  try{
    var action = e.parameter.action;
    if(action === 'checkUser') return checkUser_(e);
    if(action === 'listUsers') return listUsers_(e);
    return jsonOut_({ ok:false, error:'unknown action' });
  }catch(err){
    return jsonOut_({ ok:false, error:String(err) });
  }
}

function doPost(e){
  try{
    var body = {};
    try{ body = JSON.parse(e.postData.contents); }catch(parseErr){}
    if(body.token !== TOKEN) return jsonOut_({ ok:false, error:'invalid token' });

    var action = body.action;
    if(action === 'addUser') return addUser_(body);
    if(action === 'deleteUser') return deleteUser_(body);
    if(action === 'addEntries') return addEntries_(body);
    return jsonOut_({ ok:false, error:'unknown action' });
  }catch(err){
    return jsonOut_({ ok:false, error:String(err) });
  }
}

// ---------- Users ----------

function getUsersSheet_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(USERS_SHEET_NAME);
  if(!sh){
    sh = ss.insertSheet(USERS_SHEET_NAME);
    sh.appendRow(['Username', 'ExpiryISO', 'Note', 'CreatedAt']);
  }
  return sh;
}

function checkUser_(e){
  var username = String(e.parameter.username || '').trim();
  if(!username) return jsonOut_({ valid:false, reason:'no username' });

  var sh = getUsersSheet_();
  var data = sh.getDataRange().getValues();
  for(var i = 1; i < data.length; i++){
    if(String(data[i][0]).trim() === username){
      var expiryRaw = data[i][1];
      if(expiryRaw === '' || expiryRaw === null || expiryRaw === undefined){
        return jsonOut_({ valid:true, expiry:null }); // ບໍ່ມີວັນໝົດອາຍຸ = ໃຊ້ໄດ້ຕະຫລອດ
      }
      var expiryDate = (expiryRaw instanceof Date) ? expiryRaw : new Date(expiryRaw);
      if(isNaN(expiryDate.getTime())){
        return jsonOut_({ valid:true, expiry:null });
      }
      var now = new Date();
      if(now.getTime() <= expiryDate.getTime()){
        return jsonOut_({ valid:true, expiry: expiryDate.toISOString() });
      }
      return jsonOut_({ valid:false, reason:'expired', expiry: expiryDate.toISOString() });
    }
  }
  return jsonOut_({ valid:false, reason:'not found' });
}

function listUsers_(e){
  if(String(e.parameter.token) !== TOKEN) return jsonOut_({ ok:false, error:'invalid token' });
  var sh = getUsersSheet_();
  var data = sh.getDataRange().getValues();
  var out = [];
  for(var i = 1; i < data.length; i++){
    if(!data[i][0]) continue;
    var expiryRaw = data[i][1];
    var expiryIso = null;
    if(expiryRaw instanceof Date) expiryIso = expiryRaw.toISOString();
    else if(expiryRaw) expiryIso = String(expiryRaw);
    out.push({ username: data[i][0], expiry: expiryIso, note: data[i][2] || '' });
  }
  return jsonOut_({ ok:true, users: out });
}

function addUser_(body){
  var username = String(body.username || '').trim();
  if(!username) return jsonOut_({ ok:false, error:'ບໍ່ມີຊື່ຜູ້ໃຊ້' });

  var sh = getUsersSheet_();
  var data = sh.getDataRange().getValues();
  var expiryValue = body.expiry ? new Date(body.expiry) : '';

  for(var i = 1; i < data.length; i++){
    if(String(data[i][0]).trim() === username){
      sh.getRange(i + 1, 2).setValue(expiryValue);
      sh.getRange(i + 1, 3).setValue(body.note || '');
      return jsonOut_({ ok:true, updated:true });
    }
  }
  sh.appendRow([username, expiryValue, body.note || '', new Date()]);
  return jsonOut_({ ok:true, added:true });
}

function deleteUser_(body){
  var username = String(body.username || '').trim();
  var sh = getUsersSheet_();
  var data = sh.getDataRange().getValues();
  for(var i = 1; i < data.length; i++){
    if(String(data[i][0]).trim() === username){
      sh.deleteRow(i + 1);
      return jsonOut_({ ok:true, deleted:true });
    }
  }
  return jsonOut_({ ok:false, error:'not found' });
}

// ---------- Bet entries → your Sheet ----------

function addEntries_(body){
  var tabName   = body.sheetTab   || 'No1.';
  var startRow  = parseInt(body.startRow, 10) || 18;
  var colIndex  = body.colIndex   || 'B';
  var colNumber = body.colNumber  || 'C';
  var colPrice  = body.colPrice   || 'D';
  var entries   = body.entries    || [];

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(tabName);
  if(!sh) return jsonOut_({ ok:false, error: 'ບໍ່ພົບຊີດ (tab): ' + tabName });

  var idxCol   = columnLetterToNumber_(colIndex);
  var numCol   = columnLetterToNumber_(colNumber);
  var priceCol = columnLetterToNumber_(colPrice);

  // ຫາແຖວຫວ່າງຕໍ່ຈາກລາຍການເກົ່າ (ອີງໃສ່ຄໍລໍາລำດັບ)
  var row = startRow;
  var cell = sh.getRange(row, idxCol).getValue();
  while(cell !== '' && cell !== null){
    row++;
    cell = sh.getRange(row, idxCol).getValue();
  }

  var nextIndex = 1;
  if(row > startRow){
    var prevVal = sh.getRange(row - 1, idxCol).getValue();
    nextIndex = (typeof prevVal === 'number') ? prevVal + 1 : (row - startRow + 1);
  }

  var written = 0;
  for(var k = 0; k < entries.length; k++){
    var ent = entries[k];
    sh.getRange(row, idxCol).setValue(nextIndex);
    sh.getRange(row, numCol).setValue(ent.number);
    if(ent.price !== undefined && ent.price !== null){
      sh.getRange(row, priceCol).setValue(ent.price);
    }
    row++;
    nextIndex++;
    written++;
  }

  return jsonOut_({ ok:true, written: written, lastRow: row - 1 });
}

function columnLetterToNumber_(letter){
  letter = String(letter).toUpperCase();
  var col = 0;
  for(var i = 0; i < letter.length; i++){
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col;
}

// ---------- helper ----------

function jsonOut_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
