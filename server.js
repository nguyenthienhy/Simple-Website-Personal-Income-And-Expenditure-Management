var express = require("express");
var app = express();
var server = require("http").Server(app);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var pg = require('pg');

var config = {
   user: 'postgres',
   database: 'QuanLyThuChi',
   password: 'hydongykute',
   host: 'localhost',
   port: 5432,
   max: 10,
   idleTimeoutMillis: 300000000,
};

var pool = new pg.Pool(config);

//----Xu ly nguoidung ---//
app.get("/:id", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from nguoidung where nguoidung.id = " + id + "";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
         }
         else {
            res.render("trangchu", { user: result.rows[0].name, ID: id });
         }
      });
   });
});
app.post("/dangnhap", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var sql = "select * from nguoidung";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            for (var i = 0; i < result.rows.length; i++) {
               if (result.rows[i].name == req.body.nameuser && result.rows[i].password == req.body.pwuser) {
                  res.redirect("/" + result.rows[i].id + "");
               }
            }
         }
      });
   });
});
app.post("/dangxuat", urlencodedParser, function (req, res) {
   res.redirect("home");
});
app.post("/dangky", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var sql = "select * from nguoidung";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            var id;
            var idaccount;
            id = Math.floor(Math.random() * 100);
            for (var i = 0; i < result.rows.length; i++) {
               if (id == result.rows[i].id) {
                  id = Math.floor(Math.random() * 100);
               }
            }
            idaccount = id;
            var sql_add_user = "insert into nguoidung (id , idaccount , name , password) values( " + id + " , " + idaccount + " , '" + req.body.username + "' , '" + req.body.password + "')";
            client.query(sql_add_user, function (err, result) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng nguoidung', err);
               }
               else {
                  var sum = parseInt(req.body.vi) + parseInt(req.body.atm) + parseInt(req.body.stk) + parseInt(req.body.cq);
                  var sql_add_account = "insert into account (id , name , initialmoney , lastmoney , inmoney , outmoney , vi , stk , atm , cq) values( " + idaccount + " , '" + req.body.username + "' , " + sum + " , " + sum + " , 0 , 0 , " + req.body.vi + " , " + req.body.stk + " , " + req.body.atm + " , " + req.body.cq + ")";
                  client.query(sql_add_account, function (err, result) {
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng nguoidung', err);
                     }
                     else {
                        res.redirect("/");
                     }
                  });
               }
            });
         }
      });
   });
});
app.post("/:id/about/update", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         res.end();
         return console.log("không thể kết nối database");
      }
      else {
         var id = req.params.id;
         var sql = "select * from nguoidung where id=" + id + "";
         client.query(sql, function (err, result_nguoidung) {
            done();
            if (err) {
               res.end();
               return console.log("không thể tìm thấy bảng người dùng");
            }
            else {
               if (req.body.changename === "" || req.body.changepassword === "") {
                  res.redirect("/" + id + "/about");
               }
               else {
                  var sql_update = "update nguoidung set name='" + req.body.changename + "' , password='" + req.body.changepassword + "' where id=" + result_nguoidung.rows[0].id + "";
                  client.query(sql_update, function (err, result) {
                     if (err) {
                        res.end();
                        return console.log("không thể tìm thấy bảng người dùng");
                     }
                     else {
                        var sql_update_account = "update account set name='" + req.body.changename + "'";
                        client.query(sql_update_account, function (err, result_update_account) {
                           if (err) {
                              res.end();
                              return console.log("không thể tìm thấy bảng người dùng");
                           }
                           else {
                              if (req.body.changemoneyVi === "" || req.body.changemoneyATM === "" || req.body.changemoneySTK === "" || req.body.changemoneyCQ === "") {
                                 res.redirect("/" + id + "/about");
                              }
                              else {
                                 var sum = parseInt(req.body.changemoneyVi) + parseInt(req.body.changemoneyATM) + parseInt(req.body.changemoneySTK) + parseInt(req.body.changemoneyCQ);
                                 var sql_update_account_info = "update account set  initialmoney=" + sum + " , name='" + req.body.changename + "', vi=" + req.body.changemoneyVi + " , atm=" + req.body.changemoneyATM + " , stk=" + req.body.changemoneySTK + " , cq=" + req.body.changemoneyCQ + " where id=" + result_nguoidung.rows[0].idaccount + "";
                                 client.query(sql_update_account_info, function (err, result_update_account) {
                                    if (err) {
                                       res.end();
                                       return console.log("không thể tìm thấy bảng người dùng");
                                    }
                                    else {
                                       res.redirect("/" + id + "/about");
                                    }
                                 });
                              }
                           }
                        });

                     }
                  });
               }
            }
         });
      }
   });
});
//----Xu ly nguoidung ---//



//---khoan chi ---//
app.get("/:id/khoanchi", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from nguoidung where nguoidung.id = " + id + "";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            var sql_khoanchi = "select * from khoanchi where khoanchi.idaccount = '" + result.rows[0].idaccount + "'";
            client.query(sql_khoanchi, function (err, result) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng Khoản chi', err);
               }
               else {
                  res.render("khoanChi", { khoanchi: result, ID: id });
               }
            });
         }
      });
   });
});
app.get("/:id/khoanchi/xoa/:id_2", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var id_2 = req.params.id_2
      var sql = "call xoa_khoanchi("+id+" , "+id_2+")";
      client.query(sql, function (err) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể thuc hien thu tuc', err);
         }
         else {
            res.redirect("/" + id + "/khoanchi");
         }
      });
   });
});
app.get("/:id/khoanchi/sua/:id_2", function (req, res) {
   var id = req.params.id;
   var id_2 = req.params.id_2;
   res.render("sua_khoanchi", { ID: id, idbargain: id_2 });
});
app.post("/:id/khoanchi/sua/:id_2", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var id_2 = req.params.id_2;
      var sql = "call sua_khoanchi("+id+" , "+id_2+" , '" + req.body.suatenkhoanchi + "' , " + req.body.suamoney + " , '" + req.body.suangaychi + "' , '" + req.body.suaghichukhoanchi + "' , '" + req.body.sualoaitaikhoan + "')";
      client.query(sql, function (err) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            res.redirect("/" + id + "/khoanchi");
         }
      });
   });
});
app.post("/:id/khoanchi", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from khoanchi";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng khoanchi', err);
         }
         else {
            var length = Math.floor(Math.random() * 100);
            for (var i = 0; i < result.rows.length; i++) {
               if (length == result.rows[i].idbargain) {
                  length = Math.floor(Math.random() * 100);
               }
            }
            var sql_khoanchi = "call insert_khoanchi(" + length + " , " + id + " , '" + req.body.tenkhoanchi + "' , " + req.body.money + " ,'" + req.body.candenar + "' , '" + req.body.comment + "' , '" + req.body.accounttype + "')";
            client.query(sql_khoanchi, function (err) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng khoanchi', err);
               }
               else {
                  var sql_money = "call update_account_khoan_chi(" + req.body.money + "," + id + ")";
                  client.query(sql_money, function (err) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng account', err);
                     }
                     else {
                        res.redirect("/" + id + "/khoanchi");
                     }
                  });
               }
            });
         }
      });
   });
});
app.post("/:id/khoanchi/filter", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from  filterbydatekhoanchi("+id+" , '"+req.body.day+"' , '"+req.body.month+"' , '"+req.body.year+"')";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể thực hiện function filterbydatekhoanchi', err);
         }
         else {
            res.render("khoanChi", { khoanchi: result, ID: id });
         }
      });
   });
});
//---khoan chi ---//


//---khoan thu ---//
app.get("/:id/khoanthu", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from nguoidung where nguoidung.id = " + id + "";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            var sql_khoanthu = "select * from khoanthu where khoanthu.idaccount = '" + result.rows[0].idaccount + "'";
            client.query(sql_khoanthu, function (err, result) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng Khoản thu', err);
               }
               else {
                  res.render("khoanThu", { khoanthu: result, ID: id });
               }
            });
         }
      });
   });
});
app.get("/:id/khoanthu/sua/:id_2", function (req, res) {
   var id = req.params.id;
   var id_2 = req.params.id_2;
   res.render("sua_khoanthu", { ID: id, idincome: id_2 });
});
app.get("/:id/khoanthu/xoa/:id_2", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var id_2 = req.params.id_2
      var sql = "call xoa_khoanthu("+id+" , "+id_2+")";
      client.query(sql, function (err) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            res.redirect("/" + id + "/khoanthu");
         }
      });
   });
});
app.post("/:id/khoanthu/sua/:id_2", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var id_2 = req.params.id_2;
      var sql = "call sua_khoanthu("+id+" , "+id_2+" , '" + req.body.suatenkhoanthu + "' , " + req.body.suamoney_khoan_thu + " , '" + req.body.suangaythu + "' , '" + req.body.suaghichukhoanthu + "' , '" + req.body.sualoaitaikhoan + "')";
      client.query(sql, function (err) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            res.redirect("/" + id + "/khoanthu");
         }
      });
   });
});
app.post("/:id/khoanthu/filter", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from  filterbydatekhoanthu("+id+" , '"+req.body.day+"' , '"+req.body.month+"' , '"+req.body.year+"')";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể thực hiện function filterbydatekhoanthu', err);
         }
         else {
            res.render("khoanthu", { khoanthu: result, ID: id });
         }
      });
   });
});
app.post("/:id/khoanthu", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from khoanthu";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng khoanthu', err);
         }
         else {
            var length = Math.floor(Math.random() * 100);
            for (var i = 0; i < result.rows.length; i++) {
               if (length == result.rows[i].idincome) {
                  length = Math.floor(Math.random() * 100);
               }
            }
            var sql_khoanthu = "call insert_khoanthu(" + length + " , " + id + " , '" + req.body.tenkhoanthu + "' , " + req.body.money + " ,'" + req.body.candenar + "' , '" + req.body.comment + "' , '" + req.body.accounttype + "')";
            client.query(sql_khoanthu, function (err) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng khoanthu', err);
               }
               else {
                  var sql_money = "call update_account_khoan_thu(" + req.body.money + "," + id + ")";
                  client.query(sql_money, function (err) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng account', err);
                     }
                     else {
                        res.redirect("/" + id + "/khoanthu");
                     }
                  });
               }
            });
         }
      });
   });
});
//---khoan thu ---//



//---Loai chi ---//
app.post("/:id/loaichi/them", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.log("không thể kết nối database");
      }
      else {
         var id = req.params.id;
         var sql_loaikhoanchi = "select * from loaikhoanchi where loaikhoanchi.name = '" + req.body.addnewtypebargain + "'";
         client.query(sql_loaikhoanchi, function (err, result_search) {
            done();
            if (err) {
               res.end();
               return console.error('Không thể tìm thấy bảng loaikhoanchi', err);
            }
            else {
               if (result_search.rows.length > 0) {
                  console.log("Da co trong danh sach");
                  res.redirect("/" + id + "/loaichi");
               }
               else {
                  var sql = "select * from loaikhoanchi";
                  client.query(sql, function (err, result) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng loaikhoanchi', err);
                     }
                     else {
                        var length = result.rows[result.rows.length - 1].id + 1;
                        var sql_add = "insert into loaikhoanchi (id , name) values(" + length + " , '" + req.body.addnewtypebargain + "')";
                        client.query(sql_add, function (err, result) {
                           done();
                           if (err) {
                              res.end();
                              return console.error('Không thể tìm thấy bảng loaikhoanchi', err);
                           }
                           else {
                              res.redirect("/" + id + "/loaichi");
                           }
                        });

                     }
                  });
               }

            }
         });
      }
   });
});
app.post("/:id/loaichi/xoa", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.log("không thể kết nối database");
      }
      else {
         var id = req.params.id;
         var sql_loaikhoanchi = "select * from loaikhoanchi where loaikhoanchi.name = '" + req.body.deletetypebargain + "'";
         client.query(sql_loaikhoanchi, function (err, result) {
            done();
            if (err) {
               res.end();
               return console.error('Không thể tìm thấy bảng loaikhoanchi', err);
            }
            else {
               if (result.rows.length == 0) {
                  console.log("Khong co trong danh sach");
                  res.redirect("/" + id + "/loaichi");
               }
               else {
                  var sql_del = "delete from loaikhoanchi where loaikhoanchi.name = '" + req.body.deletetypebargain + "'";
                  client.query(sql_del, function (err, result) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng loaikhoanchi', err);
                     }
                     else {
                        res.redirect("/" + id + "/loaichi");
                     }
                  });
               }
            }
         });
      }
   });
});
app.get("/:id/loaichi", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from loaikhoanchi";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng loaikhoanchi', err);
         }
         else {
            res.render("loaikhoanchi", { typechi: result, ID: id });
         }
      });
   });
});
//---Loai chi ---//



//---Loai thu ---//
app.get("/:id/loaithu", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql = "select * from loaikhoanthu";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng loaikhoanthu', err);
         }
         else {
            res.render("loaikhoanthu", { typethu: result, ID: id });
         }
      });
   });
});
app.post("/:id/loaithu/them", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.log("không thể kết nối database");
      }
      else {
         var id = req.params.id;
         var sql_loaikhoanthu = "select * from loaikhoanthu where loaikhoanthu.name = '" + req.body.addnewtypeincome + "'";
         client.query(sql_loaikhoanthu, function (err, result) {
            done();
            if (err) {
               res.end();
               return console.error('Không thể tìm thấy bảng loaikhoanthu', err);
            }
            else {
               if (result.rows.length > 0) {
                  console.log("Da co trong danh sach");
                  res.redirect("/" + id + "/loaithu");
               }
               else {
                  var sql = "select * from loaikhoanthu";
                  client.query(sql, function (err, result_loaikhoanthu) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng loaikhoanthu', err);
                     }
                     else {
                        var length = result_loaikhoanthu.rows[result_loaikhoanthu.rows.length - 1].id + 1;
                        var sql_add = "insert into loaikhoanthu (id , name) values(" + length + " , '" + req.body.addnewtypeincome + "')";
                        client.query(sql_add, function (err, result) {
                           done();
                           if (err) {
                              res.end();
                              return console.error('Không thể tìm thấy bảng loaikhoanthu', err);
                           }
                           else {
                              res.redirect("/" + id + "/loaithu");
                           }
                        });

                     }
                  });
               }

            }
         });
      }
   });
});
app.post("/:id/loaithu/xoa", urlencodedParser, function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.log("không thể kết nối database");
      }
      else {
         var id = req.params.id;
         var sql_loaikhoanthu = "select * from loaikhoanthu where loaikhoanthu.name = '" + req.body.deletetypeincome + "'";
         client.query(sql_loaikhoanthu, function (err, result) {
            done();
            if (err) {
               res.end();
               return console.error('Không thể tìm thấy bảng loaikhoanthu', err);
            }
            else {
               if (result.rows.length == 0) {
                  console.log("Khong co trong danh sach");
                  res.redirect("/" + id + "/loaithu");
               }
               else {
                  var sql_del = "delete from loaikhoanthu where loaikhoanthu.name = '" + req.body.deletetypeincome + "'";
                  client.query(sql_del, function (err, result) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng loaikhoanthu', err);
                     }
                     else {
                        res.redirect("/" + id + "/loaithu");
                     }
                  });
               }
            }
         });
      }
   });
});
//---Loai thu ---//




//---Trang chu ---//
app.get("/", function (req, res) {
   res.render('home');
});


//---Thong ke ---//
app.get("/:id/thongke", function (req, res) {
   var id = req.params.id;
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var sql = "select * from nguoidung where nguoidung.id = " + id + "";
      client.query(sql, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            var sql_thongke_khoanchi_Vi = "select khoanchi.datebargain , khoanchi.moneybargain , khoanchi.typebargain from khoanchi where khoanchi.idaccount=" + id + " and khoanchi.typeaccount='Ví'";
            client.query(sql_thongke_khoanchi_Vi, function (err, result_khoanchi_Vi) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
               }
               else {
                  var sql_thongke_khoanthu_Vi = "select khoanthu.dateincome , khoanthu.moneyincome , khoanthu.typeincome from khoanthu where khoanthu.idaccount=" + id + " and khoanthu.typeaccount='Ví'";
                  client.query(sql_thongke_khoanthu_Vi, function (err, result_khoanthu_Vi) {
                     done();
                     if (err) {
                        res.end();
                        return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                     }
                     else {
                        var sql_thongke_khoanchi_ATM = "select khoanchi.datebargain , khoanchi.moneybargain , khoanchi.typebargain from khoanchi where khoanchi.idaccount=" + id + " and khoanchi.typeaccount='ATM'";
                        client.query(sql_thongke_khoanchi_ATM, function (err, result_khoanchi_ATM) {
                           done();
                           if (err) {
                              res.end();
                              return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                           }
                           else {
                              var sql_thongke_khoanthu_ATM = "select khoanthu.dateincome , khoanthu.moneyincome , khoanthu.typeincome from khoanthu where khoanthu.idaccount=" + id + " and khoanthu.typeaccount='ATM'";
                              client.query(sql_thongke_khoanthu_ATM, function (err, result_khoanthu_ATM) {
                                 done();
                                 if (err) {
                                    res.end();
                                    return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                                 }
                                 else {
                                    var sql_thongke_khoanchi_STT = "select khoanchi.datebargain , khoanchi.moneybargain , khoanchi.typebargain from khoanchi where khoanchi.idaccount=" + id + " and khoanchi.typeaccount='Sổ tiết kiệm'";
                                    client.query(sql_thongke_khoanchi_STT, function (err, result_khoanchi_STT) {
                                       done();
                                       if (err) {
                                          res.end();
                                          return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                                       }
                                       else {
                                          var sql_thongke_khoanthu_STT = "select khoanthu.dateincome , khoanthu.moneyincome , khoanthu.typeincome from khoanthu where khoanthu.idaccount=" + id + " and khoanthu.typeaccount='Sổ tiết kiệm'";
                                          client.query(sql_thongke_khoanthu_STT, function (err, result_khoanthu_STT) {
                                             done();
                                             if (err) {
                                                res.end();
                                                return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                                             }
                                             else {
                                                var sql_thongke_khoanchi_CQ = "select khoanchi.datebargain , khoanchi.moneybargain , khoanchi.typebargain from khoanchi where khoanchi.idaccount=" + id + " and khoanchi.typeaccount='Công quỹ'";
                                                client.query(sql_thongke_khoanchi_CQ, function (err, result_khoanchi_CQ) {
                                                   done();
                                                   if (err) {
                                                      res.end();
                                                      return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                                                   }
                                                   else {
                                                      var sql_thongke_khoanthu_CQ = "select khoanthu.dateincome , khoanthu.moneyincome , khoanthu.typeincome from khoanthu where khoanthu.idaccount=" + id + " and khoanthu.typeaccount='Công quỹ'";
                                                      client.query(sql_thongke_khoanthu_CQ, function (err, result_khoanthu_CQ) {
                                                         done();
                                                         if (err) {
                                                            res.end();
                                                            return console.error('Không thể tìm thấy bảng Khoản chi , khoản thu', err);
                                                         }
                                                         else {
                                                            res.render("thongke", { ID: id, thongke_khoanchi_vi: result_khoanchi_Vi, thongke_khoanthu_vi: result_khoanthu_Vi, thongke_khoanchi_atm: result_khoanchi_ATM, thongke_khoanthu_atm: result_khoanthu_ATM, thongke_khoanchi_stt: result_khoanchi_STT, thongke_khoanthu_stt: result_khoanthu_STT, thongke_khoanchi_cq: result_khoanchi_CQ, thongke_khoanthu_cq: result_khoanthu_CQ });
                                                         }
                                                      });
                                                   }
                                                });
                                             }
                                          });
                                       }
                                    });
                                 }
                              });
                           }
                        });
                     }
                  });
               }
            });
         }
      });
   });
});
app.get("/:id/about", function (req, res) {
   pool.connect(function (err, client, done) {
      if (err) {
         return console.error("Không thể kết nối database", err);
      }
      var id = req.params.id;
      var sql_find_user = "select * from nguoidung where id = " + id + "";
      client.query(sql_find_user, function (err, result) {
         done();
         if (err) {
            res.end();
            return console.error('Không thể tìm thấy bảng nguoidung', err);
         }
         else {
            var sql_send_info = "select * from account where id = " + result.rows[0].idaccount + "";
            client.query(sql_send_info, function (err, result_info) {
               done();
               if (err) {
                  res.end();
                  return console.error('Không thể tìm thấy bảng nguoidung', err);
               }
               else {
                  res.render("about", { data: result_info, ID: id, username: result.rows[0].name });
               }
            });
         }
      });
   });
});
//---Thong ke ---//

server.listen(3000);