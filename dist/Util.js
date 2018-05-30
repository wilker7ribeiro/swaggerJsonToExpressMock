"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utril = /** @class */ (function () {
    function Utril() {
    }
    Utril.tagNameToServiceName = function (tagName) {
        return tagName.split('-')
            .map(function (palavra) { return "" + palavra.charAt(0).toUpperCase + palavra.slice(1).toLowerCase(); })
            .join(" ");
    };
    return Utril;
}());
exports.Utril = Utril;
