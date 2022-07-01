"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.arrayN = exports.createClass = void 0;
function createClass(name, klass) {
    var klass_ = klass;
    // @ts-ignore - `name` is a read-only property
    // klass_["name" as any] = name;
    // @ts-ignore - We want add a symbol without changes in the typo
    klass_.prototype[Symbol.toStringTag] = name;
    return klass_;
}
exports.createClass = createClass;
function arrayN(n) {
    return Array.from({
        length: n
    });
}
exports.arrayN = arrayN;
