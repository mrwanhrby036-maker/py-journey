/* ==========================================================================
   PyJourney — Fallback Python Interpreter (JS)
   ----------------------------------------------------------------
   مترجم بسيط مدمج يغطي المفاهيم الأساسية: print، المتغيرات، الأنواع،
   العمليات، الشروط، الحلقات، الدوال، القوائم. يعمل كطبقة احتياطية عندما
   لا يتوفر Pyodide. أي مفهوم غير مدعوم يعيد رسالة واضحة بدل التوقف.
   ========================================================================== */

const FallbackInterpreter = (() => {

  /* ================= الأخطاء ================= */
  class RuntimeErr extends Error {
    constructor(message) { super(message); this.name = "RuntimeErr"; }
  }

  /* ================= القيم ================= */
  function PyStr(v) { this.type = "str"; this.value = String(v); }
  function PyInt(v) { this.type = "int"; this.value = Math.trunc(Number(v)); }
  function PyFloat(v) { this.type = "float"; this.value = Number(v); }
  function PyBool(v) { this.type = "bool"; this.value = Boolean(v); }
  function PyList(arr) { this.type = "list"; this.value = arr || []; }
  function PyTuple(arr) { this.type = "tuple"; this.value = arr || []; }
  function PyDict(obj) { this.type = "dict"; this.value = obj || {}; }
  function PySet(arr) { this.type = "set"; this.value = arr || []; }
  function PyNone() { this.type = "none"; this.value = null; }

  function numResult(v) { return Number.isInteger(v) ? new PyInt(v) : new PyFloat(v); }

  function pyStr(v) {
    if (v === null || v === undefined) return "None";
    if (v.type === "none") return "None";
    if (v.type === "bool") return v.value ? "True" : "False";
    if (v.type === "str") return v.value;
    if (v.type === "int") return String(v.value);
    if (v.type === "float") return Number.isInteger(v.value) ? v.value.toFixed(1) : String(v.value);
    if (v.type === "list") return "[" + v.value.map(x => x.type === "str" ? "'" + x.value + "'" : pyStr(x)).join(", ") + "]";
    if (v.type === "tuple") return "(" + v.value.map(x => x.type === "str" ? "'" + x.value + "'" : pyStr(x)).join(", ") + ")";
    if (v.type === "set") return "{" + v.value.map(x => x.type === "str" ? "'" + x.value + "'" : pyStr(x)).join(", ") + "}";
    if (v.type === "dict") return "{" + Object.keys(v.value).map(k => "'" + k + "': " + pyStr(v.value[k])).join(", ") + "}";
    return String(v.value);
  }

  function pyTruthy(v) {
    if (!v) return false;
    switch (v.type) {
      case "none": return false;
      case "bool": return v.value;
      case "int": case "float": return v.value !== 0;
      case "str": return v.value !== "";
      case "list": case "tuple": case "set": return v.value.length > 0;
      case "dict": return Object.keys(v.value).length > 0;
      default: return true;
    }
  }

  function isNum(v) { return v && (v.type === "int" || v.type === "float"); }
  function isStr(v) { return v && v.type === "str"; }

  /* ================= المحلل (Tokenizer) ================= */
  function tokenize(source) {
    const tokens = [];
    let i = 0;
    const n = source.length;
    while (i < n) {
      const c = source[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
      // تعليق
      if (c === "#") { while (i < n && source[i] !== "\n") i++; continue; }
      // نص
      if (c === '"' || c === "'") {
        const quote = c;
        let j = i + 1, val = "";
        while (j < n && source[j] !== quote) {
          if (source[j] === "\\" && j + 1 < n) { val += source[j + 1]; j += 2; }
          else { val += source[j]; j++; }
        }
        if (j >= n) throw new RuntimeErr("SyntaxError: unterminated string literal");
        tokens.push({ t: "STR", v: val });
        i = j + 1;
        continue;
      }
      // رقم
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(source[i + 1] || ""))) {
        let j = i;
        while (j < n && /[0-9.]/.test(source[j])) j++;
        const num = source.slice(i, j);
        tokens.push({ t: "NUM", v: num.includes(".") ? parseFloat(num) : parseInt(num, 10) });
        i = j;
        continue;
      }
      // معرف أو كلمة مفتاحية
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_]/.test(source[j])) j++;
        tokens.push({ t: "IDENT", v: source.slice(i, j) });
        i = j;
        continue;
      }
      // عمليات متعددة الأحرف
      const two = source.slice(i, i + 2);
      if (["**", "//", "==", "!=", ">=", "<="].includes(two)) { tokens.push({ t: "OP", v: two }); i += 2; continue; }
      // عمليات/رموز مفردة
      if ("+-*/%<>()[],=.{}:".includes(c)) { tokens.push({ t: "OP", v: c }); i += 1; continue; }
      throw new RuntimeErr("SyntaxError: unexpected character '" + c + "'");
    }
    tokens.push({ t: "EOF" });
    return tokens;
  }

  /* ================= المحلل النحوي + التنفيذ معًا ================= */
  function Parser(tokens, scope) {
    this.tokens = tokens;
    this.pos = 0;
    this.scope = scope;
  }

  Parser.prototype.peek = function () { return this.tokens[this.pos]; };
  Parser.prototype.next = function () { return this.tokens[this.pos++]; };
  Parser.prototype.match = function (op) {
    const t = this.peek();
    if (t.t === "OP" && t.v === op) { this.pos++; return true; }
    return false;
  };
  Parser.prototype.expect = function (op) {
    if (!this.match(op)) throw new RuntimeErr("SyntaxError: expected '" + op + "'");
  };

  Parser.prototype.parseExpression = function () {
    // or (أدنى أولوية)
    let left = this.parseAnd();
    while (this.peek().t === "IDENT" && this.peek().v === "or") {
      this.next();
      const right = this.parseAnd();
      left = pyTruthy(left) ? left : right;
    }
    return left;
  };

  Parser.prototype.parseAnd = function () {
    let left = this.parseNot();
    while (this.peek().t === "IDENT" && this.peek().v === "and") {
      this.next();
      const right = this.parseNot();
      left = pyTruthy(left) ? right : left;
    }
    return left;
  };

  Parser.prototype.parseNot = function () {
    if (this.peek().t === "IDENT" && this.peek().v === "not") {
      this.next();
      return new PyBool(!pyTruthy(this.parseNot()));
    }
    return this.parseComparison();
  };

  Parser.prototype.parseComparison = function () {
    const left = this.parseAddSub();
    const t = this.peek();
    if (t.t === "OP" && ["==", "!=", ">", "<", ">=", "<="].includes(t.v)) {
      this.next();
      const right = this.parseAddSub();
      return this.applyCompare(t.v, left, right);
    }
    return left;
  };

  Parser.prototype.applyCompare = function (op, l, r) {
    if (op === "==") return new PyBool(valuesEqual(l, r));
    if (op === "!=") return new PyBool(!valuesEqual(l, r));
    if (!isNum(l) || !isNum(r)) throw new RuntimeErr("TypeError: cannot compare");
    switch (op) {
      case ">": return new PyBool(l.value > r.value);
      case "<": return new PyBool(l.value < r.value);
      case ">=": return new PyBool(l.value >= r.value);
      case "<=": return new PyBool(l.value <= r.value);
    }
    return new PyBool(false);
  };

  Parser.prototype.parseAddSub = function () {
    let left = this.parseMulDiv();
    while (true) {
      const t = this.peek();
      if (t.t === "OP" && (t.v === "+" || t.v === "-")) {
        this.next();
        const right = this.parseMulDiv();
        left = this.applyArith(t.v, left, right);
      } else break;
    }
    return left;
  };

  Parser.prototype.parseMulDiv = function () {
    let left = this.parsePower();
    while (true) {
      const t = this.peek();
      if (t.t === "OP" && ["*", "/", "//", "%"].includes(t.v)) {
        this.next();
        const right = this.parsePower();
        left = this.applyArith(t.v, left, right);
      } else break;
    }
    return left;
  };

  Parser.prototype.parsePower = function () {
    let left = this.parseUnary();
    if (this.peek().t === "OP" && this.peek().v === "**") {
      this.next();
      const right = this.parsePower(); // يمين الترابط
      left = this.applyArith("**", left, right);
    }
    return left;
  };

  Parser.prototype.parseUnary = function () {
    if (this.peek().t === "OP" && this.peek().v === "-") {
      this.next();
      const v = this.parseUnary();
      if (!isNum(v)) throw new RuntimeErr("TypeError: bad operand type for unary -");
      return numResult(-v.value);
    }
    return this.parsePostfix();
  };

  // معالجة الفهرسة واستدعاء الدوال المركبة بعد القيمة الأساسية
  Parser.prototype.parsePostfix = function () {
    let v = this.parsePrimary();
    while (true) {
      const t = this.peek();
      if (t.t === "OP" && t.v === "[") {
        this.next();
        // Slicing: [a:b] أو [a:] أو [:b] أو [::step]
        if (this.peek().t === "OP" && this.peek().v === ":") {
          this.next(); // استهلك ":"
          const end = (this.peek().t === "OP" && this.peek().v === "]") ? null : this.parseExpression();
          this.expect("]");
          v = this.slice(v, null, end);
        } else {
          const start = this.parseExpression();
          if (this.peek().t === "OP" && this.peek().v === ":") {
            this.next();
            const end = (this.peek().t === "OP" && this.peek().v === "]") ? null : this.parseExpression();
            this.expect("]");
            v = this.slice(v, start, end);
          } else {
            this.expect("]");
            v = this.index(v, start);
          }
        }
      } else if (t.t === "OP" && t.v === ".") {
        this.next();
        const nameTok = this.next();
        if (nameTok.t !== "IDENT") throw new RuntimeErr("SyntaxError: expected method name");
        if (this.peek().t === "OP" && this.peek().v === "(") {
          this.next();
          const args = [];
          if (!(this.peek().t === "OP" && this.peek().v === ")")) {
            while (true) {
              args.push(this.parseExpression());
              if (this.match(",")) continue;
              break;
            }
          }
          this.expect(")");
          v = applyMethod(v, nameTok.v, args);
        } else {
          throw new RuntimeErr("AttributeError: no attribute '" + nameTok.v + "'");
        }
      } else break;
    }
    return v;
  };

  Parser.prototype.parsePrimary = function () {
    const t = this.peek();
    // نص
    if (t.t === "STR") { this.next(); return new PyStr(t.v); }
    // رقم
    if (t.t === "NUM") { this.next(); return Number.isInteger(t.v) ? new PyInt(t.v) : new PyFloat(t.v); }
    // قوس (تجميع) أو tuple
    if (t.t === "OP" && t.v === "(") {
      this.next();
      // tuple فارغ
      if (this.peek().t === "OP" && this.peek().v === ")") { this.next(); return new PyTuple([]); }
      const first = this.parseExpression();
      if (this.peek().t === "OP" && this.peek().v === ",") {
        const items = [first];
        while (this.match(",")) {
          if (this.peek().t === "OP" && this.peek().v === ")") break;
          items.push(this.parseExpression());
        }
        this.expect(")");
        return new PyTuple(items);
      }
      this.expect(")");
      return first;
    }
    // قاموس { "key": value, ... }
    if (t.t === "OP" && t.v === "{") {
      this.next();
      const obj = {};
      if (this.peek().t === "OP" && this.peek().v === "}") { this.next(); return new PyDict(obj); }
      while (true) {
        const key = this.parseExpression();
        this.expect(":");
        const val = this.parseExpression();
        obj[pyStr(key)] = val;
        if (this.match(",")) { if (this.peek().t === "OP" && this.peek().v === "}") break; continue; }
        break;
      }
      this.expect("}");
      return new PyDict(obj);
    }
    // قائمة حرفية [ ... ]
    if (t.t === "OP" && t.v === "[") {
      this.next();
      const items = [];
      if (!(this.peek().t === "OP" && this.peek().v === "]")) {
        while (true) {
          items.push(this.parseExpression());
          if (this.match(",")) continue;
          break;
        }
      }
      this.expect("]");
      return new PyList(items);
    }
    // معرف: متغير / دالة / كلمة مفتاحية
    if (t.t === "IDENT") {
      this.next();
      const name = t.v;
      if (name === "True") return new PyBool(true);
      if (name === "False") return new PyBool(false);
      if (name === "None") return new PyNone();
      // استدعاء دالة
      if (this.peek().t === "OP" && this.peek().v === "(") {
        this.next();
        const args = [];
        if (!(this.peek().t === "OP" && this.peek().v === ")")) {
          while (true) {
            args.push(this.parseExpression());
            if (this.match(",")) continue;
            break;
          }
        }
        this.expect(")");
        return this.callFunction(name, args);
      }
      // متغير
      if (this.scope.has(name)) return this.scope.get(name);
      throw new RuntimeErr("NameError: name '" + name + "' is not defined");
    }
    throw new RuntimeErr("SyntaxError: invalid syntax");
  };

  Parser.prototype.index = function (base, idx) {
    if (base.type === "list" || base.type === "tuple") {
      let ii = idx.value;
      if (ii < 0) ii = base.value.length + ii;
      if (ii < 0 || ii >= base.value.length) throw new RuntimeErr("IndexError: index out of range");
      return base.value[ii];
    }
    if (base.type === "str") {
      let ii = idx.value;
      if (ii < 0) ii = base.value.length + ii;
      if (ii < 0 || ii >= base.value.length) throw new RuntimeErr("IndexError: string index out of range");
      return new PyStr(base.value[ii]);
    }
    if (base.type === "dict") {
      const k = pyStr(idx);
      if (!(k in base.value)) throw new RuntimeErr("KeyError: '" + k + "'");
      return base.value[k];
    }
    throw new RuntimeErr("TypeError: not subscriptable");
  };

  // تقطيع [start:end] — يعيد نسخة جديدة
  Parser.prototype.slice = function (base, start, end) {
    const len = base.value.length;
    let s = start ? start.value : 0;
    let e = end ? end.value : len;
    if (s < 0) s = len + s;
    if (e < 0) e = len + e;
    s = Math.max(0, Math.min(s, len));
    e = Math.max(0, Math.min(e, len));
    const part = base.value.slice(s, e);
    if (base.type === "str") return new PyStr(part);
    if (base.type === "list") return new PyList(part);
    if (base.type === "tuple") return new PyTuple(part);
    throw new RuntimeErr("TypeError: not sliceable");
  };

  Parser.prototype.applyArith = function (op, l, r) {
    if (op === "+") {
      if (isStr(l) && isStr(r)) return new PyStr(l.value + r.value);
      if (l.type === "list" && r.type === "list") return new PyList(l.value.concat(r.value));
      if (isNum(l) && isNum(r)) return numResult(l.value + r.value);
      throw new RuntimeErr("TypeError: unsupported operand types for +");
    }
    if (!isNum(l) || !isNum(r)) throw new RuntimeErr("TypeError: unsupported operand types");
    const a = l.value, b = r.value;
    switch (op) {
      case "-": return numResult(a - b);
      case "*": return numResult(a * b);
      case "/": return b === 0 ? errZero() : new PyFloat(a / b);
      case "//": return b === 0 ? errZero() : numResult(Math.trunc(a / b));
      case "%": return b === 0 ? errZero() : numResult(((a % b) + b) % b);
      case "**": return numResult(Math.pow(a, b));
    }
    throw new RuntimeErr("TypeError: unsupported operator");
  };

  Parser.prototype.callFunction = function (name, args) {
    const built = builtins();
    if (name in built) return built[name](args, this.scope);
    if (this.scope.functions[name]) return runUserFunction(this.scope.functions[name], args, this.scope);
    throw new RuntimeErr("NameError: name '" + name + "' is not defined");
  };

  // استدعاء دوال مرتبطة بقيمة (methods) — للنصوص والقوائم
  function applyMethod(receiver, name, args) {
    // ---- دوال النصوص ----
    if (receiver.type === "str") {
      const s = receiver.value;
      switch (name) {
        case "upper": return new PyStr(s.toUpperCase());
        case "lower": return new PyStr(s.toLowerCase());
        case "strip": return new PyStr(s.trim());
        case "replace": return new PyStr(s.split(pyStr(args[0])).join(pyStr(args[1])));
        case "split": {
          const sep = args.length ? pyStr(args[0]) : null;
          const parts = sep === null ? s.split(/\s+/).filter(x => x !== "") : s.split(sep);
          return new PyList(parts.map(p => new PyStr(p)));
        }
        case "join": {
          const list = args[0];
          if (list.type !== "list") throw new RuntimeErr("TypeError: join() argument must be a list");
          return new PyStr(list.value.map(pyStr).join(s));
        }
        case "startswith": return new PyBool(s.startsWith(pyStr(args[0])));
        case "endswith": return new PyBool(s.endsWith(pyStr(args[0])));
        case "count": return new PyInt(s.split(pyStr(args[0])).length - 1);
      }
      throw new RuntimeErr("AttributeError: 'str' has no attribute '" + name + "'");
    }
    // ---- دوال القوائم ----
    if (receiver.type === "list") {
      const arr = receiver.value;
      switch (name) {
        case "append": arr.push(args[0]); return new PyNone();
        case "insert": arr.splice(args[0].value, 0, args[1]); return new PyNone();
        case "remove": {
          const target = pyStr(args[0]);
          const i = arr.findIndex(x => pyStr(x) === target);
          if (i === -1) throw new RuntimeErr("ValueError: item not in list");
          arr.splice(i, 1);
          return new PyNone();
        }
        case "pop": {
          if (arr.length === 0) throw new RuntimeErr("IndexError: pop from empty list");
          return arr.pop();
        }
        case "sort": arr.sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0)); return new PyNone();
        case "reverse": arr.reverse(); return new PyNone();
        case "count": {
          const target = pyStr(args[0]);
          return new PyInt(arr.filter(x => pyStr(x) === target).length);
        }
        case "index": {
          const target = pyStr(args[0]);
          const i = arr.findIndex(x => pyStr(x) === target);
          if (i === -1) throw new RuntimeErr("ValueError: item not in list");
          return new PyInt(i);
        }
      }
      throw new RuntimeErr("AttributeError: 'list' has no attribute '" + name + "'");
    }
    // ---- دوال القواميس ----
    if (receiver.type === "dict") {
      const obj = receiver.value;
      switch (name) {
        case "get": {
          const k = pyStr(args[0]);
          if (k in obj) return obj[k];
          return args.length > 1 ? args[1] : new PyNone();
        }
        case "keys": return new PyList(Object.keys(obj).map(k => new PyStr(k)));
        case "values": return new PyList(Object.keys(obj).map(k => obj[k]));
        case "items": return new PyList(Object.keys(obj).map(k => new PyTuple([new PyStr(k), obj[k]])));
        case "pop": {
          const k = pyStr(args[0]);
          const v = obj[k] || new PyNone();
          delete obj[k];
          return v;
        }
      }
      throw new RuntimeErr("AttributeError: 'dict' has no attribute '" + name + "'");
    }
    // ---- دوال المجموعات ----
    if (receiver.type === "set") {
      const arr = receiver.value;
      switch (name) {
        case "add":
          if (!arr.some(x => pyStr(x) === pyStr(args[0]))) arr.push(args[0]);
          return new PyNone();
        case "remove": {
          const target = pyStr(args[0]);
          const i = arr.findIndex(x => pyStr(x) === target);
          if (i === -1) throw new RuntimeErr("KeyError: '" + target + "'");
          arr.splice(i, 1);
          return new PyNone();
        }
        case "union": {
          const other = args[0];
          const merged = [...arr];
          for (const x of (other.value || [])) if (!merged.some(y => pyStr(y) === pyStr(x))) merged.push(x);
          return new PySet(merged);
        }
        case "intersection": {
          const other = args[0];
          const out = arr.filter(x => (other.value || []).some(y => pyStr(y) === pyStr(x)));
          return new PySet(out);
        }
        case "difference": {
          const other = args[0];
          const out = arr.filter(x => !(other.value || []).some(y => pyStr(y) === pyStr(x)));
          return new PySet(out);
        }
      }
      throw new RuntimeErr("AttributeError: 'set' has no attribute '" + name + "'");
    }
    throw new RuntimeErr("AttributeError: object has no attribute '" + name + "'");
  }

  function valuesEqual(l, r) {
    if (isNum(l) && isNum(r)) return l.value === r.value;
    if (l.type !== r.type) return false;
    if (l.type === "str") return l.value === r.value;
    if (l.type === "bool") return l.value === r.value;
    if (l.type === "list") return pyStr(l) === pyStr(r);
    return l === r;
  }

  function errZero() { throw new RuntimeErr("ZeroDivisionError: division by zero"); }

  /* ================= الدوال المدمجة ================= */
  function builtins() {
    return {
      print: (args, scope) => { scope._out.text += args.map(pyStr).join(" ") + "\n"; return new PyNone(); },
      type: (args) => {
        const map = { str: "str", int: "int", float: "float", bool: "bool", list: "list", none: "NoneType" };
        return new PyStr("<class '" + (map[args[0].type] || "object") + "'>");
      },
      len: (args) => {
        const v = args[0];
        if (v.type === "str") return new PyInt(v.value.length);
        if (v.type === "list" || v.type === "tuple" || v.type === "set") return new PyInt(v.value.length);
        if (v.type === "dict") return new PyInt(Object.keys(v.value).length);
        throw new RuntimeErr("TypeError: object has no len()");
      },
      int: (args) => {
        const v = args[0];
        if (isNum(v)) return new PyInt(v.value);
        if (v.type === "bool") return new PyInt(v.value ? 1 : 0);
        if (isStr(v)) {
          const n = Number(v.value.trim());
          if (isNaN(n)) throw new RuntimeErr("ValueError: invalid literal for int()");
          return new PyInt(n);
        }
        throw new RuntimeErr("TypeError: int() argument must be a string or number");
      },
      float: (args) => {
        const v = args[0];
        if (isNum(v)) return new PyFloat(v.value);
        if (isStr(v)) {
          const n = Number(v.value.trim());
          if (isNaN(n)) throw new RuntimeErr("ValueError: could not convert to float");
          return new PyFloat(n);
        }
        throw new RuntimeErr("TypeError: float() argument must be a string or number");
      },
      str: (args) => new PyStr(pyStr(args[0])),
      bool: (args) => new PyBool(pyTruthy(args[0])),
      input: (args, scope) => {
        // نص الطلب لا يُضاف إلى ناتج البرنامج — فقط قيمة الإدخال تُعاد.
        const next = scope._in.list.length ? scope._in.list.shift() : "";
        return new PyStr(next);
      },
      range: (args) => {
        let start = 0, stop, step = 1;
        if (args.length === 1) stop = args[0].value;
        else if (args.length === 2) { start = args[0].value; stop = args[1].value; }
        else { start = args[0].value; stop = args[1].value; step = args[2].value; }
        const arr = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) arr.push(new PyInt(i));
        return new PyList(arr);
      },
      list: (args) => {
        const v = args[0];
        if (v.type === "list") return new PyList([...v.value]);
        if (v.type === "tuple") return new PyList([...v.value]);
        if (v.type === "set") return new PyList([...v.value]);
        if (v.type === "str") return new PyList(v.value.split("").map(c => new PyStr(c)));
        return new PyList([]);
      },
      tuple: (args) => {
        const v = args[0];
        if (v && v.type === "list") return new PyTuple([...v.value]);
        if (v && v.type === "tuple") return new PyTuple([...v.value]);
        return new PyTuple([]);
      },
      dict: () => new PyDict({}),
      set: (args) => {
        if (args.length === 0) return new PySet([]);
        const v = args[0];
        if (v.type === "list" || v.type === "tuple" || v.type === "str") {
          const seen = [];
          const items = v.type === "str" ? v.value.split("").map(c => new PyStr(c)) : v.value;
          for (const x of items) { if (!seen.some(y => pyStr(y) === pyStr(x))) seen.push(x); }
          return new PySet(seen);
        }
        return new PySet([]);
      },
      sorted: (args) => {
        const v = args[0];
        if (v.type === "list") {
          const copy = [...v.value];
          copy.sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0));
          return new PyList(copy);
        }
        if (v.type === "str") return new PyList(v.value.split("").sort().map(c => new PyStr(c)));
        return v;
      },
      min: (args) => {
        let arr = args[0].type === "list" ? args[0].value : args;
        let m = arr[0];
        for (const x of arr) if (x.value < m.value) m = x;
        return m;
      },
      max: (args) => {
        let arr = args[0].type === "list" ? args[0].value : args;
        let m = arr[0];
        for (const x of arr) if (x.value > m.value) m = x;
        return m;
      },
      sum: (args) => {
        let s = 0;
        for (const x of args[0].value) s += x.value;
        return numResult(s);
      },
    };
  }

  /* ================= النطاقات والدوال المعرفة ================= */
  class Scope {
    constructor(parent) {
      this.vars = {};
      this.parent = parent || null;
      this.functions = {};
      // مخازن مشتركة (كائنات قابلة للتغيير) بحيث تصل كل النطاقات لنفس الناتج.
      if (parent) {
        this._out = parent._out;
        this._in = parent._in;
      } else {
        this._out = { text: "" };
        this._in = { list: [] };
      }
    }
    has(name) { return (name in this.vars) || (this.parent ? this.parent.has(name) : false); }
    get(name) { if (name in this.vars) return this.vars[name]; if (this.parent) return this.parent.get(name); throw new RuntimeErr("NameError: name '" + name + "' is not defined"); }
    set(name, val) { this.vars[name] = val; }
    findFn(name) { if (name in this.functions) return this.functions[name]; if (this.parent) return this.parent.findFn(name); return null; }
  }

  function runUserFunction(fn, args, scope) {
    const local = new Scope(scope);
    // الدوال المعرفة تبقى مرئية
    local.functions = scope.functions;
    for (let i = 0; i < fn.params.length; i++) {
      local.set(fn.params[i], args[i] || new PyNone());
    }
    const res = executeLines(fn.body, local, true);
    if (res && res.type === "return") return res.value;
    return new PyNone();
  }

  /* ================= تنفيذ الأسطر ================= */
  function splitLines(source) {
    // يزيل التعليقات والأسطر الفارغة، مع الحفاظ على المسافات البادئة
    const out = [];
    const raw = source.replace(/\r\n/g, "\n").split("\n");
    for (let i = 0; i < raw.length; i++) {
      let line = stripComment(raw[i]);
      if (line.trim() === "") continue;
      out.push({ text: line, no: i + 1 });
    }
    return out;
  }

  function stripComment(line) {
    let inStr = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"' || c === "'") {
        if (inStr === c) inStr = null; else if (inStr === null) inStr = c;
      } else if (c === "#" && inStr === null) return line.slice(0, i);
    }
    return line;
  }

  function indentOf(line) {
    let n = 0;
    while (n < line.length && line[n] === " ") n++;
    return n;
  }

  function executeLines(lines, scope, inFunction) {
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const r = executeLine(line, lines, i, scope, inFunction);
      if (r) {
        if (r.type === "return" || r.type === "break" || r.type === "continue") return r;
        if (r.jump !== undefined) { i = r.jump; continue; }
      }
      i++;
    }
    return null;
  }

  function executeLine(line, allLines, index, scope, inFunction) {
    const t = line.text.trim();
    if (t === "") return null;

    let m;

    // تعريف دالة
    m = t.match(/^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\)\s*:\s*$/);
    if (m) {
      const name = m[1];
      const params = m[2].split(",").map(s => s.trim()).filter(s => s !== "");
      const body = collectBlock(allLines, index);
      scope.functions[name] = { name, params, body };
      return { jump: index + body.length + 1 };
    }

    // return
    m = t.match(/^return\s*(.*)$/);
    if (m) {
      const val = m[1].trim() === "" ? new PyNone() : evalString(m[1], scope);
      return { type: "return", value: val };
    }

    if (t === "break") return { type: "break" };
    if (t === "continue") return { type: "continue" };

    // try / except
    if (t === "try:" || t.startsWith("try:")) {
      return handleTry(allLines, index, scope, inFunction);
    }

    // if / elif / else
    if (t.startsWith("if ") || t.startsWith("elif ") || t === "else:") {
      return handleIf(t, allLines, index, scope, inFunction);
    }

    // while
    m = t.match(/^while\s+(.+):\s*$/);
    if (m) {
      const body = collectBlock(allLines, index);
      let guard = 0;
      while (pyTruthy(evalString(m[1], scope))) {
        if (++guard > 100000) throw new RuntimeErr("RuntimeError: loop running too long");
        const r = executeLines(body, scope, inFunction);
        if (r && r.type === "return") return r;
        if (r && r.type === "break") break;
      }
      return { jump: index + body.length + 1 };
    }

    // for
    m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+):\s*$/);
    if (m) {
      const iter = evalString(m[2], scope);
      const body = collectBlock(allLines, index);
      if (iter.type === "list") {
        for (const item of iter.value) {
          scope.set(m[1], item);
          const r = executeLines(body, scope, inFunction);
          if (r && r.type === "return") return r;
          if (r && r.type === "break") break;
        }
      } else if (iter.type === "str") {
        for (const c of iter.value) {
          scope.set(m[1], new PyStr(c));
          const r = executeLines(body, scope, inFunction);
          if (r && r.type === "return") return r;
          if (r && r.type === "break") break;
        }
      } else {
        throw new RuntimeErr("TypeError: object is not iterable");
      }
      return { jump: index + body.length + 1 };
    }

    // إسناد عنصر قائمة: lst[i] = expr
    m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (m) {
      const base = scope.get(m[1]);
      const idx = evalString(m[2], scope).value;
      const val = evalString(m[3], scope);
      if (base.type !== "list") throw new RuntimeErr("TypeError: not subscriptable");
      base.value[idx] = val;
      return null;
    }

    // إسناد مع عملية: name += expr
    m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(\+=|-=|\*=)\s*(.+)$/);
    if (m) {
      const name = m[1], op = m[2].replace("=", "");
      const cur = scope.get(name);
      const rhs = evalString(m[3], scope);
      scope.set(name, applySimpleArith(op, cur, rhs));
      return null;
    }

    // إسناد: name = expr
    m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (m) {
      const name = m[1];
      scope.set(name, evalString(m[2], scope));
      return null;
    }

    // تعبير مستقل (مثل print على سطر وحده)
    if (t.includes("(")) {
      evalString(t, scope);
      return null;
    }

    throw new RuntimeErr("SyntaxError: invalid syntax");
  }

  function applySimpleArith(op, l, r) {
    if (!isNum(l) || !isNum(r)) throw new RuntimeErr("TypeError: unsupported operand types");
    if (op === "+") return numResult(l.value + r.value);
    if (op === "-") return numResult(l.value - r.value);
    if (op === "*") return numResult(l.value * r.value);
    throw new RuntimeErr("TypeError: unsupported operator");
  }

  function collectBlock(allLines, startIndex) {
    const base = indentOf(allLines[startIndex].text);
    const block = [];
    let i = startIndex + 1;
    while (i < allLines.length) {
      const t = allLines[i].text;
      if (t.trim() === "") { i++; continue; }
      if (indentOf(t) > base) { block.push(allLines[i]); i++; }
      else break;
    }
    return block;
  }

  function handleIf(t, allLines, index, scope, inFunction) {
    const base = indentOf(allLines[index].text);
    let i = index;

    while (i < allLines.length) {
      const line = allLines[i];
      const lt = line.text.trim();
      if (indentOf(line.text) !== base) break;

      let condition = null;
      if (lt.startsWith("if ")) condition = lt.slice(3).replace(/:$/, "").trim();
      else if (lt.startsWith("elif ")) condition = lt.slice(5).replace(/:$/, "").trim();
      else if (lt === "else:") condition = null;
      else break; // ليس جزءًا من سلسلة الشروط

      const body = collectBlock(allLines, i);
      const take = (condition === null) || pyTruthy(evalString(condition, scope));

      if (take) {
        const r = executeLines(body, scope, inFunction);
        if (r && (r.type === "return" || r.type === "break" || r.type === "continue")) return r;
        return { jump: chainEndFrom(allLines, i) };
      }
      // الفرع لم يُؤخذ → جرّب الفرع التالي
      i = i + body.length + 1;
    }
    // لم يُؤخذ أي فرع → تجاوز السلسلة كلها
    return { jump: chainEndFrom(allLines, index) };
  }

  // يتجاوز جسم الفرع الحالي
  function skipBlock(allLines, i) {
    const base = indentOf(allLines[i].text);
    i++;
    while (i < allLines.length && indentOf(allLines[i].text) > base) i++;
    return i;
  }

  // نهاية سلسلة if/elif/else كاملة (بعد آخر جسم)
  function chainEndFrom(allLines, startIndex) {
    const base = indentOf(allLines[startIndex].text);
    let i = skipBlock(allLines, startIndex);
    while (i < allLines.length) {
      const t = allLines[i].text.trim();
      if (indentOf(allLines[i].text) !== base) break;
      if (t.startsWith("elif ") || t === "else:") i = skipBlock(allLines, i);
      else break;
    }
    return i;
  }

  // معالجة try/except
  function handleTry(allLines, index, scope, inFunction) {
    const base = indentOf(allLines[index].text);
    const tryBody = collectBlock(allLines, index);
    // ابحث عن except في نفس المستوى
    let i = index + tryBody.length + 1;
    let exceptBody = null;
    while (i < allLines.length) {
      const lt = allLines[i].text.trim();
      const ind = indentOf(allLines[i].text);
      if (ind < base) break;
      if (ind === base && (lt === "except:" || lt.startsWith("except"))) {
        exceptBody = collectBlock(allLines, i);
        break;
      }
      i++;
    }
    const endIndex = exceptBody ? i + exceptBody.length + 1 : index + tryBody.length + 1;
    try {
      const r = executeLines(tryBody, scope, inFunction);
      if (r && (r.type === "return" || r.type === "break" || r.type === "continue")) return r;
    } catch (e) {
      if (exceptBody) {
        const r = executeLines(exceptBody, scope, inFunction);
        if (r && (r.type === "return" || r.type === "break" || r.type === "continue")) return r;
      }
    }
    return { jump: endIndex };
  }

  // تقييم تعبير نصي باستخدام المحلل
  function evalString(expr, scope) {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, scope);
    const val = parser.parseExpression();
    return val;
  }

  /* ================= الواجهة العامة ================= */
  function run(source, inputs) {
    const lines = splitLines(source);
    const scope = new Scope(null);
    scope._in.list = (inputs || []).slice();
    executeLines(lines, scope, false);
    return { output: scope._out.text, error: null };
  }

  return { run };
})();

window.FallbackInterpreter = FallbackInterpreter;
