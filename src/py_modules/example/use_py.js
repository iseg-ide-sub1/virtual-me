"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
// 调用 Python 脚本路径
var pyPath = 'py_mod.py';
(0, child_process_1.exec)("python ".concat(pyPath), function (error, stdout, stderr) {
    if (error) {
        console.error("\u6267\u884C Python \u811A\u672C\u65F6\u51FA\u9519:\n".concat(error.message));
        return;
    }
    if (stderr) {
        console.error("Python \u811A\u672C\u9519\u8BEF\u8F93\u51FA:\n".concat(stderr));
        return;
    }
    console.log("Python \u811A\u672C\u6807\u51C6\u8F93\u51FA:\n".concat(stdout));
});
