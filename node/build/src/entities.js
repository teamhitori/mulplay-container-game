"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shuriken = exports.Katana = exports.Ninja = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
require("reflect-metadata");
const types_1 = require("./components/types");
let Katana = class Katana {
    hit() {
        return "cut!";
    }
};
Katana = tslib_1.__decorate([
    inversify_1.injectable()
], Katana);
exports.Katana = Katana;
let Shuriken = class Shuriken {
    throw() {
        return "hit!";
    }
};
Shuriken = tslib_1.__decorate([
    inversify_1.injectable()
], Shuriken);
exports.Shuriken = Shuriken;
let Ninja = class Ninja {
    _katana;
    _shuriken;
    fight() { return this._katana.hit(); }
    sneak() { return this._shuriken.throw(); }
};
tslib_1.__decorate([
    inversify_1.inject(types_1.TYPES.Weapon),
    tslib_1.__metadata("design:type", Object)
], Ninja.prototype, "_katana", void 0);
tslib_1.__decorate([
    inversify_1.inject(types_1.TYPES.ThrowableWeapon),
    tslib_1.__metadata("design:type", Object)
], Ninja.prototype, "_shuriken", void 0);
Ninja = tslib_1.__decorate([
    inversify_1.injectable()
], Ninja);
exports.Ninja = Ninja;
//# sourceMappingURL=entities.js.map